import { cn } from '../../lib/cn.js';
import { STATUS_BADGES } from '../../utils/constants.js';

const BASE =
  'inline-flex min-w-0 max-w-full items-center gap-1.5 whitespace-normal rounded-full px-2.5 py-1 text-center text-xs font-semibold leading-tight ring-1 ring-inset';

const VARIANTS = {
  default: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  gradient: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white ring-transparent',
};

/** Pass a known backend `status` (PENDING_REVIEW, DEVELOPMENT, …) for its themed color,
 *  or pick a manual `variant`. */
export default function Badge({ status, variant = 'default', dot = false, className, children }) {
  return (
    <span className={cn(BASE, status ? STATUS_BADGES[status] ?? VARIANTS.default : VARIANTS[variant], className)}>
      {dot && <span className="size-1.5 shrink-0 rounded-full bg-current opacity-70" />}
      <span className="min-w-0 break-words">{children}</span>
    </span>
  );
}
