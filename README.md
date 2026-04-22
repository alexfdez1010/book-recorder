# Book Recorder

Personal web app to log books you've read. Type a partial title, pick from
combined Open Library + Google Books results, and the rest (author, pages,
cover, publication date, category, language) is filled in automatically. Add
the date you finished and save.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript 5 + TailwindCSS 4
- Prisma 6 + PostgreSQL 16
- Recharts for graphs
- Vitest (unit, integration) + Playwright (e2e)

## Features

- **Password-gate** — single password, HttpOnly cookie, SHA-256 token, 1-year expiry.
- **Two pages**: Books (list + add) and Graphs (4 charts + KPIs).
- **Book search** queries Open Library and Google Books in parallel, merges
  duplicates (same title+author), and fills missing fields from whichever
  source has them. If one API fails (e.g. Google Books rate-limit / 429),
  the other acts as a fallback automatically.
- **Fields captured**: title, author, publication date, pages, cover URL,
  category, language, finished-on date.
- **Graphs**: books finished per month, cumulative pages read, category
  distribution, language distribution. Plus total-books / total-pages /
  mean pages per day KPIs.

## Setup

```bash
cp .env.example .env
# edit PASSWORD and AUTH_SECRET
npm install
npm run database            # starts PostgreSQL on localhost:5434
npm run database:dev        # applies migrations
npm run dev
```

The app is at http://localhost:3000. PostgreSQL runs on **port 5434** to
avoid clashing with any local DB on the default 5432.

## Env vars

| Name          | Purpose                                            |
| ------------- | -------------------------------------------------- |
| `DATABASE_URL`| Postgres connection string (port 5434 by default)  |
| `PASSWORD`    | Single password used to unlock the app             |
| `AUTH_SECRET` | Long random string used to derive the session token|

## Scripts

| Script                      | What it does                                 |
| --------------------------- | -------------------------------------------- |
| `npm run dev`               | Start DB + dev server                        |
| `npm run build`             | Generate Prisma client, build Next.js        |
| `npm run start`             | Start production server                      |
| `npm run start:prod`        | Run migrations then start production server  |
| `npm run launch`            | DB up + migrate deploy + build + start       |
| `npm run database`          | Start Postgres container (5434)              |
| `npm run database:dev`      | Create/apply dev migration                   |
| `npm run database:deploy`   | Apply migrations in production               |
| `npm run test`              | Run unit, integration, and e2e tests         |
| `npm run test:unit`         | Unit tests only                              |
| `npm run test:integration`  | Live API integration tests (Open Library +   |
|                             | Google Books). Google Books gracefully skips |
|                             | on 429.                                      |
| `npm run test:e2e`          | Playwright end-to-end                        |

## Deployment (Vercel)

1. Push the repo to GitHub and import it in Vercel.
2. Provision a PostgreSQL database (Vercel Postgres, Neon, Supabase…).
3. Add the following **Environment Variables** in the Vercel project:
   - `DATABASE_URL` — the pooled connection string from the provider.
   - `PASSWORD` — the single password used to unlock the app.
   - `AUTH_SECRET` — a long random string (`openssl rand -hex 32`).
4. Deploy. The build command (`npm run build`) runs `prisma generate`,
   `prisma migrate deploy`, then `next build`, so schema migrations apply
   automatically on every deployment.

No other configuration is required — the default Next.js framework preset
on Vercel is enough.

## Project layout

```
src/
├── app/
│   ├── (app)/
│   │   ├── layout.tsx     # nav shell (Books / Graphs / Logout)
│   │   ├── books/page.tsx # list + add-book dialog
│   │   └── graphs/page.tsx
│   ├── api/logout/route.ts
│   ├── login/page.tsx
│   ├── layout.tsx
│   └── page.tsx           # redirects to /books
├── components/            # client components
├── lib/
│   ├── auth/              # session cookie + hashing
│   ├── books/             # Open Library + Google Books adapters,
│   │                       search merge, repository, server actions
│   ├── db/prisma.ts
│   └── stats/aggregate.ts # pure stats functions (unit-tested)
└── proxy.ts               # Next 16 proxy (was middleware)
prisma/
├── migrations/
└── schema.prisma
tests/
├── unit/
├── integration/           # hits real Open Library + Google Books
└── e2e/                   # Playwright
```

## Design notes

- **Search is parallel, not sequential** — `Promise.allSettled` fires Open
  Library and Google Books concurrently. Merging prefers the first source's
  metadata and fills gaps from the second. If either rejects, the survivor's
  results are still returned, giving automatic fallback.
- **Edge-safe auth** — session token is `SHA-256(password || secret)` via
  Web Crypto, so the same hashing code runs in both the Edge proxy and
  Node-runtime server actions.
- **Pure stat functions** live in `lib/stats/aggregate.ts` and have no I/O,
  so they're tested in isolation and reused on the server-rendered page.
- **File-size discipline** — every source file under 200 lines.
