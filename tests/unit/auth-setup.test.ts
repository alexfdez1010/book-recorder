import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { validSetupToken } from '@/lib/auth/setup';

const token = 'private-setup-token';
const hash = createHash('sha256').update(token).digest('hex');
describe('private first-account setup', () => {
  it('accepts only the token whose hash was configured', () => {
    expect(validSetupToken(token, hash)).toBe(true);
    expect(validSetupToken('other', hash)).toBe(false);
  });
  it.each([undefined, '', 'no-hash', 'ab'.repeat(31), 'z'.repeat(64)])(
    'fails closed with invalid configuration %s',
    (value) => {
      expect(validSetupToken(token, value)).toBe(false);
    },
  );
  it('rejects missing tokens', () => {
    expect(validSetupToken(null, hash)).toBe(false);
    expect(validSetupToken('', hash)).toBe(false);
  });
});
