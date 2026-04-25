import { listAuthors, listBooks } from '@/lib/books/repository';
import { languageName } from '@/lib/books/language';

export const dynamic = 'force-dynamic';
import { AddBookDialog } from '@/components/add-book-dialog';
import { BookCover } from '@/components/book-cover';
import { DeleteBookButton } from '@/components/delete-book-button';
import { EditBookDialog } from '@/components/edit-book-dialog';
import { Badge } from '@/components/ui/badge';

const MONTH_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

function monthKey(d: Date): string {
  const date = new Date(d);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default async function BooksPage() {
  const [books, authors] = await Promise.all([listBooks(), listAuthors()]);
  const totalPages = books.reduce((s, b) => s + b.pages, 0);

  const groups = new Map<string, { date: Date; items: (typeof books)[number][] }>();
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
        <AddBookDialog authors={authors} />
      </div>

      {books.length === 0 ? (
        <div className="lib-empty">
          <p className="lib-empty__title">No books yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-14">
          {orderedGroups.map(([key, group]) => (
            <section key={key} className="flex flex-col gap-6">
              <header className="lib-month-head">
                <h2 className="lib-month-head__title">
                  {MONTH_FORMAT.format(group.date)}
                </h2>
                <span className="lib-meta">{group.items.length}</span>
              </header>
              <ul className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((b) => (
                  <li key={b.id} className="lib-card">
                    <div className="lib-card__body">
                      <BookCover
                        title={b.title}
                        author={b.author}
                        coverUrl={b.coverUrl}
                      />
                      <div className="lib-card__text">
                        <h3 className="lib-card__title" title={b.title}>
                          {b.title}
                        </h3>
                        <p className="lib-card__author" title={b.author}>
                          {b.author}
                        </p>
                        <dl className="lib-card__grid">
                          <dt>Pages</dt>
                          <dd>{b.pages.toLocaleString()}</dd>
                          <dt>Lang</dt>
                          <dd>{languageName(b.language)}</dd>
                        </dl>
                        <div className="mt-3">
                          <Badge variant="accent">{b.category}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="lib-card__foot">
                      <EditBookDialog book={b} authors={authors} />
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
