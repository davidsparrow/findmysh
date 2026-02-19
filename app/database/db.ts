import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { SCHEMA_SQL, DB_NAME, ItemRecord } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  const dbDir = `${FileSystem.documentDirectory}findmysh_library/`;

  await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true }).catch(() => {});

  db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync('PRAGMA journal_mode = WAL;');

  await db.execAsync(SCHEMA_SQL);

  return db;
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

export async function executeInTransaction<T>(
  operation: (db: SQLite.SQLiteDatabase) => Promise<T>
): Promise<T> {
  const database = getDatabase();

  try {
    await database.execAsync('BEGIN TRANSACTION;');
    const result = await operation(database);
    await database.execAsync('COMMIT;');
    return result;
  } catch (error) {
    await database.execAsync('ROLLBACK;');
    throw error;
  }
}

export async function getCaps(): Promise<{ photoCap: number; fileCap: number; photoCount: number; fileCount: number }> {
  const database = getDatabase();

  const [photoCapRow, fileCapRow] = await Promise.all([
    database.getFirstAsync<{ value: string }>('SELECT value FROM app_metadata WHERE key = ?', ['photo_cap']),
    database.getFirstAsync<{ value: string }>('SELECT value FROM app_metadata WHERE key = ?', ['file_cap'])
  ]);

  const photoCap = photoCapRow ? parseInt(photoCapRow.value, 10) : 10;
  const fileCap = fileCapRow ? parseInt(fileCapRow.value, 10) : 10;

  const [photoCountRow, fileCountRow] = await Promise.all([
    database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM items
       WHERE source_type = 'photo' AND status = 'indexed' AND user_deleted = 0`
    ),
    database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM items
       WHERE source_type = 'file' AND status = 'indexed' AND user_deleted = 0`
    )
  ]);

  return {
    photoCap,
    fileCap,
    photoCount: photoCountRow?.count || 0,
    fileCount: fileCountRow?.count || 0
  };
}

export async function updateCaps(photoCap: number, fileCap: number): Promise<void> {
  const database = getDatabase();
  const now = Date.now();

  await executeInTransaction(async () => {
    await database.runAsync(
      'INSERT OR REPLACE INTO app_metadata (key, value, updated_at) VALUES (?, ?, ?)',
      ['photo_cap', photoCap.toString(), now]
    );
    await database.runAsync(
      'INSERT OR REPLACE INTO app_metadata (key, value, updated_at) VALUES (?, ?, ?)',
      ['file_cap', fileCap.toString(), now]
    );
  });
}

export async function getItemById(itemId: string): Promise<ItemRecord | null> {
  const database = getDatabase();
  return database.getFirstAsync<ItemRecord>(
    'SELECT * FROM items WHERE id = ?',
    [itemId]
  );
}

export async function deleteItem(itemId: string): Promise<void> {
  const database = getDatabase();

  await executeInTransaction(async () => {
    await database.runAsync('DELETE FROM items WHERE id = ?', [itemId]);
  });
}

export async function markItemDeleted(itemId: string): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    'UPDATE items SET user_deleted = 1 WHERE id = ?',
    [itemId]
  );
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function serializeVector(vector: Float32Array): Uint8Array {
  return new Uint8Array(vector.buffer);
}

export function deserializeVector(blob: Uint8Array): Float32Array {
  return new Float32Array(blob.buffer);
}
