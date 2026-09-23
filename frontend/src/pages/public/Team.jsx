import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { buttonStyles } from '../../components/ui/Button.jsx';
import useFetch from '../../hooks/useFetch.js';

function initials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function Team() {
  const { data: members, loading, error } = useFetch('/team');

  return (
    <div>
      <PageHeader
        eyebrow="Our team"
        title="The people behind Kairos"
        description="A student-run core team coordinating reviews, teams, events, and mentorship — with members across departments and years."
      />

      <section className="container-page py-10">
        {error && <Alert variant="warning" title="Team roster is offline right now">{error}</Alert>}

        {loading ? (
          <LoadingState label="Loading team…" />
        ) : error ? null : (members ?? []).length === 0 ? (
          <EmptyState
            title="Roster publishes soon"
            description="The core team page is curated by admins and will appear here once published. In the meantime, explore what the club does."
            action={
              <div className="flex gap-3">
                <Link to="/how-it-works" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>How it works</Link>
                <Link to="/join" className={buttonStyles({ size: 'sm' })}>Join Kairos</Link>
              </div>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((m) => (
              <Card key={m.id} className="text-center">
                {m.imageUrl ? (
                  <img
                    src={m.imageUrl}
                    alt={`${m.name}, ${m.role}`}
                    width="80"
                    height="80"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    className="mx-auto size-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 font-display text-2xl font-extrabold text-white">
                    {initials(m.name)}
                  </span>
                )}
                <h2 className="mt-4 font-bold">{m.name}</h2>
                <p className="text-sm text-indigo-600">{m.role}</p>
                {m.department && <p className="mt-0.5 text-xs text-slate-500">{m.department}</p>}
                <div className="mt-3 flex justify-center gap-3 text-sm">
                  {m.githubUrl && <a href={m.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on GitHub (opens in a new tab)`} className="text-slate-500 hover:text-indigo-600">GitHub</a>}
                  {m.linkedinUrl && <a href={m.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn (opens in a new tab)`} className="text-slate-500 hover:text-indigo-600">LinkedIn</a>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
