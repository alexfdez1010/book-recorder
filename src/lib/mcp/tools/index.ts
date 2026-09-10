import 'server-only';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerQueryTools } from './queries';
import { registerMutationTools } from './mutations';
import { registerFieldMutationTools } from './field-mutations';

/** Register every query and mutation exposed by the book-recorder MCP server. */
export function registerBookTools(server: McpServer): void {
  registerQueryTools(server);
  registerMutationTools(server);
  registerFieldMutationTools(server);
}
