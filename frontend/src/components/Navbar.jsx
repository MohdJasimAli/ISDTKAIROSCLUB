import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from '../lib/cn.js';
import { useAuth } from '../context/AuthContext.jsx';
import { buttonStyles } from './ui/Button.jsx';
import Logo from './Logo.jsx';

const LINKS = [
  { to: '/about', label: 'About' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/ideas', label: 'Ideas' },
  { to: '/projects', label: 'Projects' },
  { to: '/events', label: 'Events' },
  { to: '/team', label: 'Team' },
  { to: '/contact', label: 'Contact' },
];

function AuthControls({ className, onNavigate }) {
  const { user, authLoading, logout } = useAuth();

  if (authLoading) {
    return <span className={cn('h-10 w-24 animate-pulse rounded-xl bg-slate-100', className)} role="status" aria-label="Loading account" />;
  }

  if (!user) {
    return (
      <div className={className}>
        <Link to="/login" onClick={onNavigate} className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'w-full lg:w-auto' })}>
          Login
        </Link>
        <Link to="/join" onClick={onNavigate} className={buttonStyles({ variant: 'primary', size: 'sm', className: 'w-full lg:w-auto' })}>
          Join Kairos
        </Link>
      </div>
    );
  }

  const firstName = user.name?.split(' ')[0] || 'there';
  return (
    <div className={className}>
      {user.role === 'ADMIN' && (
        <Link to="/admin" onClick={onNavigate} className="inline-flex min-h-10 w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 lg:w-auto">
          Admin
        </Link>
      )}
      <Link to="/dashboard" onClick={onNavigate} className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'w-full lg:w-auto' })}>
        Hi, {firstName}
      </Link>
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          logout();
        }}
        className={buttonStyles({ variant: 'secondary', size: 'sm', className: 'w-full lg:w-auto' })}
      >
        Logout
      </button>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const headerRef = useRef(null);
  const { pathname } = useLocation();

  const linkClass = ({ isActive }) =>
    cn(
      'inline-flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <header ref={headerRef} className="safe-top sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <nav className="container-page flex h-16 items-center justify-between gap-4" aria-label="Primary navigation">
        <Logo />
        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>
        <AuthControls className="hidden items-center gap-2 lg:flex" />
        <button
          ref={menuButtonRef}
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="mobile-navigation"
          aria-expanded={open}
        >
          <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </nav>
      {open && (
        <div id="mobile-navigation" className="max-h-[calc(100vh-4rem)] max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-100 bg-white px-4 pb-4 shadow-lg lg:hidden" role="region" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1 pt-3">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            <div className="mt-3 border-t border-slate-100 pt-3">
              <AuthControls className="grid grid-cols-2 gap-2" onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
