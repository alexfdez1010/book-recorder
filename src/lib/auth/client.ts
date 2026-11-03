'use client';
import { createAuthClient } from 'better-auth/react';
import { oauthProviderClient } from '@better-auth/oauth-provider/client';

/** Same-origin client that carries the signed OAuth query through login and consent. */
export const authClient = createAuthClient({
  plugins: [oauthProviderClient()],
});
