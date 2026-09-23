import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminPage, Table, Th } from '../../components/admin/ui.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button, { buttonStyles } from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Field from '../../components/ui/Field.jsx';
import useFetch from '../../hooks/useFetch.js';
import client from '../../api/client.js';

const EMPTY = { title: '', slug: '', description: '', venue: '', startsAt: '', endsAt: '', maxSeats: '', imageUrl: '', isPublished: false };

function toLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminEvents() {
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [registrations, setRegistrations] = useState(null);
  const [regList, setRegList] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { data: events, loading, error: fetchError, refetch } = useFetch('/admin/events');

  const set = (key) => (e) =>
    setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setShowForm(true);
  }

  function openEdit(event) {
    setEditing(event);
    setForm({
      title: event.title,
      slug: event.slug,
      description: event.description,
      venue: event.venue ?? '',
      startsAt: toLocal(event.startsAt),
      endsAt: toLocal(event.endsAt),
      maxSeats: event.maxSeats ?? '',
      imageUrl: event.imageUrl ?? '',
      isPublished: event.isPublished,
    });
    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setEditing(null);
    setShowForm(false);
  }

  const valid = form.title.trim().length >= 3 && form.description.trim().length >= 10 && form.startsAt;

  async function save() {
    if (!valid) return;
    setBusy(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        startsAt: new Date(form.startsAt).toISOString(),
        isPublished: form.isPublished,
        ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
        ...(form.venue.trim() ? { venue: form.venue.trim() } : {}),
        ...(form.endsAt ? { endsAt: new Date(form.endsAt).toISOString() } : {}),
        ...(form.maxSeats ? { maxSeats: Number(form.maxSeats) } : {}),
        ...(form.imageUrl.trim() ? { imageUrl: form.imageUrl.trim() } : {}),
      };
      const res = editing
        ? await client.patch(`/admin/events/${editing.id}`, payload)
        : await client.post('/admin/events', payload);
      setMessage(res.data.message);
      setEditing(null);
      setForm(EMPTY);
      setShowForm(false);
      refetch();
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setBusy(false);
    }
  }

  async function publish(event, isPublished) {
    setError('');
    try {
      const res = await client.post(`/admin/events/${event.id}/publish`, { isPublished });
      setMessage(res.data.message);
      refetch();
    } catch (err) {
      setError(err.userMessage);
    }
  }

  async function remove(event) {
    if (!window.confirm(`Delete "${event.title}" and all its registrations?`)) return;
    setError('');
    try {
      const res = await client.delete(`/admin/events/${event.id}`);
      setMessage(res.data.message);
      refetch();
    } catch (err) {
      setError(err.userMessage);
    }
  }

  async function viewRegistrations(event) {
    setError('');
    setMessage('');
    try {
      const res = await client.get(`/admin/events/${event.id}/registrations`);
      setRegList(res.data.data);
      setRegistrations(event);
    } catch (err) {
      setError(err.userMessage);
    }
  }

  const items = events ?? [];

  return (
    <AdminPage
      title="Events"
      description="Create workshops, publish them to the site, and manage registrations."
      actions={<Button size="sm" onClick={openCreate}>+ New event</Button>}
    >
      {message && <Alert variant="success" className="mb-4">{message}</Alert>}
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {fetchError && <Alert variant="warning" className="mb-4">{fetchError}</Alert>}

      {loading ? (
        <LoadingState label="Loading events…" />
      ) : (
        <Table
          columns={['Event', 'When', 'Status', 'Registrations', 'Actions']}
          empty={items.length === 0 ? 'No events yet — create your first one.' : null}
        >
          {items.map((event) => (
            <tr key={event.id} className="hover:bg-slate-50">
              <Th>
                <p className="font-semibold text-slate-800">{event.title}</p>
                <p className="text-xs text-slate-500">/{event.slug}{event.venue ? ` · ${event.venue}` : ''}</p>
              </Th>
              <Th className="text-xs">
                <p>{new Date(event.startsAt).toLocaleString('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                {event.endsAt && (
                  <p className="text-slate-500">– {new Date(event.endsAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</p>
                )}
              </Th>
              <Th>
                {event.isPublished ? <Badge variant="success" dot>Published</Badge> : <Badge variant="warning">Draft</Badge>}
              </Th>
              <Th>
                <button
                  type="button"
                  className="text-sm font-semibold text-indigo-600 hover:underline"
                  onClick={() => viewRegistrations(event)}
                >
                  {event._count?.registrations ?? 0} registered
                </button>
              </Th>
              <Th>
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(event)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => publish(event, !event.isPublished)}>
                    {event.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => remove(event)}>Delete</Button>
                </div>
              </Th>
            </tr>
          ))}
        </Table>
      )}

      {/* Create / edit modal */}
      <Modal
        open={showForm}
        onClose={closeForm}
        title={editing ? `Edit: ${editing.title}` : 'New event'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeForm}>Cancel</Button>
            <Button size="sm" isLoading={busy} disabled={!valid} onClick={save}>Save event</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="ev-title" required className="sm:col-span-2">
            <Input id="ev-title" value={form.title} onChange={set('title')} placeholder="React workshop for beginners" />
          </Field>
          <Field label="Slug (auto if empty)" htmlFor="ev-slug">
            <Input id="ev-slug" value={form.slug} onChange={set('slug')} placeholder="react-workshop-beginners" />
          </Field>
          <Field label="Venue" htmlFor="ev-venue">
            <Input id="ev-venue" value={form.venue} onChange={set('venue')} placeholder="CSE Lab 3" />
          </Field>
          <Field label="Starts at" htmlFor="ev-start" required>
            <Input id="ev-start" type="datetime-local" value={form.startsAt} onChange={set('startsAt')} />
          </Field>
          <Field label="Ends at (optional)" htmlFor="ev-end">
            <Input id="ev-end" type="datetime-local" value={form.endsAt} onChange={set('endsAt')} />
          </Field>
          <Field label="Max seats (optional)" htmlFor="ev-seats">
            <Input id="ev-seats" type="number" min="1" value={form.maxSeats} onChange={set('maxSeats')} placeholder="50" />
          </Field>
          <Field label="Image URL (optional)" htmlFor="ev-img">
            <Input id="ev-img" type="url" inputMode="url" autoComplete="url" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…" />
          </Field>
          <Field label="Description" htmlFor="ev-desc" required className="sm:col-span-2">
            <Textarea id="ev-desc" rows={5} value={form.description} onChange={set('description')} placeholder="What will participants learn…" />
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={set('isPublished')}
              className="size-4 rounded accent-indigo-600"
            />
            Publish immediately (visible on the site)
          </label>
        </div>
      </Modal>

      {/* Registrations modal */}
      <Modal
        open={Boolean(registrations)}
        onClose={() => setRegistrations(null)}
        title={registrations ? `Registrations: ${registrations.title}` : ''}
        size="lg"
      >
        {regList.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No registrations yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {regList.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.email}{r.phone ? ` · ${r.phone}` : ''}</p>
                </div>
                <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </AdminPage>
  );
}
