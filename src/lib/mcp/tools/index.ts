import 'server-only';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerQueryTools } from './queries';
import { registerMutationTools } from './mutations';

export function registerBookTools(server: McpServer): void {
  registerQueryTools(server);
  registerMutationTools(server);
}
