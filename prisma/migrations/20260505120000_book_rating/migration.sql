-- AlterTable: add nullable 1..5 rating column. Existing rows stay null.
ALTER TABLE "Book" ADD COLUMN "rating" INTEGER;
ALTER TABLE "Book" ADD CONSTRAINT "Book_rating_range" CHECK ("rating" IS NULL OR ("rating" BETWEEN 1 AND 5));
