import { createMcpHandler, withMcpAuth } from 'mcp-handler';
import { registerBookTools } from '@/lib/mcp/tools';
import { isValidMcpToken } from '@/lib/mcp/auth';

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

const authed = withMcpAuth(
  handler,
  async (_req, bearerToken) => {
    if (!(await isValidMcpToken(bearerToken))) return undefined;
    return {
      token: bearerToken!,
      scopes: ['books:rw'],
      clientId: 'book-recorder',
    };
  },
  { required: true },
);

export { authed as GET, authed as POST, authed as DELETE };
