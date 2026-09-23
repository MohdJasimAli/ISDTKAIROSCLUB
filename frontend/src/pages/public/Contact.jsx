import { useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Field from '../../components/ui/Field.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import client from '../../api/client.js';
import focusFirstError from '../../utils/focusFirstError.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  function validate() {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Please enter your name';
    if (!EMAIL_RE.test(form.email.trim())) errs.email = 'Enter a valid email address';
    if (form.message.trim().length < 10) errs.message = 'Tell us a little more (at least 10 characters)';
    setErrors(errs);
    focusFirstError(errs, { name: 'c-name', email: 'c-email', message: 'c-message' });
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSuccess('');
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      };
      if (form.subject.trim()) payload.subject = form.subject.trim();
      const res = await client.post('/contact', payload);
      setSuccess(res.data.message);
      setForm(EMPTY);
    } catch (err) {
      setServerError(err.userMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Contact"
        title="Questions, ideas, collaborations?"
        description="Drop us a message — the Kairos team reads everything that comes through this form."
      />

      <section className="container-page grid gap-8 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            {success ? (
              <div className="py-6">
                <Alert variant="success" title="Message sent">{success}</Alert>
                <Button variant="secondary" className="mt-4" onClick={() => setSuccess('')}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
                {serverError && <Alert variant="error" className="sm:col-span-2">{serverError}</Alert>}
                <Field label="Your name" htmlFor="c-name" required error={errors.name}>
                  <Input id="c-name" value={form.name} onChange={set('name')} invalid={!!errors.name} placeholder="Jane Student" />
                </Field>
                <Field label="Email" htmlFor="c-email" required error={errors.email}>
                  <Input id="c-email" type="email" value={form.email} onChange={set('email')} invalid={!!errors.email} placeholder="jane@college.edu" />
                </Field>
                <Field label="Subject (optional)" htmlFor="c-subject" className="sm:col-span-2">
                  <Input id="c-subject" value={form.subject} onChange={set('subject')} placeholder="What is this about?" />
                </Field>
                <Field label="Message" htmlFor="c-message" required error={errors.message} className="sm:col-span-2">
                  <Textarea id="c-message" rows={6} value={form.message} onChange={set('message')} invalid={!!errors.message}
                    placeholder="Tell us what's on your mind…" />
                </Field>
                <div className="sm:col-span-2">
                  <Button type="submit" isLoading={submitting}>Send message</Button>
                </div>
              </form>
            )}
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <h2 className="font-bold">Reach us directly</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
              <li><span className="block text-xs font-bold uppercase text-slate-500">Department</span>Computer Science, Integral University</li>
              <li><span className="block text-xs font-bold uppercase text-slate-500">Location</span>Lucknow, Uttar Pradesh</li>
              <li><span className="block text-xs font-bold uppercase text-slate-500">Response time</span>Usually 2–3 days</li>
            </ul>
          </Card>
          <Card tone="dark">
            <h2 className="font-bold">Prefer talking in person?</h2>
            <p className="mt-2 text-sm text-slate-400">
              Catch us at department notice boards, club events, or drop by during open lab hours
              (announced on the Events page).
            </p>
          </Card>
        </aside>
      </section>
    </div>
  );
}
