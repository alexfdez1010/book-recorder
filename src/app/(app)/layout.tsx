import Link from 'next/link';
import { NavLink } from '@/components/nav-link';
import { LogoutButton } from '@/components/logout-button';
import { Rule } from '@/components/ui/stamp';

function today(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lib-shell">
      <header className="lib-header">
        <div className="lib-header__inner">
          <div className="lib-header__row">
            <div className="flex flex-col gap-2">
              <p className="lib-header__meta">
                Vol. I · No. {new Date().getFullYear()} · Est. 2026
              </p>
              <Link
                href="/books"
                className="lib-wordmark lib-header__title"
              >
                BOOK<span className="lib-wordmark__dot">·</span>RECORDER
              </Link>
              <p className="lib-header__subtitle">
                A personal ledger of volumes finished — {today()}
              </p>
            </div>
            <LogoutButton />
          </div>
          <nav className="lib-nav" aria-label="Main">
            <NavLink href="/books">§ Ledger</NavLink>
            <NavLink href="/authors">§ Authors</NavLink>
            <NavLink href="/graphs">§ Metrics</NavLink>
          </nav>
        </div>
      </header>
      <main className="lib-main">{children}</main>
      <footer className="lib-footer">
        <Rule ornament="❦" />
        <p className="lib-meta mt-5">
          Catalogued by hand · No algorithm reads these pages
        </p>
      </footer>
    </div>
  );
}
