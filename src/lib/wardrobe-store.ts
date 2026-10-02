import type { SQLiteDatabase } from 'expo-sqlite';

import { photoUri } from '@/lib/photo-storage';
import type { ClothingItem } from '@/types/wardrobe';

export const DATABASE_NAME = 'wardrobe.db';

const SCHEMA_VERSION = 1;

/** Creates or upgrades the database. Runs once when the app opens it. */
export async function migrate(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;
  if (version >= SCHEMA_VERSION) {
    return;
  }
  if (version < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS clothing_items (
        id TEXT PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL,
        category TEXT NOT NULL,
        data TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS clothing_items_category ON clothing_items (category);
    `);
  }
  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

/**
 * Items are stored with photo paths relative to the documents folder.
 * `photoUri`, `cutoutUri` and `labelPhotoUri` hold those relative paths in the
 * database and are resolved to full URIs when read.
 */
export async function insertClothingItem(db: SQLiteDatabase, item: ClothingItem) {
  await db.runAsync(
    'INSERT INTO clothing_items (id, created_at, category, data) VALUES (?, ?, ?, ?)',
    item.id,
    item.createdAt,
    item.category,
    JSON.stringify(item)
  );
}

export async function listClothingItems(db: SQLiteDatabase): Promise<ClothingItem[]> {
  const rows = await db.getAllAsync<{ data: string }>(
    'SELECT data FROM clothing_items ORDER BY created_at DESC'
  );
  return rows.map((row) => resolvePhotos(JSON.parse(row.data) as ClothingItem));
}

function resolvePhotos(item: ClothingItem): ClothingItem {
  return {
    ...item,
    photoUri: photoUri(item.photoUri),
    cutoutUri: item.cutoutUri ? photoUri(item.cutoutUri) : undefined,
    labelPhotoUri: item.labelPhotoUri ? photoUri(item.labelPhotoUri) : undefined,
  };
}
