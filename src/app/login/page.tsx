import { redirect } from 'next/navigation';
import { createSession } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stamp } from '@/components/ui/stamp';

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
      <div className="absolute left-6 top-6 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-mute">
        Restricted · Members only · Ref. 000-01
      </div>
      <div className="absolute right-6 top-6">
        <Stamp>private collection</Stamp>
      </div>

      <form
        action={loginAction}
        className="w-full max-w-md bg-paper-soft border-[4px] border-ink brutal-shadow"
      >
        <div className="border-b-[3px] border-ink bg-paper px-9 py-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-mute">
            Access credential required
          </p>
          <h1 className="mt-3 font-serif text-5xl font-black leading-none tracking-tight">
            The Stacks
          </h1>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
            Enter the passphrase to consult the ledger.
          </p>
        </div>

        <div className="space-y-6 px-9 py-8">
          <div className="space-y-1.5">
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
            <p
              role="alert"
              className="border-[3px] border-blood bg-paper px-3 py-2 font-mono text-xs text-blood uppercase tracking-[0.12em]"
            >
              ✕ Rejected. Passphrase does not match the register.
            </p>
          ) : null}

          <Button type="submit" variant="ink" size="lg" className="w-full">
            Unlock the ledger →
          </Button>
        </div>

        <div className="barcode h-3 mx-9 mb-7" aria-hidden />
      </form>
    </main>
  );
}
