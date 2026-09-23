import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Field from '../../components/ui/Field.jsx';
import Input from '../../components/ui/Input.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Button, { buttonStyles } from '../../components/ui/Button.jsx';
import useFetch from '../../hooks/useFetch.js';
import client from '../../api/client.js';
import focusFirstError from '../../utils/focusFirstError.js';
import usePageSeo from '../../hooks/usePageSeo.js';
import EventSchema from '../../components/EventSchema.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EventDetail() {
  const { slug } = useParams();
  const { data: event, loading, error } = useFetch(`/events/${slug}`);
  usePageSeo({ title: event?.title, description: event?.description, type: 'article' });

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  function validate() {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Please enter your full name';
    if (!EMAIL_RE.test(form.email.trim())) errs.email = 'Enter a valid email address';
    setFieldErrors(errs);
    focusFirstError(errs, { name: 'r-name', email: 'r-email' });
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSuccess('');
    setSubmitError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim() };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      const res = await client.post(`/events/${event.id}/register`, payload);
      setSuccess(res.data.message);
      setForm({ name: '', email: '', phone: '' });
    } catch (err) {
      setSubmitError(err.userMessage);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="container-page py-16"><LoadingState label="Loading event…" /></div>;
  if (error || !event) {
    return (
      <div className="container-page py-16">
        <EmptyState title="Event not found" description={error}>
          <Link to="/events" className={buttonStyles({ variant: 'secondary' })}>All events</Link>
        </EmptyState>
      </div>
    );
  }

  const d = new Date(event.startsAt);
  const registered = event._count?.registrations ?? 0;
  const seatsLeft = event.maxSeats ? event.maxSeats - registered : null;
  const isPast = d < new Date();
  const isFull = seatsLeft !== null && seatsLeft <= 0;
  const registrationOpen = !isPast && !isFull;

  return (
    <>
      <EventSchema event={event} />
      <div className="container-page py-12">
      <Link to="/events" className="text-sm font-medium text-indigo-600 hover:underline">← All events</Link>

      <div className="mt-4 flex flex-wrap gap-2">
        {isPast ? <Badge variant="default">Event ended</Badge> : isFull ? <Badge variant="danger">Fully booked</Badge> : <Badge variant="success" dot>Registration open</Badge>}
        {seatsLeft !== null && (
          <Badge variant={seatsLeft > 0 ? 'warning' : 'danger'}>
            {seatsLeft > 0 ? `${seatsLeft} of ${event.maxSeats} seats left` : 'Fully booked'}
          </Badge>
        )}
        <Badge variant="default">{registered} registered</Badge>
      </div>
      <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{event.title}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="text-lg font-extrabold">About this event</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{event.description}</p>
            <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 text-sm sm:grid-cols-2">
              <p><span className="block text-xs font-bold uppercase text-slate-500">Date</span><time dateTime={event.startsAt}>{d.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</time></p>
              <p><span className="block text-xs font-bold uppercase text-slate-500">Time</span><time dateTime={event.startsAt}>{d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</time>{event.endsAt ? <> – <time dateTime={event.endsAt}>{new Date(event.endsAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</time></> : ''}</p>
              {event.venue && <p className="sm:col-span-2"><span className="block text-xs font-bold uppercase text-slate-500">Venue</span>{event.venue}</p>}
            </div>
          </Card>
        </div>

        <aside>
          <Card>
            <h2 className="text-lg font-extrabold">Register</h2>
            {success ? (
              <Alert variant="success" title="You're in!" className="mt-3">{success}</Alert>
            ) : !registrationOpen ? (
              <Alert variant={isPast ? 'default' : 'warning'} className="mt-3">
                {isPast ? 'This event has already started. Check back for future sessions.' : 'This event is fully booked. Join the next Kairos session instead.'}
              </Alert>
            ) : (
              <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
                {submitError && <Alert variant="error"> {submitError}</Alert>}
                <Field label="Full name" htmlFor="r-name" required error={fieldErrors.name}>
                  <Input id="r-name" value={form.name} invalid={!!fieldErrors.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Student" />
                </Field>
                <Field label="Email" htmlFor="r-email" required error={fieldErrors.email}>
                  <Input id="r-email" type="email" value={form.email} invalid={!!fieldErrors.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@college.edu" />
                </Field>
                <Field label="Phone (optional)" htmlFor="r-phone">
                  <Input id="r-phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 …" />
                </Field>
                <Button type="submit" isLoading={submitting} className="w-full">Confirm registration</Button>
              </form>
            )}
          </Card>
        </aside>
      </div>
      </div>
    </>
  );
}
