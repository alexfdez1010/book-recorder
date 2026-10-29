# Reading room design system

[DESIGN.md](../DESIGN.md) records the implemented visual system and its actual palette, typography, spacing, corner and component values. [.impeccable/design.json](../.impeccable/design.json) adds shadows, motion, breakpoints and self-contained component previews. Its synthesized tonal ramps are display aids, not application tokens. [PRODUCT.md](../PRODUCT.md) records product constraints; [the direction brief](redesign-direction.md) explains the redesign's first surface.

## Responsibilities

- `src/app/styles/theme.css` owns semantic palette aliases, shared easing, keyboard focus and the CSS reduced-motion override. Chart adapters reference the same custom properties.
- Focused files under `src/app/styles/` compose Tailwind CSS 4 utilities into reusable presentation. HeroUI v3 owns accessible controls, selection and modal behavior.
- `src/app/layout.tsx` loads Fraunces, Geist and JetBrains Mono through `next/font`. Fraunces carries page and book identity; Geist carries controls, labels and reading data.
- The authenticated layout owns the desktop rail and compact sticky header. Routes load persisted data; collection components own local search and grid/list presentation.
- Pure collection and statistics functions own transformations. Existing form, opinion, rating and action components retain their data contracts.

This applies single responsibility to loading, calculation and interaction. Composition reuses existing actions rather than creating another persistence path. Small metadata interfaces let pure helpers accept only the fields they need.

## Implemented appearance and interaction

The canvas is ivory, with white panels and book cards, charcoal text and forest green actions. The desktop rail appears from 1024px; narrower screens retain a horizontal route strip. Collection grid view becomes two columns at 1280px. Headers, actions and search wrap at narrow widths.

Use `.lib-title` for page headings, `.lib-subtitle` for supporting copy, `.lib-card` for book entries and `.lib-panel` for chart sections. Cards and panels have 14px corners; buttons and fields have 12px corners. Content surfaces are quiet at rest. Fine-pointer cover lifts, button press feedback, modal opening/closing and chart updates provide purposeful motion. Keep essential actions visible and preserve the existing 44px minimum action targets. Destructive actions retain their confirmation dialog; saved opinions retain native disclosure.

The shared CSS override honors reduced motion. Recharts also needs `useChartMotion()`, because its JavaScript animation does not depend on CSS transition duration. The hook returns a disabled server snapshot and subscribes to preference changes. Avoid ambient loops and delayed access to content.

[Collection interaction](library-collection.md) describes search and grouping. [Recent performance](recent-performance.md) covers calendar windows, exact data disclosure and attribution limits. Existing rating, form and local-calendar behavior remains in [Reading interactions](reading-interactions.md).

## Verification

Run `bun run pre-commit`: unit, live integration and production-build E2E suites, followed by ESLint, Prisma formatting and Prettier. Test containers use the separate `book-recorder-test` Compose project so cleanup does not target development data. `database:test` recreates that disposable database; the TCP PostgreSQL healthcheck and Compose `up -d --wait` complete before Prisma migrations.

The test Compose file defaults to host port 5434; set `BOOK_RECORDER_TEST_DB_PORT` and the matching `DATABASE_URL` to isolate it when occupied. The app defaults to port 3000; `BOOK_RECORDER_TEST_APP_PORT` sets the production test server, readiness URL and Playwright/MCP test URLs together. For example, run the entire gate with database port 5544, app port 3001 and disposable credentials:

```bash
BOOK_RECORDER_TEST_DB_PORT=5544 \
BOOK_RECORDER_TEST_APP_PORT=3001 \
DATABASE_URL='postgresql://postgres:postgres@localhost:5544/book_recorder_test?schema=public' \
PASSWORD='test-only-password' \
AUTH_SECRET='test-only-auth-secret-for-local-verification' \
bun run pre-commit
```

Responsive Playwright coverage exercises 320px, 390px and 1440px screens, including login, all routes, adding, editing, deleting and marking books finished. Inspect the screenshots produced under `test-results/` before shipping visual changes. Use test credentials and the disposable test database, never production data.

Collection tests cover local search, layout controls and recovery. Recent-performance tests compare visible totals with persisted data, switch tabs by keyboard, expose exact daily figures and check narrow-screen reduced motion. `next.config.ts` pins the Turbopack root to `process.cwd()` to avoid parent-lockfile root inference; run commands from the repository directory.

## Official references

- [Tailwind CSS animation and reduced-motion variants](https://tailwindcss.com/docs/animation)
- [HeroUI modal anatomy and customization](https://heroui.com/en/docs/react/components/modal)
- [Next.js font optimization](https://nextjs.org/docs/app/getting-started/fonts)
- [React deferred rendering](https://react.dev/reference/react/useDeferredValue)
- [Docker Compose startup and readiness options](https://docs.docker.com/reference/cli/docker/compose/up/)
