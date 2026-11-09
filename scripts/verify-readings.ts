import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

/**
 * Verifies reading coverage and latest-book projections in one consistent snapshot.
 * Read-only: prints counts, never titles, opinions or database credentials.
 * Invoke with `bun run readings:verify`; inconsistent data exits nonzero.
 */
async function main(): Promise<void> {
  const report = await prisma.$transaction(
    async (tx) => {
      const [counts] = await tx.$queryRaw<
        Array<{ missing: bigint; mismatched: bigint; undated: bigint }>
      >`
      SELECT
        count(*) FILTER (WHERE b."status" = 'finished' AND b."finishedOn" IS NOT NULL AND r."id" IS NULL) AS missing,
        count(*) FILTER (WHERE r."id" IS NOT NULL AND (
          b."status" <> 'finished' OR
          (b."finishedOn", b."pages", b."language", b."rating", b."opinion") IS DISTINCT FROM
          (r."finishedOn", r."pages", r."language", r."rating", r."opinion")
        )) AS mismatched,
        count(*) FILTER (WHERE b."status" = 'finished' AND b."finishedOn" IS NULL) AS undated
      FROM "Book" b LEFT JOIN LATERAL (
        SELECT * FROM "Reading" WHERE "bookId" = b."id"
        ORDER BY "finishedOn" DESC, "createdAt" DESC, "id" DESC LIMIT 1
      ) r ON true
    `;
      return {
        books: await tx.book.count(),
        readings: await tx.reading.count(),
        titlesRead: await tx.book.count({ where: { readings: { some: {} } } }),
        missingReadings: Number(counts.missing),
        mismatchedProjections: Number(counts.mismatched),
        preservedUndatedBooks: Number(counts.undated),
      };
    },
    { isolationLevel: 'RepeatableRead' },
  );
  console.info(JSON.stringify(report, null, 2));
  if (report.missingReadings || report.mismatchedProjections)
    throw new Error(
      'Reading verification failed; keep the previous application deployment',
    );
}

main()
  .catch(() => {
    console.error(
      'Reading verification failed; check database access and the reported counts',
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
