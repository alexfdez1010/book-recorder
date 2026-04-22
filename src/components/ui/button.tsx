import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold uppercase tracking-[0.08em] select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ochre/60',
  {
    variants: {
      variant: {
        ink: 'bg-ink text-paper border-[3px] border-ink brutal-shadow brutal-press',
        paper:
          'bg-paper-soft text-ink border-[3px] border-ink brutal-shadow brutal-press',
        blood:
          'bg-blood text-paper border-[3px] border-ink brutal-shadow brutal-press',
        ghost:
          'bg-transparent text-ink border-[2px] border-transparent hover:border-ink',
        link: 'underline decoration-2 underline-offset-4 text-ink hover:text-blood p-0 h-auto tracking-normal normal-case',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-11 px-5 text-sm',
        lg: 'h-14 px-7 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'ink', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
