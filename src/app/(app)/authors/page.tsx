import { BookCollection } from '@/components/library/book-collection';
import { CollectionHeader } from '@/components/library/collection-header';
import { listAuthors, listBooks } from '@/lib/books/repository';
import { listCategories } from '@/lib/books/categories-repository';

export const dynamic = 'force-dynamic';

/** Loads completed books grouped by author, retaining existing edit actions. */
export default async function AuthorsPage() {
  const [books, authors, categories] = await Promise.all([
    listBooks(),
    listAuthors(),
    listCategories(),
  ]);
  const count = new Set(books.map((book) => book.author)).size;
  return (
    <section className="flex min-w-0 flex-col gap-9">
      <CollectionHeader
        title="Authors"
        description={`${count} ${count === 1 ? 'voice' : 'voices'} in your reading life`}
        count={books.length}
        pages={books.reduce((sum, book) => sum + book.pages, 0)}
      />
      <BookCollection
        books={books}
        authors={authors}
        categories={categories}
        grouping="author"
        emptyTitle="No authors yet"
        emptyDescription="Authors appear here as you add finished books to your library."
      />
    </section>
  );
}
