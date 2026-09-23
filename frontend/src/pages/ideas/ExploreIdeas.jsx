import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { buttonStyles } from '../../components/ui/Button.jsx';
import InterestButton from '../../components/InterestButton.jsx';
import useFetch from '../../hooks/useFetch.js';
import useDebouncedValue from '../../hooks/useDebouncedValue.js';
import { IDEA_CATEGORIES, IDEA_STAGES, labelFor } from '../../utils/constants.js';

const initialFilters = { search: '', category: '', stage: '', tech: '' };

export default function ExploreIdeas() {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(filters.search);

  const setFilter = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
    setPage(1);
  };

  const { data, loading, error, refetch } = useFetch('/ideas', {
    search: debouncedSearch || undefined,
    category: filters.category || undefined,
    currentStage: filters.stage || undefined,
    tech: filters.tech || undefined,
    page,
    limit: 12,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / (data?.limit || 12)));

  return (
    <div>
      <PageHeader
        eyebrow="Explore ideas"
        title="Find something worth building"
        description="Approved ideas from fellow students looking for teammates. Bring your skills — or your own idea."
      />

      <section className="container-page py-10">
        {/* Filters — search, category, development stage, technology */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            type="search"
            placeholder="Search ideas…"
            aria-label="Search ideas"
            value={filters.search}
            onChange={setFilter('search')}
          />
          <Select aria-label="Filter by category" value={filters.category} onChange={setFilter('category')}>
            <option value="">All categories</option>
            {IDEA_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          <Select aria-label="Filter by development stage" value={filters.stage} onChange={setFilter('stage')}>
            <option value="">All stages</option>
            {IDEA_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
          <Input
            placeholder="Technology (e.g. React)"
            aria-label="Filter by technology"
            value={filters.tech}
            onChange={setFilter('tech')}
          />
        </div>

        <p className="mt-4 text-sm text-slate-500" role="status" aria-live="polite" aria-busy={loading}>
          {loading ? 'Searching…' : `${total} idea${total === 1 ? '' : 's'} found`}
        </p>

        {error && <Alert variant="warning" className="mt-4">{error}</Alert>}

        {loading ? (
          <LoadingState label="Loading ideas…" />
        ) : !error && items.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="No ideas match your filters"
            description="Try clearing filters — or be the first to share an idea of your own."
            action={
              <div className="flex gap-3">
                <button
                  type="button"
                  className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                  onClick={() => { setFilters(initialFilters); setPage(1); }}
                >
                  Clear filters
                </button>
                <Link to="/ideas/submit" className={buttonStyles({ size: 'sm' })}>Submit an idea</Link>
              </div>
            }
          />
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((idea) => (
              <Card key={idea.id} className="flex flex-col">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="info">{labelFor(IDEA_CATEGORIES, idea.category)}</Badge>
                  <Badge variant="default">{labelFor(IDEA_STAGES, idea.currentStage)}</Badge>
                  {idea.hasExistingTeam ? (
                    <Badge variant="warning">Team formed</Badge>
                  ) : (
                    <Badge variant="success" dot>Team open</Badge>
                  )}
                </div>

                <h2 className="mt-3 text-lg font-extrabold">
                  <Link to={`/ideas/${idea.id}`} className="hover:text-indigo-600">{idea.title}</Link>
                </h2>
                <p className="mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500">
                  {idea.problemStatement}
                </p>

                {(idea.requiredSkills ?? []).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {idea.requiredSkills.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {s}
                      </span>
                    ))}
                    {idea.requiredSkills.length > 4 && (
                      <span className="text-xs text-slate-500">+{idea.requiredSkills.length - 4} more</span>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-500">
                    {new Date(idea.createdAt).toLocaleDateString()} · {idea.viewCount} views
                  </span>
                  <div className="flex items-center gap-2">
                    <Link to={`/ideas/${idea.id}`} className="text-xs font-semibold text-indigo-600 hover:underline">
                      View details →
                    </Link>
                    <InterestButton idea={idea} size="sm" onSent={refetch} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Idea pagination">
            <button
              type="button"
              aria-label="Previous idea page"
              className={buttonStyles({ variant: 'secondary', size: 'sm' })}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </button>
            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
            <button
              type="button"
              aria-label="Next idea page"
              className={buttonStyles({ variant: 'secondary', size: 'sm' })}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
