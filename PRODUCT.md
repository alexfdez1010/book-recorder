# Book Recorder

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

A private personal reading library for recording finished books, keeping a reading queue, saving opinions and ratings, and understanding reading patterns.

## Users

Repository-derived context: a reader manages their own library behind a shared-password sign-in. No broader audience or commercial positioning is established.

## Capabilities and Constraints

- Finished books, a separate to-read queue, author grouping, catalogue search, manual entry, editing, deletion, half-star ratings and saved opinions.
- Graphs aggregate completed books. Pages belong to a book's completion date; there is no daily reading-session tracking.
- Recent performance covers the last 7 and 30 calendar days and compares equal preceding periods.
- Next.js App Router, React, Tailwind CSS 4, HeroUI v3, Prisma and PostgreSQL. Preserve current data contracts and authentication.
- Existing interface language is English. The redesign preserves it.

## Design Delegation

The user explicitly delegated visual and interaction decisions, requested exceptional motion and UX, declined questions, and authorized publication to main after verification. Product assumptions above are derived from the existing application, not a separate interview.

## Evidence on Hand

The repository's real routes, data model, existing tests and working interactions define product truth. Demo fixtures used for visual verification must stay in the disposable test database.
