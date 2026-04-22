import { redirect } from 'next/navigation';
import { createSession } from '@/lib/auth/session';

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
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <form
        action={loginAction}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-neutral-900">Book Recorder</h1>
        <p className="text-sm text-neutral-500">Enter password to continue.</p>
        <input
          type="password"
          name="password"
          autoFocus
          required
          aria-label="Password"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
        />
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            Invalid password.
          </p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-lg bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-800"
        >
          Unlock
        </button>
      </form>
    </main>
  );
}
