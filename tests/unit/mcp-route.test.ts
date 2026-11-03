import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/mcp/auth', () => ({
  protectMcp: (handler: (request: Request) => Promise<Response>) => handler,
}));
vi.mock('@/lib/db/prisma', () => ({ prisma: {} }));
import { POST } from '@/app/api/mcp/[transport]/route';

describe('MCP transport behind OAuth', () => {
  it('initializes the registered server through the protected handler', async () => {
    const response = await POST(
      new Request('http://localhost/api/mcp/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-06-18',
            capabilities: {},
            clientInfo: { name: 'test', version: '1' },
          },
        }),
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('book-recorder');
  });
});
