import { forwardRef } from 'react';
import { cn } from '../../lib/cn.js';
import Spinner from './Spinner.jsx';

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500',
  secondary:
    'bg-white text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50',
  outline:
    'text-indigo-600 ring-1 ring-inset ring-indigo-600/60 hover:bg-indigo-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
};

const SIZES = {
  sm: 'min-h-10 px-3.5 text-sm',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-12 px-6 text-base',
};

export function buttonStyles({ variant = 'primary', size = 'md', className } = {}) {
  return cn(
    'inline-flex touch-manipulation items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 motion-safe:active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 motion-safe:transition-transform',
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', isLoading = false, className, children, type = 'button', disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonStyles({ variant, size, className })}
      disabled={isLoading || disabled}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && (
        <span aria-hidden="true">
          <Spinner size="sm" className="border-current/30 border-t-transparent" />
        </span>
      )}
      {children}
    </button>
  );
});

export default Button;
