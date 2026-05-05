import * as React from 'react';
import { cn } from '@/lib/utils';

export function Stamp({
  className,
  variant = 'accent',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'accent' | 'ink' }) {
  return (
    <span
      className={cn(
        'lib-stamp',
        variant === 'ink' && 'lib-stamp--ink',
        className,
      )}
      {...props}
    />
  );
}

export function Rule({
  ornament = '❦',
  className,
}: {
  ornament?: string;
  className?: string;
}) {
  return (
    <div className={cn('lib-rule', className)} role="separator" aria-hidden>
      <span className="lib-rule__ornament">{ornament}</span>
    </div>
  );
}
