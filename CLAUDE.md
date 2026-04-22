# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                 # Postgres (port 5434) + Next dev server (turbopack)
npm run build               # prisma generate && prisma migrate deploy && next build
npm run lint                # eslint + prisma format
npm run lint-format         # lint + prettier write
npm run test                # unit + integration + e2e (full pipeline)
npm run test:unit           # vitest, tests/unit
npm run test:integration    # vitest, tests/integration — hits live Open Library + Google Books
npm run test:e2e            # Playwright against a built prod server on test DB
npm run test:specific -- "<title pattern>"   # single Playwright test by -g
npm run database            # docker compose up postgres (5434)
npm run database:dev        # start DB + prisma migrate dev (create/apply migration)
npm run database:studio     # prisma studio
```

Run a single unit/integration test:

```bash
npx vitest run tests/unit/stats.test.ts
npx vitest run -t "merges duplicates"
```

Pre-commit gate (runs before allowing a commit): `npm run pre-commit` = `npm run test && npm run lint-format`.

## Architecture

### Auth — edge-safe, single-password

- `src/proxy.ts` is a Next 16 **proxy** (the successor to middleware). Runs on every non-public route, validates a SHA-256 cookie against `hashToken(PASSWORD, AUTH_SECRET)` using Web Crypto so the same hash code runs on the Edge runtime and in Node server actions.
- `src/lib/auth/` — `token.ts` (Web Crypto hash + `timingSafeEqual`), `session.ts` (cookie set/clear), `constants.ts` (`AUTH_COOKIE`), `config.ts`. 1-year HttpOnly cookie.
- `/login` + `/api/login` are the only public paths; `/api/logout` clears cookie.

### Book search — parallel fan-out with merge

- `src/lib/books/search.ts` fires Open Library and Google Books via `Promise.allSettled` so one failure (e.g. Google Books 429) still returns results from the survivor.
- `mergeCandidates` dedupes on lowercased `title+author`, preferring first-source fields and filling gaps from the second. Order is first-occurrence-stable.
- Adapters: `openlibrary.ts`, `googlebooks.ts`. Normalization helpers: `language.ts`. Shared shape: `types.ts` (`BookCandidate`).
- `actions.ts` = server actions (add/delete). `repository.ts` = Prisma data access. `validation.ts` = Zod schemas.

### Stats — pure functions

- `src/lib/stats/aggregate.ts` contains pure reducers over `Book[]` (books-per-month, cumulative pages, category/language distribution, KPIs). No I/O — unit-tested in isolation and consumed server-side by `/graphs`.

### Routing

- App Router with a `(app)` route group that owns the authenticated shell (`layout.tsx` nav + `/books`, `/graphs`). Root `/` redirects to `/books`.
- Client UI under `src/components/` (dialog, form, search panel, graphs dashboard).

### Database

- Prisma 6 + Postgres 16. **Port 5434** (not 5432) to avoid clashes. Compose files: `compose.yml` (dev), `compose-test.yml` (e2e).
- Client is generated to `generated/prisma` (custom output, committed-ignored). Import via `src/lib/db/prisma.ts`.
- Single `Book` model with indexes on `finishedOn` and `category`.

### Test pyramid

- `tests/unit` — vitest, no I/O (auth hash, merge logic, stats, language normalization).
- `tests/integration` — vitest, **live HTTP** to Open Library + Google Books. Google Books gracefully skips on 429. `--disable-console-intercept` is intentional.
- `tests/e2e` — Playwright. `npm run test:e2e` spins the test DB, builds, boots prod server via `start-server-and-test`, tears DB down.

## Project conventions (from AGENTS.md)

- **200-line hard limit per source file** (test files exempted when justified). If a file grows past that, split by responsibility (SRP).
- **TailwindCSS 4** utility-first. `shadcn` patterns for UI components.
- SOLID is enforced in review. Depend on abstractions at module boundaries (adapters behind `BookCandidate`, stats functions taking plain `Book[]`).
- TSDoc on exported functions/components; self-documenting code otherwise.
- After any code change: assume `npm run lint-format` must pass. Tests are required for new logic.

## Environment

`.env` needs `DATABASE_URL` (defaults to Postgres on 5434), `PASSWORD`, `AUTH_SECRET` (long random, e.g. `openssl rand -hex 32`). See `.env.example`.

## Deployment

Vercel preset. Build command runs `prisma generate && prisma migrate deploy && next build`, so migrations auto-apply on every deploy. Provide `DATABASE_URL` / `PASSWORD` / `AUTH_SECRET` as env vars.
