import { listAuthors, listBooks } from '@/lib/books/repository';
import { languageName } from '@/lib/books/language';
import { groupByAuthor } from '@/lib/books/authors';
import { BookCover } from '@/components/book-cover';
import { DeleteBookButton } from '@/components/delete-book-button';
import { EditBookDialog } from '@/components/edit-book-dialog';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function AuthorsPage() {
  const [books, authors] = await Promise.all([listBooks(), listAuthors()]);
  const groups = groupByAuthor(books);

  return (
    <section className="flex flex-col gap-10">
      <div className="lib-section-head">
        <div className="flex flex-col gap-2">
          <h1 className="lib-title">Authors</h1>
          <p className="lib-subtitle">
            {groups.length} authors · {books.length} books
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="lib-empty">
          <p className="lib-empty__title">No authors yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-14">
          {groups.map((group, gIdx) => (
            <section key={group.author} className="flex flex-col gap-6">
              <header className="lib-month-head">
                <h2 className="lib-month-head__title">{group.author}</h2>
                <span className="lib-meta">{group.books.length}</span>
              </header>
              <ul className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-2 xl:grid-cols-3">
                {group.books.map((b, idx) => (
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
