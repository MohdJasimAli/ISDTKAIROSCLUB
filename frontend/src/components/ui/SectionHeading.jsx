import { cn } from '../../lib/cn.js';

export default function SectionHeading({ eyebrow, title, description, align = 'center', className }) {
  return (
    <div className={cn('max-w-2xl animate-rise', align === 'center' ? 'mx-auto text-center' : 'text-left', className)}>
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{eyebrow}</p>
      )}
      <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base leading-relaxed text-slate-500">{description}</p>}
    </div>
  );
}
