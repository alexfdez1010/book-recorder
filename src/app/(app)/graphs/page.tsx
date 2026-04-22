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
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Graphs</h1>
      <GraphsDashboard data={data} />
    </section>
  );
}
