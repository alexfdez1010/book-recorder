# Collection interaction

Books, To read and Authors keep data fetching on their server routes. `BookCollection` receives the existing records, author/category options, a grouping mode and first-use guidance. It composes `CollectionToolbar` with `BookEntry`; the existing dialog, rating and opinion components still own their interactions.

The three route invocations use `grouping="month"` with `showRating` for Books, `grouping="none"` for To read, and `grouping="author"` for Authors. `CollectionHeader` displays unfiltered collection totals and accepts an optional action slot, such as `AddBookDialog`.

`filterCollection(books, 'garcia fiction')` matches every whitespace-separated word across title, author and category. Matching ignores case and accents, preserves source order and never changes records. Blank queries return every record. `groupCollection(books, 'month')` uses UTC completion months; author groups rank by book count and then name. The `none` mode preserves queue order.

Search updates locally with React's `useDeferredValue`, keeping typing responsive. Result counts are announced through a live status region. Grid and list controls expose `aria-pressed`; they change presentation for the current visit. No local storage or backend preference is created. Clear search returns focus to the search input; Show all books recovers from an empty result.

The collection uses `li.lib-card` for every entry. Editing, deleting, marking finished and rating continue to use their existing server actions and validation. Filtering never deletes data. Empty collections explain how to add the first book.

Verification: `tests/unit/collection.test.ts` covers search normalization, mixed-field matching, source immutability, UTC month boundaries, author sorting and queue order. `tests/e2e/collection.spec.ts` covers search, layout selection by keyboard, no-match recovery, author filtering and retained book actions. Existing responsive and book lifecycle tests remain authoritative for forms and data persistence.

Official reference: [React useDeferredValue](https://react.dev/reference/react/useDeferredValue).
