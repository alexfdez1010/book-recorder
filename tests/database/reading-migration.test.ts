import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

/** Executes fixture SQL only inside the dedicated local test container. */
function sql(input: string): string {
  const url = new URL(process.env.DATABASE_URL ?? '');
  if (
    !['localhost', '127.0.0.1'].includes(url.hostname) ||
    url.pathname !== '/book_recorder_test'
  )
    throw new Error(
      'Migration verification requires the disposable book_recorder_test database',
    );
  return execFileSync(
    'docker',
    [
      'exec',
      '-i',
      'postgres_book_recorder_test',
      'psql',
      '-X',
      '-v',
      'ON_ERROR_STOP=1',
      '-U',
      'postgres',
      '-d',
      'book_recorder_test',
    ],
    { input, encoding: 'utf8' },
  );
}

it('backfills the old model byte-for-byte without merging duplicates or changing queued and undated records', () => {
  const schema = `reading_migration_${crypto.randomUUID().replaceAll('-', '')}`;
  const migration = readFileSync(
    'prisma/migrations/20261109110000_readings/migration.sql',
    'utf8',
  );
  try {
    const output = sql(`
      CREATE SCHEMA "${schema}";
      SET search_path TO "${schema}";
      CREATE TABLE "Book" (LIKE public."Book" INCLUDING ALL);
      INSERT INTO "Book" ("id", "title", "author", "pages", "category", "language", "status", "finishedOn", "rating", "opinion", "createdAt", "updatedAt") VALUES
        ('first', 'Identical title', 'Author', 300, 'Fiction', 'es', 'finished', '2020-01-02 01:23:45.123', 4.5, E'Café\nCorazón  ', '2019-01-01', '2020-01-03'),
        ('second', 'Identical title', 'Author', 400, 'Fiction', 'en', 'finished', '2026-11-01', NULL, NULL, '2026-10-01', '2026-11-01'),
        ('queue', 'Queued', 'Author', 150, 'Other', 'fr', 'to-read', NULL, 2.5, repeat('長', 10000), '2026-10-01', '2026-10-02'),
        ('undated', 'Legacy undated', 'Author', 100, 'Other', 'en', 'finished', NULL, NULL, 'Keep me', '2020-01-01', '2020-01-01');
      CREATE TABLE snapshot AS SELECT * FROM "Book";
      ${migration}
      DO $$ BEGIN
        IF EXISTS (SELECT * FROM snapshot EXCEPT SELECT * FROM "Book") OR
           EXISTS (SELECT * FROM "Book" EXCEPT SELECT * FROM snapshot)
        THEN RAISE EXCEPTION 'Book contents changed'; END IF;
        IF (SELECT count(*) FROM "Reading") <> 2 THEN RAISE EXCEPTION 'Readings lost or merged'; END IF;
        IF EXISTS (SELECT 1 FROM snapshot b JOIN "Reading" r ON r."bookId" = b."id"
          WHERE (r."finishedOn", r."pages", r."language", r."rating", r."opinion", r."createdAt", r."updatedAt")
          IS DISTINCT FROM (b."finishedOn", b."pages", b."language", b."rating", b."opinion", b."createdAt", b."updatedAt"))
        THEN RAISE EXCEPTION 'Snapshot mismatch'; END IF;
      END $$;
      UPDATE "Book" SET "rating" = 5, "opinion" = 'Old deployment writes' WHERE "id" = 'first';
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM "Reading" WHERE "bookId" = 'first' AND "rating" = 5 AND "opinion" = 'Old deployment writes')
        THEN RAISE EXCEPTION 'Legacy writer not synchronized'; END IF;
      END $$;
      SELECT 'preserved';
    `);
    expect(output).toContain('preserved');
  } finally {
    sql(`DROP SCHEMA IF EXISTS "${schema}" CASCADE;`);
  }
});
