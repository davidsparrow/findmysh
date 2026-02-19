import { getDatabase, deserializeVector } from '../database/db';
import { generateEmbeddings } from './openai';

export type SourceType = 'photo' | 'file';
export type AssociationLevel = 0 | 1 | 2 | 3;
export type DateOp = '=' | '>' | '<' | 'range' | 'none';

export interface SearchFilters {
  queryText: string;
  sourceType: 'both' | SourceType;
  dateOp: DateOp;
  fromDate?: number;
  toDate?: number;
  associationLevel: AssociationLevel;
  viewMode: 'list' | 'grid';
}

export interface SearchResultItem {
  itemId: string;
  sourceType: SourceType;
  title: string;
  snippet?: string;
  createdAt?: number;
  modifiedAt?: number;
  openRef: {
    assetId?: string;
    localPath?: string;
  };
  score: number;
}

export interface SearchResults {
  results: SearchResultItem[];
  counts: {
    photos: number;
    files: number;
  };
}

const ASSOC_THRESHOLDS = [0.85, 0.75, 0.65, 0.55] as const;
const MAX_RESULTS = 200;
const CANDIDATE_LIMIT = 2000;

export async function runSearch(
  filters: SearchFilters,
  signal?: AbortSignal
): Promise<SearchResults> {
  const q = filters.queryText.trim();
  if (!q) {
    return { results: [], counts: { photos: 0, files: 0 } };
  }

  const threshold = ASSOC_THRESHOLDS[filters.associationLevel];

  const where = buildWhereClause(filters);

  if (signal?.aborted) throw new Error('SearchCanceled');
  const embeddingResponse = await generateEmbeddings([q]);
  const qVec = new Float32Array(embeddingResponse.embeddings[0]);

  if (signal?.aborted) throw new Error('SearchCanceled');

  const candidates = await fetchCandidates(where, CANDIDATE_LIMIT, signal);

  if (candidates.length === 0) {
    return { results: [], counts: { photos: 0, files: 0 } };
  }

  const top = scoreAndSelectTop(candidates, qVec, threshold, MAX_RESULTS, signal);

  const hydrated = await hydrateResults(top, signal);

  const counts = hydrated.reduce(
    (acc, r) => {
      if (r.sourceType === 'photo') acc.photos += 1;
      else acc.files += 1;
      return acc;
    },
    { photos: 0, files: 0 }
  );

  hydrated.sort((a, b) => b.score - a.score);

  return { results: hydrated, counts };
}

function buildWhereClause(filters: SearchFilters): { sql: string; params: any[] } {
  const clauses: string[] = [];
  const params: any[] = [];

  clauses.push(`status = 'indexed'`);
  clauses.push(`user_deleted = 0`);

  if (filters.sourceType !== 'both') {
    clauses.push(`source_type = ?`);
    params.push(filters.sourceType);
  }

  const dateField = `COALESCE(modified_at, created_at)`;

  switch (filters.dateOp) {
    case '=':
      if (filters.fromDate != null) {
        const [start, end] = dayBounds(filters.fromDate);
        clauses.push(`${dateField} >= ? AND ${dateField} < ?`);
        params.push(start, end);
      }
      break;
    case '>':
      if (filters.fromDate != null) {
        clauses.push(`${dateField} >= ?`);
        params.push(filters.fromDate);
      }
      break;
    case '<':
      if (filters.fromDate != null) {
        clauses.push(`${dateField} <= ?`);
        params.push(filters.fromDate);
      }
      break;
    case 'range':
      if (filters.fromDate != null && filters.toDate != null) {
        clauses.push(`${dateField} >= ? AND ${dateField} <= ?`);
        params.push(filters.fromDate, filters.toDate);
      }
      break;
    case 'none':
    default:
      break;
  }

  const sql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { sql, params };
}

async function fetchCandidates(
  where: { sql: string; params: any[] },
  limit: number,
  signal?: AbortSignal
): Promise<Array<{
  itemId: string;
  sourceType: SourceType;
  assetId?: string;
  localPath?: string;
  vector: Float32Array;
}>> {
  if (signal?.aborted) throw new Error('SearchCanceled');

  const db = getDatabase();

  const rows = await db.getAllAsync(
    `SELECT
      i.id as item_id,
      i.source_type,
      i.asset_id,
      i.local_path,
      e.vector_blob
    FROM items i
    JOIN item_embeddings e ON e.item_id = i.id
    ${where.sql}
    LIMIT ?`,
    [...where.params, limit]
  );

  if (signal?.aborted) throw new Error('SearchCanceled');

  return rows.map((r: any) => ({
    itemId: r.item_id,
    sourceType: r.source_type as SourceType,
    assetId: r.asset_id ?? undefined,
    localPath: r.local_path ?? undefined,
    vector: deserializeVector(new Uint8Array(r.vector_blob)),
  }));
}

function scoreAndSelectTop(
  candidates: Array<{
    itemId: string;
    sourceType: SourceType;
    assetId?: string;
    localPath?: string;
    vector: Float32Array;
  }>,
  qVec: Float32Array,
  threshold: number,
  topK: number,
  signal?: AbortSignal
): Array<{ itemId: string; score: number }> {
  const top: Array<{ itemId: string; score: number }> = [];

  for (let idx = 0; idx < candidates.length; idx++) {
    if (signal?.aborted) throw new Error('SearchCanceled');

    const c = candidates[idx];
    const score = cosineSimilarity(qVec, c.vector);

    if (score < threshold) continue;

    if (top.length < topK) {
      top.push({ itemId: c.itemId, score });
      if (top.length === topK) top.sort((a, b) => a.score - b.score);
      continue;
    }

    if (score > top[0].score) {
      top[0] = { itemId: c.itemId, score };
      top.sort((a, b) => a.score - b.score);
    }
  }

  return top.sort((a, b) => b.score - a.score);
}

async function hydrateResults(
  top: Array<{ itemId: string; score: number }>,
  signal?: AbortSignal
): Promise<SearchResultItem[]> {
  if (top.length === 0) return [];

  if (signal?.aborted) throw new Error('SearchCanceled');

  const db = getDatabase();
  const ids = top.map(t => t.itemId);
  const placeholders = ids.map(() => '?').join(',');

  const items = await db.getAllAsync(
    `SELECT
      id,
      source_type,
      display_name,
      original_filename,
      asset_id,
      local_path,
      created_at,
      modified_at
    FROM items
    WHERE id IN (${placeholders})`,
    ids
  );

  if (signal?.aborted) throw new Error('SearchCanceled');

  const itemMap = new Map(items.map((i: any) => [i.id, i]));

  const chunks = await db.getAllAsync(
    `SELECT item_id, content
    FROM item_text_chunks
    WHERE item_id IN (${placeholders})
    GROUP BY item_id`,
    ids
  );

  const chunkMap = new Map(chunks.map((c: any) => [c.item_id, truncateSnippet(c.content)]));

  return top.map(({ itemId, score }) => {
    const i = itemMap.get(itemId);
    return {
      itemId,
      sourceType: i.source_type,
      title: i.display_name || i.original_filename || 'Untitled',
      snippet: chunkMap.get(itemId),
      createdAt: i.created_at ?? undefined,
      modifiedAt: i.modified_at ?? undefined,
      openRef: {
        assetId: i.asset_id ?? undefined,
        localPath: i.local_path ?? undefined,
      },
      score,
    };
  });
}

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

function truncateSnippet(text?: string): string | undefined {
  if (!text) return undefined;
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > 140 ? t.slice(0, 140) + '…' : t;
}

function dayBounds(unixMs: number): [number, number] {
  const d = new Date(unixMs);
  d.setHours(0, 0, 0, 0);
  const start = d.getTime();
  const end = start + 24 * 60 * 60 * 1000;
  return [start, end];
}
