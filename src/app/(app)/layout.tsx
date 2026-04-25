import Link from 'next/link';
import { NavLink } from '@/components/nav-link';
import { LogoutButton } from '@/components/logout-button';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lib-shell">
      <header className="lib-header">
        <div className="lib-header__inner">
          <div className="lib-header__row">
            <Link href="/books" className="lib-wordmark lib-header__title">
              BOOK<span className="lib-wordmark__dot">·</span>RECORDER
            </Link>
            <LogoutButton />
          </div>
          <nav className="lib-nav" aria-label="Main">
            <NavLink href="/books">Books</NavLink>
            <NavLink href="/authors">Authors</NavLink>
            <NavLink href="/graphs">Graphs</NavLink>
          </nav>
        </div>
      </header>
      <main className="lib-main">{children}</main>
    </div>
  );
}
