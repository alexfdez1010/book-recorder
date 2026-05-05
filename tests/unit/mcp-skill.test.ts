import { describe, expect, it } from 'vitest';
import {
  TOKEN_ENV_VAR,
  buildMcpJson,
  buildSkillMarkdown,
} from '@/lib/mcp/skill';

const URL = 'https://example.test/api/mcp/mcp';

describe('skill markdown', () => {
  const md = buildSkillMarkdown(URL);

  it('embeds the server URL', () => {
    expect(md).toContain(URL);
  });

  it('starts with valid frontmatter and a name field', () => {
    expect(md.startsWith('---\n')).toBe(true);
    expect(md).toMatch(/^---\nname: book-recorder\n/);
  });

  it('lists every tool the MCP exposes', () => {
    for (const tool of [
      'search_books',
      'add_book',
      'list_books',
      'list_books_by_author',
      'list_authors',
      'get_book',
      'update_book',
      'delete_book',
      'get_stats',
    ]) {
      expect(md).toContain(tool);
    }
  });
});

describe('mcp.json builder', () => {
  it('uses an env-var placeholder for the bearer token, never the literal value', () => {
    const json = buildMcpJson(URL);
    const parsed = JSON.parse(json);
    expect(parsed.mcpServers['book-recorder']).toEqual({
      type: 'http',
      url: URL,
      headers: { Authorization: `Bearer \${${TOKEN_ENV_VAR}}` },
    });
    expect(json).not.toMatch(/[0-9a-f]{64}/);
  });
});
