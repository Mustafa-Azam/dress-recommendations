import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { decode } from 'jpeg-js';

import { base64ToBytes } from '@/lib/base64';
import { extractDominantColors, type DominantColor } from '@/lib/color';

/** Long edge of the thumbnail used for color detection. Small keeps it fast. */
const SAMPLE_SIZE = 64;

/** Shrinks the photo and finds its main colors. */
export async function detectColors(uri: string): Promise<DominantColor[]> {
  const image = await ImageManipulator.manipulate(uri).resize({ width: SAMPLE_SIZE }).renderAsync();
  const result = await image.saveAsync({ base64: true, format: SaveFormat.JPEG, compress: 0.9 });
  if (!result.base64) {
    return [];
  }
  const decoded = decode(base64ToBytes(result.base64), { useTArray: true, formatAsRGBA: true });
  return extractDominantColors({
    width: decoded.width,
    height: decoded.height,
    data: decoded.data,
  });
}
