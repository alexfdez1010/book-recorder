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

## 🚀 Quick start

You'll need **Bun** and **Docker** (for the local Postgres).

```bash
cp .env.example .env          # set PASSWORD and AUTH_SECRET
bun install
bun run database              # starts Postgres
bun run database:dev          # applies migrations
bun run dev                   # http://localhost:3000
```

Generate a secret with `openssl rand -hex 32`.

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
