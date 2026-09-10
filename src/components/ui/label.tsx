'use client';

import * as React from 'react';
import { Label as HeroLabel } from '@heroui/react';
import { cn } from '@/lib/utils';

/** Renders an accessible HeroUI form label with the library theme. */
export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <HeroLabel ref={ref} className={cn('lib-label', className)} {...props} />
));
Label.displayName = 'Label';
