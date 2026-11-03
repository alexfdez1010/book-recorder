import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { SetupForm } from '@/components/setup-form';

export const dynamic = 'force-dynamic';

/** Shows first-account setup only until the owner exists; the API also independently enforces this boundary. */
export default async function SetupPage() {
  if ((await prisma.user.count()) !== 0) {
    return (
      <main className="lib-login-form-area">
        <section className="lib-ticket">
          <h1 className="lib-title">Account already created</h1>
          <Link href="/login" className="mt-6 inline-block underline">
            Sign in
          </Link>
        </section>
      </main>
    );
  }
  return (
    <main className="lib-login-form-area">
      <SetupForm />
    </main>
  );
}
