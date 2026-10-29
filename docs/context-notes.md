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

## PWA and identity decisions

- The user authorizes a refined new logo and prefers the original two red volumes over the generic green book icon. The vector mark in `public/brand-mark.svg` is the common source for the header, sign-in and all installation icons. The installed app keeps the existing authenticated library start route.
- Titles, subtitles and brands must have no periods or decorative dot separators. This is a permanent user preference, also recorded in `AGENTS.md`. Do not alter punctuation in user-authored book titles or opinions.
- Register substantial work in an existing matching Simple Tasks project, using Miscelánea only when no project fits. Never create a project just to record a chat. Book Recorder, Simple Tasks and Simple Finance work belongs to Miscelánea on the current board, per the user’s explicit clarification. Do not create projects with those names unless requested.

- The PWA installation invitation is retained by the root layout before sign-in and consumed through a shared browser store. Do not move native event capture back into the authenticated shell: the browser may offer installation on the login page.
- A repeatable production-build failure matched Next’s handling of extensionless Google Fonts URLs, described in [upstream issue 99114](https://github.com/vercel/next.js/issues/99114). Font families and axes are preserved as local licensed assets so subsequent builds do not depend on Google’s CSS response shape. Font source and licensing are recorded beside those assets.

## PWA verification recorded

The final PWA production gate on 2026-10-29 passed build, 6 integration tests, 35 browser tests, lint and formatting. The complete unit rerun, including the local-font asset checks added during the build repair, passed 216 tests. Chrome manifest/installability diagnostics were clean. Browser checks cover an install offer raised before sign-in, offline navigation after sign-out, recovery, public-only cache contents and responsive screenshots.
