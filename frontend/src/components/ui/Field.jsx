import { cloneElement, isValidElement } from 'react';
import { cn } from '../../lib/cn.js';

/** Label + optional hint/error wrapper around a form control. */
export default function Field({ label, htmlFor, error, hint, required = false, className, children }) {
  const messageId = htmlFor ? `${htmlFor}-${error ? 'error' : 'hint'}` : undefined;
  const child = isValidElement(children)
    ? cloneElement(children, {
        'aria-invalid': error ? true : children.props['aria-invalid'],
        'aria-describedby': [children.props['aria-describedby'], error || hint ? messageId : null]
          .filter(Boolean)
          .join(' ') || undefined,
        required: required || children.props.required,
      })
    : children;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-rose-500" aria-hidden="true"> *</span>}
          {required && <span className="sr-only"> (required)</span>}
        </label>
      )}
      {child}
      {error ? (
        <p id={messageId} className="text-xs font-medium text-rose-600" role="alert" aria-live="polite">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
