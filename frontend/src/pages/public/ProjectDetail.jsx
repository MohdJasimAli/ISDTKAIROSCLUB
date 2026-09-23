import { Link, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { buttonStyles } from '../../components/ui/Button.jsx';
import useFetch from '../../hooks/useFetch.js';
import { PROJECT_STATUSES, IDEA_CATEGORIES, labelFor } from '../../utils/constants.js';
import InterestButton from '../../components/InterestButton.jsx';
import usePageSeo from '../../hooks/usePageSeo.js';
import ProjectSchema from '../../components/ProjectSchema.jsx';

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-extrabold">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { data: p, loading, error } = useFetch(`/projects/${id}`);
  usePageSeo({ title: p?.name, description: p?.description });

  if (loading) return <div className="container-page py-16"><LoadingState label="Loading project…" /></div>;
  if (error || !p) {
    return (
      <div className="container-page py-16">
        <EmptyState title={error === 'Project not found' ? 'Project not found' : 'Could not load project'} description={error}>
          <Link to="/projects" className={buttonStyles({ variant: 'secondary' })}>Back to projects</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      <ProjectSchema project={p} />
      <div className="container-page py-12">
      <Link to="/projects" className="text-sm font-medium text-indigo-600 hover:underline">← All projects</Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge status={p.status}>{labelFor(PROJECT_STATUSES, p.status)}</Badge>
        <Badge variant="info">{labelFor(IDEA_CATEGORIES, p.category)}</Badge>
        {p.isFeatured && <Badge variant="gradient">Featured</Badge>}
      </div>
      <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{p.name}</h1>
      <p className="mt-2 text-slate-500">
        {p.lead ? `Lead: ${p.lead.name} · ` : ''}{p._count?.members ?? p.members?.length ?? 0} member(s)
        {p.sourceIdea ? ` · from idea “${p.sourceIdea.title}”` : ''}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card><Section title="About this project">{p.description}</Section></Card>
          <Card><Section title="The problem">{p.problem}</Section></Card>
          <Card><Section title="Our solution">{p.solution}</Section></Card>

          {p.updates?.length > 0 && (
            <Card>
              <h2 className="text-lg font-extrabold">Updates</h2>
              <ol className="mt-4 space-y-5 border-l-2 border-indigo-100 pl-5">
                {p.updates.map((u) => (
                  <li key={u.id} className="relative">
                    <span className="absolute -left-[27px] top-1.5 size-3 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600" />
                    <p className="text-xs text-slate-500">
                      <time dateTime={u.createdAt}>{new Date(u.createdAt).toLocaleDateString()}</time> {u.author ? `· ${u.author.name}` : ''}
                    </p>
                    <p className="mt-0.5 text-sm font-bold">{u.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{u.body}</p>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Progress</h3>
            <div className="mt-3 h-2 rounded-full bg-slate-100" role="progressbar" aria-label={`${p.name} progress`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={p.progress ?? 0}>
              <div className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600" style={{ width: `${p.progress ?? 0}%` }} />
            </div>
            <p className="mt-1.5 text-sm text-slate-500">{p.progress ?? 0}% complete</p>

            <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-slate-500">Technologies</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(p.technologies ?? []).map((t) => (
                <span key={t} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{t}</span>
              ))}
            </div>

            <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-slate-500">Team</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              {(p.members ?? []).map((m) => (
                <li key={m.id} className="flex items-center justify-between">
                  <span>{m.user?.name}</span>
                  {m.role === 'LEAD' && <Badge variant="gradient">Lead</Badge>}
                </li>
              ))}
              {(p.members ?? []).length === 0 && <li className="text-slate-500">No members yet — team formation open.</li>}
            </ul>

            <div className="mt-6 flex flex-col gap-2">
              {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="Open project GitHub repository (opens in a new tab)" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>GitHub ↗</a>}
              {p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" aria-label="Open live project demo (opens in a new tab)" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>Live demo ↗</a>}
            </div>
          </Card>

          <Card tone="indigo">
            <p className="text-sm font-bold">Want to join this team?</p>
            {p.viewerIsMember ? (
              <>
                <p className="mt-1 text-xs text-slate-500">You&apos;re part of this project team.</p>
                <Badge variant="success" dot className="mt-3">On this team</Badge>
              </>
            ) : (
              <>
                <p className="mt-1 text-xs text-slate-500">
                  Express interest and the Kairos team will review your fit — team formation is
                  admin-assisted, never automatic.
                </p>
                <div className="mt-3">
                  <InterestButton idea={p} type="project" size="sm" />
                </div>
              </>
            )}
            {p.viewerIsLead && (
              <Badge variant="gradient" className="mt-3">You lead this project</Badge>
            )}
          </Card>
        </aside>
      </div>
      </div>
    </>
  );
}
