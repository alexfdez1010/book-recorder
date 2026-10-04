# Reading interactions

The reading room keeps its warm paper palette, serif titles and quiet green actions. This update focuses on completing everyday tasks with touch, keyboard and reliable feedback.

## Ratings

`StarRating` accepts `value` and `onChange` for controlled use, or `defaultValue` for a form. For example, use `name="rating" defaultValue={null}` in a book form; its hidden input submits the half-star value, or an empty string when unrated. Use `disabled` during persistence and `readOnly` for an accessible static summary. Neither mode permits changes.

Tab enters the rating once. Arrow keys select half-star values and wrap between 0.5 and 5; Home and End select the endpoints. Click or press Space on the selected value to clear it. The five star drawings retain their compact appearance while each half has a 24px-wide, 44px-high touch target. Card ratings occupy a full row so the targets also fit a 320px screen.

`InlineRating` owns persistence and optimistic feedback, while `StarRating` owns selection. Failed saves restore the saved value and show an alert; another selection retries. Saves cannot overlap. Pending controls use `aria-disabled` with guarded handlers so keyboard focus stays on the selected star during persistence.

## Searching and entry

`BookSearchPanel` accepts `onSelect(candidate)` and `onManual()` callbacks. The add dialog composes it with `AddBookForm`, which accepts an optional `onBack()` callback to return to search. Back is disabled while saving. Returning starts a fresh search; unsaved entry fields are discarded.

Starting a replacement search clears old results before requesting candidates. Loading and result counts are announced, failures include a recovery path, and manual entry stays available. The empty library and queue explain the first action without introducing another competing button.

Categories suggest matches when typing and open the full list through Show categories. Focus alone keeps the list closed, preventing the focus event and explicit trigger from toggling it twice during touch or scrolling interactions. The popover permits a temporarily empty collection while a new category's Create option enters the list, so entering a custom category can open it reliably.

## Calendar dates

`localDate(date?)` returns a local `YYYY-MM-DD` string for completion inputs. For example, `localDate(new Date(2026, 9, 4))` returns `2026-10-04`. Omitting the argument uses now; invalid dates throw `RangeError`. Date-only database values and month grouping continue to use UTC so stored reading history remains consistent.

## Verification and decisions

Ratings are tested as rendered markup and through keyboard, mobile target sizes and persistence flows. Search recovery tests abort the action request at the network boundary. Local calendar tests cover Madrid and Los Angeles around midnight and year boundaries. The full gate and isolated test ports are documented in [the design system](design-system.md#verification).

Keep these responsibilities separate when extending the UI. Preserve catalogue content, optional opinions, search adapters, authentication and database contracts. No schema migration is needed for these changes.

## References

- [WAI-ARIA radio keyboard interaction](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [React transitions and pending actions](https://react.dev/reference/react/useTransition)
- [HeroUI buttons and accessible states](https://heroui.com/en/docs/react/components/button)
- [React Aria combobox opening behavior](https://react-aria.adobe.com/ComboBox#popover)
- [Tailwind responsive utilities](https://tailwindcss.com/docs/responsive-design)
- [Local calendar date getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getFullYear)
