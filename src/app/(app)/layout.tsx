import Link from 'next/link';
import { NavLink } from '@/components/nav-link';
import { LogoutButton } from '@/components/logout-button';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/books" className="text-lg font-semibold">
            Book Recorder
          </Link>
          <nav className="flex items-center gap-2" aria-label="Main">
            <NavLink href="/books">Books</NavLink>
            <NavLink href="/graphs">Graphs</NavLink>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
