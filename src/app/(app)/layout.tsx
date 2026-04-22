import Link from 'next/link';
import { NavLink } from '@/components/nav-link';
import { LogoutButton } from '@/components/logout-button';

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
    <div className="min-h-screen text-ink">
      <header className="border-b-[4px] border-ink bg-paper">
        <div className="mx-auto max-w-6xl px-8">
          <div className="flex items-end justify-between gap-6 py-10">
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-mute">
                Vol. I · No. {new Date().getFullYear()} · Est. 2026
              </p>
              <Link
                href="/books"
                className="font-serif text-5xl sm:text-6xl font-black leading-[0.85] tracking-tight"
                style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 0" }}
              >
                BOOK<span className="text-blood">·</span>RECORDER
              </Link>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-mute">
                A personal ledger of volumes finished — {today()}
              </p>
            </div>
            <LogoutButton />
          </div>
          <div className="barcode h-3 -mx-8" aria-hidden />
          <nav className="mt-8 flex items-stretch gap-0 -mb-[4px]" aria-label="Main">
            <NavLink href="/books">§ Ledger</NavLink>
            <NavLink href="/graphs">§ Metrics</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-8 py-16 sm:py-20">{children}</main>
      <footer className="mx-auto max-w-6xl px-8 pb-16">
        <div className="barcode h-3 mb-5" aria-hidden />
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-mute">
          {'//'} catalogued by hand {'//'} no algorithm reads these pages {'//'}
        </p>
      </footer>
    </div>
  );
}
