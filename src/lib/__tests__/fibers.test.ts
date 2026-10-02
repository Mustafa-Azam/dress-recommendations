import { describe, expect, it } from '@jest/globals';

import { formatFiberContent, parseFiberContent } from '@/lib/fibers';

describe('parseFiberContent', () => {
  it('reads percent-first labels', () => {
    expect(parseFiberContent('60% cotton, 40% polyester')).toEqual([
      { fiber: 'cotton', percent: 60 },
      { fiber: 'polyester', percent: 40 },
    ]);
  });

  it('reads fiber-first labels and normalizes names', () => {
    expect(parseFiberContent('Cotton 95% / Spandex 5%')).toEqual([
      { fiber: 'cotton', percent: 95 },
      { fiber: 'elastane', percent: 5 },
    ]);
  });

  it('adds up repeated fibers and handles decimals', () => {
    expect(parseFiberContent('50% organic cotton; 30% cotton; 20,5% recycled polyester')).toEqual([
      { fiber: 'cotton', percent: 80 },
      { fiber: 'polyester', percent: 20.5 },
    ]);
  });

  it('handles "and" and newlines', () => {
    expect(parseFiberContent('70% wool and 30% nylon')).toEqual([
      { fiber: 'wool', percent: 70 },
      { fiber: 'nylon', percent: 30 },
    ]);
    expect(parseFiberContent('100% LINEN\nMade in Portugal')).toEqual([{ fiber: 'linen', percent: 100 }]);
  });

  it('ignores text without percentages', () => {
    expect(parseFiberContent('Machine wash cold')).toEqual([]);
    expect(parseFiberContent('')).toEqual([]);
  });
});

describe('formatFiberContent', () => {
  it('formats back to label style', () => {
    expect(
      formatFiberContent([
        { fiber: 'cotton', percent: 60 },
        { fiber: 'polyester', percent: 40 },
      ])
    ).toBe('60% cotton, 40% polyester');
  });
});
