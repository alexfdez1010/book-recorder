import * as React from 'react';
import { cn } from '@/lib/utils';

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft',
      className,
    )}
    {...props}
  />
));
Label.displayName = 'Label';
