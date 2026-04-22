import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 border-[2px] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em]',
  {
    variants: {
      variant: {
        ink: 'bg-paper border-ink text-ink',
        blood: 'bg-paper border-blood text-blood',
        ochre: 'bg-paper border-ochre text-leather',
        moss: 'bg-paper border-moss text-moss',
        solid: 'bg-ink border-ink text-paper',
      },
    },
    defaultVariants: { variant: 'ink' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
