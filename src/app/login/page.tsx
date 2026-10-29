import { redirect } from 'next/navigation';
import { BookOpen, ArrowRight, LockKeyhole } from 'lucide-react';
import { createSession } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Creates an authenticated session from the password; redirects to success or error. */
async function loginAction(formData: FormData) {
  'use server';
  const password = String(formData.get('password') ?? '');
  const ok = await createSession(password);
  if (!ok) redirect('/login?error=1');
  redirect('/books');
}

/** Renders the accessible sign-in form and optional authentication error. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="lib-login">
      <section
        className="lib-login-story"
        aria-label="Your personal reading library"
      >
        <span className="flex items-center gap-3 text-sm font-medium">
          <BookOpen size={22} strokeWidth={1.5} />
          Book Recorder
        </span>
        <div>
          <p className="lib-login-story__title">
            A life
            <br />
            in books.
          </p>
          <p className="mt-6 max-w-xs text-base leading-relaxed text-ink-soft">
            Keep the stories that stay with you. Make room for the ones still to
            come.
          </p>
          <div className="lib-login-books" aria-hidden="true">
            <div className="lib-login-volume bg-leather">
              <BookOpen size={20} strokeWidth={1.3} />
              <span>
                The stories
                <br />
                we keep.
              </span>
            </div>
            <div className="lib-login-volume bg-[#a88c65]">
              <span className="text-sm">Book Recorder</span>
              <span>
                One more
                <br />
                chapter.
              </span>
            </div>
            <div className="lib-login-volume bg-[#64796c]">
              <BookOpen size={18} strokeWidth={1.3} />
              <span>
                A world
                <br />
                within.
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-ink-soft">
          Your personal library. A little more considered.
        </p>
      </section>
      <div className="lib-login-form-area">
        <form action={loginAction} className="lib-ticket">
          <div className="lib-ticket__head">
            <span className="lib-brand-icon mb-7" aria-hidden="true">
              <BookOpen size={22} strokeWidth={1.6} />
            </span>
            <h1 className="lib-title !text-[2.25rem]">Book Recorder</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-mute">
              Welcome back. Your next chapter is waiting.
            </p>
          </div>
          <div className="lib-ticket__body">
            <div className="lib-field">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                autoFocus
                required
                aria-label="Password"
                placeholder="Enter your password"
              />
            </div>
            {error ? (
              <p role="alert" className="lib-field-error">
                Invalid password. Please try again.
              </p>
            ) : null}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="lib-btn--block"
            >
              Unlock
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <p className="mt-2 flex items-center justify-center gap-2 text-xs text-ink-mute">
              <LockKeyhole size={12} aria-hidden="true" />A private space for
              your reading life
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
