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

The app exposes its library through an **MCP server**, so any AI agent (Claude Code, Cursor, etc.) can search candidates, add books, mark to-read items finished, or pull your stats — same powers as the UI. Open the **/skill** page in the app, download the config, and your agent is wired up in two clicks.

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

| Variable       | What to put                                                  |
| -------------- | ------------------------------------------------------------ |
| `DATABASE_URL` | Leave the default for local dev (`postgresql://postgres:postgres@localhost:5434/book_recorder`) |
| `PASSWORD`     | Pick the single password you'll use to log in                |
| `AUTH_SECRET`  | A long random string — generate one with the command below   |

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
3. Set `DATABASE_URL`, `PASSWORD`, and `AUTH_SECRET` in your project's environment variables.
4. Deploy. Migrations run automatically on every push. ✅

## 🤖 Using the MCP server

1. Log in at `/login`.
2. Visit `/skill` and download **SKILL.md** plus the **mcp.json** snippet.
3. Drop them into your AI agent's config and copy the bearer token shown on the page.

Your agent now has the same library tools as the UI — search, list, add, update, delete, stats, the lot.

## 🛠️ Under the hood

Next.js 16 · React 19 · TypeScript · TailwindCSS 4 · Prisma 6 · PostgreSQL · Recharts · shadcn/ui · Bun.

Developer-facing details (commands, architecture, conventions) live in [`AGENTS.md`](AGENTS.md).

## 🪪 License

[MIT](LICENSE) © Alejandro Fernández Camello. 📄
