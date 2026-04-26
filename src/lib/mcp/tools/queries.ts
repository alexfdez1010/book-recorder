import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/db/prisma';
import { listBooks } from '@/lib/books/repository';
import { searchBooks } from '@/lib/books/search';
import {
  booksPerMonth,
  cumulativePages,
  distribution,
  meanPagesPerDay,
} from '@/lib/stats/aggregate';
import {
  averageDaysBetweenFinishes,
  averagePagesPerBook,
  favoriteAuthor,
  longestBook,
  topAuthors,
} from '@/lib/stats/advanced';
import { ok } from './shared';

export function registerQueryTools(server: McpServer): void {
  server.registerTool(
    'search_books',
    {
      title: 'Search books',
      description:
        'Search Open Library and Google Books for matching titles. Returns candidate metadata (title, author, pages, language, cover, externalId/source) you can hand to add_book.',
      inputSchema: {
        query: z.string().min(1).describe('Free-text title/author query'),
        limit: z.number().int().min(1).max(20).optional(),
      },
    },
    async ({ query, limit }) => ok(await searchBooks(query, limit ?? 10)),
  );

  server.registerTool(
    'list_books',
    {
      title: 'List finished books',
      description:
        'List books recorded in the library, optionally filtered by author (case-insensitive substring) and limited.',
      inputSchema: {
        author: z.string().optional(),
        limit: z.number().int().min(1).max(500).optional(),
      },
    },
    async ({ author, limit }) =>
      ok(
        await prisma.book.findMany({
          where: author
            ? { author: { contains: author, mode: 'insensitive' } }
            : undefined,
          orderBy: { finishedOn: 'desc' },
          take: limit,
        }),
      ),
  );

  server.registerTool(
    'list_authors',
    {
      title: 'List authors',
      description:
        'List every distinct author with the number of books recorded for them, sorted by count desc.',
      inputSchema: {},
    },
    async () => {
      const books = await listBooks();
      return ok(topAuthors(books, books.length));
    },
  );

  server.registerTool(
    'list_books_by_author',
    {
      title: 'List books for an author',
      description:
        'Return every recorded book whose author matches the given name (case-insensitive substring), most recent first.',
      inputSchema: { author: z.string().min(1) },
    },
    async ({ author }) => {
      const books = await prisma.book.findMany({
        where: { author: { contains: author, mode: 'insensitive' } },
        orderBy: { finishedOn: 'desc' },
      });
      return ok({ author, count: books.length, books });
    },
  );

  server.registerTool(
    'get_book',
    {
      title: 'Get a book by id',
      description: 'Return a single book record by its database id, or null.',
      inputSchema: { id: z.string().min(1) },
    },
    async ({ id }) => ok(await prisma.book.findUnique({ where: { id } })),
  );

  server.registerTool(
    'get_stats',
    {
      title: 'Reading statistics',
      description:
        'Aggregate stats over the whole library: KPIs (total books/pages, averages, favorite author, longest book), distributions by category/language, books-per-month and cumulative pages.',
      inputSchema: {},
    },
    async () => {
      const books = await listBooks();
      return ok({
        totals: {
          books: books.length,
          pages: books.reduce((s, b) => s + b.pages, 0),
          authors: new Set(books.map((b) => b.author)).size,
        },
        averages: {
          pagesPerBook: averagePagesPerBook(books),
          pagesPerDay: meanPagesPerDay(books),
          daysBetweenFinishes: averageDaysBetweenFinishes(books),
        },
        favoriteAuthor: favoriteAuthor(books),
        longestBook: longestBook(books),
        categories: distribution(books, 'category'),
        languages: distribution(books, 'language'),
        booksPerMonth: booksPerMonth(books),
        cumulativePages: cumulativePages(books),
      });
    },
  );
}
