import { listAuthors, listToReadBooks } from '@/lib/books/repository';
import { languageName } from '@/lib/books/language';

export const dynamic = 'force-dynamic';
import { AddBookDialog } from '@/components/add-book-dialog';
import { BookCover } from '@/components/book-cover';
import { DeleteBookButton } from '@/components/delete-book-button';
import { EditBookDialog } from '@/components/edit-book-dialog';
import { MarkAsFinishedButton } from '@/components/mark-as-finished-button';
import { Badge } from '@/components/ui/badge';

export default async function ToReadPage() {
  const [books, authors] = await Promise.all([listToReadBooks(), listAuthors()]);
  const totalPages = books.reduce((s, b) => s + b.pages, 0);

  return (
    <section className="flex flex-col gap-10">
      <div className="lib-section-head">
        <div className="flex flex-col gap-2">
          <h1 className="lib-title">To read</h1>
          <p className="lib-subtitle">
            {books.length} books · {totalPages.toLocaleString()} pages queued
          </p>
        </div>
        <AddBookDialog authors={authors} status="to-read" />
      </div>

      {books.length === 0 ? (
        <div className="lib-empty">
          <p className="lib-empty__title">Nothing queued yet.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-2 xl:grid-cols-3">
          {books.map((b, idx) => (
            <li key={b.id} className="lib-card">
              <div className="lib-card__body">
                <BookCover
                  title={b.title}
                  author={b.author}
                  coverUrl={b.coverUrl}
                  priority={idx < 6}
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
                <MarkAsFinishedButton id={b.id} title={b.title} />
                <EditBookDialog book={b} authors={authors} />
                <DeleteBookButton id={b.id} title={b.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
