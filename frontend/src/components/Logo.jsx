import { useId } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/cn.js';

/**
 * Brand logo — the same artwork as frontend/public/favicon.svg (gradient tile + K glyph).
 *
 * Using your own logo file later: drop it in frontend/public/ (e.g. logo.png) and render
 *   <Logo imageSrc="/logo.png" />  — the mark variant is used everywhere.
 */
const SIZES = {
  sm: { mark: 'size-8 rounded-lg', word: 'text-sm', sub: 'text-[9px]' },
  md: { mark: 'size-9 rounded-xl', word: 'text-base', sub: 'text-[10px]' },
  lg: { mark: 'size-12 rounded-2xl', word: 'text-lg', sub: 'text-[10px]' },
  xl: { mark: 'size-16 rounded-[20px]', word: 'text-xl', sub: 'text-xs' },
};

export function LogoMark({ size = 'md', imageSrc, className }) {
  const s = SIZES[size] ?? SIZES.md;
  // Unique gradient id per instance so Navbar + Footer + cards can coexist.
  const gradientId = `kairos-logo-${useId().replace(/:/g, '')}`;

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt="Kairos Club logo"
        width="64"
        height="64"
        className={cn(s.mark, 'shrink-0 object-cover', className)}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Kairos Club logo"
      className={cn(s.mark, 'shrink-0', className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${gradientId})`} />
      <path fill="#fff" d="M20 14h8v15.5L40.5 14H51L36.8 30.2 52 50h-9.4L28 34.2V50h-8V14Z" />
    </svg>
  );
}

export default function Logo({
  size = 'md',
  title = 'Kairos Club',
  subtitle = 'ISDT · Integral University',
  to = '/',
  tone = 'dark',
  imageSrc,
  className,
}) {
  const s = SIZES[size] ?? SIZES.md;
  const body = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} imageSrc={imageSrc} />
      {(title || subtitle) && (
        <span className="leading-tight">
          {title && (
            <span className={cn('block font-display font-extrabold', s.word, tone === 'light' ? 'text-white' : 'text-slate-900')}>
              {title}
            </span>
          )}
          {subtitle && (
            <span className={cn('block font-semibold uppercase tracking-widest', s.sub, 'text-slate-400')}>
              {subtitle}
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (!to) return body;
  return (
    <Link to={to} aria-label={`${title} — home`} className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
      {body}
    </Link>
  );
}
