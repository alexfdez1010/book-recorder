import { describe, expect, it } from 'vitest';
import { hashToken, timingSafeEqual } from '@/lib/auth/token';

describe('hashToken', () => {
  it('produces a deterministic 64-char hex digest', async () => {
    const a = await hashToken('pw', 'secret');
    const b = await hashToken('pw', 'secret');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('differs when password or secret differs', async () => {
    const base = await hashToken('pw', 'secret');
    expect(await hashToken('pw2', 'secret')).not.toBe(base);
    expect(await hashToken('pw', 'secret2')).not.toBe(base);
  });
});

describe('timingSafeEqual', () => {
  it('returns true for identical strings', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
  });

  it('returns false for mismatched content or length', () => {
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
  });
});
