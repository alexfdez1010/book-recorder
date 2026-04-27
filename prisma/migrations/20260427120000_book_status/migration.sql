-- AlterTable: add status field defaulting to "finished" so existing rows are tagged correctly,
-- then make finishedOn nullable to support to-read entries.
ALTER TABLE "Book" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'finished';
ALTER TABLE "Book" ALTER COLUMN "finishedOn" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Book_status_idx" ON "Book"("status");
