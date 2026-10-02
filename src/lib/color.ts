/**
 * Color math and naming for garment photos.
 * Pure functions with no React Native imports so they can be unit tested.
 */

import type { ItemColor } from '@/types/wardrobe';

export type RGB = [number, number, number];
export type Lab = [number, number, number];

/** Named colors as they're usually described on clothing. */
export const CLOTHING_COLORS: readonly { name: string; hex: string }[] = [
  { name: 'black', hex: '#1A1A1A' },
  { name: 'charcoal', hex: '#3C3F44' },
  { name: 'grey', hex: '#8A8D91' },
  { name: 'light grey', hex: '#C8CACC' },
  { name: 'white', hex: '#F5F5F2' },
  { name: 'cream', hex: '#EFE6D2' },
  { name: 'beige', hex: '#D6C3A0' },
  { name: 'tan', hex: '#B38B5D' },
  { name: 'camel', hex: '#C19A6B' },
  { name: 'brown', hex: '#6B4A2F' },
  { name: 'chocolate', hex: '#3F2A1D' },
  { name: 'khaki', hex: '#A89F6F' },
  { name: 'olive', hex: '#5E6332' },
  { name: 'green', hex: '#2E7D3A' },
  { name: 'forest green', hex: '#1F3D2B' },
  { name: 'mint', hex: '#A8DCC0' },
  { name: 'teal', hex: '#1C7C7D' },
  { name: 'navy', hex: '#1F2A44' },
  { name: 'blue', hex: '#2F5DA8' },
  { name: 'denim', hex: '#4A6382' },
  { name: 'light blue', hex: '#9EC1E0' },
  { name: 'purple', hex: '#5E3A7E' },
  { name: 'lavender', hex: '#B9A7D6' },
  { name: 'burgundy', hex: '#6A1E2C' },
  { name: 'red', hex: '#C0272D' },
  { name: 'pink', hex: '#E7A1B0' },
  { name: 'hot pink', hex: '#D63C7A' },
  { name: 'coral', hex: '#EE7A63' },
  { name: 'orange', hex: '#E0752B' },
  { name: 'rust', hex: '#A34A25' },
  { name: 'mustard', hex: '#C9A227' },
  { name: 'yellow', hex: '#EBD24A' },
];

export function hexToRgb(hex: string): RGB {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

export function rgbToHex([r, g, b]: RGB): string {
  const part = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return v * 255;
}

// D65 reference white
const XN = 0.95047;
const YN = 1.0;
const ZN = 1.08883;

function labF(t: number): number {
  return t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116;
}

function labFInverse(t: number): number {
  return t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27);
}

export function rgbToLab([r, g, b]: RGB): Lab {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const x = lr * 0.4124 + lg * 0.3576 + lb * 0.1805;
  const y = lr * 0.2126 + lg * 0.7152 + lb * 0.0722;
  const z = lr * 0.0193 + lg * 0.1192 + lb * 0.9505;
  const fx = labF(x / XN);
  const fy = labF(y / YN);
  const fz = labF(z / ZN);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function labToRgb([l, a, bb]: Lab): RGB {
  const fy = (l + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - bb / 200;
  const x = labFInverse(fx) * XN;
  const y = labFInverse(fy) * YN;
  const z = labFInverse(fz) * ZN;
  const lr = x * 3.2406 + y * -1.5372 + z * -0.4986;
  const lg = x * -0.9689 + y * 1.8758 + z * 0.0415;
  const lb = x * 0.0557 + y * -0.204 + z * 1.057;
  return [linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb)];
}

/** CIE76 color difference: about 2.3 is a just-noticeable difference. */
export function deltaE(a: Lab, b: Lab): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

const NAMED_LAB = CLOTHING_COLORS.map((c) => ({ ...c, lab: rgbToLab(hexToRgb(c.hex)) }));

export function nameColor(hex: string): string {
  const lab = rgbToLab(hexToRgb(hex));
  let best = NAMED_LAB[0];
  let bestDistance = Infinity;
  for (const candidate of NAMED_LAB) {
    const distance = deltaE(lab, candidate.lab);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best.name;
}

export type Pixels = {
  width: number;
  height: number;
  /** RGBA, 4 bytes per pixel. */
  data: Uint8Array;
};

export type DominantColor = ItemColor & {
  /** Share of the garment's pixels, 0–1. */
  share: number;
};

type Options = {
  /** Maximum colors to return. */
  maxColors?: number;
  /** Clusters below this share of garment pixels are dropped. */
  minShare?: number;
};

const CLUSTERS = 5;
const ITERATIONS = 12;
/** Pixels this close to the estimated background are ignored. */
const BACKGROUND_DELTA_E = 14;

/**
 * Finds the main colors of a garment photographed against a plain background.
 *
 * The background is estimated from the image border, pixels close to it are
 * ignored, and the rest are clustered with k-means in Lab space.
 */
export function extractDominantColors(pixels: Pixels, options: Options = {}): DominantColor[] {
  const { maxColors = 3, minShare = 0.12 } = options;
  const all = toLabPixels(pixels);
  const background = estimateBackground(pixels, all);

  let garment = all.filter((p) => deltaE(p, background) > BACKGROUND_DELTA_E);
  // A garment that fills the frame or matches the background: use everything.
  if (garment.length < all.length * 0.05) {
    garment = all;
  }

  const clusters = kMeans(garment, Math.min(CLUSTERS, garment.length));
  const total = garment.length;

  const merged = mergeSimilar(clusters, 10);
  return merged
    .map(({ center, count }) => {
      const hex = rgbToHex(labToRgb(center));
      return { hex, name: nameColor(hex), share: count / total };
    })
    .filter((c) => c.share >= minShare)
    .sort((a, b) => b.share - a.share)
    .slice(0, maxColors);
}

function toLabPixels({ data, width, height }: Pixels): Lab[] {
  const out: Lab[] = [];
  for (let i = 0; i < width * height; i++) {
    const alpha = data[i * 4 + 3];
    if (alpha < 128) {
      // Transparent pixels (e.g. a cutout) are treated as background.
      continue;
    }
    out.push(rgbToLab([data[i * 4], data[i * 4 + 1], data[i * 4 + 2]]));
  }
  return out;
}

/** Median color of the outermost ring of pixels. */
function estimateBackground({ data, width, height }: Pixels, fallback: Lab[]): Lab {
  const ring: Lab[] = [];
  const push = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    ring.push(rgbToLab([data[i], data[i + 1], data[i + 2]]));
  };
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    push(0, y);
    push(width - 1, y);
  }
  const source = ring.length > 0 ? ring : fallback;
  const median = (index: 0 | 1 | 2) => {
    const sorted = source.map((p) => p[index]).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };
  return [median(0), median(1), median(2)];
}

type Cluster = { center: Lab; count: number };

/** Deterministic k-means: seeds spread across lightness so results are repeatable. */
function kMeans(points: Lab[], k: number): Cluster[] {
  if (points.length === 0 || k === 0) {
    return [];
  }
  const byLightness = [...points].sort((a, b) => a[0] - b[0]);
  let centers: Lab[] = Array.from({ length: k }, (_, i) => {
    const index = Math.floor(((i + 0.5) / k) * byLightness.length);
    return [...byLightness[index]] as Lab;
  });
  let counts = new Array<number>(k).fill(0);

  for (let iteration = 0; iteration < ITERATIONS; iteration++) {
    const sums = centers.map(() => [0, 0, 0]);
    counts = new Array<number>(k).fill(0);
    for (const p of points) {
      let nearest = 0;
      let nearestDistance = Infinity;
      for (let c = 0; c < k; c++) {
        const d = deltaE(p, centers[c]);
        if (d < nearestDistance) {
          nearest = c;
          nearestDistance = d;
        }
      }
      sums[nearest][0] += p[0];
      sums[nearest][1] += p[1];
      sums[nearest][2] += p[2];
      counts[nearest]++;
    }
    centers = centers.map((center, c) =>
      counts[c] === 0
        ? center
        : ([sums[c][0] / counts[c], sums[c][1] / counts[c], sums[c][2] / counts[c]] as Lab)
    );
  }

  return centers.map((center, c) => ({ center, count: counts[c] })).filter((c) => c.count > 0);
}

/** Folds clusters closer than `threshold` into each other (shading on one fabric). */
function mergeSimilar(clusters: Cluster[], threshold: number): Cluster[] {
  const result: Cluster[] = [];
  for (const cluster of [...clusters].sort((a, b) => b.count - a.count)) {
    const match = result.find((r) => deltaE(r.center, cluster.center) < threshold);
    if (!match) {
      result.push({ center: [...cluster.center] as Lab, count: cluster.count });
      continue;
    }
    const total = match.count + cluster.count;
    match.center = [
      (match.center[0] * match.count + cluster.center[0] * cluster.count) / total,
      (match.center[1] * match.count + cluster.center[1] * cluster.count) / total,
      (match.center[2] * match.count + cluster.center[2] * cluster.count) / total,
    ];
    match.count = total;
  }
  return result;
}
