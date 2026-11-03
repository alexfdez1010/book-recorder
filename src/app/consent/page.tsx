import { headers } from 'next/headers';
import { verifyOAuthQueryParams } from '@better-auth/oauth-provider';
import { getAuth } from '@/lib/auth/server';
import { ConsentForm } from '@/components/consent-form';

export const dynamic = 'force-dynamic';

/** Verifies the signed, expiring authorization query before showing the client and requested access. */
export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const item of Array.isArray(value)
      ? value
      : value === undefined
        ? []
        : [value])
      query.append(key, item);
  }
  const { secret } = await getAuth().$context;
  const valid = await verifyOAuthQueryParams(query.toString(), secret);
  const scopes = (query.get('scope') ?? '').split(' ').filter(Boolean);
  if (
    !valid ||
    !query.get('client_id') ||
    scopes.some((scope) => !['books:rw', 'offline_access'].includes(scope))
  ) {
    return (
      <main className="lib-login-form-area">
        <p role="alert">
          Invalid or expired authorization request. Connect again from your MCP
          client.
        </p>
      </main>
    );
  }
  const client = await getAuth()
    .api.getOAuthClientPublic({
      query: { client_id: query.get('client_id')! },
      headers: await headers(),
    })
    .catch(() => null);
  if (!client)
    return (
      <main className="lib-login-form-area">
        <p role="alert">This application is unavailable</p>
      </main>
    );
  return (
    <main className="lib-login-form-area">
      <ConsentForm
        name={client.client_name ?? 'MCP client'}
        clientId={query.get('client_id')!}
        offline={scopes.includes('offline_access')}
      />
    </main>
  );
}
