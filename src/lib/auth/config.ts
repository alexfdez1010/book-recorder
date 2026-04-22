export function getAuthConfig(): { password: string; secret: string } {
  const password = process.env.PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!password) throw new Error('PASSWORD env var is required');
  if (!secret) throw new Error('AUTH_SECRET env var is required');
  return { password, secret };
}
