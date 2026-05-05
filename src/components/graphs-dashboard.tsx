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

const grid = (
  <CartesianGrid strokeDasharray="2 4" stroke={INK} strokeOpacity={0.2} />
);
const axisProps = { fontSize: 10, stroke: INK, tickLine: false } as const;

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
        <Panel title="Rolling 30-day pages">
          <LinePanel data={data.rolling30Day} stroke={MOSS} type="monotone" />
        </Panel>
        <Panel title="Categories">
          <DistributionPie entries={data.categories} />
        </Panel>
        <Panel title="Languages">
          <DistributionPie entries={data.languages} />
        </Panel>
        <Panel title="Weekday">
          <BarPanel data={data.weekday} fill={OXBLOOD} />
        </Panel>
        <Panel title="Length">
          <BarPanel data={data.pageLength} fill={WALNUT} />
        </Panel>
        <Panel title="Pages / category">
          <HorizontalBarPanel data={data.pagesByCategory} fill={LEATHER} />
        </Panel>
        <Panel title="Top authors">
          <HorizontalBarPanel data={data.topAuthors} fill={MOSS} />
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
        <Line
          type={type}
          dataKey="pages"
          stroke={stroke}
          strokeWidth={2.5}
          dot={{ fill: INK, r: 2 }}
        />
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
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: INK, fillOpacity: 0.06 }}
        />
        <Bar dataKey="value" fill={fill} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function HorizontalBarPanel({
  data,
  fill,
}: {
  data: CountEntry[];
  fill: string;
}) {
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
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: INK, fillOpacity: 0.06 }}
        />
        <Bar dataKey="value" fill={fill} />
      </BarChart>
    </ResponsiveContainer>
  );
}
