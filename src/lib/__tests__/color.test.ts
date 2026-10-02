import { describe, expect, it } from '@jest/globals';

import {
  CLOTHING_COLORS,
  extractDominantColors,
  hexToRgb,
  labToRgb,
  nameColor,
  rgbToHex,
  rgbToLab,
  type Pixels,
  type RGB,
} from '@/lib/color';

/** Builds an RGBA image where `paint(x, y)` returns each pixel's color. */
function image(width: number, height: number, paint: (x: number, y: number) => RGB): Pixels {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = paint(x, y);
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  return { width, height, data };
}

describe('color conversion', () => {
  it('round-trips hex', () => {
    expect(rgbToHex(hexToRgb('#1F2A44'))).toBe('#1F2A44');
  });

  it('round-trips through Lab', () => {
    for (const { hex } of CLOTHING_COLORS) {
      const back = rgbToHex(labToRgb(rgbToLab(hexToRgb(hex))));
      expect(back).toBe(hex);
    }
  });
});

describe('nameColor', () => {
  it('names every palette color as itself', () => {
    for (const { name, hex } of CLOTHING_COLORS) {
      expect(nameColor(hex)).toBe(name);
    }
  });

  it('names near colors sensibly', () => {
    expect(nameColor('#000000')).toBe('black');
    expect(nameColor('#FFFFFF')).toBe('white');
    expect(nameColor('#1B2540')).toBe('navy');
    expect(nameColor('#D02020')).toBe('red');
  });
});

describe('extractDominantColors', () => {
  const white: RGB = [245, 245, 242];
  const navy: RGB = [31, 42, 68];
  const red: RGB = [192, 39, 45];

  it('ignores a plain background and finds the garment colors', () => {
    // 40x40 white background, a 24x24 garment in the middle:
    // navy with a red band across a quarter of it.
    const pixels = image(40, 40, (x, y) => {
      const inGarment = x >= 8 && x < 32 && y >= 8 && y < 32;
      if (!inGarment) return white;
      return y >= 26 ? red : navy;
    });

    const colors = extractDominantColors(pixels);
    expect(colors.map((c) => c.name)).toEqual(['navy', 'red']);
    expect(colors[0].share).toBeCloseTo(0.75, 1);
    expect(colors[1].share).toBeCloseTo(0.25, 1);
  });

  it('merges slight shading on one fabric into one color', () => {
    const pixels = image(40, 40, (x, y) => {
      const inGarment = x >= 8 && x < 32 && y >= 8 && y < 32;
      if (!inGarment) return white;
      const shade = (x % 4) * 3; // gentle texture
      return [navy[0] + shade, navy[1] + shade, navy[2] + shade];
    });

    const colors = extractDominantColors(pixels);
    expect(colors).toHaveLength(1);
    expect(colors[0].name).toBe('navy');
  });

  it('uses the whole photo when the garment fills the frame', () => {
    const pixels = image(20, 20, () => red);
    const colors = extractDominantColors(pixels);
    expect(colors).toHaveLength(1);
    expect(colors[0].name).toBe('red');
    expect(colors[0].share).toBe(1);
  });

  it('drops colors below the minimum share', () => {
    const pixels = image(40, 40, (x, y) => {
      const inGarment = x >= 8 && x < 32 && y >= 8 && y < 32;
      if (!inGarment) return white;
      return x === 8 ? red : navy; // a thin red edge, about 4%
    });
    const colors = extractDominantColors(pixels);
    expect(colors.map((c) => c.name)).toEqual(['navy']);
  });
});
