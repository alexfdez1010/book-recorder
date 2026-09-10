import Link from 'next/link';
import { NavLink } from '@/components/nav-link';
import { LogoutButton } from '@/components/logout-button';

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
              Book Recorder
            </Link>
            <LogoutButton />
          </div>
          <nav className="lib-nav" aria-label="Main">
            <NavLink href="/books">Books</NavLink>
            <NavLink href="/to-read">To read</NavLink>
            <NavLink href="/authors">Authors</NavLink>
            <NavLink href="/graphs">Graphs</NavLink>
            <NavLink href="/skill">Skill</NavLink>
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="lib-main min-w-0">
        {children}
      </main>
    </div>
  );
}
