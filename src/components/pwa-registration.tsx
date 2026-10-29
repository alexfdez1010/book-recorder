'use client';

import { useEffect } from 'react';
import {
  captureInstallPrompt,
  clearInstallPrompt,
} from '@/lib/pwa/install-prompt';

/**
 * Retains native install events from the root, including before authentication.
 * Registers offline support only in secure production; failures preserve online use.
 */
export function PwaRegistration() {
  useEffect(() => {
    /** Discards a retained install action when the browser confirms installation. */
    function installed() {
      clearInstallPrompt();
    }
    window.addEventListener('beforeinstallprompt', captureInstallPrompt);
    window.addEventListener('appinstalled', installed);
    if (
      process.env.NODE_ENV === 'production' &&
      window.isSecureContext &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })
        .catch((error: unknown) => {
          console.warn('Public offline support could not be enabled', error);
        });
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', captureInstallPrompt);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);
  return null;
}
