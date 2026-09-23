import { forwardRef } from 'react';
import { cn } from '../../lib/cn.js';

const BASE =
  'block min-h-11 w-full rounded-xl border-0 bg-white px-4 text-base text-slate-900 sm:text-sm shadow-sm ring-1 ring-inset ring-slate-300 transition focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';

const Select = forwardRef(function Select({ className, invalid = false, children, ...props }, ref) {
  return (
    <select
      {...props}
      ref={ref}
      aria-invalid={invalid || props['aria-invalid'] || undefined}
      className={cn(BASE, 'pr-8', invalid && 'ring-rose-400 focus:ring-rose-500', className)}
    >
      {children}
    </select>
  );
});

export default Select;
