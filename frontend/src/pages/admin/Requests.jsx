import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminPage, Toolbar, Table, Th, Pager } from '../../components/admin/ui.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button, { buttonStyles } from '../../components/ui/Button.jsx';
import Select from '../../components/ui/Select.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import useFetch from '../../hooks/useFetch.js';
import client from '../../api/client.js';

export default function AdminRequests() {
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const { data, loading, error: fetchError, refetch } = useFetch('/admin/requests', {
    status: status || undefined,
    page,
    limit: 20,
  });

  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit ?? 20)));

  async function review(id, action) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await client.post(`/requests/${id}/review`, { action });
      setMessage(res.data.message);
      refetch();
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminPage title="Team applications" description="Review “I'm Interested” requests — approving adds the student to the team right away.">
      <Toolbar>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </Select>
      </Toolbar>

      {message && <Alert variant="success" className="mb-4">{message}</Alert>}
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {fetchError && <Alert variant="warning" className="mb-4">{fetchError}</Alert>}

      {loading ? (
        <LoadingState label="Loading applications…" />
      ) : (
        <>
          <Table
            columns={['Student', 'Wants to join', 'Message', 'Status', 'Actions']}
            empty={items.length === 0 ? 'No applications match.' : null}
          >
            {items.map((r) => {
              const target = r.project
                ? { label: r.project.name, to: `/projects/${r.project.id}` }
                : r.idea
                  ? { label: r.idea.title, to: `/ideas/${r.idea.id}` }
                  : { label: 'Removed', to: '/admin/requests' };
              return (
                <tr key={r.id} className="hover:bg-slate-50">
                  <Th>
                    <p className="font-semibold text-slate-800">{r.applicant?.name}</p>
                    <p className="text-xs text-slate-500">{r.applicant?.email}</p>
                    <p className="text-xs text-slate-500">
                      {r.applicant?.department} · {r.applicant?.year}
                    </p>
                    {(r.applicant?.skills ?? []).length > 0 && (
                      <p className="mt-1 max-w-[200px] text-xs text-slate-500">
                        Skills: {r.applicant.skills.join(', ')}
                      </p>
                    )}
                  </Th>
                  <Th>
                    <Link to={target.to} className="text-sm font-semibold text-indigo-600 hover:underline">
                      {target.label}
                    </Link>
                    <p className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                    {r.reviewedBy && <p className="text-xs text-slate-500">Reviewed by {r.reviewedBy.name}</p>}
                  </Th>
                  <Th className="max-w-[260px] whitespace-pre-wrap text-xs text-slate-600">{r.message}</Th>
                  <Th><Badge status={r.status}>{r.status}</Badge></Th>
                  <Th>
                    {r.status === 'PENDING' ? (
                      <div className="flex flex-wrap gap-1.5">
                        <Button size="sm" isLoading={busy} aria-label={`Approve ${r.applicant?.name || 'this student'} for ${target.label}`} onClick={() => review(r.id, 'APPROVE')}>
                          Approve + add
                        </Button>
                        <Button size="sm" variant="danger" isLoading={busy} aria-label={`Reject ${r.applicant?.name || 'this student'} for ${target.label}`} onClick={() => review(r.id, 'REJECT')}>
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Decided</span>
                    )}
                  </Th>
                </tr>
              );
            })}
          </Table>
          <Pager page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </AdminPage>
  );
}
