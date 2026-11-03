/** Canonical origin for cookies, OAuth issuer and resource binding; never trusts request hosts. */
export const authOrigin =
  process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
export const mcpResource = `${authOrigin}/api/mcp/mcp`;
