# Progressive web app

Book Recorder can be installed from a supported browser and opens in its own standalone window. The Web App Manifest declares the app name, scope, launch route, colors and PNG icons, including a maskable icon. The same brand artwork appears in the header, installation icons and Apple touch icon.

## Install

In browsers that provide a deferred native install prompt, `InstallAppButton` displays an Install app action only after the browser offers installation. It never opens a prompt automatically. Choosing the action opens the native installer once; accepting, dismissing or failing consumes that event. An already installed standalone app does not show it. Browsers may also offer installation in their own menus.

On iPhone and iPad, open the app in Safari, use Share and choose Add to Home Screen. The custom install action is intentionally absent when the browser does not expose the native prompt event.

HTTPS is required in production. Browsers treat localhost as a secure development origin. `PwaRegistration` installs the worker only in production builds and supported secure contexts, so `bun run dev` does not add a development worker. Run a production build and server for local PWA verification.

## Offline behavior and privacy

The worker at `/sw.js` has root scope. It prepares the public `/offline` page, its same-origin build stylesheets and the fixed public brand/icon assets. Those resources are fetched without cookies. Failed or redirected offline-document responses abort installation, so an authentication redirect cannot become a cached offline document.

Document navigations always try the network. A connection failure returns the public recovery page with a native Try again link. The offline page contains no book records, opinions or authentication data and works without JavaScript. Reconnect before reading or editing the private library.

Authenticated pages, API responses, RSC requests, form submissions, image-optimization responses and private covers are never stored by this worker. Cache misses for public assets and styles also pass through without expanding the cache. Signing out cannot expose previously cached private pages because the worker has never cached them.

## Lifecycle and maintenance

The worker does not call `skipWaiting`, force a reload or interrupt a reader for an update. Browser lifecycle rules activate an updated worker after the previous controlled pages close. Activation removes only obsolete caches beginning with `book-recorder-public-`, preserves unrelated application caches and claims available pages.

Bump the worker's public cache version when changing the offline page or its public asset/style contract. A new worker installation prepares a coherent set of offline resources before activation. The worker URL is served with no-store headers, and registration uses `updateViaCache: 'none'` so browsers check the script rather than reusing a stale HTTP copy.

## Components and invocation

Mount `PwaRegistration` once in the root layout. It returns no visible UI, captures native install offers before service-worker registration and keeps registration failures from interrupting normal online use. A browser-only external store retains an offer across login and route transitions; a late shell consumer reads the retained snapshot with `useSyncExternalStore`. Finishing one installer clears only that exact event, so a newer offer survives. Confirmed installation clears the retained action. Mount `InstallAppButton` once in the authenticated shell; its optional `className` controls the wrapper's placement. For example, a shell can supply `className="mt-4"` without changing the native installer contract.

The public offline route is statically rendered with shared Tailwind classes and the shared BrandMark. Its recovery action is a plain link to `/books`, so it can retry without downloading a client bundle.

## Verification

`tests/unit/service-worker.test.ts` executes the actual worker in an isolated browser-boundary harness and checks cache allowlisting, credential-free preparation, private navigation, offline fallback, sensitive-request passthrough, cache cleanup and rejected redirects. `tests/e2e/pwa.spec.ts` checks anonymous manifest/icon access, Chrome manifest and installability diagnostics, active worker control, real offline navigation after sign out, recovery and absence of private cache keys. A separate deterministic event test raises an offer on the login page, signs in, then verifies the shell can consume it exactly once without pretending to complete a browser installation. Store unit tests cover late subscribers, cleanup, standalone/server exclusion and replacement of a pending offer.

Use the isolated pre-commit environment from `docs/design-system.md`; PWA browser checks require the production server used by that gate. Tests do not create or delete library records.

Official references: [Next.js PWA guide](https://nextjs.org/docs/app/guides/progressive-web-apps), [MDN service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers), [native install prompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event), [Chrome manifest diagnostics](https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-getAppManifest) and [Chrome installability diagnostics](https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-getInstallabilityErrors).
