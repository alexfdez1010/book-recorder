import { prisma } from '@/lib/db/prisma';
import { disconnectClient } from '@/lib/auth/connections';
import { Button } from './ui/button';

/** Lists authorized applications with immediate revocation of their OAuth access. */
export async function OAuthConnections() {
  const connections = await prisma.oauthConsent.findMany({
    include: { oauthclient: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!connections.length) return null;
  return (
    <section className="lib-panel">
      <header className="lib-panel__head">
        <h2 className="lib-panel__title">Connected apps</h2>
      </header>
      <div className="lib-panel__body flex flex-col gap-5">
        {connections.map((connection) => (
          <form
            action={disconnectClient}
            key={connection.id}
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="font-medium">
                {connection.oauthclient.name ?? 'MCP client'}
              </p>
              <p className="break-all text-xs text-ink-mute">
                {connection.clientId}
              </p>
            </div>
            <input type="hidden" name="clientId" value={connection.clientId} />
            <Button type="submit" variant="ghost">
              Disconnect
            </Button>
          </form>
        ))}
      </div>
    </section>
  );
}
