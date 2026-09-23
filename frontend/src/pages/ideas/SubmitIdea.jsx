import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Field from '../../components/ui/Field.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { LoadingState } from '../../components/ui/Spinner.jsx';
import client from '../../api/client.js';
import { IDEA_CATEGORIES, IDEA_STAGES, SUPPORT_OPTIONS } from '../../utils/constants.js';
import focusFirstError from '../../utils/focusFirstError.js';

const EMPTY = {
  title: '', category: '', problemStatement: '', proposedSolution: '', expectedImpact: '',
  techText: '', skillsText: '', supportNeeded: [], currentStage: 'JUST_AN_IDEA',
  hasExistingTeam: false, existingTeamMembers: '', demoLink: '',
};

// Server field errors arrive keyed by API field names — map to form input names.
const SERVER_KEY_MAP = { techStack: 'techText', requiredSkills: 'skillsText' };

function toPayload(f) {
  const arr = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
  return {
    title: f.title.trim(),
    category: f.category,
    problemStatement: f.problemStatement.trim(),
    proposedSolution: f.proposedSolution.trim(),
    expectedImpact: f.expectedImpact.trim(),
    techStack: arr(f.techText),
    requiredSkills: arr(f.skillsText),
    supportNeeded: f.supportNeeded,
    currentStage: f.currentStage,
    hasExistingTeam: f.hasExistingTeam,
    existingTeamMembers: f.existingTeamMembers.trim(),
    demoLink: f.demoLink.trim(),
  };
}

export default function SubmitIdea() {
  const { user } = useAuth();
  const { id } = useParams(); // present → edit mode
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    client
      .get(`/ideas/${id}`)
      .then((res) => {
        if (cancelled) return;
        const d = res.data.data;
        setForm({
          title: d.title, category: d.category, problemStatement: d.problemStatement,
          proposedSolution: d.proposedSolution, expectedImpact: d.expectedImpact,
          techText: (d.techStack ?? []).join(', '),
          skillsText: (d.requiredSkills ?? []).join(', '),
          supportNeeded: d.supportNeeded ?? [], currentStage: d.currentStage,
          hasExistingTeam: d.hasExistingTeam, existingTeamMembers: d.existingTeamMembers ?? '',
          demoLink: d.demoLink ?? '',
        });
      })
      .catch((err) => { if (!cancelled) setServerError(err.userMessage); })
      .finally(() => { if (!cancelled) setLoadingEdit(false); });
    return () => { cancelled = true; };
  }, [id, isEdit]);

  const set = (key) => (e) =>
    setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const toggleSupport = (opt) =>
    setForm((f) => ({
      ...f,
      supportNeeded: f.supportNeeded.includes(opt)
        ? f.supportNeeded.filter((x) => x !== opt)
        : [...f.supportNeeded, opt],
    }));

  function validate() {
    const errs = {};
    if (form.title.trim().length < 5) errs.title = 'At least 5 characters';
    if (!form.category) errs.category = 'Pick a category';
    if (form.problemStatement.trim().length < 20) errs.problemStatement = 'At least 20 characters — describe the real problem';
    if (form.proposedSolution.trim().length < 20) errs.proposedSolution = 'At least 20 characters — how will you solve it?';
    if (form.expectedImpact.trim().length < 10) errs.expectedImpact = 'At least 10 characters';
    if (form.supportNeeded.length === 0) errs.supportNeeded = 'Select at least one type of support';
    if (form.demoLink.trim() && !/^https?:\/\//.test(form.demoLink.trim())) errs.demoLink = 'Must start with http(s)://';
    setErrors(errs);
    focusFirstError(errs, {
      title: 'i-title',
      category: 'i-cat',
      problemStatement: 'i-problem',
      proposedSolution: 'i-solution',
      expectedImpact: 'i-impact',
      supportNeeded: 'support-group',
      demoLink: 'i-link',
    });
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerError('');
    setSuccess('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = toPayload(form);
      if (isEdit) {
        await client.patch(`/ideas/${id}`, payload);
        setSuccess('Idea updated — back in the review queue.');
      } else {
        await client.post('/ideas', payload);
        setSuccess('Idea submitted! Redirecting to your ideas…');
        setTimeout(() => navigate('/ideas/my'), 1200);
      }
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors) {
        const mapped = {};
        for (const [k, v] of Object.entries(fieldErrors)) mapped[SERVER_KEY_MAP[k] ?? k] = v[0];
        setErrors(mapped);
        focusFirstError(mapped, {
          title: 'i-title',
          category: 'i-cat',
          problemStatement: 'i-problem',
          proposedSolution: 'i-solution',
          expectedImpact: 'i-impact',
          supportNeeded: 'support-group',
          techText: 'i-tech',
          skillsText: 'i-skills',
          demoLink: 'i-link',
        });
        setServerError('Please fix the highlighted fields.');
      } else {
        setServerError(err.userMessage);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingEdit) return <div className="container-page py-20"><LoadingState label="Loading idea…" /></div>;

  return (
    <div className="container-page max-w-4xl py-10">
      <PageHeader
        eyebrow={isEdit ? 'Edit idea' : 'Submit an idea'}
        title={isEdit ? 'Revise your idea' : 'Turn a problem into a project'}
        description="The more concrete your problem, solution, and impact are, the faster the Kairos team can review it and find you teammates."
      />

      <div className="mt-8 grid gap-6">
        {/* Student info — prefilled from profile */}
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold">Submitted by</h2>
              <p className="mt-1 text-sm text-slate-500">Taken from your account — update it in your dashboard.</p>
            </div>
            <Link to="/dashboard" className="text-sm font-semibold text-indigo-600 hover:underline">Edit profile</Link>
          </div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><span className="block text-xs font-bold uppercase text-slate-500">Name</span>{user?.name}</div>
            <div><span className="block text-xs font-bold uppercase text-slate-500">Email</span>{user?.email}</div>
            <div><span className="block text-xs font-bold uppercase text-slate-500">Department</span>{user?.department || '—'}</div>
            <div><span className="block text-xs font-bold uppercase text-slate-500">Year</span>{user?.year || '—'}</div>
          </div>
        </Card>

        {/* Idea form */}
        <Card>
          <form onSubmit={onSubmit} noValidate className="grid gap-5">
            {serverError && <Alert variant="error">{serverError}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Field label="Idea title" htmlFor="i-title" required error={errors.title} hint="A clear, catchy one-liner">
              <Input id="i-title" value={form.title} invalid={!!errors.title} onChange={set('title')} placeholder="e.g. Campus lost-and-found with QR tagging" />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Category" htmlFor="i-cat" required error={errors.category}>
                <Select id="i-cat" value={form.category} invalid={!!errors.category} onChange={set('category')}>
                  <option value="" disabled>Choose…</option>
                  {IDEA_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Select>
              </Field>
              <Field label="Current stage" htmlFor="i-stage" required>
                <Select id="i-stage" value={form.currentStage} onChange={set('currentStage')}>
                  {IDEA_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </Field>
            </div>

            <Field label="Problem statement" htmlFor="i-problem" required error={errors.problemStatement} hint="What real-world problem exists today?">
              <Textarea id="i-problem" rows={4} value={form.problemStatement} invalid={!!errors.problemStatement} onChange={set('problemStatement')} placeholder="Students lose valuable items on campus with no way to report or claim them…" />
            </Field>

            <Field label="Proposed solution" htmlFor="i-solution" required error={errors.proposedSolution} hint="How will your idea solve that problem?">
              <Textarea id="i-solution" rows={4} value={form.proposedSolution} invalid={!!errors.proposedSolution} onChange={set('proposedSolution')} placeholder="A web app where found items get QR tags and owners can claim them…" />
            </Field>

            <Field label="Expected impact" htmlFor="i-impact" required error={errors.expectedImpact} hint="Who benefits, and how much?">
              <Textarea id="i-impact" rows={3} value={form.expectedImpact} invalid={!!errors.expectedImpact} onChange={set('expectedImpact')} placeholder="Reduces lost-item reports at the admin office; helps 1000+ students…" />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Technologies (comma-separated)" htmlFor="i-tech" error={errors.techText} hint="e.g. React, Node.js, Firebase">
                <Input id="i-tech" value={form.techText} invalid={!!errors.techText} onChange={set('techText')} placeholder="React, Node.js, MongoDB" />
              </Field>
              <Field label="Skills required (comma-separated)" htmlFor="i-skills" error={errors.skillsText} hint="e.g. Frontend, UI/UX, AI/ML">
                <Input id="i-skills" value={form.skillsText} invalid={!!errors.skillsText} onChange={set('skillsText')} placeholder="Frontend, UI/UX, Backend" />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Existing team?" htmlFor="i-team" hint="Do you already have people working on this?">
                <Select id="i-team" value={form.hasExistingTeam ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, hasExistingTeam: e.target.value === 'yes' })}>
                  <option value="no">No — I need a team</option>
                  <option value="yes">Yes — we already have a team</option>
                </Select>
              </Field>
              <Field label="GitHub / demo / document link (optional)" htmlFor="i-link" error={errors.demoLink}>
                <Input id="i-link" type="url" inputMode="url" autoComplete="url" value={form.demoLink} invalid={!!errors.demoLink} onChange={set('demoLink')} placeholder="https://…" />
              </Field>
            </div>

            {form.hasExistingTeam && (
              <Field label="Existing team members" htmlFor="i-members" hint="Names + skills, comma-separated">
                <Textarea id="i-members" rows={3} value={form.existingTeamMembers} onChange={set('existingTeamMembers')} placeholder="Aman (Backend), Sara (UI/UX)" />
              </Field>
            )}

            <fieldset id="support-group" tabIndex={-1} className="min-w-0 border-0 p-0 focus:outline-none" aria-required="true" aria-describedby={errors.supportNeeded ? 'support-error' : undefined}>
              <legend className="mb-2 text-sm font-medium text-slate-700">
                Support required <span className="text-rose-500" aria-hidden="true">*</span>
                <span className="ml-2 text-xs font-normal text-slate-500">pick all that apply</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {SUPPORT_OPTIONS.map((opt) => {
                  const active = form.supportNeeded.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleSupport(opt)}
                      aria-pressed={active}
                      className={
                        active
                          ? 'rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white'
                          : 'rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-300 hover:ring-indigo-400'
                      }
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {errors.supportNeeded && <p id="support-error" className="mt-1.5 text-xs font-medium text-rose-600" role="alert">{errors.supportNeeded}</p>}
            </fieldset>

            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
              <Button type="submit" isLoading={submitting}>
                {isEdit ? 'Save changes' : 'Submit idea'}
              </Button>
              <Button variant="ghost" onClick={() => navigate(isEdit ? '/ideas/my' : '/dashboard')}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
