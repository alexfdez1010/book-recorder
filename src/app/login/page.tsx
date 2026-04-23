import { redirect } from 'next/navigation';
import { createSession } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rule, Stamp } from '@/components/ui/stamp';

async function loginAction(formData: FormData) {
  'use server';
  const password = String(formData.get('password') ?? '');
  const ok = await createSession(password);
  if (!ok) redirect('/login?error=1');
  redirect('/books');
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="relative flex min-h-screen items-center justify-center p-6">
      <p className="absolute left-6 top-6 lib-meta">
        Restricted · Members only · Ref. 000-01
      </p>
      <div className="absolute right-6 top-6">
        <Stamp>private collection</Stamp>
      </div>

      <form action={loginAction} className="lib-ticket">
        <div className="lib-ticket__head">
          <p className="lib-kicker">Access credential required</p>
          <h1 className="lib-title mt-3">The Stacks</h1>
          <p className="lib-subtitle mt-3">
            Enter the passphrase to consult the ledger.
          </p>
        </div>

        <div className="lib-ticket__body">
          <div className="lib-field">
            <Label htmlFor="password">Passphrase</Label>
            <Input
              id="password"
              type="password"
              name="password"
              autoFocus
              required
              aria-label="Password"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p role="alert" className="lib-field-error">
              ✕ Rejected. Passphrase does not match the register.
            </p>
          ) : null}

          <Button type="submit" variant="primary" size="lg" className="lib-btn--block">
            Unlock the ledger →
          </Button>

          <Rule ornament="❦" />
        </div>
      </form>
    </main>
  );
}
