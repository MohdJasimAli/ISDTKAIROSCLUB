import { useState } from 'react';
import { AdminPage, Table, Th } from '../../components/admin/ui.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Field from '../../components/ui/Field.jsx';
import useFetch from '../../hooks/useFetch.js';
import client from '../../api/client.js';

const EMPTY = { title: '', body: '', isPublished: true, isPinned: false };

export default function AdminAnnouncements() {
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const { data: items, loading, error: fetchError, refetch } = useFetch('/admin/announcements');

  const set = (key) => (e) =>
    setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const valid = form.title.trim().length >= 3 && form.body.trim().length >= 10;

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setShowForm(true);
  }

  function openEdit(ann) {
    setEditing(ann);
    setForm({ title: ann.title, body: ann.body, isPublished: ann.isPublished, isPinned: ann.isPinned });
    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setEditing(null);
    setShowForm(false);
  }

  async function save() {
    if (!valid) return;
    setBusy(true);
    setError('');
    try {
      const payload = { title: form.title.trim(), body: form.body.trim(), isPublished: form.isPublished, isPinned: form.isPinned };
      const res = editing
        ? await client.patch(`/admin/announcements/${editing.id}`, payload)
        : await client.post('/admin/announcements', payload);
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

  async function act(fn) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await fn();
      setMessage(res.data.message);
      refetch();
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setBusy(false);
    }
  }

  const list = items ?? [];

  return (
    <AdminPage
      title="Announcements"
      description="Notice-board posts — publish, pin, archive, or delete."
      actions={<Button size="sm" onClick={openCreate}>+ New announcement</Button>}
    >
      {message && <Alert variant="success" className="mb-4">{message}</Alert>}
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {fetchError && <Alert variant="warning" className="mb-4">{fetchError}</Alert>}

      {loading ? (
        <LoadingState label="Loading announcements…" />
      ) : (
        <Table
          columns={['Announcement', 'Status', 'Actions']}
          empty={list.length === 0 ? 'No announcements yet.' : null}
        >
          {list.map((ann) => (
            <tr key={ann.id} className="hover:bg-slate-50">
              <Th>
                <p className="font-semibold text-slate-800">
                  {ann.title}
                  {ann.isPinned && <Badge variant="gradient" className="ml-2">Pinned</Badge>}
                </p>
                <p className="mt-1 line-clamp-2 max-w-xl text-sm text-slate-500">{ann.body}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(ann.createdAt).toLocaleDateString()}
                  {ann.author ? ` · by ${ann.author.name}` : ''}
                </p>
              </Th>
              <Th>
                {ann.archivedAt ? <Badge variant="default">Archived</Badge>
                  : ann.isPublished ? <Badge variant="success" dot>Published</Badge>
                    : <Badge variant="warning">Draft</Badge>}
              </Th>
              <Th>
                <div className="flex max-w-[280px] flex-wrap gap-1.5">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(ann)}>Edit</Button>
                  <Button size="sm" variant="ghost" isLoading={busy} onClick={() => act(() => client.post(`/admin/announcements/${ann.id}/publish`, { isPublished: !ann.isPublished }))}>
                    {ann.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button size="sm" variant="ghost" isLoading={busy} onClick={() => act(() => client.post(`/admin/announcements/${ann.id}/archive`, { archived: !ann.archivedAt }))}>
                    {ann.archivedAt ? 'Restore' : 'Archive'}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-rose-600" isLoading={busy} onClick={() => { if (window.confirm(`Delete "${ann.title}"?`)) act(() => client.delete(`/admin/announcements/${ann.id}`)); }}>
                    Delete
                  </Button>
                </div>
              </Th>
            </tr>
          ))}
        </Table>
      )}

      <Modal
        open={showForm}
        onClose={closeForm}
        title={editing ? `Edit: ${editing.title}` : 'New announcement'}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeForm}>Cancel</Button>
            <Button size="sm" isLoading={busy} disabled={!valid} onClick={save}>Save</Button>
          </>
        }
      >
        <Field label="Title" htmlFor="an-title" required>
          <Input id="an-title" value={form.title} onChange={set('title')} placeholder="Hackathon dates announced" />
        </Field>
        <Field label="Body" htmlFor="an-body" required className="mt-4">
          <Textarea id="an-body" rows={5} value={form.body} onChange={set('body')} placeholder="Everything members need to know…" />
        </Field>
        <div className="mt-4 flex gap-6">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.isPublished} onChange={set('isPublished')} className="size-4 rounded accent-indigo-600" />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.isPinned} onChange={set('isPinned')} className="size-4 rounded accent-indigo-600" />
            Pinned to top
          </label>
        </div>
      </Modal>
    </AdminPage>
  );
}
