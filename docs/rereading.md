# Rereading

A book owns its catalogue metadata and any number of completed readings. Each reading keeps its own completion date, page count, language, rating and opinion. Rereads are recorded explicitly against an existing book; matching titles or authors never cause an automatic merge.

## Reader experience

Choose **Register reread** on a finished book. The form starts with today's local calendar date, the latest edition's pages and language, and blank rating and opinion. **Edition and language** reveals the edition fields. Earlier notes and ratings are never copied or overwritten. Fields remain available after failed saves, and retrying the same request cannot create a duplicate.

**Reading history** is available through the reading-count button. It lists every reading newest first and allows edits to one reading. Removing a mistaken reading requires confirmation and preserves the other readings. The final reading is protected; **Delete book** removes the whole book and explicitly confirms the loss of all its readings.

The monthly journal shows every reading in its own completion month, including its original rating and opinion. **Reread** identifies subsequent chronological readings. The author collection shows each title once with the latest reading. Backdated and same-day readings are supported; completion date, creation timestamp and id provide deterministic ordering.

All completed readings contribute to activity charts and pages read. Distinct titles are counted by book id, so reading a 300-page book twice produces two readings, one title and 600 completed pages. The MCP's legacy `totals.books` key remains an alias for completed readings; new consumers should use `totals.readings` and `totals.titles`.

The **First readings and rereads** chart compares both groups in stacked horizontal bars by UTC completion year. It replaces the former annual total chart while preserving the annual totals as the sum of both series. The summary reports the number and share of rereads. **View yearly figures** exposes the exact counts without hover, works by keyboard and fits narrow screens. A library without rereads retains its first-reading baseline and explicitly says that no rereads have been recorded.

`rereadsByYear(readings)` in `src/lib/stats/rereading.ts` accepts only completion dates and chronological reading ordinals. For example, `rereadsByYear(await listBooks())` returns ascending `{ year, firstReads, rereads }` rows. Ordinal 1 identifies the earliest recorded reading of a catalogue id; every later ordinal is a reread, including multiple finishes within one year. This preserves backdated and same-day ordering and never infers identity from titles. `RereadingPanel` accepts these rows through its `data` prop, reuses the existing chart palette and reduced-motion subscription, and supplies an exact-data table.

The layout retains the existing palette, typography and HeroUI modals. Controls wrap at narrow widths, action targets remain at least 44 pixels high, and form actions remain reachable while scrolling the modal. Existing modal motion respects the global reduced-motion preference.

## Data ownership and compatibility

`Reading` is the source of completed-reading data. `Book` retains **all** its existing columns and ids. Its date, pages, language, rating and opinion mirror the latest chronological reading so the previous deployment and existing MCP clients continue to work. Queue records retain their existing optional fields until their first completion.

Two PostgreSQL triggers maintain this compatibility boundary:

- `book_reading_compatibility` creates the first reading for legacy inserts/completions and applies legacy personal-field edits to the latest reading only
- `reading_book_projection` refreshes the book projection after a reading changes, including backdating and deletion

Trigger depth prevents recursive synchronization. New history writes lock the parent book **before** touching a reading, serializing them with legacy book writes. Never introduce a new writer that locks the reading before its parent. A book with existing reading history cannot be moved back to an unread state through a legacy update. `mark_as_finished` is retry-safe and cannot overwrite a completed reading.

Editing a book through a journal entry changes shared title/author/category/cover metadata for every occurrence, but date, pages, language, rating and opinion target that entry's `readingId`. Legacy calls without a reading id target the latest reading. An omitted opinion on a legacy full update still preserves its saved text.

## Migration and rollback

Migration `20261109110000_readings` is additive and transactional. It locks book writes while it creates the table, copies each dated finished book to `legacy:<book-id>`, verifies every copied field and timestamp, and installs compatibility triggers. It changes no existing book, category, authentication record or custom owner index. Queued and undated legacy books remain intact. Identical titles remain separate records.

The deployment sequence is:

1. Keep a private pre-deployment backup of the library and categories, with the baseline counts
2. Run the unit, live catalogue, database and browser suites against the disposable local database
3. Compile the production application before changing the live schema
4. Apply the migration using the existing direct-connection migration runner
5. Run `bun run readings:verify`; failed coverage or projection checks prevent promotion
6. Compare the first migrated readings to the pre-deployment backup and verify the live build

The SQL backfill aborts the entire migration if its copy verification fails. The database test suite reconstructs the previous book model in an isolated schema, including duplicate titles, nullable values, multiline Unicode opinions, a 10,000-character queued opinion and undated legacy data; it compares the original book rows and migrated snapshots without normalization.

Rollback means restoring the previous **application deployment while leaving the additive schema and triggers in place**. The old UI shows the latest reading; earlier readings remain stored and available when the new version is restored. Do not drop `Reading`, reset migrations or copy a single latest value over historical rows. No destructive schema contraction is part of this release. A database restore would discard intervening writes and is a separate recovery decision.

## Application interfaces

- `listLibraryBooks()` loads each read title once with its ordered history for library views
- `listFinishedReadings()` and legacy `listBooks()` return one snapshot per completed reading for statistics
- `readingEntries(books)` expands ordered histories without mutating them; `collectionEntries(books, monthly)` selects monthly activity or one latest entry per title
- `recordReread(bookId, requestId, input)` appends a complete snapshot; for example pass a stable UUID and `{ finishedOn: new Date('2026-11-09'), pages: 300, language: 'es', rating: null, opinion: null }`
- `updateReading(bookId, readingId, input)`, `setReadingRating(bookId, readingId, rating)` and `deleteReading(bookId, readingId)` address one reading and verify its parent
- `updateBook(bookId, metadata, readingId?)` accepts an explicit journal-entry target; omitting it retains the legacy latest-reading behavior
- `saveReadingAction(bookId, form, readingId?)` authenticates and validates the complete form; the create form includes a UUID `requestId`. `setReadingRatingAction` and `deleteReadingAction` provide focused authenticated mutations
- `ReadingForm` composes date, rating, opinion and edition fields using `initial`, `onSave`, `onSaved`, `onCancel` and `onPendingChange`; `RereadDialog` creates a retry identity and `ReadingHistoryDialog` manages one history/edit surface

For example, `readingEntries(await listLibraryBooks())` returns the journal input, while the author collection uses `collectionEntries(books, false)`. Completion forms use local dates for entry and UTC date-only values for storage and grouping.

## MCP usage

Existing book tools and their ids remain available. `get_book` additionally includes ordered `readings`. Use the explicit reading tools for rereads and historical edits:

```ts
const result = await client.callTool({
  name: 'record_reread',
  arguments: {
    bookId: 'existing-book-id',
    requestId: crypto.randomUUID(), // Retain this UUID if retrying the same save
    finishedOn: '2026-11-09',
    pages: 300,
    language: 'es',
    rating: 4.5,
    opinion: 'I noticed different details this time.',
  },
});
```

`list_readings` takes `{ bookId }`. `update_reading` takes `{ bookId, id, finishedOn, pages, language, rating?, opinion? }`; omitted personal fields clear them. `delete_reading` takes `{ bookId, id }` and protects the final reading. Discover exact schemas with `tools/list`. The downloadable agent skill documents these conventions.

## Verification commands

`bun run test:database` runs deterministic persistence and migration tests against a local database whose name ends in `_test`. It never resets a developer or production library. The migration fixture additionally requires the dedicated `postgres_book_recorder_test` container. The full `bun run test:e2e` pipeline initializes that disposable database, runs database tests, builds and then runs Playwright.

`bun run readings:verify` is read-only. It reports book/reading/title counts, finished books missing a reading, mismatched latest projections and preserved undated legacy books. It uses a consistent transaction snapshot and prints no library text or credentials. Set `DATABASE_URL` for the intended environment; a nonzero exit prevents deployment promotion. Use the isolated environment example in [the design system](design-system.md#verification) for the full `bun run pre-commit` gate.

## Official references

The final local `bun run pre-commit` run on 2026-11-09 passed 234 unit tests, 6 live catalogue integration tests, 11 database/migration tests and 47 browser tests, including the new reread and MCP lifecycles. Production build, lint and formatting passed. Screenshots of the form, journal and history were inspected at 320, 390 and 1440 pixels.

- [Prisma 6 custom migrations and preserving data](https://www.prisma.io/docs/orm/v6/prisma-migrate/workflows/customizing-migrations)
- [Prisma 6 transactions and isolation](https://www.prisma.io/docs/orm/v6/prisma-client/queries/transactions)
- [PostgreSQL 16 trigger behavior](https://www.postgresql.org/docs/16/trigger-definition.html)
- [Next.js path revalidation](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [HeroUI modal anatomy, scrolling and dismissal](https://heroui.com/en/docs/react/components/modal)
- [Tailwind responsive design](https://tailwindcss.com/docs/responsive-design)
- [Recharts bar series and stacking](https://recharts.github.io/en-US/api/Bar/)
- [Recharts responsive containers](https://recharts.github.io/en-US/api/ResponsiveContainer/)
