import { betterAuth } from 'better-auth';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { jwt } from 'better-auth/plugins';
import { mcp } from '@better-auth/mcp';
import { cimd } from '@better-auth/cimd';
import { fetchClientMetadataResource } from '@better-auth/cimd/node';
import { prisma } from '@/lib/db/prisma';
import { validSetupToken } from './setup';
import { authOrigin, mcpResource } from './config';

/** Builds one auth instance lazily, keeping compilation independent of database availability. */
function createAuth() {
  return betterAuth({
    appName: 'Book Recorder',
    baseURL: authOrigin,
    secret: process.env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    emailAndPassword: { enabled: true, minPasswordLength: 12 },
    hooks: {
      before: createAuthMiddleware(async (context) => {
        if (context.path !== '/sign-up/email') return;
        const allowedEmail = process.env.AUTH_OWNER_EMAIL?.trim().toLowerCase();
        if (
          !validSetupToken(
            context.headers?.get('x-book-recorder-setup-token') ?? null,
          ) ||
          !allowedEmail ||
          context.body?.email?.trim().toLowerCase() !== allowedEmail ||
          (await prisma.user.count()) !== 0
        ) {
          throw new APIError('FORBIDDEN', {
            message: 'Registration is closed',
          });
        }
      }),
    },
    disabledPaths: ['/token'],
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: {
      enabled: true,
      storage: 'database',
      customRules: {
        '/sign-in/email': { window: 60, max: 10 },
        '/sign-up/email': { window: 60, max: 5 },
        '/oauth2/register': { window: 60, max: 10 },
      },
    },
    advanced: { ipAddress: { ipAddressHeaders: ['x-real-ip'] } },
    plugins: [
      jwt(),
      mcp({
        resource: mcpResource,
        resources: [
          {
            identifier: mcpResource,
            name: 'Book Recorder',
            allowedScopes: ['books:rw', 'offline_access'],
          },
        ],
        loginPage: '/login',
        consentPage: '/consent',
        scopes: ['books:rw', 'offline_access'],
        grantTypes: ['authorization_code', 'refresh_token'],
        accessTokenExpiresIn: 60 * 15,
        refreshTokenExpiresIn: 60 * 60 * 24 * 30,
        allowDynamicClientRegistration: true,
        allowUnauthenticatedClientRegistration: true,
        clientRegistrationDefaultApplicationType: 'infer',
        clientRegistrationRequirePKCE: true,
      }),
      cimd({ fetchClientMetadataResource, metadataProfile: 'mcp-2026-07-28' }),
    ],
  });
}

let instance: ReturnType<typeof createAuth> | undefined;

/** Returns the request-time auth instance; initialization may read or seed OAuth resource metadata. */
export function getAuth() {
  return (instance ??= createAuth());
}
