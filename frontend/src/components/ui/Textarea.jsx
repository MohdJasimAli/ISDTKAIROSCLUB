import { forwardRef } from 'react';
import { cn } from '../../lib/cn.js';

const BASE =
  'block w-full rounded-xl border-0 bg-white px-4 py-3 text-base leading-relaxed sm:text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-500 transition focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';

const Textarea = forwardRef(function Textarea({ className, invalid = false, rows = 4, ...props }, ref) {
  return (
    <textarea
      {...props}
      ref={ref}
      rows={rows}
      aria-invalid={invalid || props['aria-invalid'] || undefined}
      className={cn(BASE, invalid && 'ring-rose-400 focus:ring-rose-500', className)}
    />
  );
});

export default Textarea;
