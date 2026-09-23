import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import { buttonStyles } from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import Alert from '../../components/ui/Alert.jsx';
import useFetch from '../../hooks/useFetch.js';
import useDebouncedValue from '../../hooks/useDebouncedValue.js';
import { IDEA_CATEGORIES, PROJECT_STATUSES, labelFor } from '../../utils/constants.js';
import InterestButton from '../../components/InterestButton.jsx';

export default function Projects() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const { data, loading, error } = useFetch('/projects', {
    search: debouncedSearch || undefined,
    category: category || undefined,
    status: status || undefined,
    page,
    limit: 12,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / (data?.limit || 12)));

  return (
    <div>
      <PageHeader
        eyebrow="Projects"
        title="Things students are building"
        description="Approved ideas that became projects — from team formation to showcase and beyond."
      />

      <section className="container-page py-10">
        {/* Filters */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            type="search"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Search projects"
            className="sm:max-w-none"
          />
          <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} aria-label="Filter by category">
            <option value="">All categories</option>
            {IDEA_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status">
            <option value="">All statuses</option>
            {PROJECT_STATUSES.filter((s) => s.value !== 'IDEA_SUBMITTED' && s.value !== 'UNDER_REVIEW').map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </div>

        <p className="mt-4 text-sm text-slate-500" role="status" aria-live="polite" aria-busy={loading}>
          {loading ? 'Loading projects…' : `${total} project${total === 1 ? '' : 's'} found`}
        </p>

        {error && (
          <Alert variant="warning" title="Projects are offline right now" className="mt-6">
            {error}
          </Alert>
        )}

        {loading ? (
          <LoadingState label="Loading projects…" />
        ) : error ? null : items.length === 0 ? (
          <EmptyState
            className="mt-8"
            title="No projects yet"
            description="Projects appear here once an idea is approved and converted. Be the first — submit an idea."
            action={<Link to="/ideas/submit" className="text-sm font-semibold text-indigo-600 hover:underline">Submit an idea →</Link>}
          />
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <Card key={p.id} className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge status={p.status}>{labelFor(PROJECT_STATUSES, p.status)}</Badge>
                  {p.isFeatured && <Badge variant="gradient">Featured</Badge>}
                </div>
                <h2 className="mt-3 text-lg font-extrabold">
                  <Link to={`/projects/${p.id}`} className="rounded hover:text-indigo-600">{p.name}</Link>
                </h2>
                <p className="mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(p.technologies ?? []).slice(0, 4).map((t) => (
                    <span key={t} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Progress</span><span>{p.progress ?? 0}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100" role="progressbar" aria-label={`${p.name} progress`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={p.progress ?? 0}>
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600" style={{ width: `${p.progress ?? 0}%` }} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {p._count?.members ?? 0} member{(p._count?.members ?? 0) === 1 ? '' : 's'}
                  {p.lead ? ` · Lead: ${p.lead.name}` : ''}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  {p.viewerIsMember ? (
                    <Badge variant="success" dot>You&apos;re on this team</Badge>
                  ) : (
                    <span className="text-xs text-slate-500">Team formation open</span>
                  )}
                  <InterestButton idea={p} type="project" size="sm" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Project pagination">
            <button type="button" aria-label="Previous project page" className={buttonStyles({ variant: 'secondary', size: 'sm' })} disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              ← Previous
            </button>
            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
            <button type="button" aria-label="Next project page" className={buttonStyles({ variant: 'secondary', size: 'sm' })} disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
              Next →
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
