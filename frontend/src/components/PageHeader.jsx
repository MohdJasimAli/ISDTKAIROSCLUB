import { useId } from 'react';
import { cn } from '../lib/cn.js';

/** Consistent hero band for inner pages. */
export default function PageHeader({ eyebrow, title, description, className }) {
  const headingId = useId();

  return (
    <section className={cn('relative overflow-hidden border-b border-slate-200/60 bg-white', className)} aria-labelledby={headingId}>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60" aria-hidden="true" />
      <div className="container-page relative animate-rise py-12 sm:py-16">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{eyebrow}</p>
        )}
        <h1 id={headingId} className="mt-2 max-w-4xl text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-500">{description}</p>
        )}
      </div>
    </section>
  );
}
