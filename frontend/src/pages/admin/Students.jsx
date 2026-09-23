import { useState } from 'react';
import { AdminPage, Toolbar, Table, Th, Pager } from '../../components/admin/ui.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import useFetch from '../../hooks/useFetch.js';
import useDebouncedValue from '../../hooks/useDebouncedValue.js';
import client from '../../api/client.js';
import { MEMBERSHIP_STATUSES } from '../../utils/constants.js';

const MEMBER_TONES = { PENDING: 'warning', MEMBER: 'success', VOLUNTEER: 'info', REJECTED: 'danger' };

export default function AdminStudents() {
  const [filters, setFilters] = useState({ search: '', membershipStatus: '', role: '' });
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const debouncedSearch = useDebouncedValue(filters.search);

  const { data, loading, error: fetchError, refetch } = useFetch('/admin/users', {
    search: debouncedSearch || undefined,
    membershipStatus: filters.membershipStatus || undefined,
    role: filters.role || undefined,
    page,
    limit: 20,
  });

  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit ?? 20)));

  async function update(userId, patch) {
    setError('');
    setMessage('');
    try {
      const res = await client.patch(`/admin/users/${userId}`, patch);
      setMessage(res.data.message);
      refetch();
    } catch (err) {
      setError(err.userMessage);
      refetch();
    }
  }

  return (
    <AdminPage title="Students" description="Review registrations and manage membership, roles, and access.">
      <Toolbar>
        <Input
          type="search"
          placeholder="Search name, email, dept…"
          value={filters.search}
          onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
          className="sm:max-w-xs"
          aria-label="Search students"
        />
        <Select value={filters.role} onChange={(e) => { setFilters({ ...filters, role: e.target.value }); setPage(1) }} aria-label="Filter by role">
          <option value="">All roles</option>
          <option value="STUDENT">Students</option>
          <option value="ADMIN">Admins</option>
        </Select>
        <Select
          value={filters.membershipStatus}
          onChange={(e) => { setFilters({ ...filters, membershipStatus: e.target.value }); setPage(1); }}
          aria-label="Filter by membership"
        >
          <option value="">All membership</option>
          {MEMBERSHIP_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
      </Toolbar>

      {message && <Alert variant="success" className="mb-4">{message}</Alert>}
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {fetchError && <Alert variant="warning" className="mb-4">{fetchError}</Alert>}

      {loading ? (
        <LoadingState label="Loading students…" />
      ) : (
        <>
          <Table
            columns={['Student', 'Skills', 'Participation', 'Membership', 'Role', 'Active']}
            empty={items.length === 0 ? 'No students match these filters.' : null}
          >
            {items.map((user) => (
              <tr key={user.id} className={user.isActive ? 'hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100'}>
                <Th>
                  <p className="font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  <p className="text-xs text-slate-500">{user.department} · {user.year}</p>
                  {user.role === 'ADMIN' && <Badge variant="gradient" className="mt-1">Admin</Badge>}
                </Th>
                <Th>
                  <div className="flex max-w-[180px] flex-wrap gap-1">
                    {(user.skills ?? []).slice(0, 5).map((s) => (
                      <span key={s} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">{s}</span>
                    ))}
                    {(user.skills ?? []).length === 0 && <span className="text-xs text-slate-300">—</span>}
                  </div>
                </Th>
                <Th className="text-xs">
                  <p>{user._count?.ideas ?? 0} ideas</p>
                  <p>{user._count?.memberships ?? 0} teams</p>
                  <p>{user._count?.joinRequests ?? 0} requests</p>
                </Th>
                <Th>
                  <Select
                    value={user.membershipStatus}
                    aria-label={`Membership for ${user.name}`}
                    onChange={(e) => update(user.id, { membershipStatus: e.target.value })}
                  >
                    {MEMBERSHIP_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </Select>
                  <Badge variant={MEMBER_TONES[user.membershipStatus] ?? 'default'} className="mt-1.5">
                    {user.membershipStatus.replace(/_/g, ' ')}
                  </Badge>
                </Th>
                <Th>
                  <Select
                    value={user.role}
                    aria-label={`Role for ${user.name}`}
                    onChange={(e) => update(user.id, { role: e.target.value })}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="ADMIN">Admin</option>
                  </Select>
                  <p className="mt-1 max-w-[150px] text-[11px] leading-snug text-slate-500">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </Th>
                <Th>
                  <label className="inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={user.isActive}
                      aria-label={`Active state for ${user.name}`}
                      onChange={(e) => update(user.id, { isActive: e.target.checked })}
                      className="size-5 rounded accent-indigo-600"
                    />
                  </label>
                </Th>
              </tr>
            ))}
          </Table>
          <Pager page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </AdminPage>
  );
}
