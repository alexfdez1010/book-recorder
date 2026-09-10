# 📚 Book Recorder

Your personal reading journal. Search any book, save it, and watch your library — and your reading habits — come to life.

> Brutalist, book-themed UI. Built for readers who want their shelf, their stats, and their to-read pile in one place. ✍️

## ✨ What it does

### 🔎 Find any book in seconds

Type part of a title. The app searches **Open Library** and **Google Books** at the same time, merges the results, and gives you one clean list. Pick a match — author, page count, cover, publication date, category, and language are filled in for you. No typing metadata by hand.

### 📖 Your finished shelf

- Add a book with the date you finished it.
- Browse your library grouped by month, with cover art and inline finish dates.
- Edit anything that's wrong. Delete with a confirmation step so you don't lose entries by mistake.
- To fill a missing cover on a saved book, open **Edit → Cover URL → Find cover by title**, choose a preview, then **Save**. The search uses the current Title field and selection changes only the cover URL; you can still paste a URL manually.
- Save an optional personal opinion for each book in the add/edit form. Expand **Opinion** on a book card to read it. Opinions also work on queued books and the authors view.

### 📥 To-read pile

Queue up books you want to read next — no finish date required. When you're done, hit **Mark finished**, pick the date, and it slides into your main shelf.

### 👤 Authors view

Every author you've read, with how many of their books you finished. Tap any author to expand the list of titles.

### 📊 12 graphs + 8 stats

A whole reading dashboard:

- Books per month and per year
- Pages per month, cumulative pages over time
- Which weekday you finish books on
- Category and language breakdowns
- Average pages per day
- Average days between finishes
- Longest book, favorite author, top authors, and more

### 🤖 Built-in AI agent access

The app exposes its library through an **MCP server**, so any AI agent (Claude Code, Cursor, etc.) can search candidates, add books, read or update your opinions, mark to-read items finished, or pull your stats — same powers as the UI. Open the **/skill** page in the app, download the config, and your agent is wired up in two clicks.

### 🔐 Single-password gate

One password unlocks the whole app. Sessions last a year, cookie-only, no accounts to manage.

## 🚀 Getting started

### 1. Prerequisites

- [**Bun**](https://bun.com) ≥ 1.3 — package manager and runtime
- [**Docker**](https://www.docker.com/) — runs the local Postgres on port **5434**
- A terminal you're comfortable in

Verify they're installed:

```bash
bun --version
docker --version
```

### 2. Clone and install

```bash
git clone https://github.com/alexfdez1010/book-recorder.git
cd book-recorder
bun install                   # also runs `prisma generate` post-install
```

### 3. Configure environment

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

Then open `.env` and set:

| Variable       | What to put                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Leave the default for local dev (`postgresql://postgres:postgres@localhost:5434/book_recorder`) |
| `PASSWORD`     | Pick the single password you'll use to log in                                                   |
| `AUTH_SECRET`  | A long random string — generate one with the command below                                      |

Generate a strong `AUTH_SECRET`:

```bash
openssl rand -hex 32
```

> 💡 Keep `.env` out of git. It's already in `.gitignore`.

### 4. Start the database

```bash
bun run database              # docker compose up -d (Postgres on :5434)
bun run database:dev          # creates and applies migrations
```

If port 5434 is taken, stop whatever's holding it (or change the port in `compose.yml` and `.env` together).

### 5. Run the app

```bash
bun run dev                   # http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000), log in with the `PASSWORD` you set, and start adding books.

### 6. (Optional) Useful follow-ups

```bash
bun run database:studio       # browse the DB visually with Prisma Studio
bun run test                  # run unit + integration + E2E suites
bun run lint-format           # ESLint + Prettier (run before committing)
```

### 🆘 Troubleshooting

- **`Can't reach database server at localhost:5434`** — Docker isn't running or the container didn't start. Run `docker ps` and `bun run database` again.
- **`Environment variable not found: DATABASE_URL`** — your `.env` is missing or in the wrong directory. It must sit at the project root.
- **Login screen rejects your password** — double-check `PASSWORD` in `.env` and restart `bun run dev` so it picks up the new value.
- **`prisma generate` failed during install** — re-run `bun install` after fixing `DATABASE_URL`; the postinstall hook needs a valid schema.

## 🚢 Deploy to Vercel

1. Push the repo to GitHub and import it in Vercel.
2. Provision a Postgres database (Neon, Supabase, Vercel Marketplace, anything).
3. Set `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (direct), `PASSWORD`, and `AUTH_SECRET` in Vercel. The Neon integration supplies both database URLs.
4. Deploy. `vercel.json` runs `bun run vercel-build`: compile first, then apply migrations over the direct connection on production deployments. A migration failure prevents promotion.

`bun run build` only generates Prisma Client and compiles Next.js; it does not connect to the database. `bun run database:deploy` applies migrations separately, with limited retries for connection failures or advisory-lock contention. Local PostgreSQL can continue using only `DATABASE_URL`.

Preview deployments do not automatically migrate: this project's preview variables currently share the production database. Give previews a separate Neon branch before testing schema changes. See [deployment configuration and rollback](docs/deployment.md).

## 🤖 Using the MCP server

1. Log in at `/login`.
2. Visit `/skill` and download **SKILL.md** plus the **mcp.json** snippet.
3. Drop them into your AI agent's config and copy the bearer token shown on the page.

Your agent now has the same library tools as the UI — search, list, add, update, delete, stats, the lot.

Opinions accept up to 10,000 characters. `get_book`, `list_books`, and
`list_to_read_books` return the saved text (or `null`). Opinions are optional on
`add_book` and `update_book`; omitting the field during an update preserves it.
To change only that field,
call `set_opinion` with the book id and text, or pass `null` to clear it:

```ts
await client.callTool({
  name: 'set_opinion',
  arguments: { id: 'book-id', opinion: 'A memorable, beautifully paced read.' },
});
```

## 🛠️ Under the hood

Next.js 16 · React 19 · TypeScript · TailwindCSS 4 · Prisma 6 · PostgreSQL · Recharts · [HeroUI v3](https://heroui.com/en/docs/react/getting-started/quick-start) · Bun.

HeroUI supplies buttons, text controls, selects, searchable author/category pickers,
chips, and modal dialogs. Small adapters under `src/components/ui` keep the visual
library theme separate from book forms. Tailwind CSS 4 is imported before
`@heroui/styles`, with the theme split by responsibility under `src/app/styles`.

The opinion migration only adds a nullable text column; existing records retain
all their metadata. A code rollback can leave this additive column in place.

Responsive E2E coverage includes login, both shelves, authors, graphs, and MCP setup
at 320, 390, and 1440 pixels, plus book forms and confirmation dialogs. The suite
writes mobile/desktop screenshots to `test-results` and masks MCP credentials.
Run `bun run test:e2e` against a disposable test database; it rebuilds the production
app and recreates the test database before execution.

Developer-facing details (commands, architecture, conventions) live in [`AGENTS.md`](AGENTS.md).

## 🪪 License

[MIT](LICENSE) © Alejandro Fernández Camello. 📄

Cover preview selection uses `selectBookCovers(candidates)` from `src/lib/books/covers.ts` to filter and deduplicate catalogue image URLs. For example, pass the results of `searchBooksAction(title)` to obtain `{ title, author, coverUrl }` previews.
