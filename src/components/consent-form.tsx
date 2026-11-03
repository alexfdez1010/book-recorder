'use client';
import { useState } from 'react';
import { authClient } from '@/lib/auth/client';
import { BrandMark } from './brand-mark';
import { Button } from './ui/button';

/** Displays the verified client request; approval and denial both resume the signed OAuth flow. */
export function ConsentForm({
  name,
  clientId,
  offline,
}: {
  name: string;
  clientId: string;
  offline: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  /** Sends a consent decision; the provider validates the session, signature and registered callback. */
  async function decide(accept: boolean) {
    setPending(true);
    setError('');
    try {
      const result = await authClient.oauth2.consent({ accept });
      if (result.error)
        setError('Unable to authorize. Connect again from your MCP client.');
      else if (!result.data.redirect && result.data.url)
        window.location.assign(result.data.url);
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="lib-ticket" aria-busy={pending}>
      <BrandMark className="mb-7" />
      <h1 className="lib-title">Connect your library</h1>
      <p className="mt-5 break-words text-ink-soft">
        <strong>{name}</strong> wants to read, add, edit and delete books in
        your library
      </p>
      <p className="mt-3 break-all text-xs text-ink-mute">
        Client ID: {clientId}
      </p>
      {offline && (
        <p className="mt-4 text-sm text-ink-soft">
          Allow access when you are away, for up to 30 days
        </p>
      )}
      {error && (
        <p role="alert" className="lib-field-error mt-4">
          {error}
        </p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          onClick={() => decide(true)}
          disabled={pending}
          variant="primary"
        >
          Allow access
        </Button>
        <Button
          onClick={() => decide(false)}
          disabled={pending}
          variant="ghost"
        >
          Deny
        </Button>
      </div>
    </section>
  );
}
