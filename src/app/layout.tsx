import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { PwaRegistration } from '@/components/pwa-registration';

const fraunces = localFont({
  src: './fonts/fraunces.ttf',
  variable: '--font-fraunces',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});
const grotesk = localFont({
  src: './fonts/geist.ttf',
  variable: '--font-grotesk',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
});
const jetbrains = localFont({
  src: './fonts/jetbrains-mono.ttf',
  preload: false,
  variable: '--font-jetbrains',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Book Recorder',
  description: 'The books you finish and the stories you keep',
  applicationName: 'Book Recorder',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Book Recorder',
    statusBarStyle: 'default',
  },
  icons: { icon: '/brand-mark.svg', apple: '/apple-touch-icon.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f7f7f2',
};

/** Provides document metadata and root-scoped font variables for the shared theme. */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${grotesk.variable} ${jetbrains.variable}`}
    >
      <body className="antialiased">
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}
