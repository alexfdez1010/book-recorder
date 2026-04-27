import { createHash } from 'node:crypto';
import { config as loadEnv } from 'dotenv';
import { test, expect, request } from '@playwright/test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

loadEnv();

const PASSWORD = process.env.PASSWORD ?? 'dev-password';
const SECRET = process.env.AUTH_SECRET ?? 'dev-secret';

const MCP_URL = 'http://localhost:3000/api/mcp/mcp';

const TOKEN = createHash('sha256').update(`${PASSWORD}::${SECRET}`).digest('hex');

const TOOL_NAMES = [
  'search_books',
  'list_books',
  'list_to_read_books',
  'list_authors',
  'list_books_by_author',
  'get_book',
  'add_book',
  'add_to_read_book',
  'update_book',
  'mark_as_finished',
  'delete_book',
  'get_stats',
];

async function connect(token = TOKEN) {
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  });
  const client = new Client({ name: 'e2e', version: '0.0.0' });
  await client.connect(transport);
  return { client, transport };
}

function parseToolJson<T>(result: { content: Array<{ type: string; text?: string }> }): T {
  const text = result.content.find((c) => c.type === 'text')?.text;
  expect(text, 'tool returned no text content').toBeTruthy();
  return JSON.parse(text!) as T;
}

test('rejects unauthenticated requests with 401', async () => {
  const ctx = await request.newContext();
  const res = await ctx.post(MCP_URL, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    data: { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
  });
  expect(res.status()).toBe(401);
  await ctx.dispose();
});

test('rejects requests with a wrong bearer token', async () => {
  const ctx = await request.newContext();
  const res = await ctx.post(MCP_URL, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      Authorization: 'Bearer not-the-real-token',
    },
    data: { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
  });
  expect(res.status()).toBe(401);
  await ctx.dispose();
});

test('exposes the full tool catalog via tools/list', async () => {
  const { client, transport } = await connect();
  try {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual([...TOOL_NAMES].sort());
  } finally {
    await transport.close();
  }
});

test('add_book → list_books_by_author → delete_book happy path', async () => {
  const { client, transport } = await connect();
  const finishedOn = new Date().toISOString().slice(0, 10);
  const title = `MCP E2E Book ${Date.now()}`;
  const author = `MCP E2E Author ${Date.now()}`;

  try {
    const added = parseToolJson<{ id: string; title: string; author: string }>(
      await client.callTool({
        name: 'add_book',
        arguments: {
          title,
          author,
          pages: 321,
          category: 'Other',
          language: 'en',
          finishedOn,
          source: 'manual',
        },
      }),
    );
    expect(added.id).toBeTruthy();
    expect(added.title).toBe(title);

    const byAuthor = parseToolJson<{
      author: string;
      count: number;
      books: Array<{ id: string; title: string }>;
    }>(
      await client.callTool({
        name: 'list_books_by_author',
        arguments: { author },
      }),
    );
    expect(byAuthor.count).toBeGreaterThanOrEqual(1);
    expect(byAuthor.books.some((b) => b.id === added.id && b.title === title)).toBe(true);

    const deleted = parseToolJson<{ deleted: string }>(
      await client.callTool({
        name: 'delete_book',
        arguments: { id: added.id },
      }),
    );
    expect(deleted.deleted).toBe(added.id);

    const after = parseToolJson<{ count: number }>(
      await client.callTool({
        name: 'list_books_by_author',
        arguments: { author },
      }),
    );
    expect(after.count).toBe(0);
  } finally {
    await transport.close();
  }
});

test('get_stats returns the documented shape', async () => {
  const { client, transport } = await connect();
  try {
    const stats = parseToolJson<{
      totals: { books: number; pages: number; authors: number };
      averages: { pagesPerBook: number; pagesPerDay: number; daysBetweenFinishes: number };
      categories: Array<{ label: string; value: number }>;
      languages: Array<{ label: string; value: number }>;
      booksPerMonth: Array<{ label: string; value: number }>;
      cumulativePages: Array<{ date: string; pages: number }>;
    }>(
      await client.callTool({ name: 'get_stats', arguments: {} }),
    );
    expect(stats.totals).toBeDefined();
    expect(typeof stats.totals.books).toBe('number');
    expect(stats.averages).toBeDefined();
    expect(Array.isArray(stats.categories)).toBe(true);
    expect(Array.isArray(stats.languages)).toBe(true);
    expect(Array.isArray(stats.booksPerMonth)).toBe(true);
    expect(Array.isArray(stats.cumulativePages)).toBe(true);
  } finally {
    await transport.close();
  }
});
