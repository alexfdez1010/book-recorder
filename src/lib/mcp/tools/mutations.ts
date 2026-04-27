import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  createBook,
  deleteBook,
  markBookAsFinished,
  updateBook,
} from '@/lib/books/repository';
import { newBookSchema } from '@/lib/books/validation';
import { bookFields, ok } from './shared';

export function registerMutationTools(server: McpServer): void {
  server.registerTool(
    'add_book',
    {
      title: 'Record a book',
      description:
        'Record a book. Default `status` is `finished` (requires `finishedOn` YYYY-MM-DD); pass `status: "to-read"` to queue it without a finish date.',
      inputSchema: bookFields,
    },
    async (input) => {
      const parsed = newBookSchema.parse(input);
      const isFinished = parsed.status === 'finished';
      const created = await createBook({
        title: parsed.title,
        author: parsed.author,
        publicationDate: parsed.publicationDate ? new Date(parsed.publicationDate) : null,
        pages: parsed.pages,
        coverUrl: parsed.coverUrl ? parsed.coverUrl : null,
        category: parsed.category,
        language: parsed.language,
        status: parsed.status,
        finishedOn: isFinished && parsed.finishedOn ? new Date(parsed.finishedOn) : null,
        externalId: parsed.externalId ? parsed.externalId : null,
        source: parsed.source ?? 'manual',
      });
      return ok(created);
    },
  );

  server.registerTool(
    'add_to_read_book',
    {
      title: 'Queue a book to read',
      description:
        'Add a book to the to-read shelf. Convenience wrapper for `add_book` with `status: "to-read"`; no `finishedOn` is required.',
      inputSchema: { ...bookFields, status: z.literal('to-read').optional() },
    },
    async (input) => {
      const parsed = newBookSchema.parse({ ...input, status: 'to-read' });
      const created = await createBook({
        title: parsed.title,
        author: parsed.author,
        publicationDate: parsed.publicationDate ? new Date(parsed.publicationDate) : null,
        pages: parsed.pages,
        coverUrl: parsed.coverUrl ? parsed.coverUrl : null,
        category: parsed.category,
        language: parsed.language,
        status: 'to-read',
        finishedOn: null,
        externalId: parsed.externalId ? parsed.externalId : null,
        source: parsed.source ?? 'manual',
      });
      return ok(created);
    },
  );

  server.registerTool(
    'update_book',
    {
      title: 'Update a recorded book',
      description: 'Update an existing book record by id. All metadata fields are required.',
      inputSchema: { id: z.string().min(1), ...bookFields },
    },
    async ({ id, ...rest }) => {
      const parsed = newBookSchema.parse(rest);
      const isFinished = parsed.status === 'finished';
      const updated = await updateBook(id, {
        title: parsed.title,
        author: parsed.author,
        publicationDate: parsed.publicationDate ? new Date(parsed.publicationDate) : null,
        pages: parsed.pages,
        coverUrl: parsed.coverUrl ? parsed.coverUrl : null,
        category: parsed.category,
        language: parsed.language,
        status: parsed.status,
        finishedOn: isFinished && parsed.finishedOn ? new Date(parsed.finishedOn) : null,
      });
      return ok(updated);
    },
  );

  server.registerTool(
    'mark_as_finished',
    {
      title: 'Move a to-read book to finished',
      description:
        'Promote a to-read book to the finished shelf by setting `finishedOn` (YYYY-MM-DD).',
      inputSchema: {
        id: z.string().min(1),
        finishedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
      },
    },
    async ({ id, finishedOn }) => {
      const updated = await markBookAsFinished(id, new Date(finishedOn));
      return ok(updated);
    },
  );

  server.registerTool(
    'delete_book',
    {
      title: 'Delete a book',
      description: 'Permanently delete a book record by id.',
      inputSchema: { id: z.string().min(1) },
    },
    async ({ id }) => {
      await deleteBook(id);
      return ok({ deleted: id });
    },
  );
}
