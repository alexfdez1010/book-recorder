# Authentication and MCP authorization

Better Auth owns password hashing, database sessions, OAuth authorization, PKCE, signing keys and token rotation. The application permits one owner and provides an immediate disconnect policy around Better Auth's token verifier. Existing book and category records remain unchanged.

## First account

Set `BETTER_AUTH_URL` to the canonical HTTPS origin and `BETTER_AUTH_SECRET` to at least 32 random characters. Set `AUTH_OWNER_EMAIL` to the sole owner's email. Generate an unpredictable setup token of at least 32 random bytes and store only its SHA-256 hash as `AUTH_SETUP_TOKEN_HASH`. Keep the original token private.

Open `/setup#token=YOUR_TOKEN` on the canonical origin. The fragment is read in the browser and sent in `x-book-recorder-setup-token` over HTTPS, keeping it out of request URLs, referrers and ordinary server access logs. The owner chooses a new password of 12–128 characters. Better Auth stores a salted scrypt hash in `account.password`; the plaintext password is never stored in environment variables or application logs.

The setup hook rejects missing or incorrect credentials, any other email, and all registrations once an owner exists. PostgreSQL's `user_single_owner` unique expression index closes the race between concurrent requests. This custom SQL index is intentionally outside the Prisma model: do not remove it in later migrations. The setup link ceases to grant registration after successful creation.

There is no public password-reset email service configured. Do not advertise email recovery without adding and validating its delivery mechanism.

## Browser sessions and HTTP boundaries

Browser sessions expire after seven days and renew after a day of activity. Cookies are HttpOnly, Secure on HTTPS and SameSite Lax. `proxy.ts` validates sessions in the database before private routes; book actions and connection mutations validate again at the data boundary. Old `br_session` cookies are ignored.

Route handlers forward authentication requests through `getAuth().handler(request)`, including the legacy `/api/logout` alias. This is necessary for Better Auth's origin checks and database-backed rate limiter. Server-side `auth.api` calls do not automatically run the HTTP protections. Login allows ten attempts per minute per trusted IP; first-account setup allows five. Vercel supplies `x-real-ip`; a self-hosted proxy must overwrite that header instead of accepting client-provided values.

`getAuth()` initializes lazily so `bun run build` remains independent of database availability. `isAuthenticated()` returns whether the current request has an active database session. `validSetupToken(token, expectedHash?)` compares a setup token to its configured hash and fails closed for missing or malformed configuration.

## MCP connection

Add `https://books.alejandrofernandezcamello.me/api/mcp/mcp` to an OAuth-capable MCP client. The server advertises RFC 9728 resource metadata and RFC 8414 authorization-server metadata through `/.well-known/*`. A rejected request includes the `WWW-Authenticate` discovery challenge.

The client registers using DCR or supplies a CIMD document, opens the authorization URL, signs in and asks for consent. S256 PKCE is mandatory. Grants are limited to authorization code and refresh token; client credentials cannot access the library. `books:rw` grants access to the book tools; `offline_access` permits renewal while the owner is away. Unknown scopes and resources are rejected.

Access tokens last 15 minutes and are bound to the canonical MCP URL. Refresh tokens rotate and last at most 30 days. The MCP guard verifies the JWT signature, issuer, expiry, audience and scope through Better Auth, then verifies that its owner exists, its client is enabled and its consent still grants `books:rw`. Disconnecting a client on `/skill` disables it, removes consent and removes stored grants atomically, immediately rejecting its existing access tokens. Reconnecting a deliberately disabled client requires an administrator to re-enable it or the MCP client to register a new client identity.

`protectMcp(handler)` wraps an HTTP transport handler with this authorization policy. The underlying `mcp-handler` transport and tool contracts are preserved, including compatibility with existing SDK v1 clients. The modern MCP authorization plugins do not require replacing the existing transport to validate OAuth JWTs. Exported `buildSkillMarkdown(url)` and `buildMcpJson(url)` produce agent instructions and an HTTP configuration with no embedded credentials.

## Provisioning and tests

`bun run auth:provision` is a private operator command, primarily used for disposable E2E fixtures. It requires `AUTH_OWNER_EMAIL` and `AUTH_OWNER_PASSWORD`, optionally loading `AUTH_ENV_FILE`; it hashes the password, atomically creates the owner and credential account, and preserves credentials on repeated execution. It refuses a different existing owner. The public setup form is the production onboarding path.

For E2E, use a disposable local database ending in `_test`, set `BETTER_AUTH_URL` to the test server origin, and set `PASSWORD` to a test-only password. Set `AUTH_SETUP_TOKEN` to the test setup token and `AUTH_SETUP_TOKEN_HASH` to its SHA-256 hash. The Playwright global setup refuses remote and non-test databases. Each browser receives an isolated proxy IP so tests exercise real rate limits without sharing a bucket. Run `bun run test:e2e`, or against an already running built server run `bunx playwright test tests/e2e/auth-setup.spec.ts tests/e2e/oauth-security.spec.ts`.

## Deployment and recovery

Deploy the additive migration before serving the new auth code. Vercel's existing production build gate applies migrations after successful compilation and before promotion. No existing book or category table is altered. New Vercel configuration replaces `PASSWORD` and `AUTH_SECRET`; remove those legacy variables after verifying the new deployment. Existing browser and MCP credentials must be replaced through login and OAuth.

Preview and Production currently share a database. They must share `BETTER_AUTH_SECRET` because signing keys and refresh responses are encrypted with it. Their canonical auth origin remains Production. Use an isolated Neon branch, new auth secret and the preview's canonical origin for an independent preview auth flow.

A failed build leaves the previous deployment active. The additive auth tables remain compatible with the previous application. Before removing legacy variables, rollback can use the previous deployment. Afterwards, restoring that insecure legacy version also requires explicitly restoring its old environment variables from a secure source. Never drop auth tables or reset the production database as rollback. For password recovery, use a trusted operator process to replace the credential hash with Better Auth's `hashPassword` and revoke all browser sessions and OAuth grants; do not delete the owner or reopen public signup.

## Official references

- [Better Auth email and password](https://better-auth.com/docs/authentication/email-password)
- [Better Auth Next.js integration](https://better-auth.com/docs/integrations/next)
- [Better Auth Prisma adapter](https://better-auth.com/docs/adapters/prisma)
- [Better Auth MCP plugin](https://better-auth.com/docs/plugins/mcp)
- [Better Auth OAuth provider](https://better-auth.com/docs/plugins/oauth-provider)
- [Better Auth rate limits](https://better-auth.com/docs/concepts/rate-limit)
