import * as React from 'react';
import { cn } from '@/lib/utils';

export function Stamp({
  className,
  children,
  variant = 'blood',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'blood' | 'ink' }) {
  return (
    <span
      className={cn('stamp', variant === 'ink' && 'stamp--ink', className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function Spine({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 border-[3px] border-ink bg-ink text-paper px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em]',
        className,
      )}
    >
      <span className="inline-block w-2 h-2 bg-blood" aria-hidden />
      {label}
    </div>
  );
}
