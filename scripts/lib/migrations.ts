/** Exit status and captured output from one Prisma migration attempt. */
export interface MigrationResult {
  status: number;
  output: string;
}

/** Small I/O boundary for migration execution, retry delays and progress reports. */
export interface MigrationDependencies {
  run: () => Promise<MigrationResult>;
  wait: (milliseconds: number) => Promise<void>;
  report: (message: string) => void;
}

/**
 * Selects a direct migration URL from env, falling back to DATABASE_URL locally.
 * Returns a URL with a bounded Neon connection timeout; rejects pooled Neon URLs
 * and invalid configuration without including credentials in error messages.
 */
export function migrationUrl(env: NodeJS.ProcessEnv): string {
  const value = env.DATABASE_URL_UNPOOLED || env.DIRECT_URL || env.DATABASE_URL;
  if (!value)
    throw new Error(
      'Set DATABASE_URL_UNPOOLED or DATABASE_URL to run migrations.',
    );
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('The migration database URL is invalid.');
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('Migrations require a PostgreSQL connection URL.');
  }
  if (url.hostname.endsWith('.neon.tech')) {
    if (url.hostname.split('.')[0].endsWith('-pooler')) {
      throw new Error(
        'Set DATABASE_URL_UNPOOLED to the direct Neon connection before migrating.',
      );
    }
    if (!url.searchParams.has('connect_timeout')) {
      url.searchParams.set('connect_timeout', '15');
    }
  }
  return url.toString();
}

/**
 * Executes up to three attempts via injected I/O; returns the last exit status.
 * Only connection failures and advisory-lock timeouts retry (after 2s and 4s).
 * SQL, authentication and failed-migration errors stop immediately.
 */
export async function deployMigrations({
  run,
  wait,
  report,
}: MigrationDependencies): Promise<number> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = await run();
    const code = result.output.match(/\bError:\s*(P\d{4})\b/)?.[1];
    const transient =
      code === 'P1001' ||
      (code === 'P1002' && /advisory lock/i.test(result.output));
    if (result.status === 0 || !transient || attempt === 3)
      return result.status;
    const delay = attempt * 2_000;
    report(
      `Temporary database connection or migration lock failure; retry ${attempt + 1}/3 in ${delay / 1_000}s.`,
    );
    await wait(delay);
  }
  return 1;
}
