import { cn } from '../../lib/cn.js';

const VARIANTS = {
  info: 'bg-sky-50 text-sky-800 ring-sky-600/20 [&_svg]:text-sky-500',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20 [&_svg]:text-emerald-500',
  warning: 'bg-amber-50 text-amber-900 ring-amber-600/20 [&_svg]:text-amber-500',
  error: 'bg-rose-50 text-rose-800 ring-rose-600/20 [&_svg]:text-rose-500',
};

const ICONS = {
  info: 'M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z',
  success: 'M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z',
  warning: 'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008ZM12 15h.008v.008H12V15Z',
  error: 'M12 9v3.75m0 3.75h.008v.008H12v-.008ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
};

export default function Alert({ variant = 'info', title, className, children }) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={cn('flex gap-3 rounded-xl p-4 text-sm ring-1 ring-inset', VARIANTS[variant], className)}
    >
      <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d={ICONS[variant]} clipRule="evenodd" />
      </svg>
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5 opacity-90')}>{children}</div>}
      </div>
    </div>
  );
}
