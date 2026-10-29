import type { MetadataRoute } from 'next';

/** Returns the public install metadata; start navigation still requires a session. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Book Recorder',
    short_name: 'Book Recorder',
    description: 'Your private reading library',
    lang: 'en',
    start_url: '/books',
    scope: '/',
    display: 'standalone',
    background_color: '#f7f7f2',
    theme_color: '#f7f7f2',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
