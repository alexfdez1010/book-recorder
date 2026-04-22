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
    <section className="space-y-14">
      <div className="flex flex-wrap items-end justify-between gap-8 border-b-[3px] border-ink pb-8">
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-mute">
            Section I · The catalogue
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl font-black leading-[0.9] tracking-tight">
            Ledger of volumes
          </h1>
          <p className="pt-1 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">
            {books.length.toString().padStart(3, '0')} entries · {totalPages.toLocaleString()} pages read
          </p>
        </div>
        <div className="flex items-center gap-5">
          <Stamp>Catalogued</Stamp>
          <AddBookDialog />
        </div>
      </div>

      {books.length === 0 ? (
        <div className="ledger border-[3px] border-ink p-16 text-center">
          <p className="font-serif text-4xl font-black">The shelves are empty.</p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-ink-mute">
            Catalogue your first volume to begin the record.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-10 md:gap-12 md:grid-cols-2 xl:grid-cols-3">
          {books.map((b, i) => (
            <li
              key={b.id}
              className="group relative bg-paper-soft border-[3px] border-ink brutal-shadow-sm brutal-press flex flex-col"
            >
              <div className="flex items-center justify-between border-b-[3px] border-ink bg-paper px-4 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                  {callNumber(b.id, i)}
                </span>
                <Badge variant="blood">{b.category}</Badge>
              </div>

              <div className="flex gap-6 p-6">
                <div className="relative h-40 w-28 shrink-0 overflow-hidden border-[3px] border-ink bg-ink">
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
                    <div className="flex h-full w-full flex-col items-center justify-center text-[9px] text-paper font-mono uppercase tracking-[0.2em] gap-1 px-1 text-center">
                      <span className="opacity-60">no</span>
                      <span>cover</span>
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <h2
                    className="font-serif text-lg font-bold leading-tight line-clamp-3"
                    title={b.title}
                  >
                    {b.title}
                  </h2>
                  <p
                    className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-soft truncate"
                    title={b.author}
                  >
                    by {b.author}
                  </p>
                  <div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-1.5 pt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute">
                    <span>Pages</span>
                    <span className="text-ink font-bold text-right">
                      {b.pages.toLocaleString()}
                    </span>
                    <span>Tongue</span>
                    <span className="text-ink text-right">{languageName(b.language)}</span>
                    <span>Published</span>
                    <span className="text-ink text-right">{formatDate(b.publicationDate)}</span>
                    <span>Finished</span>
                    <span className="text-ink text-right">{formatDate(b.finishedOn)}</span>
                  </div>
                </div>
              </div>

              <div className="barcode h-2 mx-6 mb-5" aria-hidden />
              <div className="flex items-center justify-between border-t-[3px] border-ink bg-paper px-4 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-mute">
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
