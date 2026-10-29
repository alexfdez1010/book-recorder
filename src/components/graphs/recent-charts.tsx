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
import type { RecentPerformance } from '@/lib/stats/recent';
import { LEATHER, WALNUT, tooltipStyle } from './primitives';
import { useChartMotion } from './use-chart-motion';
import { RecentFigures } from './recent-figures';

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});
const axis = {
  fontSize: 11,
  stroke: 'var(--ink-mute)',
  tickLine: false,
  axisLine: false,
};
const grid = (
  <CartesianGrid
    vertical={false}
    stroke="var(--paper-edge)"
    strokeDasharray="3 5"
  />
);

/** Formats an ISO date on chart axes without shifting the date in local time. */
function shortDate(value: string): string {
  return DATE_FORMAT.format(new Date(value));
}

/**
 * Renders daily completed pages and cumulative pace against an aligned prior
 * window. A native data disclosure provides exact values without relying on SVG.
 */
export function RecentCharts({ period }: { period: RecentPerformance }) {
  const animate = useChartMotion();
  return (
    <div className="min-w-0">
      <div className="grid min-w-0 gap-5 xl:grid-cols-[1.2fr_1fr]">
        <figure
          className="min-w-0 rounded-[14px] bg-bone p-4 sm:p-6"
          aria-label="Daily completed pages chart"
        >
          <figcaption className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-medium">Completed pages by day</h3>
            <span className="text-xs text-ink-mute">
              {period.current.books} books finished
            </span>
          </figcaption>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={period.points}
              margin={{ left: -25, right: 3, top: 5 }}
              accessibilityLayer
            >
              {grid}
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                minTickGap={25}
                {...axis}
              />
              <YAxis allowDecimals={false} {...axis} />
              <Tooltip
                labelFormatter={(label) => shortDate(String(label))}
                contentStyle={tooltipStyle}
                cursor={{ fill: 'var(--paper-soft)' }}
              />
              <Bar
                dataKey="pages"
                name="Completed pages"
                fill={LEATHER}
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
                animationDuration={400}
                isAnimationActive={animate}
              />
            </BarChart>
          </ResponsiveContainer>
          {period.current.books === 0 && (
            <p className="mt-3 text-sm text-ink-mute">
              No books finished in this period. Your next finish will appear
              here.
            </p>
          )}
        </figure>
        <figure
          className="min-w-0 rounded-[14px] bg-bone p-4 sm:p-6"
          aria-label="Cumulative pace comparison chart"
        >
          <figcaption className="mb-6">
            <h3 className="font-medium">Pace compared with before</h3>
            <p className="mt-1 text-xs text-ink-mute">
              Cumulative pages, aligned from the first day
            </p>
          </figcaption>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={period.points}
              margin={{ left: -25, right: 8, top: 5 }}
              accessibilityLayer
            >
              {grid}
              <XAxis dataKey="day" minTickGap={22} {...axis} />
              <YAxis allowDecimals={false} {...axis} />
              <Tooltip
                labelFormatter={(day) => `Day ${day}`}
                contentStyle={tooltipStyle}
              />
              <Line
                dataKey="previousCumulativePages"
                name="Previous period"
                stroke={WALNUT}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                type="stepAfter"
                isAnimationActive={false}
              />
              <Line
                dataKey="cumulativePages"
                name="Current period"
                stroke={LEATHER}
                strokeWidth={2.5}
                dot={false}
                type="stepAfter"
                animationDuration={400}
                isAnimationActive={animate}
              />
            </LineChart>
          </ResponsiveContainer>
          <div
            className="mt-3 flex flex-wrap gap-4 text-xs text-ink-mute"
            aria-hidden="true"
          >
            <span className="inline-flex items-center gap-2">
              <i className="w-4 border-t-2 border-leather" />
              Current period
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="w-4 border-t-2 border-dashed border-walnut" />
              Previous period
            </span>
          </div>
        </figure>
      </div>
      <RecentFigures points={period.points} />
    </div>
  );
}
