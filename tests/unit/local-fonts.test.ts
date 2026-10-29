import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const FONTS = ['fraunces', 'geist', 'jetbrains-mono'] as const;

/** Reads a named TrueType table from a real vendored font; missing tables fail clearly. */
function table(font: Buffer, tag: string): Buffer {
  const count = font.readUInt16BE(4);
  for (let index = 0; index < count; index += 1) {
    const record = 12 + index * 16;
    if (font.toString('ascii', record, record + 4) !== tag) continue;
    const offset = font.readUInt32BE(record + 8);
    return font.subarray(offset, offset + font.readUInt32BE(record + 12));
  }
  throw new Error(`Missing ${tag} table`);
}

/** Extracts variable axes and their supported bounds without font-processing dependencies. */
function axes(font: Buffer): Map<string, { minimum: number; maximum: number }> {
  const data = table(font, 'fvar');
  const start = data.readUInt16BE(4);
  const count = data.readUInt16BE(8);
  const size = data.readUInt16BE(10);
  return new Map(
    Array.from({ length: count }, (_, index) => {
      const offset = start + index * size;
      return [
        data.toString('ascii', offset, offset + 4),
        {
          minimum: data.readInt32BE(offset + 4) / 65_536,
          maximum: data.readInt32BE(offset + 12) / 65_536,
        },
      ];
    }),
  );
}

describe('vendored variable fonts', () => {
  it.each(FONTS)(
    '%s is a valid variable font supporting every UI weight',
    (name) => {
      const font = readFileSync(resolve(`src/app/fonts/${name}.ttf`));
      expect(font.readUInt32BE(0)).toBe(0x00010000);
      expect(table(font, 'cmap').length).toBeGreaterThan(0);
      const weight = axes(font).get('wght');
      expect(weight).toBeDefined();
      expect(weight!.minimum).toBeLessThanOrEqual(400);
      expect(weight!.maximum).toBeGreaterThanOrEqual(700);
    },
  );

  it('preserves the Fraunces optical, softness and wonk variation axes', () => {
    const font = readFileSync(resolve('src/app/fonts/fraunces.ttf'));
    const variation = axes(font);
    expect([...variation.keys()].sort()).toEqual([
      'SOFT',
      'WONK',
      'opsz',
      'wght',
    ]);
    expect(variation.get('opsz')).toEqual({ minimum: 9, maximum: 144 });
    expect(variation.get('SOFT')).toEqual({ minimum: 0, maximum: 100 });
  });

  it.each(FONTS)('%s retains its original adjacent license', (name) => {
    const license = readFileSync(
      resolve(`src/app/fonts/${name}-OFL.txt`),
      'utf8',
    );
    expect(license).toContain('SIL OPEN FONT LICENSE Version 1.1');
    expect(license).toMatch(/copyright/i);
  });
});
