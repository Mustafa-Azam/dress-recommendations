import type { FiberShare } from '@/types/wardrobe';

/** Common label spellings mapped to one name. */
const FIBER_ALIASES: Record<string, string> = {
  cotton: 'cotton',
  'organic cotton': 'cotton',
  polyester: 'polyester',
  'recycled polyester': 'polyester',
  poly: 'polyester',
  wool: 'wool',
  'merino wool': 'wool',
  merino: 'wool',
  cashmere: 'cashmere',
  linen: 'linen',
  flax: 'linen',
  silk: 'silk',
  viscose: 'viscose',
  rayon: 'viscose',
  modal: 'modal',
  lyocell: 'lyocell',
  tencel: 'lyocell',
  nylon: 'nylon',
  polyamide: 'nylon',
  acrylic: 'acrylic',
  elastane: 'elastane',
  spandex: 'elastane',
  lycra: 'elastane',
  leather: 'leather',
  down: 'down',
};

function normalizeFiber(raw: string): string {
  const cleaned = raw.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
  return FIBER_ALIASES[cleaned] ?? cleaned;
}

/**
 * Reads fabric content as printed on a label, e.g.
 * "60% cotton, 40% polyester" or "Cotton 95% / Elastane 5%".
 * Repeated fibers are added together. Unparseable parts are skipped.
 */
export function parseFiberContent(text: string): FiberShare[] {
  const totals = new Map<string, number>();
  // A comma followed by a digit is a decimal comma ("20,5%"), not a separator.
  const parts = text.split(/,(?!\d)|[/;\n+]|\band\b/i);

  for (const part of parts) {
    const match =
      part.match(/(\d+(?:[.,]\d+)?)\s*%\s*([a-z][a-z\s-]*)/i) ??
      part.match(/([a-z][a-z\s-]*?)\s*(\d+(?:[.,]\d+)?)\s*%/i);
    if (!match) {
      continue;
    }
    const numberFirst = /^\d/.test(match[1]);
    const percent = parseFloat((numberFirst ? match[1] : match[2]).replace(',', '.'));
    const fiber = normalizeFiber(numberFirst ? match[2] : match[1]);
    if (!fiber || !(percent > 0) || percent > 100) {
      continue;
    }
    totals.set(fiber, (totals.get(fiber) ?? 0) + percent);
  }

  return [...totals.entries()]
    .map(([fiber, percent]) => ({ fiber, percent }))
    .sort((a, b) => b.percent - a.percent);
}

export function formatFiberContent(fibers: FiberShare[]): string {
  return fibers.map((f) => `${f.percent}% ${f.fiber}`).join(', ');
}
