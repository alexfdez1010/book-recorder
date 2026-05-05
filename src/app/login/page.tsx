import { redirect } from 'next/navigation';
import { createSession } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <main className="flex min-h-screen items-center justify-center p-4">
      <form action={loginAction} className="lib-ticket">
        <div className="lib-ticket__head">
          <h1 className="lib-title">Book Recorder</h1>
        </div>

        <div className="lib-ticket__body">
          <div className="lib-field">
            <Label htmlFor="password">Password</Label>
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
              ✕ Invalid password.
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="lib-btn--block"
          >
            Unlock
          </Button>
        </div>
      </form>
    </main>
  );
}
