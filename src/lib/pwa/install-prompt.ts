/** Native deferred installer contract; browsers without it never create a prompt. */
export interface DeferredInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let current: DeferredInstallPrompt | null = null;
const listeners = new Set<() => void>();

/** Returns the browser's retained install event without consuming it. */
export function getInstallPrompt(): DeferredInstallPrompt | null {
  return current;
}

/** Keeps server rendering deterministic and free of browser-owned install state. */
export function getServerInstallPrompt(): null {
  return null;
}

/** Subscribes a consumer to prompt changes; the return value removes that subscription. */
export function subscribeInstallPrompt(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Retains a supported browser event across login and route changes; never mutates on SSR.
 * @param event - The browser's beforeinstallprompt event; unsupported or standalone events pass through.
 */
export function captureInstallPrompt(event: Event): void {
  if (
    typeof window === 'undefined' ||
    window.matchMedia('(display-mode: standalone)').matches ||
    !('prompt' in event) ||
    typeof event.prompt !== 'function'
  )
    return;
  event.preventDefault();
  current = event as DeferredInstallPrompt;
  listeners.forEach((listener) => listener());
}

/**
 * Clears an installed or consumed browser prompt without discarding a newer event.
 * @param expected - When supplied, only this exact consumed event may be cleared.
 */
export function clearInstallPrompt(expected?: DeferredInstallPrompt): void {
  if (typeof window === 'undefined' || (expected && current !== expected))
    return;
  current = null;
  listeners.forEach((listener) => listener());
}
