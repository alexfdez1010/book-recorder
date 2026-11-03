'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { authClient } from '@/lib/auth/client';
import { BrandMark } from './brand-mark';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

/** Signs in through Better Auth's rate-limited HTTP endpoint and resumes OAuth when requested. */
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  /** Submits credentials without persisting them; errors preserve the form for correction. */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    const fields = new FormData(event.currentTarget);
    try {
      const result = await authClient.signIn.email({
        email: String(fields.get('email') ?? ''),
        password: String(fields.get('password') ?? ''),
      });
      if (result.error) {
        setError(
          result.error.status === 429
            ? 'Too many attempts. Try again in a minute.'
            : 'Invalid email or password. Please try again.',
        );
      } else if (!result.data.redirect) {
        router.push('/books');
      }
    } catch {
      setError('Unable to sign in. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="lib-ticket" aria-busy={pending}>
      <div className="lib-ticket__head">
        <BrandMark className="mb-7" />
        <h1 className="lib-title !text-[2.25rem]">Book Recorder</h1>
      </div>
      <div className="lib-ticket__body">
        <div className="lib-field">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            autoComplete="username"
            autoFocus
            required
          />
        </div>
        <div className="lib-field">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p role="alert" className="lib-field-error">
            {error}
          </p>
        )}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="lib-btn--block"
          disabled={pending}
        >
          {pending ? 'Signing in…' : 'Unlock'}
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
