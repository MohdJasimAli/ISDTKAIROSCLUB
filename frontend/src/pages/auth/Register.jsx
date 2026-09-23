import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Field from '../../components/ui/Field.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import focusFirstError from '../../utils/focusFirstError.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY = { name: '', email: '', department: '', year: '', phone: '', password: '', confirm: '' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  function validate() {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Please enter your full name';
    if (!EMAIL_RE.test(form.email.trim())) errs.email = 'Enter a valid email address';
    if (!form.department.trim()) errs.department = 'Department is required';
    if (!form.year.trim()) errs.year = 'Year / semester is required';
    if (form.password.length < 8 || !/[a-z]/i.test(form.password) || !/\d/.test(form.password)) errs.password = 'At least 8 characters with a letter and a number';
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    focusFirstError(errs, {
      name: 'r-name',
      email: 'r-email',
      department: 'r-dept',
      year: 'r-year',
      password: 'r-pass',
      confirm: 'r-confirm',
    });
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        year: form.year.trim(),
        password: form.password,
      };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      await register(payload);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.userMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page flex justify-center py-16">
      <Card className="w-full max-w-lg">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Join the platform</p>
        <h1 className="mt-1.5 text-2xl font-extrabold">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Accounts start as <strong>Pending</strong> — the Kairos team reviews every registration.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
          {serverError && <Alert variant="error" className="sm:col-span-2">{serverError}</Alert>}

          <Field label="Full name" htmlFor="r-name" required error={errors.name} className="sm:col-span-2">
            <Input id="r-name" autoComplete="name" value={form.name} invalid={!!errors.name} onChange={set('name')} placeholder="Jane Student" />
          </Field>

          <Field label="Email" htmlFor="r-email" required error={errors.email} className="sm:col-span-2">
            <Input id="r-email" type="email" autoComplete="email" value={form.email} invalid={!!errors.email} onChange={set('email')} placeholder="jane@college.edu" />
          </Field>

          <Field label="Department" htmlFor="r-dept" required error={errors.department}>
            <Input id="r-dept" value={form.department} invalid={!!errors.department} onChange={set('department')} placeholder="Computer Science" />
          </Field>

          <Field label="Year / Semester" htmlFor="r-year" required error={errors.year}>
            <Select id="r-year" value={form.year} invalid={!!errors.year} onChange={set('year')}>
              <option value="" disabled>Select…</option>
              {['1st Year', '2nd Year', '3rd Year', '4th Year', 'MCA', 'M.Sc', 'Ph.D'].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
          </Field>

          <Field label="Phone (optional)" htmlFor="r-phone" className="sm:col-span-2">
            <Input id="r-phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="+91 …" />
          </Field>

          <Field label="Password" htmlFor="r-pass" required error={errors.password} hint="Min 8 characters, with a letter and a number">
            <Input id="r-pass" type="password" autoComplete="new-password" value={form.password} invalid={!!errors.password} onChange={set('password')} />
          </Field>

          <Field label="Confirm password" htmlFor="r-confirm" required error={errors.confirm}>
            <Input id="r-confirm" type="password" autoComplete="new-password" value={form.confirm} invalid={!!errors.confirm} onChange={set('confirm')} />
          </Field>

          <div className="sm:col-span-2">
            <Button type="submit" isLoading={submitting} className="w-full">Create account</Button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
