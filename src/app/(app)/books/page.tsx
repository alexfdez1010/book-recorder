import Image from 'next/image';
import { listBooks } from '@/lib/books/repository';
import { languageName } from '@/lib/books/language';

export const dynamic = 'force-dynamic';
import { AddBookDialog } from '@/components/add-book-dialog';
import { DeleteBookButton } from '@/components/delete-book-button';
import { EditBookDialog } from '@/components/edit-book-dialog';
import { Badge } from '@/components/ui/badge';
import { Stamp } from '@/components/ui/stamp';

function formatDate(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : '—';
}

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
  const books = await listBooks();
  const totalPages = books.reduce((s, b) => s + b.pages, 0);

  const groups = new Map<
    string,
    { date: Date; items: { book: (typeof books)[number]; index: number }[] }
  >();
  books.forEach((book, index) => {
    const key = monthKey(book.finishedOn);
    const bucket = groups.get(key);
    if (bucket) bucket.items.push({ book, index });
    else groups.set(key, { date: new Date(book.finishedOn), items: [{ book, index }] });
  });
  const orderedGroups = [...groups.entries()].sort((a, b) =>
    b[0].localeCompare(a[0]),
  );

  return (
    <section className="flex flex-col gap-14">
      <div className="lib-section-head">
        <div className="flex flex-col gap-3">
          <p className="lib-kicker">Section I · The catalogue</p>
          <h1 className="lib-title lib-title--xl">Ledger of volumes</h1>
          <p className="lib-subtitle pt-1">
            {books.length.toString().padStart(3, '0')} entries ·{' '}
            {totalPages.toLocaleString()} pages read
          </p>
        </div>
        <div className="flex items-center gap-5">
          <Stamp>Catalogued</Stamp>
          <AddBookDialog />
        </div>
      </div>

      {books.length === 0 ? (
        <div className="lib-empty">
          <p className="lib-empty__title">The shelves are empty.</p>
          <p className="lib-meta mt-4">
            Catalogue your first volume to begin the record.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-14">
          {orderedGroups.map(([key, group]) => (
            <section key={key} className="flex flex-col gap-6">
              <header className="lib-month-head">
                <h2 className="lib-month-head__title">
                  {MONTH_FORMAT.format(group.date)}
                </h2>
                <span className="lib-meta">
                  {group.items.length.toString().padStart(2, '0')}{' '}
                  {group.items.length === 1 ? 'entry' : 'entries'}
                </span>
              </header>
              <ul className="grid grid-cols-1 gap-10 md:gap-12 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map(({ book: b, index: i }) => (
                  <li key={b.id} className="lib-card">
                    <div className="lib-card__head">
                      <span className="lib-card__call">{formatDate(b.finishedOn)}</span>
                      <Badge variant="accent">{b.category}</Badge>
                    </div>

                    <div className="lib-card__body">
                      <div className="lib-cover">
                        {b.coverUrl ? (
                          <Image
                            src={b.coverUrl}
                            alt={`${b.title} cover`}
                            fill
                            sizes="112px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="lib-cover__placeholder">
                            <span>no</span>
                            <span>cover</span>
                          </div>
                        )}
                      </div>
                      <div className="lib-card__text">
                        <h3 className="lib-card__title" title={b.title}>
                          {b.title}
                        </h3>
                        <p className="lib-card__author" title={b.author}>
                          by {b.author}
                        </p>
                        <dl className="lib-card__grid">
                          <dt>Pages</dt>
                          <dd>{b.pages.toLocaleString()}</dd>
                          <dt>Tongue</dt>
                          <dd>{languageName(b.language)}</dd>
                        </dl>
                      </div>
                    </div>

                    <div className="lib-card__foot">
                      <span className="lib-meta">
                        Vol. No. {String(i + 1).padStart(3, '0')}
                      </span>
                      <div className="flex items-center gap-4">
                        <EditBookDialog book={b} />
                        <DeleteBookButton id={b.id} title={b.title} />
                      </div>
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
