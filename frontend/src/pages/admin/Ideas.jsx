import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminPage, Toolbar, Table, Th, Pager } from '../../components/admin/ui.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button, { buttonStyles } from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Field from '../../components/ui/Field.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import useFetch from '../../hooks/useFetch.js';
import useDebouncedValue from '../../hooks/useDebouncedValue.js';
import client from '../../api/client.js';
import { IDEA_STATUSES, IDEA_CATEGORIES, labelFor } from '../../utils/constants.js';

const ACTIONS = [
  { value: 'APPROVE', label: 'Approve — publish to Explore Ideas' },
  { value: 'REQUEST_CHANGES', label: 'Request changes (note required)' },
  { value: 'REJECT', label: 'Reject' },
];

export default function AdminIdeas() {
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [review, setReview] = useState(null);
  const [reviewAction, setReviewAction] = useState('APPROVE');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const debouncedSearch = useDebouncedValue(filters.search);

  const { data, loading, error: fetchError, refetch } = useFetch('/admin/ideas', {
    status: filters.status || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: 20,
  });

  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit ?? 20)));
  const noteRequired = reviewAction === 'REQUEST_CHANGES' && note.trim().length < 5;

  async function submitReview() {
    setBusy(true);
    setError('');
    try {
      const res = await client.post(`/ideas/${review.id}/review`, {
        action: reviewAction,
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      setMessage(res.data.message);
      setReview(null);
      setNote('');
      setReviewAction('APPROVE');
      refetch();
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setBusy(false);
    }
  }

  async function convert(idea) {
    if (!window.confirm(`Convert "${idea.title}" into a project?`)) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await client.post(`/projects/from-idea/${idea.id}`, {});
      setMessage(res.data.message);
      refetch();
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminPage title="Ideas" description="Review submissions, request changes, approve, or convert to projects.">
      <Toolbar>
        <Input
          type="search"
          placeholder="Search title or problem…"
          value={filters.search}
          onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
          className="sm:max-w-xs"
          aria-label="Search ideas"
        />
        <Select
          value={filters.status}
          onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {IDEA_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
      </Toolbar>

      {message && <Alert variant="success" className="mb-4">{message}</Alert>}
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {fetchError && <Alert variant="warning" className="mb-4">{fetchError}</Alert>}

      {loading ? (
        <LoadingState label="Loading ideas…" />
      ) : (
        <>
          <Table
            columns={['Idea', 'Submitter', 'Category', 'Status', 'Actions']}
            empty={items.length === 0 ? 'No ideas match these filters.' : null}
          >
            {items.map((idea) => (
              <tr key={idea.id} className="hover:bg-slate-50">
                <Th>
                  <Link to={`/ideas/${idea.id}`} className="font-semibold text-slate-800 hover:text-indigo-600">
                    {idea.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {new Date(idea.createdAt).toLocaleDateString()} · {idea.viewCount} views
                  </p>
                  {idea.reviewerNote && <p className="mt-1 text-xs text-amber-700">Note: {idea.reviewerNote}</p>}
                </Th>
                <Th>
                  <p className="text-sm">{idea.submitter?.name}</p>
                  <p className="text-xs text-slate-500">{idea.submitter?.department} · {idea.submitter?.year}</p>
                </Th>
                <Th className="text-xs">{labelFor(IDEA_CATEGORIES, idea.category)}</Th>
                <Th><Badge status={idea.status}>{idea.status.replace(/_/g, ' ')}</Badge></Th>
                <Th>
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => { setReview(idea); setError(''); }}>Review</Button>
                    <Link to={`/ideas/edit/${idea.id}`} className={buttonStyles({ variant: 'ghost', size: 'sm' })}>Edit</Link>
                    {idea.status === 'APPROVED' && !idea.projectId && (
                      <Button size="sm" isLoading={busy} onClick={() => convert(idea)}>Convert → project</Button>
                    )}
                    {idea.projectId && (
                      <Link to={`/projects/${idea.projectId}`} className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
                        Project ↗
                      </Link>
                    )}
                  </div>
                </Th>
              </tr>
            ))}
          </Table>
          <Pager page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}

      <Modal
        open={Boolean(review)}
        onClose={() => setReview(null)}
        title={review ? `Review: ${review.title}` : ''}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setReview(null)}>Cancel</Button>
            <Button size="sm" isLoading={busy} disabled={noteRequired} onClick={submitReview}>
              Submit decision
            </Button>
          </>
        }
      >
        <Field label="Decision" htmlFor="rv-action">
          <Select id="rv-action" value={reviewAction} onChange={(e) => setReviewAction(e.target.value)}>
            {ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </Select>
        </Field>
        <Field
          label="Note (shown to the student)"
          htmlFor="rv-note"
          className="mt-4"
          error={noteRequired ? 'A note of at least 5 characters is required' : undefined}
          hint="Students see this on their idea and dashboard."
        >
          <Textarea
            id="rv-note"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a wireframe link and clarify the target users…"
          />
        </Field>
      </Modal>
    </AdminPage>
  );
}
