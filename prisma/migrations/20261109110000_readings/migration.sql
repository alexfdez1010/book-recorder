-- Expand only: retain every Book column and id for old deployments and clients.
BEGIN;
LOCK TABLE "Book" IN SHARE ROW EXCLUSIVE MODE;

CREATE TABLE "Reading" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "bookId" TEXT NOT NULL REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "finishedOn" TIMESTAMP(3) NOT NULL,
  "pages" INTEGER NOT NULL,
  "language" TEXT NOT NULL,
  "rating" DOUBLE PRECISION,
  "opinion" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "Reading_bookId_finishedOn_createdAt_id_idx"
  ON "Reading"("bookId", "finishedOn", "createdAt", "id");
CREATE INDEX "Reading_finishedOn_idx" ON "Reading"("finishedOn");

-- No normalization or deduplication: copy dates, text and timestamps verbatim.
INSERT INTO "Reading" (
  "id", "bookId", "finishedOn", "pages", "language", "rating", "opinion", "createdAt", "updatedAt"
)
SELECT 'legacy:' || "id", "id", "finishedOn", "pages", "language", "rating", "opinion", "createdAt", "updatedAt"
FROM "Book" WHERE "status" = 'finished' AND "finishedOn" IS NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Book" b LEFT JOIN "Reading" r ON r."bookId" = b."id"
    WHERE b."status" = 'finished' AND b."finishedOn" IS NOT NULL AND (
      r."id" IS NULL OR
      (r."finishedOn", r."pages", r."language", r."rating", r."opinion", r."createdAt", r."updatedAt")
      IS DISTINCT FROM
      (b."finishedOn", b."pages", b."language", b."rating", b."opinion", b."createdAt", b."updatedAt")
    )
  ) OR (SELECT count(*) FROM "Reading") <>
       (SELECT count(*) FROM "Book" WHERE "status" = 'finished' AND "finishedOn" IS NOT NULL)
  THEN RAISE EXCEPTION 'Reading backfill verification failed'; END IF;
END $$;

-- Book is a compatibility projection of the latest chronological Reading.
-- Depth checks prevent recursion; the original deployment may still write Book.
CREATE FUNCTION sync_book_reading() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE latest_id TEXT;
BEGIN
  IF pg_trigger_depth() > 1 THEN RETURN NEW; END IF;
  SELECT "id" INTO latest_id FROM "Reading" WHERE "bookId" = NEW."id"
    ORDER BY "finishedOn" DESC, "createdAt" DESC, "id" DESC LIMIT 1;
  IF latest_id IS NOT NULL AND (NEW."status" <> 'finished' OR NEW."finishedOn" IS NULL) THEN
    RAISE EXCEPTION 'A book with reading history must remain finished';
  END IF;
  IF NEW."status" <> 'finished' OR NEW."finishedOn" IS NULL THEN RETURN NEW; END IF;
  IF latest_id IS NULL THEN
    INSERT INTO "Reading" (
      "id", "bookId", "finishedOn", "pages", "language", "rating", "opinion", "createdAt", "updatedAt"
    ) VALUES (
      'legacy:' || NEW."id", NEW."id", NEW."finishedOn", NEW."pages", NEW."language",
      NEW."rating", NEW."opinion", NEW."createdAt", NEW."updatedAt"
    );
  ELSIF (NEW."finishedOn", NEW."pages", NEW."language", NEW."rating", NEW."opinion")
    IS DISTINCT FROM (OLD."finishedOn", OLD."pages", OLD."language", OLD."rating", OLD."opinion") THEN
    UPDATE "Reading" SET "finishedOn" = NEW."finishedOn", "pages" = NEW."pages",
      "language" = NEW."language", "rating" = NEW."rating", "opinion" = NEW."opinion",
      "updatedAt" = NEW."updatedAt" WHERE "id" = latest_id;
  END IF;
  RETURN NEW;
END $$;

CREATE FUNCTION sync_reading_book() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE parent_id TEXT; latest "Reading"%ROWTYPE;
BEGIN
  parent_id := CASE WHEN TG_OP = 'DELETE' THEN OLD."bookId" ELSE NEW."bookId" END;
  SELECT * INTO latest FROM "Reading" WHERE "bookId" = parent_id
    ORDER BY "finishedOn" DESC, "createdAt" DESC, "id" DESC LIMIT 1;
  IF FOUND THEN
    UPDATE "Book" SET "status" = 'finished', "finishedOn" = latest."finishedOn",
      "pages" = latest."pages", "language" = latest."language", "rating" = latest."rating",
      "opinion" = latest."opinion", "updatedAt" = GREATEST("Book"."updatedAt", CURRENT_TIMESTAMP)
      WHERE "id" = parent_id AND
        ("status", "finishedOn", "pages", "language", "rating", "opinion") IS DISTINCT FROM
        ('finished', latest."finishedOn", latest."pages", latest."language", latest."rating", latest."opinion");
  ELSE
    UPDATE "Book" SET "status" = 'to-read', "finishedOn" = NULL,
      "rating" = NULL, "opinion" = NULL, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = parent_id;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER book_reading_compatibility AFTER INSERT OR UPDATE ON "Book"
  FOR EACH ROW EXECUTE FUNCTION sync_book_reading();
CREATE TRIGGER reading_book_projection AFTER INSERT OR UPDATE OR DELETE ON "Reading"
  FOR EACH ROW EXECUTE FUNCTION sync_reading_book();
COMMIT;
