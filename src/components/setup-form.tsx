'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';
import { BrandMark } from './brand-mark';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

/** Creates the only owner using a private setup credential from the URL fragment, which is never sent in the URL. */
export function SetupForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  /** Sends the new password directly to Better Auth; the database uniqueness constraint closes concurrent signup races. */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get('password') !== form.get('confirmPassword')) {
      setError('Passwords do not match');
      return;
    }
    const token = new URLSearchParams(window.location.hash.slice(1)).get(
      'token',
    );
    if (!token) {
      setError('Open the private setup link to create your account');
      return;
    }
    setPending(true);
    setError('');
    try {
      const result = await authClient.signUp.email(
        {
          name: 'Alejandro',
          email: String(form.get('email')),
          password: String(form.get('password')),
        },
        { headers: { 'x-book-recorder-setup-token': token } },
      );
      if (result.error)
        setError(
          'Unable to create the account. Check your email and private setup link.',
        );
      else {
        window.history.replaceState(null, '', '/setup');
        router.push('/books');
      }
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="lib-ticket" aria-busy={pending}>
      <BrandMark className="mb-7" />
      <h1 className="lib-title">Create your account</h1>
      <div className="lib-ticket__body mt-8">
        <div className="lib-field">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            autoFocus
          />
        </div>
        <div className="lib-field">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            aria-describedby="password-help"
            required
          />
          <p id="password-help" className="text-xs text-ink-mute">
            Use at least 12 characters
          </p>
        </div>
        <div className="lib-field">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
          />
        </div>
        {error && (
          <p role="alert" className="lib-field-error">
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Creating account…' : 'Create account'}
        </Button>
      </div>
    </form>
  );
}
