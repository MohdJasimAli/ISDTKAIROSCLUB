import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { buttonStyles } from '../../components/ui/Button.jsx';
import useFetch from '../../hooks/useFetch.js';

function fmt(dateStr) {
  const d = new Date(dateStr);
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleString('en', { month: 'short' }),
    time: d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    full: d.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

export default function Events() {
  const { data: events, loading, error } = useFetch('/events');
  const now = new Date();
  const items = (events ?? []).map((e) => ({ ...e, past: new Date(e.startsAt) < now }));

  const upcoming = items.filter((e) => !e.past);
  const past = items.filter((e) => e.past).reverse();

  const EventCard = ({ e }) => {
    const d = fmt(e.startsAt);
    const seatsLeft = e.maxSeats ? e.maxSeats - (e._count?.registrations ?? 0) : null;
    return (
      <Card interactive as={Link} to={`/events/${e.slug}`} className="flex gap-4">
        <div className="flex h-fit w-16 shrink-0 flex-col items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 py-2 text-white">
          <span className="text-lg font-extrabold leading-none">{d.day}</span>
          <span className="text-[10px] font-bold uppercase">{d.month}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {e.past ? <Badge variant="default">Past</Badge> : <Badge variant="success" dot>Upcoming</Badge>}
            {seatsLeft !== null && (
              <Badge variant={seatsLeft > 0 ? 'warning' : 'danger'}>
                {seatsLeft > 0 ? `${seatsLeft} seats left` : 'Full'}
              </Badge>
            )}
          </div>
          <h3 className="mt-2 truncate font-bold">{e.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{e.description}</p>
          <p className="mt-2 text-xs text-slate-500">
            <time dateTime={e.startsAt}>{d.time}</time>{e.venue ? ` · ${e.venue}` : ''}
          </p>
        </div>
      </Card>
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Events"
        title="Workshops, hackathons & showcases"
        description="Everything happening at Kairos — register in one click."
      />
      <section className="container-page py-10">
        {error && <Alert variant="warning" title="Events are offline right now">{error}</Alert>}
        {loading ? (
          <LoadingState label="Loading events…" />
        ) : error ? null : items.length === 0 ? (
          <EmptyState
            title="No events published yet"
            description="Workshops, hackathons, and demo days will appear here as soon as they're announced."
          />
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <h2 className="text-lg font-extrabold">Upcoming</h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((e) => <EventCard key={e.id} e={e} />)}
                </div>
              </>
            )}
            {past.length > 0 && (
              <>
                <h2 className="mt-12 text-lg font-extrabold text-slate-500">Past events</h2>
                <div className="mt-4 grid gap-5 opacity-90 sm:grid-cols-2 lg:grid-cols-3">
                  {past.map((e) => <EventCard key={e.id} e={e} />)}
                </div>
              </>
            )}
          </>
        )}
        <div className="mt-12 rounded-2xl bg-slate-950 p-8 text-center text-white">
          <h2 className="text-xl font-extrabold">Want to host a session?</h2>
          <p className="mt-2 text-sm text-slate-400">We welcome student-led workshops and talks.</p>
          <Link to="/contact" className={`${buttonStyles({ variant: 'outline', size: 'sm', className: 'mt-4 ring-indigo-400/60 text-indigo-300 hover:bg-indigo-500/10' })}`}>
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}
