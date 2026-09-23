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
import { PROJECT_STATUSES, PROJECT_STATUS_TRANSITIONS, IDEA_CATEGORIES, labelFor } from '../../utils/constants.js';

export default function AdminProjects() {
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [team, setTeam] = useState(null);       // project being managed
  const [inviteEmail, setInviteEmail] = useState('');
  const [updates, setUpdates] = useState(null); // project receiving an update
  const [updateForm, setUpdateForm] = useState({ title: '', body: '' });
  const debouncedSearch = useDebouncedValue(filters.search);

  const { data, loading, error: fetchError, refetch } = useFetch('/admin/projects', {
    status: filters.status || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: 20,
  });

  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit ?? 20)));

  async function act(fn, okMessage) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await fn();
      setMessage(okMessage ?? res?.data?.message ?? 'Done');
      refetch();
      return true;
    } catch (err) {
      setError(err.userMessage);
      return false;
    } finally {
      setBusy(false);
    }
  }

  const advanceStatus = (project, next) =>
    act(() => client.post(`/projects/${project.id}/status`, { status: next }));

  const addMember = () =>
    act(async () => {
      const res = await client.post(`/projects/${team.id}/members`, { email: inviteEmail.trim() });
      setInviteEmail('');
      return res;
    });

  const setMemberRole = (project, userId, role) =>
    act(() => client.patch(`/projects/${project.id}/members/${userId}/role`, { role }));

  const removeMember = (project, userId) =>
    act(() => client.delete(`/projects/${project.id}/members/${userId}`));

  const postUpdate = () =>
    act(async () => {
      const res = await client.post(`/projects/${updates.id}/updates`, updateForm);
      setUpdateForm({ title: '', body: '' });
      setUpdates(null);
      return res;
    });

  const toggleFeatured = (project) =>
    act(() => client.patch(`/projects/${project.id}`, { isFeatured: !project.isFeatured }));

  return (
    <AdminPage
      title="Projects"
      description="Move projects through the pipeline, manage teams, and post progress updates."
      actions={<Link to="/admin/ideas" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>Convert an idea →</Link>}
    >
      <Toolbar>
        <Input
          type="search"
          placeholder="Search projects…"
          value={filters.search}
          onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
          className="sm:max-w-xs"
          aria-label="Search projects"
        />
        <Select
          value={filters.status}
          onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {PROJECT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
      </Toolbar>

      {message && <Alert variant="success" className="mb-4">{message}</Alert>}
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {fetchError && <Alert variant="warning" className="mb-4">{fetchError}</Alert>}

      {loading ? (
        <LoadingState label="Loading projects…" />
      ) : (
        <>
          <Table
            columns={['Project', 'Lead', 'Team', 'Status', 'Actions']}
            empty={items.length === 0 ? 'No projects yet — convert an approved idea to create one.' : null}
          >
            {items.map((project) => {
              const next = PROJECT_STATUS_TRANSITIONS[project.status] ?? [];
              return (
                <tr key={project.id} className="hover:bg-slate-50">
                  <Th>
                    <Link to={`/projects/${project.id}`} className="font-semibold text-slate-800 hover:text-indigo-600">
                      {project.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {labelFor(IDEA_CATEGORIES, project.category)} · {project.progress}%
                      {project.sourceIdea ? ` · from “${project.sourceIdea.title}”` : ''}
                    </p>
                  </Th>
                  <Th>
                    <p className="text-sm">{project.lead?.name ?? 'No lead'}</p>
                    <p className="text-xs text-slate-500">{project.lead?.email}</p>
                  </Th>
                  <Th>
                    <p className="text-sm">{project._count?.members ?? 0} member(s)</p>
                    <p className="text-xs text-slate-500">
                      {project._count?.updates ?? 0} updates · {project._count?.joinRequests ?? 0} requests
                    </p>
                    <Button size="sm" variant="ghost" className="mt-1" onClick={() => { setTeam(project); setError(''); }}>
                      Manage team
                    </Button>
                  </Th>
                  <Th>
                    <Badge status={project.status}>{labelFor(PROJECT_STATUSES, project.status)}</Badge>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {next.map((s) => (
                        <Button key={s} size="sm" variant="secondary" isLoading={busy} onClick={() => advanceStatus(project, s)}>
                          → {labelFor(PROJECT_STATUSES, s)}
                        </Button>
                      ))}
                      {next.length === 0 && <span className="text-xs text-slate-500">Terminal status</span>}
                    </div>
                  </Th>
                  <Th>
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant="secondary" onClick={() => { setUpdates(project); setError(''); }}>+ Update</Button>
                      <Button size="sm" variant="ghost" isLoading={busy} onClick={() => toggleFeatured(project)}>
                        {project.isFeatured ? 'Unfeature' : 'Feature'}
                      </Button>
                    </div>
                  </Th>
                </tr>
              );
            })}
          </Table>
          <Pager page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}

      {/* Team manager */}
      <Modal
        open={Boolean(team)}
        onClose={() => setTeam(null)}
        title={team ? `Team: ${team.name}` : ''}
        size="lg"
      >
        {error && <Alert variant="error" className="mb-4">{error}</Alert>}
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Add member by email" htmlFor="invite-email" className="flex-1">
            <Input
              id="invite-email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="student@college.edu"
            />
          </Field>
          <Button size="sm" isLoading={busy} disabled={!inviteEmail.trim()} onClick={addMember}>
            Add to team
          </Button>
        </div>
        <ul className="mt-5 divide-y divide-slate-100">
          {(team?.members ?? []).map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="text-sm font-semibold">{m.user?.name}</p>
                <p className="text-xs text-slate-500">{m.user?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {m.role === 'LEAD' ? <Badge variant="gradient">Lead</Badge> : <Badge variant="default">Member</Badge>}
                <Button
                  size="sm"
                  variant="ghost"
                  isLoading={busy}
                  onClick={() => setMemberRole(team, m.user?.id, m.role === 'LEAD' ? 'MEMBER' : 'LEAD')}
                >
                  {m.role === 'LEAD' ? 'Demote' : 'Make lead'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600"
                  isLoading={busy}
                  onClick={() => removeMember(team, m.user?.id)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
          {(team?.members ?? []).length === 0 && (
            <li className="py-6 text-center text-sm text-slate-500">No team members yet.</li>
          )}
        </ul>
      </Modal>

      {/* Update poster */}
      <Modal
        open={Boolean(updates)}
        onClose={() => setUpdates(null)}
        title={updates ? `Post update: ${updates.name}` : ''}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setUpdates(null)}>Cancel</Button>
            <Button
              size="sm"
              isLoading={busy}
              disabled={updateForm.title.trim().length < 3 || updateForm.body.trim().length < 10}
              onClick={postUpdate}
            >
              Post update
            </Button>
          </>
        }
      >
        <Field label="Title" htmlFor="up-title">
          <Input
            id="up-title"
            value={updateForm.title}
            onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
            placeholder="Milestone: authentication shipped"
          />
        </Field>
        <Field label="Details" htmlFor="up-body" className="mt-4">
          <Textarea
            id="up-body"
            rows={5}
            value={updateForm.body}
            onChange={(e) => setUpdateForm({ ...updateForm, body: e.target.value })}
            placeholder="What changed, what's next…"
          />
        </Field>
      </Modal>
    </AdminPage>
  );
}
