import Image from 'next/image';
import { listBooks } from '@/lib/books/repository';

export const dynamic = 'force-dynamic';
import { AddBookDialog } from '@/components/add-book-dialog';
import { DeleteBookButton } from '@/components/delete-book-button';

function formatDate(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : '—';
}

export default async function BooksPage() {
  const books = await listBooks();
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Books</h1>
          <p className="text-sm text-neutral-500">{books.length} recorded</p>
        </div>
        <AddBookDialog />
      </div>

      {books.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center text-neutral-500">
          No books yet. Add the first one to get started.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b) => (
            <li
              key={b.id}
              className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                {b.coverUrl ? (
                  <Image
                    src={b.coverUrl}
                    alt={`${b.title} cover`}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                    No cover
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h2 className="truncate font-medium" title={b.title}>
                  {b.title}
                </h2>
                <p className="truncate text-sm text-neutral-600" title={b.author}>
                  {b.author}
                </p>
                <dl className="mt-auto grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs text-neutral-500">
                  <dt>Category</dt>
                  <dd className="truncate text-neutral-700">{b.category}</dd>
                  <dt>Language</dt>
                  <dd className="text-neutral-700">{b.language}</dd>
                  <dt>Pages</dt>
                  <dd className="text-neutral-700">{b.pages}</dd>
                  <dt>Published</dt>
                  <dd className="text-neutral-700">{formatDate(b.publicationDate)}</dd>
                  <dt>Finished</dt>
                  <dd className="text-neutral-700">{formatDate(b.finishedOn)}</dd>
                </dl>
                <DeleteBookButton id={b.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
