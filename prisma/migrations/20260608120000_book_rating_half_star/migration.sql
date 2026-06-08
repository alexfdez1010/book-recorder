-- Allow half-star ratings: widen `rating` to a float and require 0.5 increments
-- within the 0.5..5 range. Existing integer ratings (1..5) remain valid and are
-- preserved unchanged by the DOUBLE PRECISION widening.
ALTER TABLE "Book" DROP CONSTRAINT IF EXISTS "Book_rating_range";

ALTER TABLE "Book" ALTER COLUMN "rating" TYPE DOUBLE PRECISION;

ALTER TABLE "Book" ADD CONSTRAINT "Book_rating_range" CHECK (
  "rating" IS NULL
  OR (
    "rating" BETWEEN 0.5 AND 5
    AND ("rating" * 2) = floor("rating" * 2)
  )
);
