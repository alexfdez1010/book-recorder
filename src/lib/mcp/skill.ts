import 'server-only';

const SKILL_NAME = 'book-recorder';
export const TOKEN_ENV_VAR = 'BOOK_RECORDER_TOKEN';

export function buildSkillMarkdown(serverUrl: string): string {
  return `---
name: ${SKILL_NAME}
description: Personal reading log. Record finished books, query the user's library by author, and report reading stats through the book-recorder MCP server. Activate when the user mentions logging a book, asks what they have read by some author, asks for reading stats, or wants to look up a book to add.
---

# Book Recorder

Personal reading log backed by the \`${SKILL_NAME}\` MCP server at \`${serverUrl}\`.

The server exposes the following tools — discover their exact input schemas via the standard MCP \`tools/list\` call.

| Tool | Purpose |
|------|---------|
| \`search_books\` | Search Open Library + Google Books for candidates. |
| \`add_book\` | Record a book. Default \`status\` is \`finished\` (needs \`finishedOn\`); pass \`status: "to-read"\` to queue it. |
| \`add_to_read_book\` | Convenience wrapper to queue a book on the to-read shelf. |
| \`list_books\` | Books on the library, default \`status: "finished"\`; pass \`status: "to-read"\` for the queue. Optional \`author\` + \`limit\`. |
| \`list_to_read_books\` | Books queued to read, newest first. |
| \`list_books_by_author\` | All books for one author. |
| \`list_authors\` | Distinct authors with book counts. |
| \`get_book\` | One book by id. |
| \`update_book\` | Replace metadata for an id. |
| \`mark_as_finished\` | Promote a to-read book to finished by setting \`finishedOn\`. |
| \`delete_book\` | Remove a book by id. |
| \`get_stats\` | Totals, averages, distributions, time series. |

## Conventions

- Prefer \`search_books\` before \`add_book\` so \`pages\`, \`coverUrl\`, \`externalId\`, \`source\`, and \`publicationDate\` are filled from a real candidate. Manual values are a fallback.
- \`category\` is one of: Fiction, Science Fiction, Fantasy, Mystery & Thriller, Romance, Horror, Biography & Memoir, History, Science, Technology, Philosophy, Self-Help, Business, Poetry, Other.
- \`language\` is ISO 639-1 (\`en\`, \`es\`, \`fr\`, \`de\`, \`it\`, \`pt\`, \`ru\`, \`ja\`, \`zh\`, \`ar\`, \`nl\`, \`sv\`, \`no\`, \`da\`, \`pl\`, \`tr\`, \`ko\`, \`hi\`, \`la\`, \`el\`).
- Default \`finishedOn\` to today (UTC) when the user does not specify a date.
- Confirm destructive operations (\`delete_book\`, \`update_book\`) before invoking.
`;
}

export function buildMcpJson(serverUrl: string): string {
  return JSON.stringify(
    {
      mcpServers: {
        [SKILL_NAME]: {
          type: 'http',
          url: serverUrl,
          headers: { Authorization: `Bearer \${${TOKEN_ENV_VAR}}` },
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
