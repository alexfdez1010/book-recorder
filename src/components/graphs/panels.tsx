'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CountEntry, TimeseriesPoint } from '@/lib/stats/aggregate';
import type { YearOverYearRow } from '@/lib/stats/extras';
import { INK, PALETTE, tooltipStyle } from './primitives';

const grid = (
  <CartesianGrid strokeDasharray="2 4" stroke={INK} strokeOpacity={0.2} />
);
const axisProps = { fontSize: 10, stroke: INK, tickLine: false } as const;

export function LinePanel({
  data,
  stroke,
  type,
  dataKey = 'pages',
}: {
  data: TimeseriesPoint[];
  stroke: string;
  type: 'stepAfter' | 'monotone';
  dataKey?: string;
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
          dataKey={dataKey}
          stroke={stroke}
          strokeWidth={2.5}
          dot={{ fill: INK, r: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BarPanel({ data, fill }: { data: CountEntry[]; fill: string }) {
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

export function HorizontalBarPanel({
  data,
  fill,
  domain,
}: {
  data: CountEntry[];
  fill: string;
  domain?: [number, number];
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(240, data.length * 28)}>
      <BarChart
        layout="vertical"
        data={data.map((e) => ({ name: e.label, value: e.value }))}
        margin={{ left: 12, right: 12 }}
      >
        {grid}
        <XAxis
          type="number"
          allowDecimals={domain !== undefined}
          domain={domain}
          {...axisProps}
        />
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

/**
 * Multi-line chart: x-axis is a categorical key (e.g. month), and a separate
 * line is rendered for each `series` key. Used for year-over-year comparisons.
 */
export function MultiLinePanel({
  data,
  xKey,
  series,
}: {
  data: YearOverYearRow[];
  xKey: string;
  series: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        {grid}
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis allowDecimals={false} {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          wrapperStyle={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        />
        {series.map((s, i) => (
          <Line
            key={s}
            type="monotone"
            dataKey={s}
            stroke={PALETTE[i % PALETTE.length]}
            strokeWidth={2}
            dot={{ fill: INK, r: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
