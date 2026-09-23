import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { buttonStyles } from '../../components/ui/Button.jsx';
import useFetch from '../../hooks/useFetch.js';
import { IDEA_CATEGORIES, IDEA_STAGES, labelFor } from '../../utils/constants.js';

const STATUS_HINT = {
  PENDING_REVIEW: 'Awaiting review by the Kairos team.',
  UNDER_REVIEW: 'Being assessed for feasibility and impact.',
  APPROVED: 'Approved — visible in Explore Ideas.',
  CHANGES_REQUESTED: 'The team asked for revisions — see the note below, edit and resubmit.',
  REJECTED: 'Not moving forward this cycle. You can still submit a new idea.',
};

export default function MyIdeas() {
  const { data: ideas, loading, error } = useFetch('/ideas/mine');
  const items = ideas ?? [];

  return (
    <div className="container-page py-10">
      <PageHeader
        eyebrow="My ideas"
        title="Your submissions"
        description="Track review status, respond to feedback, and edit ideas still in the queue."
      />

      <div className="mt-6 flex justify-end">
        <Link to="/ideas/submit" className={buttonStyles({ size: 'sm' })}>+ Submit new idea</Link>
      </div>

      {error && <Alert variant="warning" className="mt-6">{error}</Alert>}

      {loading ? (
        <LoadingState label="Loading your ideas…" />
      ) : error ? null : items.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No ideas yet"
          description="Every big project starts as a single submission. Describe a problem you've noticed — the team helps with the rest."
          action={<Link to="/ideas/submit" className={buttonStyles()}>Submit your first idea</Link>}
        />
      ) : (
        <div className="mt-6 grid gap-5">
          {items.map((idea) => (
            <Card key={idea.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge status={idea.status}>{idea.status.replace(/_/g, ' ')}</Badge>
                    <Badge variant="info">{labelFor(IDEA_CATEGORIES, idea.category)}</Badge>
                    <Badge variant="default">{labelFor(IDEA_STAGES, idea.currentStage)}</Badge>
                  </div>
                  <h2 className="mt-3 text-lg font-extrabold">{idea.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{STATUS_HINT[idea.status] ?? ''}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Submitted <time dateTime={idea.createdAt}>{new Date(idea.createdAt).toLocaleDateString()}</time> · {idea.viewCount} view(s)
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link to={`/ideas/${idea.id}`} className={buttonStyles({ variant: 'secondary', size: 'sm' })}>View</Link>
                  {['PENDING_REVIEW', 'CHANGES_REQUESTED'].includes(idea.status) && (
                    <Link to={`/ideas/edit/${idea.id}`} className={buttonStyles({ variant: 'outline', size: 'sm' })}>Edit</Link>
                  )}
                </div>
              </div>

              {idea.status === 'CHANGES_REQUESTED' && idea.reviewerNote && (
                <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-inset ring-amber-600/20">
                  <span className="font-bold">Reviewer note: </span>{idea.reviewerNote}
                </div>
              )}
              {idea.status === 'REJECTED' && idea.reviewerNote && (
                <div className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-900 ring-1 ring-inset ring-rose-600/20">
                  <span className="font-bold">Feedback: </span>{idea.reviewerNote}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
