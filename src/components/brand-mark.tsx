import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Shows the shared two-volume library mark beside an accessible brand name.
 * @param props - Optional square size and layout classes; defaults to 40px.
 * @returns A decorative image; the adjacent wordmark supplies its name.
 */
export function BrandMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/brand-mark.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={cn('shrink-0 rounded-xl', className)}
    />
  );
}
