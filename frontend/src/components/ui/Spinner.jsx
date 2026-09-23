import { cn } from '../../lib/cn.js';

const SIZES = { sm: 'size-4 border-2', md: 'size-6 border-[3px]', lg: 'size-8 border-[3px]' };

export default function Spinner({ size = 'md', className, label = 'Loading', ...props }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-block animate-spin rounded-full border-slate-300 motion-reduce:animate-none', SIZES[size], className)}
      {...props}
    />
  );
}

/** Centered loading block for pages/sections. */
export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500" role="status" aria-live="polite" aria-busy="true">
      <Spinner aria-hidden="true" size="lg" className="border-indigo-200 border-t-indigo-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
