import { useState } from 'react';
import { AdminPage, Toolbar, Table, Th, Pager } from '../../components/admin/ui.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import useFetch from '../../hooks/useFetch.js';
import client from '../../api/client.js';

export default function AdminMessages() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const { data, loading, error: fetchError, refetch } = useFetch('/admin/messages', {
    unreadOnly: unreadOnly || undefined,
    page,
    limit: 20,
  });

  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit ?? 20)));

  async function mark(id, isRead) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await client.patch(`/admin/messages/${id}`, { isRead });
      setMessage(res.data.message);
      refetch();
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminPage title="Inbox" description="Messages from the public contact form.">
      <Toolbar>
        <Button
          variant={unreadOnly ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => { setUnreadOnly((v) => !v); setPage(1); }}
        >
          {unreadOnly ? 'Showing unread only' : 'Show unread only'}
        </Button>
      </Toolbar>

      {message && <Alert variant="success" className="mb-4">{message}</Alert>}
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {fetchError && <Alert variant="warning" className="mb-4">{fetchError}</Alert>}

      {loading ? (
        <LoadingState label="Loading messages…" />
      ) : (
        <>
          <Table
            columns={['Message', 'From', 'Date', 'Status', 'Action']}
            empty={items.length === 0 ? 'Inbox zero. 🎉' : null}
          >
            {items.map((m) => (
              <tr key={m.id} className={m.isRead ? 'hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50'}>
                <Th>
                  {m.subject && <p className="text-sm font-bold">{m.subject}</p>}
                  <p className="whitespace-pre-wrap text-sm text-slate-600">{m.message}</p>
                </Th>
                <Th>
                  <p className="text-sm font-semibold">{m.name}</p>
                  <a href={`mailto:${m.email}`} className="text-xs text-indigo-600 hover:underline">{m.email}</a>
                </Th>
                <Th className="text-xs text-slate-500">{new Date(m.createdAt).toLocaleString()}</Th>
                <Th>{m.isRead ? <Badge variant="default">Read</Badge> : <Badge variant="info" dot>Unread</Badge>}</Th>
                <Th>
                  <Button size="sm" variant="ghost" isLoading={busy} onClick={() => mark(m.id, !m.isRead)}>
                    {m.isRead ? 'Mark unread' : 'Mark read'}
                  </Button>
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
