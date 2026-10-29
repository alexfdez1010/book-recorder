import type { CountEntry, TimeseriesPoint } from '@/lib/stats/aggregate';
import type { YearOverYearRow } from '@/lib/stats/extras';
import type { RecentPerformance } from '@/lib/stats/recent';

export interface GraphsData {
  booksPerMonth: CountEntry[];
  booksPerYear: CountEntry[];
  pagesPerMonth: CountEntry[];
  categories: CountEntry[];
  languages: CountEntry[];
  cumulativePages: TimeseriesPoint[];
  cumulativeBooks: TimeseriesPoint[];
  rolling30Day: TimeseriesPoint[];
  weekday: CountEntry[];
  pagesPerWeekday: CountEntry[];
  pageLength: CountEntry[];
  pagesByCategory: CountEntry[];
  topAuthors: CountEntry[];
  ageWhenRead: CountEntry[];
  ratingDistribution: CountEntry[];
  avgRatingByCategory: CountEntry[];
  publicationDecade: CountEntry[];
  yearOverYear: { rows: YearOverYearRow[]; years: string[] };
  meanPagesPerDay: number;
  avgPagesPerBook: number;
  avgDaysBetween: number;
  longestBook: { title: string; pages: number } | null;
  favoriteAuthor: { author: string; count: number } | null;
  recentWeek: RecentPerformance;
  recentMonth: RecentPerformance;
  totalBooks: number;
  totalPages: number;
}
