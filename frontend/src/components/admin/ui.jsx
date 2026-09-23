import { cn } from '../../lib/cn.js';
import { buttonStyles } from '../ui/Button.jsx';

export function AdminPage({ title, description, actions, children }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

const TONES = {
  default: 'bg-white',
  indigo: 'bg-indigo-600 text-white',
  amber: 'bg-amber-50 ring-amber-200',
  emerald: 'bg-emerald-50 ring-emerald-200',
};

export function StatCard({ label, value, tone = 'default', hint }) {
  return (
    <div className={cn('rounded-2xl p-4 shadow-card ring-1 ring-slate-200/70', TONES[tone])}>
      <p className={cn('text-xs font-bold uppercase tracking-wider', tone === 'indigo' ? 'text-indigo-100' : 'text-slate-500')}>
        {label}
      </p>
      <p className={cn('mt-2 text-2xl font-extrabold', tone === 'indigo' ? 'text-white' : 'text-slate-900')}>{value}</p>
      {hint && <p className={cn('mt-1 text-xs', tone === 'indigo' ? 'text-indigo-100' : 'text-slate-500')}>{hint}</p>}
    </div>
  );
}

export function Toolbar({ children }) {
  return <div className="admin-toolbar mb-4">{children}</div>;
}

export function Table({ columns, children, empty, colSpan }) {
  return (
    <>
      <p className="mb-2 text-xs text-slate-500 sm:hidden">Swipe horizontally to view all columns.</p>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70" role="region" aria-label="Scrollable data table" tabIndex={0}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">{columns.join(' · ')}</caption>
        <thead className="border-b border-slate-100 bg-slate-50/70">
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {empty ? (
            <tr>
              <td colSpan={colSpan ?? columns.length} className="px-4 py-10 text-center text-sm text-slate-500">
                {empty}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
      </div>
    </>
  );
}

export function Pager({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-4 flex items-center justify-center gap-4" aria-label="Pagination">
      <button type="button" aria-label="Previous page" className={buttonStyles({ variant: 'secondary', size: 'sm' })} disabled={page <= 1} onClick={() => onPage(page - 1)}>
        ← Previous
      </button>
      <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
      <button type="button" aria-label="Next page" className={buttonStyles({ variant: 'secondary', size: 'sm' })} disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        Next →
      </button>
    </nav>
  );
}

export function Th({ children, className }) {
  return <td className={cn('px-4 py-3 align-top', className)}>{children}</td>;
}
