import { listBooks } from '@/lib/books/repository';
import { languageName } from '@/lib/books/language';

export const dynamic = 'force-dynamic';
import {
  booksPerMonth,
  cumulativePages,
  distribution,
  meanPagesPerDay,
} from '@/lib/stats/aggregate';
import { GraphsDashboard } from '@/components/graphs-dashboard';
import { Stamp } from '@/components/ui/stamp';

export default async function GraphsPage() {
  const books = await listBooks();
  const plain = books.map((b) => ({
    pages: b.pages,
    category: b.category,
    language: b.language,
    finishedOn: b.finishedOn.toISOString(),
  }));
  const data = {
    booksPerMonth: booksPerMonth(plain),
    categories: distribution(plain, 'category'),
    languages: distribution(plain, 'language').map((e) => ({
      label: languageName(e.label),
      value: e.value,
    })),
    cumulativePages: cumulativePages(plain),
    meanPagesPerDay: meanPagesPerDay(plain),
    totalBooks: books.length,
    totalPages: books.reduce((s, b) => s + b.pages, 0),
  };
  return (
    <section className="space-y-14">
      <div className="flex flex-wrap items-end justify-between gap-8 border-b-[3px] border-ink pb-8">
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-mute">
            Section II · The record
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl font-black leading-[0.9] tracking-tight">
            Reading metrics
          </h1>
          <p className="pt-1 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">
            Quantities, cadences, proclivities.
          </p>
        </div>
        <Stamp variant="ink">Measured</Stamp>
      </div>
      <GraphsDashboard data={data} />
    </section>
  );
}
