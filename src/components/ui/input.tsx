'use client';

import * as React from 'react';
import { Input as HeroInput } from '@heroui/react';
import { cn } from '@/lib/utils';

/** Renders a text control with HeroUI behavior and the library theme. */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...props }, ref) => (
  <HeroInput
    ref={ref}
    type={type}
    className={cn('lib-input', className)}
    {...props}
  />
));
Input.displayName = 'Input';
