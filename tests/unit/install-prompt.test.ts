import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** Creates an isolated native event without opening a real browser installer. */
function promptEvent() {
  return Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt: vi.fn(async () => undefined),
    userChoice: Promise.resolve({
      outcome: 'dismissed' as const,
      platform: 'web',
    }),
  });
}

/** Installs only the browser API needed by the install-state boundary. */
function browser(standalone = false) {
  vi.stubGlobal('window', { matchMedia: () => ({ matches: standalone }) });
}

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());

describe('retained native install prompt', () => {
  it('retains an offer before a later consumer subscribes, as happens during login', async () => {
    browser();
    const store = await import('@/lib/pwa/install-prompt');
    const event = promptEvent();
    store.captureInstallPrompt(event);
    const listener = vi.fn();
    store.subscribeInstallPrompt(listener);
    expect(store.getInstallPrompt()).toBe(event);
    expect(event.defaultPrevented).toBe(true);
    expect(store.getServerInstallPrompt()).toBeNull();
    expect(listener).not.toHaveBeenCalled();
  });

  it('notifies subscribers and removes the subscription on cleanup', async () => {
    browser();
    const store = await import('@/lib/pwa/install-prompt');
    const listener = vi.fn();
    const unsubscribe = store.subscribeInstallPrompt(listener);
    store.captureInstallPrompt(promptEvent());
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
    store.clearInstallPrompt();
    expect(listener).toHaveBeenCalledOnce();
  });

  it('does not erase a newer offer while an older prompt finishes', async () => {
    browser();
    const store = await import('@/lib/pwa/install-prompt');
    const first = promptEvent();
    const next = promptEvent();
    store.captureInstallPrompt(first);
    store.captureInstallPrompt(next);
    store.clearInstallPrompt(first);
    expect(store.getInstallPrompt()).toBe(next);
    store.clearInstallPrompt(next);
    expect(store.getInstallPrompt()).toBeNull();
  });

  it('discards the retained offer after confirmed installation', async () => {
    browser();
    const store = await import('@/lib/pwa/install-prompt');
    store.captureInstallPrompt(promptEvent());
    store.clearInstallPrompt();
    expect(store.getInstallPrompt()).toBeNull();
  });

  it('does not intercept unsupported events or offers in standalone mode', async () => {
    browser();
    const store = await import('@/lib/pwa/install-prompt');
    const unsupported = new Event('beforeinstallprompt', { cancelable: true });
    store.captureInstallPrompt(unsupported);
    expect(unsupported.defaultPrevented).toBe(false);
    browser(true);
    const event = promptEvent();
    store.captureInstallPrompt(event);
    expect(event.defaultPrevented).toBe(false);
    expect(store.getInstallPrompt()).toBeNull();
  });

  it('never mutates browser-owned state during server rendering', async () => {
    const store = await import('@/lib/pwa/install-prompt');
    store.captureInstallPrompt(promptEvent());
    store.clearInstallPrompt();
    expect(store.getInstallPrompt()).toBeNull();
    expect(store.getServerInstallPrompt()).toBeNull();
  });
});
