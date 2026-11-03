import 'server-only';
import { requireMcpAuth } from '@better-auth/mcp';
import { getAuth } from '@/lib/auth/server';
import { mcpResource } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';

/** Verifies OAuth signature, issuer, resource, expiry and scope, and requires the owner and an enabled client. */
export function protectMcp(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) =>
    requireMcpAuth(
      getAuth(),
      async (request, claims) => {
        if (typeof claims.sub !== 'string' || typeof claims.azp !== 'string') {
          return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const [owner, client, consent] = await Promise.all([
          prisma.user.findUnique({
            where: { id: claims.sub },
            select: { id: true },
          }),
          prisma.oauthClient.findUnique({
            where: { clientId: claims.azp },
            select: { disabled: true },
          }),
          prisma.oauthConsent.findFirst({
            where: { clientId: claims.azp, userId: claims.sub },
            select: { scopes: true },
          }),
        ]);
        if (
          !owner ||
          !client ||
          client.disabled ||
          !consent?.scopes.includes('books:rw')
        ) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return handler(request);
      },
      { resource: mcpResource, requiredScopes: ['books:rw'] },
    )(request);
}
