import { test, expect, request, type Page } from '../helpers/fixtures';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { authorizeMcp } from '../helpers/oauth';

const MCP_URL = `${process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'}/api/mcp/mcp`;

const TOOL_NAMES = [
  'search_books',
  'list_books',
  'list_to_read_books',
  'list_categories',
  'list_authors',
  'list_books_by_author',
  'get_book',
  'add_book',
  'add_to_read_book',
  'update_book',
  'set_opinion',
  'set_rating',
  'add_category',
  'mark_as_finished',
  'delete_book',
  'get_stats',
  'record_reread',
  'list_readings',
  'update_reading',
  'delete_reading',
];

async function connect(page: Page) {
  const { access_token: token } = await authorizeMcp(page);
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  });
  const client = new Client({ name: 'e2e', version: '0.0.0' });
  await client.connect(transport);
  return { client, transport };
}

function parseToolJson<T>(result: unknown): T {
  const toolResult = result as {
    content?: Array<{ type: string; text?: string }>;
    isError?: boolean;
  };
  const content = toolResult.content;
  const text = content?.find((c) => c.type === 'text')?.text;
  expect(text, 'tool returned no text content').toBeTruthy();
  expect(toolResult.isError, text).not.toBe(true);
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

test('exposes the full tool catalog via tools/list', async ({ page }) => {
  const { client, transport } = await connect(page);
  try {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual([...TOOL_NAMES].sort());
  } finally {
    await transport.close();
  }
});

test('add_book → set_opinion → list_books_by_author → delete_book', async ({
  page,
}) => {
  const { client, transport } = await connect(page);
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

    const opinion = 'A concise opinion recorded through MCP.';
    const updated = parseToolJson<{ id: string; opinion: string | null }>(
      await client.callTool({
        name: 'set_opinion',
        arguments: { id: added.id, opinion },
      }),
    );
    expect(updated.opinion).toBe(opinion);

    const metadataUpdate = parseToolJson<{
      id: string;
      opinion: string | null;
    }>(
      await client.callTool({
        name: 'update_book',
        arguments: {
          id: added.id,
          title,
          author,
          pages: 322,
          category: 'Other',
          language: 'en',
          finishedOn,
        },
      }),
    );
    expect(metadataUpdate.opinion).toBe(opinion);

    const byAuthor = parseToolJson<{
      author: string;
      count: number;
      books: Array<{ id: string; title: string; opinion: string | null }>;
    }>(
      await client.callTool({
        name: 'list_books_by_author',
        arguments: { author },
      }),
    );
    expect(byAuthor.count).toBeGreaterThanOrEqual(1);
    expect(
      byAuthor.books.some(
        (b) => b.id === added.id && b.title === title && b.opinion === opinion,
      ),
    ).toBe(true);

    const cleared = parseToolJson<{ opinion: string | null }>(
      await client.callTool({
        name: 'set_opinion',
        arguments: { id: added.id, opinion: null },
      }),
    );
    expect(cleared.opinion).toBeNull();

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

test('get_stats returns the documented shape', async ({ page }) => {
  const { client, transport } = await connect(page);
  try {
    const stats = parseToolJson<{
      totals: { books: number; pages: number; authors: number };
      averages: {
        pagesPerBook: number;
        pagesPerDay: number;
        daysBetweenFinishes: number;
      };
      categories: Array<{ label: string; value: number }>;
      languages: Array<{ label: string; value: number }>;
      booksPerMonth: Array<{ label: string; value: number }>;
      cumulativePages: Array<{ date: string; pages: number }>;
    }>(await client.callTool({ name: 'get_stats', arguments: {} }));
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

test('MCP rereads preserve original snapshots, statistics and legacy field commands', async ({
  page,
}) => {
  const { client, transport } = await connect(page);
  let bookId: string | undefined;
  type Reading = {
    id: string;
    pages: number;
    language: string;
    rating: number | null;
    opinion: string | null;
  };
  try {
    const baseline = parseToolJson<{
      totals: { readings: number; titles: number; pages: number };
    }>(await client.callTool({ name: 'get_stats', arguments: {} }));
    const book = parseToolJson<{ id: string }>(
      await client.callTool({
        name: 'add_book',
        arguments: {
          title: `MCP reread ${crypto.randomUUID()}`,
          author: 'MCP reread fixture',
          pages: 300,
          category: 'Fiction',
          language: 'en',
          finishedOn: '2020-01-01',
          rating: 3.5,
          opinion: 'Original opinion',
        },
      }),
    );
    bookId = book.id;
    const original = parseToolJson<Reading[]>(
      await client.callTool({ name: 'list_readings', arguments: { bookId } }),
    )[0];
    const args = {
      bookId,
      requestId: crypto.randomUUID(),
      finishedOn: '2026-11-09',
      pages: 320,
      language: 'es',
    };
    const second = parseToolJson<Reading>(
      await client.callTool({ name: 'record_reread', arguments: args }),
    );
    expect(second).toMatchObject({
      pages: 320,
      language: 'es',
      rating: null,
      opinion: null,
    });
    const retry = parseToolJson<Reading>(
      await client.callTool({ name: 'record_reread', arguments: args }),
    );
    expect(retry).toEqual(second);
    const stats = parseToolJson<{
      totals: {
        books: number;
        readings: number;
        titles: number;
        pages: number;
      };
    }>(await client.callTool({ name: 'get_stats', arguments: {} }));
    expect(stats.totals.readings).toBe(baseline.totals.readings + 2);
    expect(stats.totals.books).toBe(stats.totals.readings);
    expect(stats.totals.titles).toBe(baseline.totals.titles + 1);
    expect(stats.totals.pages).toBe(baseline.totals.pages + 620);
    await client.callTool({
      name: 'set_rating',
      arguments: { id: bookId, rating: 5 },
    });
    await client.callTool({
      name: 'update_reading',
      arguments: {
        bookId,
        id: original.id,
        finishedOn: '2020-01-01',
        pages: 301,
        language: 'en',
        rating: 3.5,
        opinion: 'Corrected original',
      },
    });
    const fetched = parseToolJson<{ rating: number; readings: Reading[] }>(
      await client.callTool({ name: 'get_book', arguments: { id: bookId } }),
    );
    expect(fetched.rating).toBe(5);
    expect(fetched.readings).toHaveLength(2);
    expect(fetched.readings[0]).toMatchObject({
      id: second.id,
      pages: 320,
      rating: 5,
      opinion: null,
    });
    expect(fetched.readings[1]).toMatchObject({
      id: original.id,
      pages: 301,
      rating: 3.5,
      opinion: 'Corrected original',
    });
    parseToolJson(
      await client.callTool({
        name: 'delete_reading',
        arguments: { bookId, id: second.id },
      }),
    );
    const lastDelete = await client.callTool({
      name: 'delete_reading',
      arguments: { bookId, id: original.id },
    });
    expect(lastDelete.isError).toBe(true);
    expect(
      parseToolJson<Reading[]>(
        await client.callTool({ name: 'list_readings', arguments: { bookId } }),
      ),
    ).toHaveLength(1);
  } finally {
    if (bookId)
      await client.callTool({ name: 'delete_book', arguments: { id: bookId } });
    await transport.close();
  }
});
