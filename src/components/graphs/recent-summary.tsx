'use client';

import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { periodChange, type RecentPerformance } from '@/lib/stats/recent';

/** Shows honest relative change, including an explicit zero-baseline state. */
function Change({ current, previous }: { current: number; previous: number }) {
  const change = periodChange(current, previous);
  const Icon =
    change === null || change > 0
      ? ArrowUpRight
      : change < 0
        ? ArrowDownRight
        : Minus;
  const description =
    change === null
      ? 'No previous activity'
      : change === 0
        ? 'No change'
        : `${change > 0 ? '+' : ''}${change}%`;
  return (
    <span className="mt-2 inline-flex items-center gap-1 text-xs text-ink-mute">
      <Icon size={13} aria-hidden="true" />
      {description}
      {change !== null && (
        <span className="sr-only"> versus previous period</span>
      )}
    </span>
  );
}

/** Presents four parallel period metrics as one accessible definition list. */
export function RecentSummary({ period }: { period: RecentPerformance }) {
  const metrics = [
    { key: 'books', label: 'Books finished' },
    { key: 'pages', label: 'Completed pages' },
    { key: 'pagesPerDay', label: 'Pages / calendar day' },
    { key: 'completionDays', label: 'Days with a finish' },
  ] as const;
  return (
    <dl
      aria-label="Period totals"
      className="grid grid-cols-2 gap-x-6 gap-y-7 border-y border-paper-edge py-6 sm:grid-cols-4"
    >
      {metrics.map(({ key, label }) => (
        <div key={key} className="min-w-0">
          <dt className="text-xs text-ink-mute">{label}</dt>
          <dd
            className="mt-2 text-3xl font-medium tracking-tight text-ink tabular-nums"
            data-testid={`recent-${key}`}
          >
            {period.current[key].toLocaleString('en-US')}
          </dd>
          <dd>
            <Change
              current={period.current[key]}
              previous={period.previous[key]}
            />
          </dd>
        </div>
      ))}
    </dl>
  );
}
