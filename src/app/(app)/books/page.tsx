import { AddBookDialog } from '@/components/add-book-dialog';
import { BookCollection } from '@/components/library/book-collection';
import { CollectionHeader } from '@/components/library/collection-header';
import { listAuthors } from '@/lib/books/repository';
import { listLibraryBooks } from '@/lib/books/readings-repository';
import { listCategories } from '@/lib/books/categories-repository';

export const dynamic = 'force-dynamic';

/** Loads finished books and selection options; collection interaction stays local. */
export default async function BooksPage() {
  const [books, authors, categories] = await Promise.all([
    listLibraryBooks(),
    listAuthors(),
    listCategories(),
  ]);
  return (
    <section className="flex min-w-0 flex-col gap-9">
      <CollectionHeader
        title="Books"
        description="The books you finish and the stories you keep"
        count={books.length}
        readingCount={books.reduce(
          (sum, book) => sum + book.readings.length,
          0,
        )}
        pages={books.reduce(
          (sum, book) =>
            sum +
            book.readings.reduce((pages, reading) => pages + reading.pages, 0),
          0,
        )}
      >
        <AddBookDialog authors={authors} categories={categories} />
      </CollectionHeader>
      <BookCollection
        books={books}
        authors={authors}
        categories={categories}
        grouping="month"
        showRating
        emptyTitle="No books yet"
        emptyDescription="Start with a book you’ve finished. Choose Add book to search by title or enter the details yourself."
      />
    </section>
  );
}
