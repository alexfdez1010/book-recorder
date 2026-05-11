-- Categories live in their own table so they can be managed at runtime.
-- Book.category stays a plain String for backward compatibility — existing
-- production rows are NOT modified. The Category table is the source of
-- truth for the picker; books reference it by name.

CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- 1. Preserve every distinct category currently used by existing Book rows
--    (production-safe: if prod has a category we didn't seed, it survives).
INSERT INTO "Category" ("id", "name", "updatedAt")
SELECT gen_random_uuid()::text, "category", CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "category" FROM "Book" WHERE "category" IS NOT NULL AND "category" <> '') AS existing
ON CONFLICT ("name") DO NOTHING;

-- 2. Seed defaults: the original 15 + extras. Idempotent via ON CONFLICT.
INSERT INTO "Category" ("id", "name", "updatedAt") VALUES
    ('seed_fiction',             'Fiction',                   CURRENT_TIMESTAMP),
    ('seed_science_fiction',     'Science Fiction',           CURRENT_TIMESTAMP),
    ('seed_fantasy',             'Fantasy',                   CURRENT_TIMESTAMP),
    ('seed_mystery_thriller',    'Mystery & Thriller',        CURRENT_TIMESTAMP),
    ('seed_romance',             'Romance',                   CURRENT_TIMESTAMP),
    ('seed_horror',              'Horror',                    CURRENT_TIMESTAMP),
    ('seed_biography_memoir',    'Biography & Memoir',        CURRENT_TIMESTAMP),
    ('seed_history',             'History',                   CURRENT_TIMESTAMP),
    ('seed_science',             'Science',                   CURRENT_TIMESTAMP),
    ('seed_technology',          'Technology',                CURRENT_TIMESTAMP),
    ('seed_philosophy',          'Philosophy',                CURRENT_TIMESTAMP),
    ('seed_self_help',           'Self-Help',                 CURRENT_TIMESTAMP),
    ('seed_business',            'Business',                  CURRENT_TIMESTAMP),
    ('seed_poetry',              'Poetry',                    CURRENT_TIMESTAMP),
    ('seed_other',               'Other',                     CURRENT_TIMESTAMP),
    ('seed_young_adult',         'Young Adult',               CURRENT_TIMESTAMP),
    ('seed_childrens',           'Children''s',               CURRENT_TIMESTAMP),
    ('seed_comics',              'Comics & Graphic Novels',   CURRENT_TIMESTAMP),
    ('seed_cooking',             'Cooking',                   CURRENT_TIMESTAMP),
    ('seed_art_design',          'Art & Design',              CURRENT_TIMESTAMP),
    ('seed_religion',            'Religion & Spirituality',   CURRENT_TIMESTAMP),
    ('seed_travel',              'Travel',                    CURRENT_TIMESTAMP),
    ('seed_education',           'Education',                 CURRENT_TIMESTAMP),
    ('seed_health_fitness',      'Health & Fitness',          CURRENT_TIMESTAMP),
    ('seed_politics',            'Politics',                  CURRENT_TIMESTAMP),
    ('seed_true_crime',          'True Crime',                CURRENT_TIMESTAMP),
    ('seed_essays',              'Essays',                    CURRENT_TIMESTAMP),
    ('seed_classics',            'Classics',                  CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;
