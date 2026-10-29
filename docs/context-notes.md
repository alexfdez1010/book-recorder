# Implementation context

Recorded on 2026-10-29 for subsequent work on the library experience.

## Product and design decisions

- The user delegated visual and interaction decisions and requested no design questions. `PRODUCT.md` records repository-derived product truth; `docs/redesign-direction.md` records the first-surface direction. `DESIGN.md` captures the implemented system, with `.impeccable/design.json` as its preview extension.
- The application remains a private English-language reading library. The redesign preserves authentication, actions, search adapters and the Book schema.
- A fixed white rail appears from 1024px. Narrow screens retain a sticky header and visible routes. Ivory, white and forest green frame Fraunces headings, Geist controls and real covers. Cards and panels have 14px corners.
- Motion responds to interaction: fine-pointer cover lifts, button presses, modal settling and chart updates. CSS and the chart subscription respect reduced motion. Navigation changes color and shows a static active dot; the brief's moving mark was not implemented.

## Architectural boundaries

- Routes load persisted data. `BookCollection` owns local query/view state, `CollectionToolbar` owns controls and `BookEntry` composes existing rating, opinion and action components. Grid/list preference lasts for the mounted visit; no storage preference was added.
- Pure collection helpers match every normalized query word across title, author and category, preserve source order, group UTC completion months and rank authors by count then name. Ungrouped queue mode preserves queue order.
- `recentPerformance` computes equal, disjoint 7/30-day UTC windows including today, zero-filled bins and aligned cumulative totals. The server supplies one shared `now`. The repository excludes queue records.
- Pages belong to finish dates, not reading sessions. Calendar-day averages include zero days and today, which is incomplete. A zero prior baseline with new activity has no defined percentage and displays “No previous activity.”
- Recent charts have keyboard tabs and an exact-data disclosure. `useChartMotion()` supplies a stable disabled server snapshot and a media-query subscription; Recharts needs a JavaScript preference as well as the CSS override.

## Verification and environment caveats

- Use the separate `book-recorder-test` Compose project and disposable credentials. `database:test` recreates test data. Override the test database port and `DATABASE_URL` together; `BOOK_RECORDER_TEST_APP_PORT` aligns the server and browser readiness target. The full example remains in `docs/design-system.md`.
- PostgreSQL initialization can close its bootstrap server before the final server starts. The test service has a TCP `pg_isready` healthcheck; `database:test` uses `docker compose up -d --wait` before Prisma migrations. Container creation alone is not readiness. See [Docker Compose up](https://docs.docker.com/reference/cli/docker/compose/up/).
- Turbopack's root is explicitly `process.cwd()` in `next.config.ts`, avoiding parent-lockfile inference. Run project commands from the repository root.
- Run the full pre-commit gate after final changes and record exact outcomes in the change's verification report. Live catalogue integration tests remain dependent on upstream availability and rate limits.
- Historical CSS filenames remain for compatibility. Their current content is authoritative; do not infer leather textures, parchment tabs or engraved panels from filenames.
- Sidecar tonal ramps are synthesized preview strips required by the panel format, not application CSS tokens. Actual palette and component values live in `DESIGN.md` and `src/app/styles/`.

## Verification recorded

The final 2026-10-29 `bun run pre-commit` run completed successfully with 159 unit tests, 6 live integration tests and 32 browser tests, plus production build, lint and formatting. The final browser suite includes Spanish-locale hydration checks for library and graphs, 320/390/1440px containment, keyboard tabs and core book flows. Independent visual review requested stronger unselected-rating contrast and deterministic graph number formatting; both corrections are included.
