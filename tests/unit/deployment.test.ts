import { describe, expect, it, vi } from 'vitest';
import { deployMigrations, migrationUrl } from '../../scripts/lib/migrations';

const local = 'postgresql://postgres:postgres@localhost:5434/test';
const direct =
  'postgresql://user:secret@ep-test.eu-central-1.aws.neon.tech/db?sslmode=require';
const pooled = direct.replace('ep-test.', 'ep-test-pooler.');

describe('migration connection', () => {
  it('uses the Neon integration direct URL without changing runtime configuration', () => {
    const env = { DATABASE_URL: pooled, DATABASE_URL_UNPOOLED: direct };
    const url = new URL(migrationUrl(env));
    expect(url.hostname).not.toContain('-pooler');
    expect(url.searchParams.get('sslmode')).toBe('require');
    expect(url.searchParams.get('connect_timeout')).toBe('15');
    expect(env.DATABASE_URL).toBe(pooled);
  });

  it('supports an explicit DIRECT_URL and keeps an intentional timeout', () => {
    const url = migrationUrl({
      DATABASE_URL: pooled,
      DIRECT_URL: `${direct}&connect_timeout=30`,
    });
    expect(new URL(url).searchParams.get('connect_timeout')).toBe('30');
  });

  it('preserves local PostgreSQL compatibility without another environment variable', () => {
    expect(migrationUrl({ DATABASE_URL: local })).toBe(local);
  });

  it('rejects pooled Neon migrations instead of leaving session locks behind', () => {
    expect(() => migrationUrl({ DATABASE_URL: pooled })).toThrow(
      'direct Neon connection',
    );
    expect(() =>
      migrationUrl({ DATABASE_URL_UNPOOLED: pooled, DATABASE_URL: local }),
    ).toThrow('direct Neon connection');
  });

  it.each([undefined, 'not-a-url-secret', 'https://user:secret@example.com'])(
    'rejects missing or invalid configuration without exposing credentials: %s',
    (value) => {
      expect(() => migrationUrl({ DATABASE_URL: value })).toThrow();
      try {
        migrationUrl({ DATABASE_URL: value });
      } catch (error) {
        expect(String(error)).not.toContain('secret');
      }
    },
  );
});

describe('migration deployment', () => {
  it('returns immediately after a successful attempt', async () => {
    const run = vi
      .fn()
      .mockResolvedValue({ status: 0, output: 'No pending migrations.' });
    const wait = vi.fn();
    expect(await deployMigrations({ run, wait, report: vi.fn() })).toBe(0);
    expect(run).toHaveBeenCalledTimes(1);
    expect(wait).not.toHaveBeenCalled();
  });

  it.each([
    'Error: P1001 Cannot reach database',
    'Error: P1002 Timed out trying to acquire a postgres advisory lock',
  ])('retries a transient failure, then succeeds: %s', async (output) => {
    const run = vi
      .fn()
      .mockResolvedValueOnce({ status: 1, output })
      .mockResolvedValue({ status: 0, output: '' });
    const wait = vi.fn();
    const report = vi.fn();
    expect(await deployMigrations({ run, wait, report })).toBe(0);
    expect(run).toHaveBeenCalledTimes(2);
    expect(wait).toHaveBeenCalledWith(2_000);
    expect(report).toHaveBeenCalledWith(expect.stringContaining('retry 2/3'));
  });

  it('bounds retries and preserves failure so Vercel cannot promote the build', async () => {
    const run = vi
      .fn()
      .mockResolvedValue({ status: 1, output: 'Error: P1001' });
    const wait = vi.fn();
    expect(await deployMigrations({ run, wait, report: vi.fn() })).toBe(1);
    expect(run).toHaveBeenCalledTimes(3);
    expect(wait.mock.calls).toEqual([[2_000], [4_000]]);
  });

  it.each([
    'Error: P1000 invalid credentials',
    'Error: P3009 failed migration',
    'Error: P3018 invalid SQL',
    'Error: P3018 failed migration; nested Error: P1001',
    'Error: P1002 query timeout',
    'Process could not start',
  ])('does not retry a non-transient failure: %s', async (output) => {
    const run = vi.fn().mockResolvedValue({ status: 1, output });
    const wait = vi.fn();
    expect(await deployMigrations({ run, wait, report: vi.fn() })).toBe(1);
    expect(run).toHaveBeenCalledTimes(1);
    expect(wait).not.toHaveBeenCalled();
  });
});
