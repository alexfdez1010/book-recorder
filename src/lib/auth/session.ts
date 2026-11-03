import 'server-only';
import { headers } from 'next/headers';
import { getAuth } from './server';

/** Checks the database-backed session, including expiry and revocation; never accepts legacy cookies. */
export async function isAuthenticated(): Promise<boolean> {
  return Boolean(await getAuth().api.getSession({ headers: await headers() }));
}
