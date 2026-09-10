import { BookOpinion } from '@/components/book-opinion';
import { listAuthors, listBooks } from '@/lib/books/repository';
import { listCategories } from '@/lib/books/categories-repository';
import { languageName } from '@/lib/books/language';

export const dynamic = 'force-dynamic';
import { AddBookDialog } from '@/components/add-book-dialog';
import { BookCover } from '@/components/book-cover';
import { DeleteBookButton } from '@/components/delete-book-button';
import { EditBookDialog } from '@/components/edit-book-dialog';
import { InlineRating } from '@/components/inline-rating';
import { Badge } from '@/components/ui/badge';

const MONTH_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Returns a UTC month key so books group consistently across time zones. */
function monthKey(d: Date): string {
  const date = new Date(d);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** Loads the library data and renders the responsive catalogue view. */
export default async function BooksPage() {
  const [books, authors, categories] = await Promise.all([
    listBooks(),
    listAuthors(),
    listCategories(),
  ]);
  const totalPages = books.reduce((s, b) => s + b.pages, 0);

  const groups = new Map<
    string,
    { date: Date; items: (typeof books)[number][] }
  >();
  books.forEach((book) => {
    const key = monthKey(book.finishedOn);
    const bucket = groups.get(key);
    if (bucket) bucket.items.push(book);
    else groups.set(key, { date: new Date(book.finishedOn), items: [book] });
  });
  const orderedGroups = [...groups.entries()].sort((a, b) =>
    b[0].localeCompare(a[0]),
  );

  return (
    <section className="flex flex-col gap-10">
      <div className="lib-section-head">
        <div className="flex flex-col gap-2">
          <h1 className="lib-title">Books</h1>
          <p className="lib-subtitle">
            {books.length} books · {totalPages.toLocaleString()} pages
          </p>
        </div>
        <AddBookDialog authors={authors} categories={categories} />
      </div>

      {books.length === 0 ? (
        <div className="lib-empty">
          <p className="lib-empty__title">No books yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-14">
          {orderedGroups.map(([key, group], gIdx) => (
            <section key={key} className="flex flex-col gap-6">
              <header className="lib-month-head">
                <h2 className="lib-month-head__title">
                  {MONTH_FORMAT.format(group.date)}
                </h2>
                <span className="lib-meta">{group.items.length}</span>
              </header>
              <ul className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2">
                {group.items.map((b, idx) => (
                  <li key={b.id} className="lib-card">
                    <div className="lib-card__body">
                      <BookCover
                        title={b.title}
                        author={b.author}
                        coverUrl={b.coverUrl}
                        priority={gIdx === 0 && idx < 6}
                      />
                      <div className="lib-card__text">
                        <h3 className="lib-card__title" title={b.title}>
                          {b.title}
                        </h3>
                        <p className="lib-card__author" title={b.author}>
                          {b.author}
                        </p>
                        <p className="mt-3 text-sm text-ink-mute">
                          {b.pages.toLocaleString()} pages ·{' '}
                          {languageName(b.language)}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                          <Badge
                            variant="accent"
                            className="min-w-0 max-w-full truncate"
                          >
                            {b.category}
                          </Badge>
                          <InlineRating id={b.id} rating={b.rating} />
                        </div>
                      </div>
                    </div>

                    <BookOpinion opinion={b.opinion} />
                    <div className="lib-card__foot">
                      <EditBookDialog
                        book={b}
                        authors={authors}
                        categories={categories}
                      />
                      <DeleteBookButton id={b.id} title={b.title} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
