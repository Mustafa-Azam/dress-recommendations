import { Directory, File, Paths } from 'expo-file-system';

const PHOTO_DIR = 'wardrobe-photos';

/**
 * Copies a picked or captured photo into the app's documents folder and
 * returns its path relative to that folder.
 *
 * Relative paths are stored because the absolute documents path on iOS
 * changes between app updates.
 */
export async function savePhoto(sourceUri: string, name: string): Promise<string> {
  const directory = new Directory(Paths.document, PHOTO_DIR);
  directory.create({ idempotent: true, intermediates: true });
  const extension = sourceUri.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
  const relativePath = `${PHOTO_DIR}/${name}.${extension}`;
  const destination = new File(Paths.document, relativePath);
  if (destination.exists) {
    destination.delete();
  }
  await new File(sourceUri).copy(destination);
  return relativePath;
}

/** Turns a stored relative path back into a URI the app can display. */
export function photoUri(relativePath: string): string {
  return new File(Paths.document, relativePath).uri;
}

export function deletePhoto(relativePath: string) {
  const file = new File(Paths.document, relativePath);
  if (file.exists) {
    file.delete();
  }
}
