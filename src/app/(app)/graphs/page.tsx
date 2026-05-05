import { listBooks } from '@/lib/books/repository';
import { languageName } from '@/lib/books/language';

export const dynamic = 'force-dynamic';
import {
  booksPerMonth,
  cumulativePages,
  distribution,
  meanPagesPerDay,
} from '@/lib/stats/aggregate';
import {
  ageWhenReadHistogram,
  averageDaysBetweenFinishes,
  averagePagesPerBook,
  booksPerYear,
  favoriteAuthor,
  longestBook,
  pageLengthHistogram,
  pagesByCategory,
  pagesPerMonth,
  rolling30DayPages,
  topAuthors,
  weekdayFinishes,
} from '@/lib/stats/advanced';
import {
  averageRatingByCategory,
  booksPerMonthByYear,
  cumulativeBooks,
  pagesPerWeekday,
  publicationDecadeDistribution,
  ratingDistribution,
} from '@/lib/stats/extras';
import { GraphsDashboard } from '@/components/graphs-dashboard';

export default async function GraphsPage() {
  const books = await listBooks();
  const plain = books.map((b) => ({
    pages: b.pages,
    category: b.category,
    language: b.language,
    finishedOn: b.finishedOn.toISOString(),
    author: b.author,
    title: b.title,
    publicationDate: b.publicationDate ? b.publicationDate.toISOString() : null,
    rating: b.rating,
  }));
  const data = {
    booksPerMonth: booksPerMonth(plain),
    booksPerYear: booksPerYear(plain),
    pagesPerMonth: pagesPerMonth(plain),
    categories: distribution(plain, 'category'),
    languages: distribution(plain, 'language').map((e) => ({
      label: languageName(e.label),
      value: e.value,
    })),
    cumulativePages: cumulativePages(plain),
    cumulativeBooks: cumulativeBooks(plain),
    rolling30Day: rolling30DayPages(plain),
    weekday: weekdayFinishes(plain),
    pagesPerWeekday: pagesPerWeekday(plain),
    pageLength: pageLengthHistogram(plain),
    pagesByCategory: pagesByCategory(plain),
    topAuthors: topAuthors(plain),
    ageWhenRead: ageWhenReadHistogram(plain),
    ratingDistribution: ratingDistribution(plain),
    avgRatingByCategory: averageRatingByCategory(plain),
    publicationDecade: publicationDecadeDistribution(plain),
    yearOverYear: booksPerMonthByYear(plain),
    meanPagesPerDay: meanPagesPerDay(plain),
    avgPagesPerBook: averagePagesPerBook(plain),
    avgDaysBetween: averageDaysBetweenFinishes(plain),
    longestBook: longestBook(plain),
    favoriteAuthor: favoriteAuthor(plain),
    totalBooks: books.length,
    totalPages: books.reduce((s, b) => s + b.pages, 0),
  };
  return (
    <section className="flex flex-col gap-10">
      <div className="lib-section-head">
        <h1 className="lib-title">Graphs</h1>
      </div>
      <GraphsDashboard data={data} />
    </section>
  );
}
