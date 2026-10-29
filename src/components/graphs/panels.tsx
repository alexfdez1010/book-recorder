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
import { useChartMotion } from './use-chart-motion';

const grid = (
  <CartesianGrid
    vertical={false}
    strokeDasharray="3 5"
    stroke="var(--paper-edge)"
  />
);
const axisProps = {
  fontSize: 10,
  stroke: 'var(--ink-mute)',
  tickLine: false,
  axisLine: false,
} as const;

/** Plots a historical timeseries; motion follows the operating system preference. */
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
  const animate = useChartMotion();
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart
        data={data}
        margin={{ left: -20, right: 8, top: 8 }}
        accessibilityLayer
      >
        {grid}
        <XAxis dataKey="date" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type={type}
          dataKey={dataKey}
          stroke={stroke}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
          animationDuration={450}
          isAnimationActive={animate}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Plots category totals with integer ticks and bounded, rounded columns. */
export function BarPanel({ data, fill }: { data: CountEntry[]; fill: string }) {
  const animate = useChartMotion();
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data.map((e) => ({ name: e.label, value: e.value }))}
        margin={{ left: -20, right: 8, top: 8 }}
        accessibilityLayer
      >
        {grid}
        <XAxis dataKey="name" {...axisProps} />
        <YAxis allowDecimals={false} {...axisProps} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: INK, fillOpacity: 0.06 }}
        />
        <Bar
          dataKey="value"
          fill={fill}
          radius={[4, 4, 0, 0]}
          maxBarSize={42}
          animationDuration={450}
          isAnimationActive={animate}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Plots longer category labels horizontally, with an optional fixed numeric range. */
export function HorizontalBarPanel({
  data,
  fill,
  domain,
}: {
  data: CountEntry[];
  fill: string;
  domain?: [number, number];
}) {
  const animate = useChartMotion();
  return (
    <ResponsiveContainer width="100%" height={Math.max(240, data.length * 28)}>
      <BarChart
        layout="vertical"
        data={data.map((e) => ({ name: e.label, value: e.value }))}
        margin={{ left: 12, right: 12 }}
        accessibilityLayer
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
        <Bar
          dataKey="value"
          fill={fill}
          radius={[0, 4, 4, 0]}
          maxBarSize={22}
          animationDuration={450}
          isAnimationActive={animate}
        />
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
  const animate = useChartMotion();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart
        data={data}
        margin={{ left: -20, right: 8, top: 8 }}
        accessibilityLayer
      >
        {grid}
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis allowDecimals={false} {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          wrapperStyle={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
          }}
        />
        {series.map((s, i) => (
          <Line
            key={s}
            type="monotone"
            dataKey={s}
            stroke={PALETTE[i % PALETTE.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            animationDuration={450}
            isAnimationActive={animate}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
