'use client';

import * as React from 'react';
import { Button as HeroButton } from '@heroui/react';
import { cn } from '@/lib/utils';

type ButtonVariant =
  | 'default'
  | 'primary'
  | 'accent'
  | 'destructive'
  | 'ghost'
  | 'ghost-light'
  | 'link';
type ButtonSize = 'sm' | 'md' | 'lg' | 'block';

const variantClasses: Record<ButtonVariant, string> = {
  default: '',
  primary: 'lib-btn--primary',
  accent: 'lib-btn--accent',
  destructive: 'lib-btn--destructive',
  ghost: 'lib-btn--ghost',
  'ghost-light': 'lib-btn--ghost-light',
  link: 'lib-btn--link',
};
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'lib-btn--sm',
  md: '',
  lg: 'lib-btn--lg',
  block: 'lib-btn--block',
};

export interface ButtonProps extends Omit<
  React.ComponentProps<typeof HeroButton>,
  'isDisabled' | 'size' | 'variant'
> {
  asChild?: boolean;
  disabled?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

/** Renders the library button skin on HeroUI's accessible button primitive. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      children,
      className,
      disabled,
      size = 'md',
      variant = 'primary',
      ...props
    },
    ref,
  ) => {
    const classes = cn(
      'lib-btn',
      variantClasses[variant],
      sizeClasses[size],
      className,
    );
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: cn(classes, child.props.className),
      });
    }
    return (
      <HeroButton
        ref={ref}
        className={classes}
        isDisabled={disabled}
        {...props}
      >
        {children}
      </HeroButton>
    );
  },
);
Button.displayName = 'Button';

/** Returns the semantic class names for a button variant and size. */
export function buttonVariants({
  className,
  size = 'md',
  variant = 'primary',
}: {
  className?: string;
  size?: ButtonSize | null;
  variant?: ButtonVariant | null;
} = {}): string {
  return cn(
    'lib-btn',
    variantClasses[variant ?? 'primary'],
    sizeClasses[size ?? 'md'],
    className,
  );
}
