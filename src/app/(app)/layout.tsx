import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import { InstallAppButton } from '@/components/install-app-button';
import { NavLink } from '@/components/nav-link';
import { LogoutButton } from '@/components/logout-button';
import { ArrowUpRight } from 'lucide-react';

/** Renders the authenticated navigation shell and focusable content destination. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lib-shell">
      <a
        href="#main-content"
        className="sr-only z-50 bg-bone p-3 text-ink focus:not-sr-only focus:absolute"
      >
        Skip to content
      </a>
      <header className="lib-header">
        <div className="lib-header__inner">
          <div className="lib-header__row">
            <Link href="/books" className="lib-wordmark lib-header__title">
              <BrandMark />
              <span>
                Book
                <span className="block">Recorder</span>
              </span>
            </Link>
            <span className="lib-mobile-logout">
              <LogoutButton />
            </span>
          </div>
          <nav className="lib-nav" aria-label="Main">
            <NavLink href="/books">Books</NavLink>
            <NavLink href="/to-read">To read</NavLink>
            <NavLink href="/authors">Authors</NavLink>
            <NavLink href="/graphs">Graphs</NavLink>
            <NavLink href="/skill">Skill</NavLink>
          </nav>
          <InstallAppButton className="my-3 w-full" />
          <div className="lib-sidebar-footer">
            <div className="mb-5 border-t border-paper-edge pt-5">
              <p className="text-sm font-medium">One book at a time</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-mute">
                A little space for everything
                <br />
                you take from the page.
              </p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs text-ink-mute">
                Personal library
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="lib-main min-w-0">
        <div className="lib-workspace-bar" aria-hidden="true">
          <span>Your reading space</span>
          <span className="flex items-center gap-2">
            Keep a little of every story
            <ArrowUpRight size={13} />
          </span>
        </div>
        {children}
      </main>
    </div>
  );
}
