'use client';

import type { CountEntry, TimeseriesPoint } from '@/lib/stats/aggregate';
import type { YearOverYearRow } from '@/lib/stats/extras';
import {
  BRASS,
  DistributionPie,
  Kpi,
  LEATHER,
  MOSS,
  OXBLOOD,
  Panel,
  WALNUT,
} from './graphs/primitives';
import {
  BarPanel,
  HorizontalBarPanel,
  LinePanel,
  MultiLinePanel,
} from './graphs/panels';

interface Props {
  data: {
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
    totalBooks: number;
    totalPages: number;
  };
}

export function GraphsDashboard({ data }: Props) {
  if (data.totalBooks === 0) {
    return (
      <div className="lib-empty">
        <p className="lib-empty__title">No data yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        <Kpi label="Books" value={data.totalBooks} />
        <Kpi label="Pages" value={data.totalPages.toLocaleString()} />
        <Kpi label="Pages / day" value={data.meanPagesPerDay} />
        <Kpi label="Pages / book" value={data.avgPagesPerBook} />
        <Kpi label="Days between" value={data.avgDaysBetween} />
        <Kpi
          label="Top author"
          value={data.favoriteAuthor?.author ?? '—'}
          note={data.favoriteAuthor ? `${data.favoriteAuthor.count} books` : ''}
          compact
        />
        <Kpi
          label="Longest"
          value={data.longestBook?.pages.toLocaleString() ?? '—'}
          note={data.longestBook?.title ?? ''}
        />
        <Kpi label="Categories" value={data.categories.length} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-2">
        <Panel title="Books / month">
          <BarPanel data={data.booksPerMonth} fill={LEATHER} />
        </Panel>
        <Panel title="Pages / month">
          <BarPanel data={data.pagesPerMonth} fill={WALNUT} />
        </Panel>
        <Panel title="Cumulative pages">
          <LinePanel
            data={data.cumulativePages}
            stroke={OXBLOOD}
            type="stepAfter"
          />
        </Panel>
        <Panel title="Cumulative books">
          <LinePanel
            data={data.cumulativeBooks}
            stroke={BRASS}
            type="stepAfter"
          />
        </Panel>
        <Panel title="Rolling 30-day pages">
          <LinePanel data={data.rolling30Day} stroke={MOSS} type="monotone" />
        </Panel>
        <Panel title="Year over year — books / month">
          <MultiLinePanel
            data={data.yearOverYear.rows}
            xKey="month"
            series={data.yearOverYear.years}
          />
        </Panel>
        <Panel title="Categories">
          <DistributionPie entries={data.categories} />
        </Panel>
        <Panel title="Languages">
          <DistributionPie entries={data.languages} />
        </Panel>
        <Panel title="Weekday — books">
          <BarPanel data={data.weekday} fill={OXBLOOD} />
        </Panel>
        <Panel title="Weekday — pages">
          <BarPanel data={data.pagesPerWeekday} fill={MOSS} />
        </Panel>
        <Panel title="Length">
          <BarPanel data={data.pageLength} fill={WALNUT} />
        </Panel>
        <Panel title="Rating distribution">
          <BarPanel data={data.ratingDistribution} fill={BRASS} />
        </Panel>
        <Panel title="Pages / category">
          <HorizontalBarPanel data={data.pagesByCategory} fill={LEATHER} />
        </Panel>
        <Panel title="Top authors">
          <HorizontalBarPanel data={data.topAuthors} fill={MOSS} />
        </Panel>
        <Panel title="Average rating / category">
          <HorizontalBarPanel
            data={data.avgRatingByCategory}
            fill={OXBLOOD}
            domain={[0, 5]}
          />
        </Panel>
        <Panel title="Publication decade">
          <BarPanel data={data.publicationDecade} fill={WALNUT} />
        </Panel>
        <Panel title="Book age at reading">
          <BarPanel data={data.ageWhenRead} fill={OXBLOOD} />
        </Panel>
        <Panel title="Books / year">
          <BarPanel data={data.booksPerYear} fill={LEATHER} />
        </Panel>
      </div>
    </div>
  );
}
