# Vercel and Neon deployment

## Diagnosis

The failed production deployment at commit `990101f` reached Neon, then failed with Prisma `P1002` while waiting 10 seconds for `pg_advisory_lock(72707369)`. The migration command used the pooled `DATABASE_URL`. Inspection found an idle PgBouncer session retaining that lock, while all six migrations were already applied. This was not a restriction on database access in Vercel builds.

## Build and release responsibilities

- `bun run build`: generate Prisma Client and compile Next.js. Database-backed pages are dynamic, so compilation does not query Neon.
- `bun run database:deploy`: apply pending migrations over a direct connection. The command uses `scripts/migrate-deploy.ts`; it never resets the database or disables advisory locking.
- `bun run vercel-build`: compile first, then migrate only when `VERCEL_ENV=production`. Vercel promotes a deployment only after the complete command succeeds. A failed compile does not touch the schema; a failed migration keeps the existing deployment serving.

`vercel.json` versions the Vercel build command. The project setting should also be `bun run vercel-build` so the CLI and repository configuration agree.

## Connection configuration

Keep `DATABASE_URL` pooled for runtime queries. The migration runner selects `DATABASE_URL_UNPOOLED` (provided by the Neon integration), then `DIRECT_URL`, then `DATABASE_URL` for existing local PostgreSQL setups. It rejects a pooled Neon URL rather than silently migrating through PgBouncer. No credentials are committed, and the runtime URL is only overridden in the migration child process.

For direct Neon URLs, `connect_timeout=15` is added if absent; an explicit value is preserved. Connection failures (`P1001`) and advisory-lock timeouts (`P1002` with an advisory-lock message) retry twice, after 2 and 4 seconds. Authentication, SQL, failed-migration and other errors stop immediately. This helps short-lived contention without masking persistent failures.

Use `bun run database:deploy` locally against PostgreSQL, or run it in a trusted CI process with the intended environment variables. Use `bunx prisma migrate status` with `DATABASE_URL` set to the direct connection for a read-only history check. The pure `migrationUrl(env)` helper returns the selected connection string; `deployMigrations({ run, wait, report })` runs the bounded retry policy with injected process and timer boundaries.

## Preview environments

At the time of this change, Preview and Production resolve to the same Neon database. Automatic migrations are production-only to keep a preview from modifying that shared schema. UI previews still build normally. For schema changes, provision an isolated Neon branch, scope its pooled and unpooled URLs to Preview, and apply migrations there before enabling preview migration automation. Do not reuse a production direct URL for a preview branch.

## Verification and recovery

Run `bun run pre-commit` with disposable local database credentials. The unit suite verifies connection selection, safe configuration errors, retries and permanent failures. Building with an unreachable database URL verifies that compilation has no database dependency.

If a migration fails, inspect its error before retrying manually. Never use `migrate reset`, `db push`, or `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK` in production. A persistent idle lock needs a targeted database-session investigation, not unlimited retries.

This change introduces no schema or data migration. To roll back the deployment configuration, revert its commit and restore the prior Vercel build command; existing records and migration history remain intact. Keep future schema migrations compatible with the previous application version because it continues serving during builds and can be restored independently of the database.

## Official references

- [Prisma deployment on Vercel](https://www.prisma.io/docs/orm/v6/prisma-client/deployment/serverless/deploy-to-vercel)
- [Neon connection setup for Prisma](https://neon.com/docs/guides/prisma)
- [Prisma connection timeouts with Neon](https://www.prisma.io/docs/orm/v6/overview/databases/neon)
- [Vercel build configuration and environment access](https://vercel.com/docs/builds)
