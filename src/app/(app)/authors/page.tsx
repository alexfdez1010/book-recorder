import { listAuthors, listBooks } from '@/lib/books/repository';
import { languageName } from '@/lib/books/language';
import { groupByAuthor } from '@/lib/books/authors';
import { BookCover } from '@/components/book-cover';
import { DeleteBookButton } from '@/components/delete-book-button';
import { EditBookDialog } from '@/components/edit-book-dialog';
import { Badge } from '@/components/ui/badge';
import { Stamp } from '@/components/ui/stamp';

export const dynamic = 'force-dynamic';

function formatDate(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : '—';
}

export default async function AuthorsPage() {
  const [books, authors] = await Promise.all([listBooks(), listAuthors()]);
  const groups = groupByAuthor(books);
  const totalPages = books.reduce((s, b) => s + b.pages, 0);

  return (
    <section className="flex flex-col gap-14">
      <div className="lib-section-head">
        <div className="flex flex-col gap-3">
          <p className="lib-kicker">Section III · The scribes</p>
          <h1 className="lib-title lib-title--xl">Index of authors</h1>
          <p className="lib-subtitle pt-1">
            {groups.length.toString().padStart(3, '0')} authors ·{' '}
            {books.length.toString().padStart(3, '0')} volumes ·{' '}
            {totalPages.toLocaleString()} pages read
          </p>
        </div>
        <Stamp>Classified</Stamp>
      </div>

      {groups.length === 0 ? (
        <div className="lib-empty">
          <p className="lib-empty__title">No scribes yet.</p>
          <p className="lib-meta mt-4">Catalogue a volume to list its author.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-14">
          {groups.map((group) => (
            <section key={group.author} className="flex flex-col gap-6">
              <header className="lib-month-head">
                <h2 className="lib-month-head__title">{group.author}</h2>
                <span className="lib-meta">
                  {group.books.length.toString().padStart(2, '0')}{' '}
                  {group.books.length === 1 ? 'volume' : 'volumes'}
                </span>
              </header>
              <ul className="grid grid-cols-1 gap-10 md:gap-12 md:grid-cols-2 xl:grid-cols-3">
                {group.books.map((b, i) => (
                  <li key={b.id} className="lib-card">
                    <div className="lib-card__head">
                      <span className="lib-card__call">{formatDate(b.finishedOn)}</span>
                      <Badge variant="accent">{b.category}</Badge>
                    </div>
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
                        <EditBookDialog book={b} authors={authors} />
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
