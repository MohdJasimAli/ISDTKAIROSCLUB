import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Field from '../../components/ui/Field.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import focusFirstError from '../../utils/focusFirstError.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const errs = {};
    if (!EMAIL_RE.test(form.email.trim())) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    focusFirstError(errs, { email: 'l-email', password: 'l-password' });
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.userMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page flex justify-center py-16">
      <Card className="w-full max-w-md">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Welcome back</p>
        <h1 className="mt-1.5 text-2xl font-extrabold">Log in to Kairos</h1>
        <p className="mt-1 text-sm text-slate-500">Access your ideas, projects, and profile.</p>

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          {serverError && <Alert variant="error">{serverError}</Alert>}
          <Field label="Email" htmlFor="l-email" required error={errors.email}>
            <Input
              id="l-email"
              type="email"
              autoComplete="email"
              value={form.email}
              invalid={!!errors.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jane@college.edu"
            />
          </Field>
          <Field label="Password" htmlFor="l-password" required error={errors.password}>
            <Input
              id="l-password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              invalid={!!errors.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </Field>
          <Button type="submit" isLoading={submitting} className="w-full">
            Log in
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          New here?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
