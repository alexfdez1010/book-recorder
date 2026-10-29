'use client';

import { Tabs } from '@heroui/react';
import type { RecentPerformance as Performance } from '@/lib/stats/recent';
import { RecentCharts } from './recent-charts';
import { RecentSummary } from './recent-summary';

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Formats ISO day ranges in UTC, matching the aggregation's calendar boundary. */
export function formatPeriod(start: string, end: string): string {
  return `${DATE_FORMAT.format(new Date(start))} – ${DATE_FORMAT.format(new Date(end))}`;
}

/**
 * Renders keyboard-accessible 7/30-day comparisons from server-computed windows.
 * Tabs change presentation only; all data uses the same server reference date.
 */
export function RecentPerformance({
  week,
  month,
}: {
  week: Performance;
  month: Performance;
}) {
  return (
    <section aria-labelledby="recent-performance-title" className="min-w-0">
      <Tabs defaultSelectedKey="7" className="gap-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2
              id="recent-performance-title"
              className="text-2xl font-medium tracking-tight"
            >
              Recent performance
            </h2>
            <p className="mt-1 text-sm text-ink-mute">
              A closer look at your reading rhythm
            </p>
          </div>
          <Tabs.ListContainer className="w-auto max-w-full">
            <Tabs.List
              aria-label="Performance period"
              className="rounded-full bg-paper-soft p-1"
            >
              <Tabs.Tab
                id="7"
                className="min-h-11 min-w-max whitespace-nowrap rounded-full px-4 text-sm text-ink-soft"
              >
                Last 7 days
                <Tabs.Indicator className="rounded-full bg-bone" />
              </Tabs.Tab>
              <Tabs.Tab
                id="30"
                className="min-h-11 min-w-max whitespace-nowrap rounded-full px-4 text-sm text-ink-soft"
              >
                Last 30 days
                <Tabs.Indicator className="rounded-full bg-bone" />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </div>
        {[week, month].map((period) => (
          <Tabs.Panel
            key={period.days}
            id={String(period.days)}
            className="flex min-w-0 flex-col gap-6 outline-offset-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-mute">
              <p>
                {formatPeriod(period.start, period.end)}{' '}
                <span className="ml-2">Includes today</span>
              </p>
              <p>
                Compared with{' '}
                {formatPeriod(period.previousStart, period.previousEnd)}
              </p>
            </div>
            <RecentSummary period={period} />
            <RecentCharts period={period} />
            <p className="max-w-3xl text-xs leading-relaxed text-ink-mute">
              Pages are counted on the date a book is finished, not on the days
              you spent reading it. Windows use UTC calendar days; today is
              still in progress.
            </p>
          </Tabs.Panel>
        ))}
      </Tabs>
    </section>
  );
}
