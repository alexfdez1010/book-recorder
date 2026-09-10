'use client';

import * as React from 'react';
import { Chip } from '@heroui/react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'accent' | 'gilt' | 'moss' | 'solid';
const variantClasses: Record<BadgeVariant, string> = {
  default: '',
  accent: 'lib-badge--accent',
  gilt: 'lib-badge--gilt',
  moss: 'lib-badge--moss',
  solid: 'lib-badge--solid',
};

export interface BadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'color'
> {
  variant?: BadgeVariant;
}

/** Renders short metadata in HeroUI's inline Chip primitive. */
export function Badge({
  children,
  className,
  title,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <Chip
      className={cn('lib-badge max-w-full', variantClasses[variant], className)}
      title={title ?? (typeof children === 'string' ? children : undefined)}
      {...props}
    >
      <Chip.Label className="min-w-0 truncate">{children}</Chip.Label>
    </Chip>
  );
}

/** Returns the semantic class names for a badge variant. */
export function badgeVariants({
  className,
  variant = 'default',
}: {
  className?: string;
  variant?: BadgeVariant | null;
} = {}): string {
  return cn('lib-badge', variantClasses[variant ?? 'default'], className);
}
