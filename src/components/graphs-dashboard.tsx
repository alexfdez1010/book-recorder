'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CountEntry, TimeseriesPoint } from '@/lib/stats/aggregate';
import {
  DistributionPie,
  INK,
  Kpi,
  LEATHER,
  MOSS,
  OXBLOOD,
  Panel,
  WALNUT,
  tooltipStyle,
} from './graphs/primitives';

interface Props {
  data: {
    booksPerMonth: CountEntry[];
    booksPerYear: CountEntry[];
    pagesPerMonth: CountEntry[];
    categories: CountEntry[];
    languages: CountEntry[];
    cumulativePages: TimeseriesPoint[];
    rolling30Day: TimeseriesPoint[];
    weekday: CountEntry[];
    pageLength: CountEntry[];
    pagesByCategory: CountEntry[];
    topAuthors: CountEntry[];
    ageWhenRead: CountEntry[];
    meanPagesPerDay: number;
    avgPagesPerBook: number;
    avgDaysBetween: number;
    longestBook: { title: string; pages: number } | null;
    favoriteAuthor: { author: string; count: number } | null;
    totalBooks: number;
    totalPages: number;
  };
}

const grid = <CartesianGrid strokeDasharray="2 4" stroke={INK} strokeOpacity={0.2} />;
const axisProps = { fontSize: 10, stroke: INK, tickLine: false } as const;

export function GraphsDashboard({ data }: Props) {
  if (data.totalBooks === 0) {
    return (
      <div className="lib-empty">
        <p className="lib-empty__title">No record yet.</p>
        <p className="lib-meta mt-3">
          Catalogue volumes on the ledger page to populate these metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Volumes" value={data.totalBooks} />
        <Kpi label="Pages turned" value={data.totalPages.toLocaleString()} />
        <Kpi label="Mean pp / day" value={data.meanPagesPerDay} note="across span" />
        <Kpi label="Avg pp / book" value={data.avgPagesPerBook} note="per volume" />
        <Kpi label="Days between" value={data.avgDaysBetween} note="avg finish gap" />
        <Kpi
          label="Favourite author"
          value={data.favoriteAuthor?.author ?? '—'}
          note={data.favoriteAuthor ? `${data.favoriteAuthor.count} vol.` : 'none'}
          compact
        />
        <Kpi
          label="Longest tome"
          value={data.longestBook?.pages.toLocaleString() ?? '—'}
          note={data.longestBook?.title ?? 'none'}
        />
        <Kpi
          label="Shelves"
          value={data.categories.length}
          note="distinct categories"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:gap-10 lg:grid-cols-2">
        <Panel title="Volumes by month" kicker="Fig. 1">
          <BarPanel data={data.booksPerMonth} fill={LEATHER} />
        </Panel>

        <Panel title="Pages by month" kicker="Fig. 2">
          <BarPanel data={data.pagesPerMonth} fill={WALNUT} />
        </Panel>

        <Panel title="Cumulative pages" kicker="Fig. 3">
          <LinePanel data={data.cumulativePages} stroke={OXBLOOD} type="stepAfter" />
        </Panel>

        <Panel title="Rolling 30-day pages" kicker="Fig. 4">
          <LinePanel data={data.rolling30Day} stroke={MOSS} type="monotone" />
        </Panel>

        <Panel title="Shelves" kicker="Fig. 5">
          <DistributionPie entries={data.categories} />
        </Panel>

        <Panel title="Tongues" kicker="Fig. 6">
          <DistributionPie entries={data.languages} />
        </Panel>

        <Panel title="Finishes by weekday" kicker="Fig. 7">
          <BarPanel data={data.weekday} fill={OXBLOOD} />
        </Panel>

        <Panel title="Tome length" kicker="Fig. 8">
          <BarPanel data={data.pageLength} fill={WALNUT} />
        </Panel>

        <Panel title="Pages by shelf" kicker="Fig. 9">
          <HorizontalBarPanel data={data.pagesByCategory} fill={LEATHER} />
        </Panel>

        <Panel title="Top scribes" kicker="Fig. 10">
          <HorizontalBarPanel data={data.topAuthors} fill={MOSS} />
        </Panel>

        <Panel title="Book age at reading" kicker="Fig. 11">
          <BarPanel data={data.ageWhenRead} fill={OXBLOOD} />
        </Panel>

        <Panel title="Volumes by year" kicker="Fig. 12">
          <BarPanel data={data.booksPerYear} fill={LEATHER} />
        </Panel>
      </div>
    </div>
  );
}

function LinePanel({
  data,
  stroke,
  type,
}: {
  data: TimeseriesPoint[];
  stroke: string;
  type: 'stepAfter' | 'monotone';
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        {grid}
        <XAxis dataKey="date" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type={type} dataKey="pages" stroke={stroke} strokeWidth={2.5} dot={{ fill: INK, r: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BarPanel({ data, fill }: { data: CountEntry[]; fill: string }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data.map((e) => ({ name: e.label, value: e.value }))}>
        {grid}
        <XAxis dataKey="name" {...axisProps} />
        <YAxis allowDecimals={false} {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: INK, fillOpacity: 0.06 }} />
        <Bar dataKey="value" fill={fill} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function HorizontalBarPanel({ data, fill }: { data: CountEntry[]; fill: string }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(240, data.length * 28)}>
      <BarChart
        layout="vertical"
        data={data.map((e) => ({ name: e.label, value: e.value }))}
        margin={{ left: 12, right: 12 }}
      >
        {grid}
        <XAxis type="number" allowDecimals={false} {...axisProps} />
        <YAxis type="category" dataKey="name" width={120} {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: INK, fillOpacity: 0.06 }} />
        <Bar dataKey="value" fill={fill} />
      </BarChart>
    </ResponsiveContainer>
  );
}
