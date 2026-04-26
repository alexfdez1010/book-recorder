import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createBook, deleteBook, updateBook } from '@/lib/books/repository';
import { newBookSchema } from '@/lib/books/validation';
import { bookFields, ok } from './shared';

export function registerMutationTools(server: McpServer): void {
  server.registerTool(
    'add_book',
    {
      title: 'Record a finished book',
      description:
        'Record a new finished book. Use search_books first to obtain accurate metadata; otherwise fall back to manual values. finishedOn is YYYY-MM-DD.',
      inputSchema: bookFields,
    },
    async (input) => {
      const parsed = newBookSchema.parse(input);
      const created = await createBook({
        title: parsed.title,
        author: parsed.author,
        publicationDate: parsed.publicationDate ? new Date(parsed.publicationDate) : null,
        pages: parsed.pages,
        coverUrl: parsed.coverUrl ? parsed.coverUrl : null,
        category: parsed.category,
        language: parsed.language,
        finishedOn: new Date(parsed.finishedOn),
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
      const updated = await updateBook(id, {
        title: parsed.title,
        author: parsed.author,
        publicationDate: parsed.publicationDate ? new Date(parsed.publicationDate) : null,
        pages: parsed.pages,
        coverUrl: parsed.coverUrl ? parsed.coverUrl : null,
        category: parsed.category,
        language: parsed.language,
        finishedOn: new Date(parsed.finishedOn),
      });
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
