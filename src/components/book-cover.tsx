import Image from 'next/image';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md';

type BookCoverProps = {
  title: string;
  author: string;
  coverUrl?: string | null;
  size?: Size;
  className?: string;
  priority?: boolean;
};

const COVER_SIZES = {
  sm: '56px',
  md: '(min-width: 640px) 112px, 88px',
} as const;

function blurDataURL(a: string, b: string, angle: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 12'><defs><linearGradient id='g' gradientTransform='rotate(${angle})'><stop offset='0%' stop-color='${a}'/><stop offset='100%' stop-color='${b}'/></linearGradient></defs><rect width='8' height='12' fill='url(%23g)'/></svg>`;
  return `data:image/svg+xml;utf8,${svg.replace(/#/g, '%23').replace(/"/g, "'")}`;
}

function hashString(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function paletteFor(title: string, author: string) {
  const seed = hashString(`${title.trim().toLowerCase()}::${author.trim().toLowerCase()}`);
  const hue = seed % 360;
  const sat = 38 + ((seed >>> 9) % 18);
  const light = 22 + ((seed >>> 17) % 11);
  const hueShift = 12 + ((seed >>> 23) % 16);
  const angle = 120 + ((seed >>> 5) % 60);
  const hue2 = (hue + hueShift) % 360;
  return {
    a: `hsl(${hue} ${sat}% ${light}%)`,
    b: `hsl(${hue2} ${Math.max(sat - 8, 28)}% ${light + 10}%)`,
    accent: `hsl(${hue} ${Math.min(sat + 22, 72)}% ${Math.min(light + 34, 62)}%)`,
    angle,
  };
}

function initialsFrom(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '·';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function BookCover({
  title,
  author,
  coverUrl,
  size = 'md',
  className,
  priority = false,
}: BookCoverProps) {
  const frame = cn('lib-cover', size === 'sm' && 'lib-cover--sm', className);
  const { a, b, accent, angle } = paletteFor(title, author);

  if (coverUrl) {
    return (
      <div className={frame}>
        <Image
          src={coverUrl}
          alt={`${title} cover`}
          fill
          sizes={COVER_SIZES[size]}
          className="object-cover"
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          placeholder="blur"
          blurDataURL={blurDataURL(a, b, angle)}
        />
      </div>
    );
  }

  const isSmall = size === 'sm';

  return (
    <div
      className={cn(frame, 'lib-cover--gen')}
      style={
        {
          '--gen-a': a,
          '--gen-b': b,
          '--gen-accent': accent,
          '--gen-angle': `${angle}deg`,
        } as React.CSSProperties
      }
      role="img"
      aria-label={`${title} by ${author}`}
    >
      <div className="lib-cover__gen-grain" aria-hidden />
      {isSmall ? (
        <div className="lib-cover__gen-initials">{initialsFrom(title)}</div>
      ) : (
        <div className="lib-cover__gen-plate">
          <span className="lib-cover__gen-mark">{initialsFrom(author)}</span>
          <span className="lib-cover__gen-rule" aria-hidden />
          <span className="lib-cover__gen-title" title={title}>
            {title}
          </span>
          <span className="lib-cover__gen-rule lib-cover__gen-rule--thin" aria-hidden />
          <span className="lib-cover__gen-author" title={author}>
            {author}
          </span>
        </div>
      )}
    </div>
  );
}
