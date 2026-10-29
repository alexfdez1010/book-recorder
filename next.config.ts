import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
      { protocol: 'https', hostname: 'books.google.com' },
      { protocol: 'https', hostname: 'books.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    imageSizes: [56, 88, 112, 160, 224],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
