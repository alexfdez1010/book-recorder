import 'dotenv/config';
import { spawnSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import { deployMigrations, migrationUrl } from './lib/migrations';

/**
 * Runs Prisma against a direct connection in a child process, preserving the
 * application's pooled URL. Reports redacted output and exits nonzero on failure.
 * Invoke with `bun run database:deploy`; no reset or lock bypass is performed.
 */
async function main(): Promise<number> {
  const databaseUrl = migrationUrl(process.env);
  return deployMigrations({
    run: async () => {
      const result = spawnSync(
        'bunx',
        ['--no-install', 'prisma', 'migrate', 'deploy'],
        {
          env: { ...process.env, DATABASE_URL: databaseUrl },
          encoding: 'utf8',
          maxBuffer: 2 * 1024 * 1024,
        },
      );
      const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
      process.stdout.write(
        output.replace(
          /postgres(?:ql)?:\/\/[^\s"']+/g,
          '[database URL redacted]',
        ),
      );
      if (result.error)
        console.error('Could not complete the Prisma migration process.');
      return { status: result.status ?? 1, output };
    },
    wait: setTimeout,
    report: console.info,
  });
}

main().then(
  (status) => {
    process.exitCode = status;
  },
  (error: Error) => {
    console.error(error.message);
    process.exitCode = 1;
  },
);
