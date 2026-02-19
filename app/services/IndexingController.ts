import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { getDatabase, generateId, executeInTransaction, getCaps, serializeVector } from '../database/db';
import { generateEmbeddings, generateTags } from './openai';
import { extractTextFromImage, extractTextFromFile } from './textExtractor';

export type IndexState =
  | 'IDLE'
  | 'REQUESTING_PERMISSIONS'
  | 'ENUMERATING'
  | 'PROCESSING_PHOTOS'
  | 'PROCESSING_FILES_INTAKE'
  | 'COPYING_TO_LIBRARY'
  | 'EXTRACTING_TEXT'
  | 'TAGGING'
  | 'EMBEDDING'
  | 'SAVING'
  | 'NEXT_ITEM'
  | 'COMPLETE'
  | 'ERROR'
  | 'ERROR_ITEM';

export type IndexEvent =
  | 'spawn'
  | 'scan'
  | 'embed'
  | 'save'
  | 'complete'
  | 'error';

export interface IndexingProgress {
  state: IndexState;
  progress: number;
  processedCount: number;
  totalCount: number;
  currentItemType: 'photo' | 'file' | null;
  event?: IndexEvent;
  error?: string;
}

export type IndexingListener = (progress: IndexingProgress) => void;

const BATCH_SIZE = 20;
const CHUNK_SIZE = 1000;

export class IndexingController {
  private listeners: IndexingListener[] = [];
  private currentState: IndexState = 'IDLE';
  private processedCount = 0;
  private totalCount = 0;
  private currentItemType: 'photo' | 'file' | null = null;
  private isRunning = false;
  private shouldCancel = false;

  subscribe(listener: IndexingListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(update: Partial<IndexingProgress>) {
    const progress: IndexingProgress = {
      state: this.currentState,
      progress: this.totalCount > 0 ? this.processedCount / this.totalCount : 0,
      processedCount: this.processedCount,
      totalCount: this.totalCount,
      currentItemType: this.currentItemType,
      ...update,
    };

    this.listeners.forEach(listener => listener(progress));
  }

  private setState(state: IndexState, event?: IndexEvent) {
    this.currentState = state;
    this.emit({ state, event });
  }

  async startIndexing(options: { includePhotos?: boolean; includeFiles?: boolean } = {}): Promise<void> {
    if (this.isRunning) {
      throw new Error('Indexing already in progress');
    }

    this.isRunning = true;
    this.shouldCancel = false;
    this.processedCount = 0;
    this.totalCount = 0;

    try {
      this.setState('REQUESTING_PERMISSIONS');

      const caps = await getCaps();

      let photoAssets: MediaLibrary.Asset[] = [];
      if (options.includePhotos !== false && caps.photoCount < caps.photoCap) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          this.setState('ENUMERATING');
          photoAssets = await this.enumeratePhotos(caps.photoCap - caps.photoCount);
        }
      }

      this.totalCount = photoAssets.length;
      this.emit({});

      if (photoAssets.length > 0) {
        await this.processPhotos(photoAssets);
      }

      this.setState('COMPLETE', 'complete');
    } catch (error) {
      this.setState('ERROR');
      this.emit({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      this.isRunning = false;
    }
  }

  async addFiles(fileUris: string[]): Promise<void> {
    if (this.isRunning) {
      throw new Error('Indexing already in progress');
    }

    this.isRunning = true;
    this.shouldCancel = false;
    this.processedCount = 0;

    try {
      const caps = await getCaps();
      const available = caps.fileCap - caps.fileCount;

      if (available <= 0) {
        throw new Error('File cap reached. Remove items or upgrade.');
      }

      const filesToProcess = fileUris.slice(0, available);
      this.totalCount = filesToProcess.length;

      this.setState('PROCESSING_FILES_INTAKE');
      await this.processFiles(filesToProcess);

      this.setState('COMPLETE', 'complete');
    } catch (error) {
      this.setState('ERROR');
      this.emit({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      this.isRunning = false;
    }
  }

  cancel(): void {
    this.shouldCancel = true;
  }

  private async enumeratePhotos(maxCount: number): Promise<MediaLibrary.Asset[]> {
    const assets: MediaLibrary.Asset[] = [];
    let hasNext = true;
    let after: string | undefined;

    while (hasNext && assets.length < maxCount) {
      const result = await MediaLibrary.getAssetsAsync({
        first: Math.min(100, maxCount - assets.length),
        after,
        mediaType: ['photo'],
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      assets.push(...result.assets);
      hasNext = result.hasNextPage;
      after = result.endCursor;
    }

    return assets;
  }

  private async processPhotos(assets: MediaLibrary.Asset[]): Promise<void> {
    this.currentItemType = 'photo';
    this.setState('PROCESSING_PHOTOS');

    for (let i = 0; i < assets.length; i += BATCH_SIZE) {
      if (this.shouldCancel) break;

      const batch = assets.slice(i, i + BATCH_SIZE);
      await this.processBatch(batch, 'photo');

      await this.yieldToEventLoop();
    }
  }

  private async processFiles(fileUris: string[]): Promise<void> {
    this.currentItemType = 'file';

    for (let i = 0; i < fileUris.length; i += BATCH_SIZE) {
      if (this.shouldCancel) break;

      const batch = fileUris.slice(i, i + BATCH_SIZE);
      await this.processBatch(batch, 'file');

      await this.yieldToEventLoop();
    }
  }

  private async processBatch(items: any[], type: 'photo' | 'file'): Promise<void> {
    for (const item of items) {
      if (this.shouldCancel) break;

      try {
        this.emit({ event: 'spawn' });

        if (type === 'photo') {
          await this.processPhotoItem(item);
        } else {
          await this.processFileItem(item);
        }

        this.processedCount++;
        this.emit({});
      } catch (error) {
        this.setState('ERROR_ITEM');
        console.error('Error processing item:', error);
        this.processedCount++;
      }
    }
  }

  private async processPhotoItem(asset: MediaLibrary.Asset): Promise<void> {
    const db = getDatabase();
    const itemId = generateId();

    this.setState('EXTRACTING_TEXT');
    this.emit({ event: 'scan' });

    const text = await extractTextFromImage(asset.uri);

    this.setState('TAGGING');
    const tags = text ? await generateTags(text) : [];

    this.setState('EMBEDDING');
    this.emit({ event: 'embed' });

    const embeddingText = [
      asset.filename,
      text,
      ...tags,
    ].filter(Boolean).join(' ');

    const embeddingResponse = await generateEmbeddings([embeddingText]);
    const embedding = new Float32Array(embeddingResponse.embeddings[0]);

    this.setState('SAVING');
    this.emit({ event: 'save' });

    await executeInTransaction(async () => {
      await db.runAsync(
        `INSERT INTO items (id, source_type, asset_id, display_name, created_at, modified_at, status, last_seen_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          'photo',
          asset.id,
          asset.filename,
          asset.creationTime,
          asset.modificationTime,
          'indexed',
          Date.now(),
        ]
      );

      if (text) {
        const chunks = this.chunkText(text);
        for (let i = 0; i < chunks.length; i++) {
          await db.runAsync(
            `INSERT INTO item_text_chunks (id, item_id, chunk_index, content)
             VALUES (?, ?, ?, ?)`,
            [generateId(), itemId, i, chunks[i]]
          );
        }
      }

      for (const tag of tags) {
        await db.runAsync(
          `INSERT INTO item_tags (id, item_id, tag)
           VALUES (?, ?, ?)`,
          [generateId(), itemId, tag]
        );
      }

      await db.runAsync(
        `INSERT INTO item_embeddings (id, item_id, vector_blob, dimension)
         VALUES (?, ?, ?, ?)`,
        [generateId(), itemId, serializeVector(embedding), embedding.length]
      );
    });
  }

  private async processFileItem(fileUri: string): Promise<void> {
    const db = getDatabase();
    const itemId = generateId();

    this.setState('COPYING_TO_LIBRARY');

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    const filename = fileUri.split('/').pop() || 'unnamed_file';
    const sandboxDir = `${FileSystem.documentDirectory}findmysh_library/files/`;
    await FileSystem.makeDirectoryAsync(sandboxDir, { intermediates: true }).catch(() => {});

    const localPath = `${sandboxDir}${itemId}_${filename}`;
    await FileSystem.copyAsync({ from: fileUri, to: localPath });

    this.setState('EXTRACTING_TEXT');
    this.emit({ event: 'scan' });

    const text = await extractTextFromFile(localPath);

    this.setState('TAGGING');
    const tags = text ? await generateTags(text) : [];

    this.setState('EMBEDDING');
    this.emit({ event: 'embed' });

    const embeddingText = [filename, text, ...tags].filter(Boolean).join(' ');
    const embeddingResponse = await generateEmbeddings([embeddingText]);
    const embedding = new Float32Array(embeddingResponse.embeddings[0]);

    this.setState('SAVING');
    this.emit({ event: 'save' });

    await executeInTransaction(async () => {
      await db.runAsync(
        `INSERT INTO items (id, source_type, local_path, original_filename, display_name, created_at, size_bytes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          'file',
          localPath,
          filename,
          filename,
          Date.now(),
          fileInfo.size || 0,
          'indexed',
        ]
      );

      if (text) {
        const chunks = this.chunkText(text);
        for (let i = 0; i < chunks.length; i++) {
          await db.runAsync(
            `INSERT INTO item_text_chunks (id, item_id, chunk_index, content)
             VALUES (?, ?, ?, ?)`,
            [generateId(), itemId, i, chunks[i]]
          );
        }
      }

      for (const tag of tags) {
        await db.runAsync(
          `INSERT INTO item_tags (id, item_id, tag)
           VALUES (?, ?, ?)`,
          [generateId(), itemId, tag]
        );
      }

      await db.runAsync(
        `INSERT INTO item_embeddings (id, item_id, vector_blob, dimension)
         VALUES (?, ?, ?, ?)`,
        [generateId(), itemId, serializeVector(embedding), embedding.length]
      );
    });
  }

  private chunkText(text: string): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      chunks.push(text.slice(i, i + CHUNK_SIZE));
    }
    return chunks;
  }

  private async yieldToEventLoop(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }
}

export const indexingController = new IndexingController();
