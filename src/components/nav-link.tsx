'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'px-7 py-3.5 border-[3px] border-ink border-b-0 font-mono text-[11px] uppercase tracking-[0.2em] font-bold',
        'transition-colors',
        active
          ? 'bg-ink text-paper'
          : 'bg-paper-soft text-ink hover:bg-ochre hover:text-ink',
      )}
    >
      {children}
    </Link>
  );
}
