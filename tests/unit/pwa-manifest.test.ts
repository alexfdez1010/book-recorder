import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import manifest from '@/app/manifest';

describe('PWA manifest and icon assets', () => {
  it('launches the authenticated library in standalone mode without tracking parameters', () => {
    expect(manifest()).toMatchObject({
      id: '/',
      name: 'Book Recorder',
      start_url: '/books',
      scope: '/',
      display: 'standalone',
    });
    expect(manifest().name).not.toMatch(/[.·]/);
  });

  it('provides real PNG icons at their declared dimensions, including a maskable icon', () => {
    const icons = manifest().icons ?? [];
    expect(icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
    expect(icons.map((icon) => icon.sizes)).toContain('192x192');
    expect(icons.map((icon) => icon.sizes)).toContain('512x512');
    for (const icon of icons) {
      const png = readFileSync(resolve('public', icon.src.slice(1)));
      expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
      expect(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`).toBe(
        icon.sizes,
      );
      expect(icon.type).toBe('image/png');
    }
  });

  it('includes an Apple touch icon at 180px', () => {
    const png = readFileSync(resolve('public/apple-touch-icon.png'));
    expect(png.readUInt32BE(16)).toBe(180);
    expect(png.readUInt32BE(20)).toBe(180);
  });
});
