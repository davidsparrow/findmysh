import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { getDatabase, executeInTransaction } from '../database/db';

export interface RefreshProgress {
  phase: 'checking_photos' | 'checking_files' | 'purging' | 'complete';
  processed: number;
  total: number;
}

export type RefreshListener = (progress: RefreshProgress) => void;

export async function refreshIndex(
  onProgress?: RefreshListener
): Promise<{ photosRemoved: number; filesRemoved: number }> {
  const db = getDatabase();
  let photosRemoved = 0;
  let filesRemoved = 0;

  const now = Date.now();

  onProgress?.({ phase: 'checking_photos', processed: 0, total: 0 });

  await db.runAsync(
    `UPDATE items SET last_seen_at = NULL WHERE source_type = 'photo'`
  );

  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status === 'granted') {
    const accessibleAssets = await enumerateAllAssets();
    const assetIds = new Set(accessibleAssets.map(a => a.id));

    const photoItems = await db.getAllAsync<{ id: string; asset_id: string }>(
      `SELECT id, asset_id FROM items WHERE source_type = 'photo'`
    );

    let processed = 0;
    for (const item of photoItems) {
      if (assetIds.has(item.asset_id)) {
        await db.runAsync(
          `UPDATE items SET last_seen_at = ? WHERE id = ?`,
          [now, item.id]
        );
      }
      processed++;
      onProgress?.({ phase: 'checking_photos', processed, total: photoItems.length });
    }

    const unseenPhotos = await db.getAllAsync<{ id: string }>(
      `SELECT id FROM items WHERE source_type = 'photo' AND last_seen_at IS NULL`
    );

    photosRemoved = unseenPhotos.length;

    for (const item of unseenPhotos) {
      await executeInTransaction(async () => {
        await db.runAsync(`DELETE FROM items WHERE id = ?`, [item.id]);
      });
    }
  }

  onProgress?.({ phase: 'checking_files', processed: 0, total: 0 });

  const fileItems = await db.getAllAsync<{ id: string; local_path: string }>(
    `SELECT id, local_path FROM items WHERE source_type = 'file'`
  );

  let processedFiles = 0;
  for (const item of fileItems) {
    const fileInfo = await FileSystem.getInfoAsync(item.local_path);

    if (!fileInfo.exists) {
      await executeInTransaction(async () => {
        await db.runAsync(`DELETE FROM items WHERE id = ?`, [item.id]);
      });
      filesRemoved++;
    }

    processedFiles++;
    onProgress?.({ phase: 'checking_files', processed: processedFiles, total: fileItems.length });
  }

  await db.runAsync(
    `INSERT OR REPLACE INTO app_metadata (key, value, updated_at) VALUES (?, ?, ?)`,
    ['last_refresh_at', now.toString(), now]
  );

  onProgress?.({ phase: 'complete', processed: processedFiles, total: fileItems.length });

  return { photosRemoved, filesRemoved };
}

async function enumerateAllAssets(): Promise<MediaLibrary.Asset[]> {
  const assets: MediaLibrary.Asset[] = [];
  let hasNext = true;
  let after: string | undefined;

  while (hasNext) {
    const result = await MediaLibrary.getAssetsAsync({
      first: 1000,
      after,
      mediaType: ['photo'],
    });

    assets.push(...result.assets);
    hasNext = result.hasNextPage;
    after = result.endCursor;
  }

  return assets;
}
