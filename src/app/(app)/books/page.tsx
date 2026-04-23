import Image from 'next/image';
import { listBooks } from '@/lib/books/repository';
import { languageName } from '@/lib/books/language';

export const dynamic = 'force-dynamic';
import { AddBookDialog } from '@/components/add-book-dialog';
import { DeleteBookButton } from '@/components/delete-book-button';
import { Badge } from '@/components/ui/badge';
import { Stamp } from '@/components/ui/stamp';

function formatDate(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : '—';
}

function callNumber(id: string, i: number): string {
  const slug = id.replace(/[^a-z0-9]/gi, '').slice(-4).toUpperCase();
  return `BR-${String(i + 1).padStart(3, '0')}·${slug}`;
}

export default async function BooksPage() {
  const books = await listBooks();
  const totalPages = books.reduce((s, b) => s + b.pages, 0);

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
        <ul className="grid grid-cols-1 gap-10 md:gap-12 md:grid-cols-2 xl:grid-cols-3">
          {books.map((b, i) => (
            <li key={b.id} className="lib-card">
              <div className="lib-card__head">
                <span className="lib-card__call">{callNumber(b.id, i)}</span>
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
                  <h2 className="lib-card__title" title={b.title}>
                    {b.title}
                  </h2>
                  <p className="lib-card__author" title={b.author}>
                    by {b.author}
                  </p>
                  <dl className="lib-card__grid">
                    <dt>Pages</dt>
                    <dd>{b.pages.toLocaleString()}</dd>
                    <dt>Tongue</dt>
                    <dd>{languageName(b.language)}</dd>
                    <dt>Published</dt>
                    <dd>{formatDate(b.publicationDate)}</dd>
                    <dt>Finished</dt>
                    <dd>{formatDate(b.finishedOn)}</dd>
                  </dl>
                </div>
              </div>

              <div className="lib-card__foot">
                <span className="lib-meta">
                  Vol. No. {String(i + 1).padStart(3, '0')}
                </span>
                <DeleteBookButton id={b.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
