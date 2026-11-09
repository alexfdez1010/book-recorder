'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RereadingYear } from '@/lib/stats/rereading';
import { BRASS, LEATHER, Panel, tooltipStyle } from './primitives';
import { useChartMotion } from './use-chart-motion';

const series = [
  { key: 'firstReads', label: 'First readings', color: LEATHER },
  { key: 'rereads', label: 'Rereads', color: BRASS },
] as const;

const axis = {
  fontSize: 11,
  stroke: 'var(--ink-mute)',
  tickLine: false,
  axisLine: false,
};

/**
 * Compares annual first readings and rereads with stacked bars and exact figures.
 * Horizontal year labels fit mobile; the disclosure works without hover or colour.
 * Only completed readings are supplied; empty reread history keeps its baseline visible.
 */
export function RereadingPanel({ data }: { data: RereadingYear[] }) {
  const animate = useChartMotion();
  const rereads = data.reduce((sum, row) => sum + row.rereads, 0);
  const total = data.reduce(
    (sum, row) => sum + row.firstReads + row.rereads,
    0,
  );
  const share = total ? Math.round((rereads / total) * 100) : 0;
  return (
    <Panel title="First readings and rereads">
      <figure
        aria-label="First readings and rereads by year"
        className="min-w-0"
      >
        <figcaption className="mb-5 text-sm text-ink-soft">
          {rereads
            ? `${rereads.toLocaleString('en-US')} ${rereads === 1 ? 'reread' : 'rereads'} (${share}% of all readings)`
            : 'No rereads recorded yet'}
        </figcaption>
        <ul
          className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-soft"
          aria-label="Chart legend"
        >
          {series.map(({ key, label, color }) => (
            <li key={key} className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-sm"
                style={{ backgroundColor: color }}
              />
              {label}
            </li>
          ))}
        </ul>
        <ResponsiveContainer
          width="100%"
          height={Math.max(180, data.length * 36 + 36)}
        >
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 12, bottom: 0, left: 0 }}
            accessibilityLayer
          >
            <CartesianGrid
              horizontal={false}
              stroke="var(--paper-edge)"
              strokeDasharray="3 5"
            />
            <XAxis type="number" allowDecimals={false} {...axis} />
            <YAxis
              type="category"
              dataKey="year"
              width={42}
              interval={0}
              {...axis}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: 'var(--paper-soft)' }}
            />
            {series.map(({ key, label, color }) => (
              <Bar
                key={key}
                name={label}
                dataKey={key}
                stackId="readings"
                fill={color}
                maxBarSize={22}
                animationDuration={450}
                isAnimationActive={animate}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </figure>
      <details className="mt-3 text-xs text-ink-soft">
        <summary className="min-h-11 w-fit cursor-pointer py-3 focus-visible:outline-2 focus-visible:outline-offset-2">
          View yearly figures
        </summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <caption className="sr-only">
            Annual first readings and rereads
          </caption>
          <thead>
            <tr>
              <th scope="col" className="pb-3 font-medium">
                Year
              </th>
              <th scope="col" className="pb-3 text-right font-medium">
                First readings
              </th>
              <th scope="col" className="pb-3 text-right font-medium">
                Rereads
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.year}>
                <th scope="row" className="py-2 font-normal">
                  {row.year}
                </th>
                <td className="text-right">
                  {row.firstReads.toLocaleString('en-US')}
                </td>
                <td className="text-right">
                  {row.rereads.toLocaleString('en-US')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Panel>
  );
}
