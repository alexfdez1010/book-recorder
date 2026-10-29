'use client';

import { useState, useSyncExternalStore } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  clearInstallPrompt,
  getInstallPrompt,
  getServerInstallPrompt,
  subscribeInstallPrompt,
} from '@/lib/pwa/install-prompt';

/**
 * Offers the browser event retained by the root, including prompts raised during login.
 * @param className - Optional shell placement classes; unsupported browsers render nothing.
 * @returns A native install action with recoverable status; never prompts on its own.
 */
export function InstallAppButton({ className }: { className?: string }) {
  const prompt = useSyncExternalStore(
    subscribeInstallPrompt,
    getInstallPrompt,
    getServerInstallPrompt,
  );
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  /** Opens one retained prompt; clearing the consumed event preserves any newer offer. */
  async function install() {
    if (!prompt || pending) return;
    const requested = prompt;
    setPending(true);
    setMessage('');
    try {
      await requested.prompt();
      await requested.userChoice;
    } catch {
      setMessage('You can also install from your browser’s menu');
    } finally {
      clearInstallPrompt(requested);
      setPending(false);
    }
  }

  if (!prompt && !message) return null;
  return (
    <div className={className}>
      {prompt && (
        <Button
          variant="default"
          size="sm"
          onClick={install}
          disabled={pending}
        >
          <Download size={15} aria-hidden="true" />
          {pending ? 'Opening installer' : 'Install app'}
        </Button>
      )}
      {message && (
        <p role="status" className="max-w-56 text-xs text-ink-mute">
          {message}
        </p>
      )}
    </div>
  );
}
