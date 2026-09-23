import { cn } from '../../lib/cn.js';

// Background tones are mutually exclusive on purpose: if a caller passes its own
// `bg-*` class, Tailwind resolves the conflict by *stylesheet* order rather than
// class order — a dark card can silently render white. Use `tone` instead.
const TONES = {
  light: 'bg-white ring-slate-200/70',
  dark: 'bg-slate-950 text-white ring-slate-800/60',
  indigo: 'bg-indigo-50/70 ring-indigo-200',
};

export default function Card({
  as: Tag = 'div',
  interactive = false,
  padded = true,
  tone = 'light',
  className,
  children,
  ...props
}) {
  const isActionable = Tag === 'a' || Tag === 'button' || typeof Tag === 'function';

  return (
    <Tag
      className={cn(
        'rounded-2xl shadow-card ring-1 transition duration-200',
        TONES[tone] ?? TONES.light,
        padded && 'p-6',
        interactive && 'card-hover focus-within:ring-2 focus-within:ring-indigo-500 motion-reduce:transform-none',
        interactive && isActionable && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
