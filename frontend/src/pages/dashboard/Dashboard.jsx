import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Field from '../../components/ui/Field.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import client from '../../api/client.js';
import { SKILLS } from '../../utils/constants.js';

const MEMBER_LABELS = {
  PENDING: 'Pending review', MEMBER: 'Member', VOLUNTEER: 'Volunteer', REJECTED: 'Not selected',
};

export default function Dashboard() {
  const { user, authLoading, logout } = useAuth();
  const [form, setForm] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        department: user.department ?? '',
        year: user.year ?? '',
        phone: user.phone ?? '',
        bio: user.bio ?? '',
        githubUrl: user.githubUrl ?? '',
        linkedinUrl: user.linkedinUrl ?? '',
        skills: Array.isArray(user.skills) ? user.skills : [],
      });
    }
  }, [user]);

  if (authLoading || !form) {
    return <div className="container-page py-20"><LoadingState label="Loading your dashboard…" /></div>;
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const toggleSkill = (s) =>
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter((x) => x !== s) : [...f.skills, s],
    }));

  async function onSave(e) {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (form.skills.length === 0) {
      setError('Choose at least one skill so admins can match you with the right team.');
      document.getElementById('skills-heading')?.focus();
      return;
    }
    setSaving(true);
    try {
      await client.patch('/users/me', form);
      setSuccess('Profile saved.');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-page py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Student dashboard</p>
          <h1 className="mt-1 text-3xl font-extrabold">Hi, {user.name.split(' ')[0]} 👋</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={user.role === 'ADMIN' ? 'gradient' : 'info'}>{user.role}</Badge>
            <Badge variant={user.membershipStatus === 'MEMBER' ? 'success' : 'warning'}>
              {MEMBER_LABELS[user.membershipStatus] ?? user.membershipStatus}
            </Badge>
            <Badge variant="default">{user.department} · {user.year}</Badge>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={logout}>Log out</Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Profile editor */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-lg font-extrabold">My profile</h2>
            <p className="mt-1 text-sm text-slate-500">Shown to admins when matching you to project teams.</p>
            <form onSubmit={onSave} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
              {success && <Alert variant="success" className="sm:col-span-2">{success}</Alert>}
              {error && <Alert variant="error" className="sm:col-span-2">{error}</Alert>}

              <Field label="Full name" htmlFor="p-name"><Input id="p-name" value={form.name} onChange={set('name')} /></Field>
              <Field label="Department" htmlFor="p-dept"><Input id="p-dept" value={form.department} onChange={set('department')} /></Field>
              <Field label="Year / Semester" htmlFor="p-year"><Input id="p-year" value={form.year} onChange={set('year')} /></Field>
              <Field label="Phone" htmlFor="p-phone"><Input id="p-phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="+91 …" /></Field>

              <Field label="Bio" htmlFor="p-bio" className="sm:col-span-2" hint="A sentence or two about what you like building">
                <Textarea id="p-bio" rows={3} value={form.bio} onChange={set('bio')} placeholder="I enjoy building web apps and dabbling with AI…" />
              </Field>

              <Field label="GitHub URL" htmlFor="p-github"><Input id="p-github" type="url" inputMode="url" autoComplete="url" value={form.githubUrl} onChange={set('githubUrl')} placeholder="https://github.com/you" /></Field>
              <Field label="LinkedIn URL" htmlFor="p-linkedin"><Input id="p-linkedin" type="url" inputMode="url" autoComplete="url" value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/you" /></Field>

              <fieldset className="min-w-0 sm:col-span-2" aria-required="true">
                <legend id="skills-heading" tabIndex={-1} className="mb-2 text-sm font-medium text-slate-700 focus:outline-none">Skills <span className="text-rose-500" aria-hidden="true">*</span></legend>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSkill(s)}
                      aria-pressed={form.skills.includes(s)}
                      className={
                        form.skills.includes(s)
                          ? 'rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white'
                          : 'rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-300 hover:ring-indigo-400'
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="sm:col-span-2">
                <Button type="submit" isLoading={saving}>Save profile</Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Quick actions */}
        <aside className="space-y-5">
          <Card>
            <h3 className="font-bold">Quick actions</h3>
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/ideas/submit" className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white">Submit an idea</Link>
              <Link to="/ideas" className="rounded-xl bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Explore ideas</Link>
              <Link to="/projects" className="rounded-xl bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Browse projects</Link>
            </div>
          </Card>
          <Card>
            <h3 className="font-bold">My activity</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-500">
              <li className="flex items-center justify-between">
                <Link to="/ideas/my" className="font-medium text-indigo-600 hover:underline">My ideas</Link>
                <Badge variant="success">Live</Badge>
              </li>
              <li className="flex items-center justify-between">
                <Link to="/requests/my" className="font-medium text-indigo-600 hover:underline">Join requests</Link>
                <Badge variant="success">Live</Badge>
              </li>
              <li className="flex items-center justify-between"><span>Event registrations</span><Badge variant="default">Live</Badge></li>
            </ul>
          </Card>
          <Card tone="indigo">
            <h3 className="font-bold">Membership</h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Your account is <strong>{MEMBER_LABELS[user.membershipStatus] ?? user.membershipStatus}</strong>.
              Selection considers interest, skills, participation, performance, and contribution —
              strong members may be recommended to <strong>ISDT</strong>.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
