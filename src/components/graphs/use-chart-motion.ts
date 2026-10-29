'use client';

import { useSyncExternalStore } from 'react';

/** Subscribes once per chart to changes in the operating system's motion setting. */
function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

/** Reads the user's motion preference; no animations run when reduced motion is set. */
function getSnapshot(): boolean {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Disables chart animation during server rendering to keep the initial HTML stable. */
function getServerSnapshot(): boolean {
  return false;
}

/** Returns whether chart motion is allowed; SSR and reduced-motion users see final data. */
export function useChartMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
