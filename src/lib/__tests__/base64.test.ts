import { describe, expect, it } from '@jest/globals';

import { base64ToBytes } from '@/lib/base64';

const bytesOf = (text: string) => Array.from(text, (c) => c.charCodeAt(0));

describe('base64ToBytes', () => {
  // RFC 4648 test vectors
  it.each([
    ['', ''],
    ['Zg==', 'f'],
    ['Zm8=', 'fo'],
    ['Zm9v', 'foo'],
    ['Zm9vYg==', 'foob'],
    ['Zm9vYmE=', 'fooba'],
    ['Zm9vYmFy', 'foobar'],
  ])('decodes %p', (encoded, text) => {
    expect(Array.from(base64ToBytes(encoded))).toEqual(bytesOf(text));
  });

  it('decodes high bytes and ignores line breaks', () => {
    expect(Array.from(base64ToBytes('/+7d\nzLuq'))).toEqual([0xff, 0xee, 0xdd, 0xcc, 0xbb, 0xaa]);
  });
});
