import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { buttonStyles } from '../../components/ui/Button.jsx';
import useFetch from '../../hooks/useFetch.js';

const HINTS = {
  PENDING: 'Awaiting review by the Kairos team — matching is admin-assisted.',
  APPROVED: 'Approved — you were added to the team. Check the project page for next steps.',
  REJECTED: 'Not matched this time. You can express interest in other projects.',
};

export default function MyRequests() {
  const { data: requests, loading, error } = useFetch('/requests/mine');
  const items = requests ?? [];

  return (
    <div className="container-page py-10">
      <PageHeader
        eyebrow="My requests"
        title="Teams you asked to join"
        description="Every interest you've expressed on ideas and projects, with its review status."
      />

      <div className="mt-6 flex justify-end">
        <Link to="/projects" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>Browse projects</Link>
      </div>

      {error && <Alert variant="warning" className="mt-6">{error}</Alert>}

      {loading ? (
        <LoadingState label="Loading your requests…" />
      ) : error ? null : items.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No requests yet"
          description="Found a project that needs your skills? Express interest and the Kairos team will review the match."
          action={<Link to="/ideas" className={buttonStyles()}>Explore ideas</Link>}
        />
      ) : (
        <div className="mt-6 grid gap-5">
          {items.map((r) => {
            const target = r.project
              ? { label: r.project.name, to: `/projects/${r.project.id}`, kind: 'Project' }
              : r.idea
                ? { label: r.idea.title, to: `/ideas/${r.idea.id}`, kind: 'Idea' }
                : { label: 'Removed item', to: '/ideas', kind: '—' };

            return (
              <Card key={r.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge status={r.status}>{r.status}</Badge>
                      <Badge variant="default">{target.kind}</Badge>
                    </div>
                    <h2 className="mt-3 text-lg font-extrabold">
                      <Link to={target.to} className="hover:text-indigo-600">{target.label}</Link>
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{HINTS[r.status] ?? ''}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Requested <time dateTime={r.createdAt}>{new Date(r.createdAt).toLocaleDateString()}</time>
                      {r.reviewedBy ? ` · Reviewed by ${r.reviewedBy.name}` : ''}
                    </p>
                  </div>
                  <Link to={target.to} className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
                    View
                  </Link>
                </div>
                {r.message && (
                  <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 ring-1 ring-inset ring-slate-200">
                    “{r.message}”
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
