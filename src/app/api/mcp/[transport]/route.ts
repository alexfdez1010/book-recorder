import { createMcpHandler } from 'mcp-handler';
import { registerBookTools } from '@/lib/mcp/tools';
import { protectMcp } from '@/lib/mcp/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = createMcpHandler(
  (server) => {
    registerBookTools(server);
  },
  {
    serverInfo: { name: 'book-recorder', version: '1.0.0' },
  },
  {
    basePath: '/api/mcp',
    maxDuration: 60,
    disableSse: true,
  },
);

const authed = protectMcp(handler);

export { authed as GET, authed as POST, authed as DELETE };
