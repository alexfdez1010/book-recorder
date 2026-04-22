-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publicationDate" TIMESTAMP(3),
    "pages" INTEGER NOT NULL,
    "coverUrl" TEXT,
    "category" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "finishedOn" TIMESTAMP(3) NOT NULL,
    "externalId" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Book_finishedOn_idx" ON "Book"("finishedOn");

-- CreateIndex
CREATE INDEX "Book_category_idx" ON "Book"("category");
