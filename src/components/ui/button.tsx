import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva('lib-btn', {
  variants: {
    variant: {
      default: '',
      primary: 'lib-btn--primary',
      accent: 'lib-btn--accent',
      destructive: 'lib-btn--destructive',
      ghost: 'lib-btn--ghost',
      'ghost-light': 'lib-btn--ghost-light',
      link: 'lib-btn--link',
    },
    size: {
      sm: 'lib-btn--sm',
      md: '',
      lg: 'lib-btn--lg',
      block: 'lib-btn--block',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

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
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
