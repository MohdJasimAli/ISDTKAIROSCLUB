import { useEffect, useId, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './ui/Button.jsx';
import Modal from './ui/Modal.jsx';
import Field from './ui/Field.jsx';
import Textarea from './ui/Textarea.jsx';
import Alert from './ui/Alert.jsx';
import client from '../api/client.js';

function interestIsActive(interest) {
  if (!interest) return false;
  if (typeof interest === 'object') return ['PENDING', 'APPROVED'].includes(interest.status);
  return true;
}

/**
 * "I'm Interested" — admin-assisted: records a PENDING join request, never auto-assigns.
 * - Logged out → redirects to login (remembers current page)
 * - Owner → renders nothing
 * - Already sent → static "Interest sent" chip
 */
export default function InterestButton({ idea, onSent, size = 'md', type = 'idea' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const messageId = useId();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(() => interestIsActive(idea.myInterest));

  useEffect(() => {
    setSent(interestIsActive(idea.myInterest));
  }, [idea.myInterest]);

  if (idea.viewerIsOwner || idea.viewerIsMember || (type === 'idea' && idea.hasExistingTeam)) return null;

  function handleClick() {
    if (sent) return;
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setError('');
    setOpen(true);
  }

  async function submit() {
    setSending(true);
    setError('');
    try {
      const endpoint = type === 'project' ? `/projects/${idea.id}/interest` : `/ideas/${idea.id}/interest`;
      await client.post(endpoint, { message: message.trim() || undefined });
      setSent(true);
      setOpen(false);
      onSent?.();
    } catch (err) {
      if (err.response?.status === 409) {
        setSent(true);
        setOpen(false);
        onSent?.();
      } else {
        setError(err.userMessage);
      }
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20" role="status" aria-live="polite">
        <span aria-hidden="true">✓</span> Interest sent
      </span>
    );
  }

  return (
    <>
      <Button variant={size === 'sm' ? 'secondary' : 'primary'} size={size} onClick={handleClick}>
        I&apos;m Interested
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Express your interest"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" isLoading={sending} onClick={submit}>Send interest</Button>
          </>
        }
      >
        {error && <Alert variant="error" className="mb-4">{error}</Alert>}
        <p className="text-sm text-slate-600">
          Tell the Kairos team why you&apos;d like to join <strong>{idea.title || idea.name}</strong>. Team
          formation is <strong>admin-assisted</strong> — no automatic assignment; every match is
          reviewed for fit.
        </p>
        <Field
          label="Message (optional)"
          htmlFor={messageId}
          className="mt-4"
          hint="You can add skills to your profile from the dashboard."
        >
          <Textarea
            id={messageId}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="I've built two React apps and want to help with the frontend…"
          />
        </Field>
      </Modal>
    </>
  );
}
