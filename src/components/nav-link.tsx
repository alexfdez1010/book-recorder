'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Library,
  Bookmark,
  Users,
  ChartNoAxesCombined,
  Puzzle,
} from 'lucide-react';

const icons = {
  '/books': Library,
  '/to-read': Bookmark,
  '/authors': Users,
  '/graphs': ChartNoAxesCombined,
  '/skill': Puzzle,
};

/** Renders a route link with its active state and a decorative navigation icon. */
export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(`${href}/`);
  const Icon = icons[href as keyof typeof icons];
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className="lib-nav-item"
    >
      {Icon && <Icon size={18} strokeWidth={1.7} aria-hidden="true" />}
      <span>{children}</span>
      {active && <span className="lib-nav-item__dot" aria-hidden="true" />}
    </Link>
  );
}
