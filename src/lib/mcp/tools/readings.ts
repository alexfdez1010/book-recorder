import 'server-only';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { prisma } from '@/lib/db/prisma';
import { LANGUAGE_KEYS } from '@/lib/books/language';
import {
  readingDateSchema,
  readingSchema,
} from '@/lib/books/reading-validation';
import {
  deleteReading,
  readingOrder,
  recordReread,
  updateReading,
} from '@/lib/books/readings-repository';
import { ok } from './shared';

const fields = {
  finishedOn: readingDateSchema,
  pages: z.number().int().positive(),
  language: z.enum(LANGUAGE_KEYS),
  rating: z.number().min(0.5).max(5).multipleOf(0.5).nullable().optional(),
  opinion: z.string().trim().max(10_000).nullable().optional(),
};

/** Registers explicit per-reading commands while retaining legacy book-id operations. */
export function registerReadingTools(server: McpServer): void {
  server.registerTool(
    'record_reread',
    {
      title: 'Record a reread',
      description:
        'Append a finished reading to an existing read book without overwriting history. Supply a stable UUID requestId for safe retries. Omitted rating and opinion start blank; pages and language are snapshots of this edition.',
      inputSchema: {
        bookId: z.string().min(1),
        requestId: z.string().uuid().optional(),
        ...fields,
      },
    },
    async ({ bookId, requestId, ...input }) => {
      const parsed = readingSchema.parse(input);
      return ok(
        await recordReread(bookId, requestId ?? randomUUID(), {
          ...parsed,
          finishedOn: new Date(parsed.finishedOn),
        }),
      );
    },
  );

  server.registerTool(
    'list_readings',
    {
      title: 'List reading history',
      description:
        'Return every reading for one book, newest first, including its own date, pages, language, rating and opinion.',
      inputSchema: { bookId: z.string().min(1) },
    },
    async ({ bookId }) =>
      ok(
        await prisma.reading.findMany({
          where: { bookId },
          orderBy: readingOrder,
        }),
      ),
  );

  server.registerTool(
    'update_reading',
    {
      title: 'Update one reading',
      description:
        'Replace one reading by its id and parent bookId. Metadata shared by all readings is unchanged. Omitted rating or opinion clears that field.',
      inputSchema: {
        bookId: z.string().min(1),
        id: z.string().min(1),
        ...fields,
      },
    },
    async ({ bookId, id, ...input }) => {
      const parsed = readingSchema.parse(input);
      return ok(
        await updateReading(bookId, id, {
          ...parsed,
          finishedOn: new Date(parsed.finishedOn),
        }),
      );
    },
  );

  server.registerTool(
    'delete_reading',
    {
      title: 'Delete one reading',
      description:
        'Permanently remove one reading and its personal fields. The last reading is protected; delete_book removes the full title and history.',
      inputSchema: { bookId: z.string().min(1), id: z.string().min(1) },
    },
    async ({ bookId, id }) => {
      await deleteReading(bookId, id);
      return ok({ deleted: id });
    },
  );
}
