import { Link, useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import { buttonStyles } from '../../components/ui/Button.jsx';
import useFetch from '../../hooks/useFetch.js';
import { IDEA_CATEGORIES, IDEA_STAGES, SUPPORT_OPTIONS, labelFor } from '../../utils/constants.js';
import InterestButton from '../../components/InterestButton.jsx';
import usePageSeo from '../../hooks/usePageSeo.js';

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-extrabold">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}

function Chips({ items }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{t}</span>
      ))}
    </div>
  );
}

export default function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: idea, loading, error, refetch } = useFetch(`/ideas/${id}`);
  usePageSeo({ title: idea?.title, description: idea?.problemStatement });

  if (loading) return <div className="container-page py-16"><LoadingState label="Loading idea…" /></div>;
  if (error || !idea) {
    return (
      <div className="container-page py-16">
        <EmptyState title="Idea not found" description={error === 'Idea not found' ? 'It may not be approved yet, or the link is wrong.' : error}>
          <Link to="/" className={buttonStyles({ variant: 'secondary' })}>Back home</Link>
        </EmptyState>
      </div>
    );
  }

  const isOwner = idea.viewerIsOwner;

  return (
    <div className="container-page max-w-4xl py-10">
      <button type="button" onClick={() => navigate(-1)} className="text-sm font-medium text-indigo-600 hover:underline">
        ← Back
      </button>

      <div className="mt-4 flex flex-wrap gap-2">
        {isOwner && <Badge status={idea.status}>{idea.status.replace(/_/g, ' ')}</Badge>}
        <Badge variant="info">{labelFor(IDEA_CATEGORIES, idea.category)}</Badge>
        <Badge variant="default">{labelFor(IDEA_STAGES, idea.currentStage)}</Badge>
        <Badge variant="default">{idea.viewCount + 1} view(s)</Badge>
      </div>

      <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{idea.title}</h1>
      <p className="mt-2 text-sm text-slate-500">
        Idea by <span className="font-semibold text-slate-700">{idea.submitter?.name}</span>
        {idea.submitter?.department ? ` · ${idea.submitter.department}` : ''}
        {idea.submitter?.year ? ` · ${idea.submitter.year}` : ''}
        {' · '}<time dateTime={idea.createdAt}>{new Date(idea.createdAt).toLocaleDateString()}</time>
      </p>

      {isOwner && idea.status === 'CHANGES_REQUESTED' && idea.reviewerNote && (
        <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-inset ring-amber-600/20">
          <span className="font-bold">Reviewer note: </span>{idea.reviewerNote}
          <Link to={`/ideas/edit/${idea.id}`} className="ml-2 font-semibold text-amber-900 underline">Edit & resubmit →</Link>
        </div>
      )}

      <div className="mt-8 grid gap-6">
        <Card><Section title="The problem">{idea.problemStatement}</Section></Card>
        <Card><Section title="Proposed solution">{idea.proposedSolution}</Section></Card>
        <Card><Section title="Expected impact">{idea.expectedImpact}</Section></Card>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Technologies</h3>
            {(idea.techStack ?? []).length ? <Chips items={idea.techStack} /> : <p className="mt-2 text-sm text-slate-500">Not specified</p>}
            <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-slate-500">Skills required</h3>
            {(idea.requiredSkills ?? []).length ? <Chips items={idea.requiredSkills} /> : <p className="mt-2 text-sm text-slate-500">Not specified</p>}
          </Card>
          <Card>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Support needed</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(idea.supportNeeded ?? []).map((s) => <Badge key={s} variant="gradient">{s}</Badge>)}
            </div>
            <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-slate-500">Existing team</h3>
            <p className="mt-1 text-sm text-slate-600">
              {idea.hasExistingTeam ? (idea.existingTeamMembers || 'Yes — members not listed') : 'No — looking for teammates'}
            </p>
          </Card>
        </div>

        {idea.demoLink && (
          <Card>
            <a href={idea.demoLink} target="_blank" rel="noopener noreferrer" aria-label="Open idea demo or document (opens in a new tab)" className="text-sm font-semibold text-indigo-600 hover:underline">
              View demo / document ↗
            </a>
          </Card>
        )}

        {isOwner || idea.hasExistingTeam ? (
          <Card tone="dark" className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold">{isOwner ? 'Track your idea' : 'This idea has a team'}</p>
              <p className="text-sm text-slate-400">
                {isOwner ? 'Review feedback and follow progress from your dashboard.' : 'Explore another idea if you want to contribute your skills.'}
              </p>
            </div>
            <Link to={isOwner ? '/ideas/my' : '/ideas'} className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
              {isOwner ? 'My ideas' : 'Explore ideas'}
            </Link>
          </Card>
        ) : (
          <Card tone="dark" className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold">Want to work on this idea?</p>
              <p className="text-sm text-slate-400">
                Express your interest — team formation is admin-assisted, never automatic.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <InterestButton idea={idea} onSent={refetch} />
              <Link to="/dashboard" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>My dashboard</Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
