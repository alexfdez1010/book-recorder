# Recent performance

The Graphs page compares the last 7 or 30 UTC calendar days with the immediately preceding window of the same length. Both windows use one server reference instant. Today is included as a complete calendar bin even though the day is still in progress; the interface states this limitation.

Pages are attributed to the date a book is finished. These figures describe completed books and pages, not daily reading sessions or time spent reading. Queue records are excluded by the repository's finished-book query before aggregation.

## Pure calculation API

`recentPerformance(books, days, now)` is exported from `src/lib/stats/recent.ts`. Pass finished-book metadata containing `pages` and `finishedOn`, a period of `7` or `30`, and an explicit valid `Date`. It performs no I/O and does not mutate the records or reference date. For example, invoke `recentPerformance(finishedBooks, 7, new Date('2026-10-29T13:30:00Z'))` for October 23–29 against October 16–22. With the same reference date, a 30-day invocation covers September 30–October 29 against August 31–September 29.

The result contains `start`, `end`, `previousStart`, `previousEnd`, `days`, current/prior totals and zero-filled daily `points`. Each point includes its current and prior ISO date, a one-based aligned day, book count, completed pages, prior completed pages and both cumulative page totals. The preceding window is aligned by relative day.

`PeriodTotals` exposes finished `books`, completed `pages`, `pagesPerDay` and `completionDays`. Pages per day divides by all calendar days, including days with no finish, rounded to one decimal. Completion days counts distinct days with at least one finished book. Multiple finishes on one day add their pages but count as one completion day.

Invalid finish dates, records before the preceding window and dates after today's UTC day are ignored. A later timestamp within today's UTC day belongs to today. Invalid reference dates and unsupported periods throw `RangeError`. Page counts use the application's validated book data; this calculation is not an additional input-validation boundary.

`periodChange(current, previous)` returns the rounded integer percentage difference from a nonzero prior total. For example, `periodChange(300, 200)` returns `50`. Two zero totals return `0`; a positive current total with a zero prior total returns `null`, displayed as “No previous activity.” An absent baseline never becomes an invented growth percentage.

## Presentation API and accessibility

The server route computes `recentPerformance(plainBooks, 7, now)` and `recentPerformance(plainBooks, 30, now)` with the same `now`, then passes both through `GraphsData`. `RecentPerformance` receives the results as `week` and `month`; tabs change presentation without refetching. `formatPeriod(start, end)` formats ISO ranges in UTC to match the calculation.

HeroUI period tabs expose a Performance period label and support keyboard selection. Four metrics use a definition list. Daily completed pages use bars; cumulative pace uses step lines, with a solid current line and dashed prior line. The charts retain stable responsive regions as the period changes.

`RecentCharts` accepts one period result. `RecentFigures` accepts its `points` and exposes exact values in a native “View daily figures” disclosure. The table has a caption and row/column headers, with the prior date announced alongside prior pages. Exact data remains available without hovering over SVG. Empty windows retain zero-filled series and explain that the next completed book will appear there.

`useChartMotion()` returns whether chart animation is allowed. It disables animation during server rendering and under `prefers-reduced-motion: reduce`, updating when the preference changes. Current recent-chart series animate for 400ms when allowed; the preceding line stays steady.

## Verification

`tests/unit/recent-stats.test.ts` covers inclusive boundaries, distinct equal windows, empty data, UTC offsets, leap days, year boundaries, multiple finishes, malformed dates, immutability and zero baselines. `tests/e2e/recent-performance.spec.ts` compares UI totals against independent Prisma aggregates, verifies queue exclusion, keyboard tabs, exact figures, 320px containment and reduced motion. Its fixtures require a local disposable database with `_test` in its name.

Run these checks through the [isolated pre-commit environment](design-system.md#verification). Execution outcomes belong to the change's verification report.
