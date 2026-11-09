import 'server-only';

const SKILL_NAME = 'book-recorder';

/** Returns the downloadable agent instructions for the canonical MCP URL. */
export function buildSkillMarkdown(serverUrl: string): string {
  return `---
name: ${SKILL_NAME}
description: Personal reading log. Record finished books, query the user's library by author, and report reading stats through the book-recorder MCP server. Activate when the user mentions logging a book, asks what they have read by some author, asks for reading stats, or wants to look up a book to add.
---

# Book Recorder

Personal reading log backed by the \`${SKILL_NAME}\` MCP server at \`${serverUrl}\`.

Connect using OAuth in your MCP client and approve access in the browser. No static token is required.

The server exposes the following tools — discover their exact input schemas via the standard MCP \`tools/list\` call.

| Tool | Purpose |
|------|---------|
| \`search_books\` | Search Open Library + Google Books for candidates. |
| \`add_book\` | Record a book, optionally including the reader's \`opinion\`. Default \`status\` is \`finished\` (needs \`finishedOn\`); pass \`status: "to-read"\` to queue it. |
| \`add_to_read_book\` | Convenience wrapper to queue a book on the to-read shelf. |
| \`list_books\` | Books on the library, default \`status: "finished"\`; pass \`status: "to-read"\` for the queue. Optional \`author\` + \`limit\`. |
| \`list_to_read_books\` | Books queued to read, newest first. |
| \`list_categories\` | Every category available for book records. |
| \`list_books_by_author\` | All books for one author. |
| \`list_authors\` | Distinct authors with book counts. |
| \`get_book\` | One book by id. |
| \`update_book\` | Replace metadata, including an optional opinion, for an id. |
| \`set_opinion\` | Set or clear the reader's opinion for a book. |
| \`set_rating\` | Set or clear the rating for a book. |
| \`mark_as_finished\` | Promote a to-read book to finished by setting \`finishedOn\`. |
| \`record_reread\` | Append a completed reread to an existing \`bookId\`, preserving history. |
| \`list_readings\` | Every reading of a \`bookId\`, newest first. |
| \`update_reading\` | Edit one reading by its \`id\` and \`bookId\`. |
| \`delete_reading\` | Remove one reading; the final reading is protected. |
| \`add_category\` | Add a reusable book category. |
| \`delete_book\` | Remove a book by id. |
| \`get_stats\` | Totals, averages, distributions, time series. |

## Conventions

- Prefer \`search_books\` before \`add_book\` so \`pages\`, \`coverUrl\`, \`externalId\`, \`source\`, and \`publicationDate\` are filled from a real candidate. Manual values are a fallback.
- \`category\` is one of: Fiction, Science Fiction, Fantasy, Mystery & Thriller, Romance, Horror, Biography & Memoir, History, Science, Technology, Philosophy, Self-Help, Business, Poetry, Other.
- \`language\` is ISO 639-1 (\`en\`, \`es\`, \`fr\`, \`de\`, \`it\`, \`pt\`, \`ru\`, \`ja\`, \`zh\`, \`ar\`, \`nl\`, \`sv\`, \`no\`, \`da\`, \`pl\`, \`tr\`, \`ko\`, \`hi\`, \`la\`, \`el\`).
- Default \`finishedOn\` to today (UTC) when the user does not specify a date.
- \`opinion\` is optional free text up to 10,000 characters. Use \`set_opinion\` with \`null\` to clear it.
- A reread belongs to the existing book. Use \`record_reread\` rather than \`add_book\` or changing its old finish date. Pass \`bookId\`, \`finishedOn\`, \`pages\`, \`language\` and a stable UUID \`requestId\` for retry safety. New ratings and opinions are optional and start blank.
- \`set_rating\`, \`set_opinion\` and legacy \`update_book\` target the latest chronological reading. Use \`update_reading\` for a specific past reading. Its omitted rating/opinion fields clear them.
- \`get_book\` includes ordered \`readings\`; its top-level date, pages, language, rating and opinion mirror the latest reading. \`get_stats.totals.readings\` counts finishes, \`titles\` counts distinct book ids, and legacy \`books\` remains an alias for readings. Page totals include rereads.
- Confirm destructive operations (\`delete_book\`, \`delete_reading\`, \`update_book\`, \`update_reading\`) before invoking. Deleting a book removes all its readings.
`;
}

/** Returns an HTTP MCP configuration; the client manages OAuth credentials. */
export function buildMcpJson(serverUrl: string): string {
  return JSON.stringify(
    {
      mcpServers: {
        [SKILL_NAME]: {
          type: 'http',
          url: serverUrl,
        },
      },
    },
    null,
    2,
  );
}

export const SKILL_FILENAME = 'SKILL.md';
export const SKILL_CONFIG_FILENAME = 'book-recorder.mcp.json';
export { SKILL_NAME };
