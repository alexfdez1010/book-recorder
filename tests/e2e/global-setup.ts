import { execFileSync } from 'node:child_process';

/** Seeds only an explicitly local test database, never a developer or production library. */
export default function setup() {
  const database = new URL(process.env.DATABASE_URL ?? '');
  if (
    !['localhost', '127.0.0.1'].includes(database.hostname) ||
    !database.pathname.endsWith('_test')
  ) {
    throw new Error('E2E requires a local database whose name ends in _test');
  }
  execFileSync('bun', ['run', 'auth:provision'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      AUTH_OWNER_EMAIL: process.env.AUTH_OWNER_EMAIL ?? 'owner@example.test',
      AUTH_OWNER_PASSWORD: process.env.PASSWORD ?? 'dev-password',
    },
  });
}
