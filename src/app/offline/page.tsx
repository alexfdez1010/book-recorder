import { ArrowRight, WifiOff } from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';

/**
 * Provides a public static fallback with no library data and no JavaScript dependency.
 * @returns Branded recovery guidance; its native link retries the live library route.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <section className="w-full max-w-md text-center">
        <BrandMark size={64} className="mx-auto mb-8" />
        <WifiOff
          size={20}
          className="mx-auto mb-4 text-ink-mute"
          aria-hidden="true"
        />
        <h1 className="lib-title">A little pause</h1>
        <p className="mt-5 text-sm leading-relaxed text-ink-soft">
          You’re offline. Reconnect to open your library and save changes. Your
          private books stay on the server.
        </p>
        <a href="/books" className="lib-btn lib-btn--primary mt-7">
          Try again
          <ArrowRight size={16} aria-hidden="true" />
        </a>
        <p className="mt-9 text-xs text-ink-mute">Book Recorder</p>
      </section>
    </main>
  );
}
