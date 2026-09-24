import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminPage, StatCard, Table, Th } from '../../components/admin/ui.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { buttonStyles } from '../../components/ui/Button.jsx';
import useFetch from '../../hooks/useFetch.js';
import client from '../../api/client.js';

export default function Overview() {
  const { data: stats, loading, error } = useFetch('/admin/stats');
  const { data: pendingIdeas } = useFetch('/admin/ideas', { status: 'PENDING_REVIEW', limit: 5 });
  const { data: pendingRequests } = useFetch('/admin/requests', { status: 'PENDING', limit: 5 });

  const [resetOpen, setResetOpen] = useState(false);
  const [resetPhrase, setResetPhrase] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error) return <Alert variant="error">{error}</Alert>;

  async function wipeBoards() {
    setResetting(true);
    setResetError('');
    try {
      const res = await client.post('/admin/events/reset', {});
      const summary = Object.entries(res.data.data ?? {})
        .map(([key, count]) => `${key}: ${count}`)
        .join(', ');
      setResetMessage(`Boards wiped. ${summary}.`);
      window.location.reload();
    } catch (err) {
      setResetError(err.userMessage);
    } finally {
      setResetting(false);
    }
  }

  const s = stats ?? {};
  const ideas = s.ideas ?? {};
  const projects = s.projects ?? {};
  const users = s.users ?? {};
  const events = s.events ?? {};

  return (
    <AdminPage title="Overview" description="Everything happening across the Kairos platform right now.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={users.students ?? 0} hint={`${users.members ?? 0} members · ${users.pendingMembership ?? 0} pending`} />
        <StatCard label="Total ideas" value={ideas.total ?? 0} hint={`${ideas.approved ?? 0} approved · ${ideas.rejected ?? 0} rejected`} />
        <StatCard label="Pending review" value={ideas.pending ?? 0} tone={(ideas.pending ?? 0) > 0 ? 'amber' : 'default'} hint="Awaiting a decision" />
        <StatCard label="Team applications" value={s.requestsPending ?? 0} tone={(s.requestsPending ?? 0) > 0 ? 'amber' : 'default'} hint="Pending matches" />
        <StatCard label="Active projects" value={projects.active ?? 0} hint={`${projects.teamFormation ?? 0} still forming teams`} />
        <StatCard label="Completed projects" value={projects.completed ?? 0} />
        <StatCard label="Events" value={events.total ?? 0} hint={`${events.published ?? 0} published`} />
        <StatCard label="Unread messages" value={s.messagesUnread ?? 0} hint="From the contact form" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-extrabold">Ideas awaiting review</h2>
            <Link to="/admin/ideas" className="text-sm font-semibold text-indigo-600 hover:underline">Review all →</Link>
          </div>
          <Table
            columns={['Idea', 'Submitter', 'Status']}
            empty={(pendingIdeas?.items ?? []).length === 0 ? 'Nothing in the queue — nice work!' : null}
          >
            {(pendingIdeas?.items ?? []).map((idea) => (
              <tr key={idea.id} className="hover:bg-slate-50">
                <Th>
                  <p className="font-semibold text-slate-800">{idea.title}</p>
                  <p className="text-xs text-slate-500">{new Date(idea.createdAt).toLocaleDateString()}</p>
                </Th>
                <Th>
                  <p className="text-sm">{idea.submitter?.name}</p>
                  <p className="text-xs text-slate-500">{idea.submitter?.department}</p>
                </Th>
                <Th><Badge status={idea.status}>{idea.status.replace(/_/g, ' ')}</Badge></Th>
              </tr>
            ))}
          </Table>
        </div>

        <div>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-extrabold">Team applications</h2>
            <Link to="/admin/requests" className="text-sm font-semibold text-indigo-600 hover:underline">Manage all →</Link>
          </div>
          <Table
            columns={['Student', 'Target', 'Status']}
            empty={(pendingRequests?.items ?? []).length === 0 ? 'No pending applications.' : null}
          >
            {(pendingRequests?.items ?? []).map((request) => (
              <tr key={request.id} className="hover:bg-slate-50">
                <Th>
                  <p className="font-semibold text-slate-800">{request.applicant?.name}</p>
                  <p className="text-xs text-slate-500">{request.applicant?.department}</p>
                </Th>
                <Th className="text-sm">{request.project?.name ?? request.idea?.title ?? '—'}</Th>
                <Th><Badge status={request.status}>{request.status}</Badge></Th>
              </tr>
            ))}
          </Table>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/admin/events" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>Create an event</Link>
        <Link to="/admin/announcements" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>Post an announcement</Link>
        <Link to="/admin/projects" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>Manage projects</Link>
        <Button variant="danger" size="sm" onClick={() => { setResetOpen(true); setResetPhrase(''); setResetMessage(''); setResetError(''); }}>
          Reset demo data…
        </Button>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset demo data"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button variant="danger" size="sm" isLoading={resetting} disabled={resetPhrase.trim() !== 'RESET'} onClick={wipeBoards}>
              Wipe boards
            </Button>
          </>
        }
      >
        {resetError && <Alert variant="error" className="mb-4">{resetError}</Alert>}
        {resetMessage && <Alert variant="success" className="mb-4">{resetMessage}</Alert>}
        <p className="text-sm text-slate-600">
          This permanently deletes <strong>all ideas, projects, join requests, updates,
            events, registrations, announcements, and contact messages</strong>.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Student accounts and team profiles are kept. Type <strong>RESET</strong> to confirm.
        </p>
        <input
          type="text"
          value={resetPhrase}
          onChange={(e) => setResetPhrase(e.target.value)}
          placeholder="Type RESET"
          aria-label="Type RESET to confirm"
          className="mt-4 block w-full rounded-xl border-0 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
        />
      </Modal>
    </AdminPage>
  );
}
