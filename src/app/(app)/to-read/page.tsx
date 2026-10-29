import { AddBookDialog } from '@/components/add-book-dialog';
import { BookCollection } from '@/components/library/book-collection';
import { CollectionHeader } from '@/components/library/collection-header';
import { listAuthors, listToReadBooks } from '@/lib/books/repository';
import { listCategories } from '@/lib/books/categories-repository';

export const dynamic = 'force-dynamic';

/** Loads the reading queue without counting its unfinished books as completed. */
export default async function ToReadPage() {
  const [books, authors, categories] = await Promise.all([
    listToReadBooks(),
    listAuthors(),
    listCategories(),
  ]);
  return (
    <section className="flex min-w-0 flex-col gap-9">
      <CollectionHeader
        title="To read"
        description="Good things waiting on your shelf."
        count={books.length}
        pages={books.reduce((sum, book) => sum + book.pages, 0)}
        queued
      >
        <AddBookDialog
          authors={authors}
          categories={categories}
          status="to-read"
        />
      </CollectionHeader>
      <BookCollection
        books={books}
        authors={authors}
        categories={categories}
        grouping="none"
        emptyTitle="Nothing queued yet."
        emptyDescription="Keep your next reads here. Choose Add to read, then mark each book finished when you’re done."
      />
    </section>
  );
}
