import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full bg-bone border-[3px] border-ink px-3 py-2 text-sm font-mono text-ink',
        'placeholder:text-ink-mute placeholder:font-sans placeholder:normal-case',
        'focus:outline-none focus:bg-paper focus:ring-4 focus:ring-ochre/60',
        'disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full bg-bone border-[3px] border-ink px-3 py-2 text-sm font-mono text-ink appearance-none',
        'bg-[url("data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2016%2016%27%3E%3Cpath%20fill%3D%27%230b0b0b%27%20d%3D%27M4%206l4%204%204-4%27/%3E%3C/svg%3E")]',
        'bg-[length:14px_14px] bg-no-repeat bg-[right_0.75rem_center] pr-9',
        'focus:outline-none focus:bg-paper focus:ring-4 focus:ring-ochre/60',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = 'Select';
