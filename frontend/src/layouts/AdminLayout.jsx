import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { cn } from '../lib/cn.js';
import RouteLoading from '../components/RouteLoading.jsx';
import Seo from '../components/Seo.jsx';
import Logo from '../components/Logo.jsx';

const NAV = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/ideas', label: 'Ideas' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/requests', label: 'Applications' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/announcements', label: 'Announcements' },
  { to: '/admin/messages', label: 'Messages' },
];

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const sidebarRef = useRef(null);
  const mainRef = useRef(null);
  const firstRender = useRef(true);
  const { pathname } = useLocation();

  const linkClass = ({ isActive }) =>
    cn(
      'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
    );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const frame = window.setTimeout(() => mainRef.current?.focus({ preventScroll: true }), 0);
    return () => window.clearTimeout(frame);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusableSelector = FOCUSABLE;
    const getFocusable = () => [...(sidebarRef.current?.querySelectorAll(focusableSelector) ?? [])];
    const focusInitial = window.setTimeout(() => getFocusable()[0]?.focus(), 0);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!sidebarRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusInitial);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  return (
    <div className="min-h-screen min-h-dvh bg-slate-100 lg:flex">
      <Seo />
      <a className="skip-link" href="#admin-content">Skip to admin content</a>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          aria-label="Close admin navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        id="admin-navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto bg-slate-950 lg:static lg:z-auto lg:w-64 lg:shrink-0',
          open ? 'block' : 'hidden lg:block'
        )}
        aria-label="Admin navigation"
        aria-modal={open ? 'true' : undefined}
        role={open ? 'dialog' : undefined}
      >
        <div className="px-5 py-5">
          <Logo tone="light" title="Kairos Admin" subtitle="ISDT Club" />
        </div>
        <nav className="space-y-1 px-3 pb-8" aria-label="Admin sections">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="safe-top sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 lg:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Close admin menu' : 'Open admin menu'}
              aria-controls="admin-navigation"
              aria-expanded={open}
            >
              ☰ Menu
            </button>
            <p className="hidden min-w-0 truncate text-sm text-slate-500 lg:block">
              Signed in as <span className="font-semibold text-slate-700">{user?.name}</span> · {user?.email}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link to="/" className="inline-flex min-h-10 items-center rounded-lg px-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:underline">View site ↗</Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex min-h-10 items-center rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </header>
        <main ref={mainRef} id="admin-content" aria-label="Admin content" tabIndex={-1} className="flex-1 p-4 focus:outline-none sm:p-6">
          <Suspense fallback={<RouteLoading />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
