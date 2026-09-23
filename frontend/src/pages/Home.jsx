import { Link } from 'react-router-dom';
import Badge from '../components/ui/Badge.jsx';
import Card from '../components/ui/Card.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import { buttonStyles } from '../components/ui/Button.jsx';
import useFetch from '../hooks/useFetch.js';
import { PROJECT_STATUSES, labelFor } from '../utils/constants.js';

const PATHWAY = [
  { step: '1', title: 'Share an Idea', desc: 'Describe a real problem and your proposed solution.' },
  { step: '2', title: 'Find Your Team', desc: 'Match with students who have the skills you need.' },
  { step: '3', title: 'Build & Prototype', desc: 'Develop with mentorship and Kairos support.' },
  { step: '4', title: 'ISDT & Beyond', desc: 'Promising projects progress toward ISDT & INTACT.' },
];

function useOptionalArray(data, key = 'items') {
  if (Array.isArray(data)) return data;
  return data?.[key] ?? [];
}

export default function Home() {
  const { data: projectsData } = useFetch('/projects', { limit: 3 });
  const { data: events } = useFetch('/events', { limit: 3 });
  const { data: announcements } = useFetch('/announcements', { limit: 3 });

  const projects = useOptionalArray(projectsData)
    .slice()
    .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    .slice(0, 3);
  const upcoming = (Array.isArray(events) ? events : [])
    .filter((e) => new Date(e.startsAt) >= new Date())
    .slice(0, 3);
  const news = (Array.isArray(announcements) ? announcements : []).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" aria-labelledby="home-title">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/70 via-slate-50 to-slate-50" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-24 top-16 hidden size-64 rounded-full bg-indigo-200/30 blur-3xl sm:block sm:size-96" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 bottom-0 hidden size-72 rounded-full bg-teal-200/25 blur-3xl sm:block sm:size-96" aria-hidden="true" />
        <div className="container-page relative py-20 text-center sm:py-28">
          <Badge variant="gradient" className="animate-rise" style={{ animationDelay: '50ms' }}>
            Department of Computer Science · Integral University
          </Badge>
          <h1 id="home-title" className="mx-auto mt-6 w-full max-w-3xl animate-rise text-4xl font-extrabold leading-tight sm:text-6xl" style={{ animationDelay: '100ms' }}>
            Where student ideas become <span className="text-gradient">real projects</span>
          </h1>
          <p className="mx-auto mt-5 w-full max-w-2xl animate-rise text-lg text-slate-500" style={{ animationDelay: '150ms' }}>
            ISDT Kairos Club discovers talent, connects complementary skills, and turns promising
            ideas into working software & hardware — the bridge between students and ISDT.
          </p>
          <div className="mt-8 flex animate-rise flex-wrap justify-center gap-3" style={{ animationDelay: '200ms' }}>
            <Link to="/ideas/submit" className={buttonStyles({ size: 'lg' })}>
              Submit Your Idea
            </Link>
            <Link to="/ideas" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
              Explore Ideas
            </Link>
          </div>
          <div className="mt-6 text-sm text-slate-500">
            Students → <span className="font-semibold text-indigo-600">Kairos Club</span> → ISDT → INTACT
          </div>
        </div>
      </section>

      {/* Pathway */}
      <section className="container-page py-16">
        <SectionHeading
          eyebrow="How it works"
          title="From idea to impact in four steps"
          description="Two journeys — submit your own idea, or bring your skills to someone else's."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PATHWAY.map((p, index) => (
            <Card key={p.step} className="animate-rise" style={{ animationDelay: `${index * 70}ms` }}>
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 font-display font-extrabold text-white">
                {p.step}
              </span>
              <h3 className="mt-4 text-base font-bold">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{p.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured projects (section hidden until API returns data) */}
      {projects.length > 0 && (
        <section className="content-auto bg-white py-16 ring-1 ring-slate-200/60">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <SectionHeading align="left" eyebrow="Building now" title="Featured projects" />
              <Link to="/projects" className="shrink-0 text-sm font-semibold text-indigo-600 hover:underline">View all →</Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Card key={p.id} interactive as={Link} to={`/projects/${p.id}`}>
                  <Badge status={p.status}>{labelFor(PROJECT_STATUSES, p.status)}</Badge>
                  <h3 className="mt-3 font-bold">{p.name}</h3>
                  <p className="mt-1.5 line-clamp-3 text-sm text-slate-500">{p.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <section className="content-auto container-page py-16">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading align="left" eyebrow="Calendar" title="Upcoming events" />
            <Link to="/events" className="shrink-0 text-sm font-semibold text-indigo-600 hover:underline">All events →</Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => {
              const d = new Date(e.startsAt);
              return (
                <Card key={e.id} interactive as={Link} to={`/events/${e.slug}`} className="flex gap-4">
                  <div className="flex h-fit w-14 shrink-0 flex-col items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 py-2 text-white">
                    <span className="text-lg font-extrabold leading-none">{d.getDate().toString().padStart(2, '0')}</span>
                    <span className="text-[10px] font-bold uppercase">{d.toLocaleString('en', { month: 'short' })}</span>
                  </div>
                  <div>
                    <h3 className="font-bold">{e.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{e.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Announcements */}
      {news.length > 0 && (
        <section className="content-auto bg-white py-16 ring-1 ring-slate-200/60">
          <div className="container-page">
            <SectionHeading align="left" eyebrow="Notice board" title="Latest announcements" />
            <div className="mt-8 space-y-4">
              {news.map((n) => (
                <Card key={n.id} padded={false} className="flex items-start gap-4 p-5">
                  {n.isPinned && <Badge variant="gradient">Pinned</Badge>}
                  <div>
                    <h3 className="font-bold">{n.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{n.body}</p>
                    <p className="mt-2 text-xs text-slate-500"><time dateTime={n.createdAt}>{new Date(n.createdAt).toLocaleDateString()}</time></p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA + status */}
      <section className="content-auto container-page py-16">
        <Card tone="dark" className="text-center sm:p-10">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Have an idea worth building?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
            Submit it in five minutes. We'll review it, help you find teammates, and support you
            through development.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/ideas/submit" className={buttonStyles({ size: 'lg' })}>Submit Your Idea</Link>
            <Link to="/join" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>Join as Volunteer</Link>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Built for students, by students · Ideas become impact together.
          </p>
        </Card>
      </section>
    </div>
  );
}
