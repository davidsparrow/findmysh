export const DB_NAME = 'findmysh.db';

export const SCHEMA_VERSION = 1;

export const SCHEMA_SQL = `
-- Parent items table (one row per indexed photo/file)
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL CHECK(source_type IN ('photo', 'file')),
  asset_id TEXT,
  local_path TEXT,
  original_filename TEXT,
  display_name TEXT,
  created_at INTEGER,
  modified_at INTEGER,
  size_bytes INTEGER,
  status TEXT DEFAULT 'indexed' CHECK(status IN ('indexed', 'error', 'processing')),
  last_seen_at INTEGER,
  user_deleted INTEGER DEFAULT 0,
  indexed_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_items_source_type ON items(source_type);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);
CREATE INDEX IF NOT EXISTS idx_items_user_deleted ON items(user_deleted);
CREATE INDEX IF NOT EXISTS idx_items_asset_id ON items(asset_id) WHERE asset_id IS NOT NULL;

-- Text chunks extracted from items
CREATE TABLE IF NOT EXISTS item_text_chunks (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chunks_item_id ON item_text_chunks(item_id);
CREATE INDEX IF NOT EXISTS idx_chunks_item_chunk ON item_text_chunks(item_id, chunk_index);

-- Embeddings (vector stored as BLOB)
CREATE TABLE IF NOT EXISTS item_embeddings (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  vector_blob BLOB NOT NULL,
  dimension INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_embeddings_item_id ON item_embeddings(item_id);

-- Tags for semantic search enhancement
CREATE TABLE IF NOT EXISTS item_tags (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  confidence REAL DEFAULT 1.0,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tags_item_id ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_tags_tag ON item_tags(tag);

-- App metadata and settings
CREATE TABLE IF NOT EXISTS app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

-- Initialize default settings
INSERT OR IGNORE INTO app_metadata (key, value) VALUES
  ('schema_version', '1'),
  ('user_tier', 'free'),
  ('photo_cap', '10'),
  ('file_cap', '10'),
  ('last_refresh_at', '0');
`;

export interface ItemRecord {
  id: string;
  source_type: 'photo' | 'file';
  asset_id?: string;
  local_path?: string;
  original_filename?: string;
  display_name?: string;
  created_at?: number;
  modified_at?: number;
  size_bytes?: number;
  status: 'indexed' | 'error' | 'processing';
  last_seen_at?: number;
  user_deleted: number;
  indexed_at: number;
}

export interface TextChunkRecord {
  id: string;
  item_id: string;
  chunk_index: number;
  content: string;
}

export interface EmbeddingRecord {
  id: string;
  item_id: string;
  vector_blob: Uint8Array;
  dimension: number;
  created_at: number;
}

export interface TagRecord {
  id: string;
  item_id: string;
  tag: string;
  confidence: number;
}

export interface AppMetadata {
  key: string;
  value: string;
  updated_at: number;
}
