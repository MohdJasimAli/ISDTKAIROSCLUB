import { Component } from 'react';
import { buttonStyles } from './ui/Button.jsx';

/**
 * Catches render-time crashes so the user sees an error card (with the message)
 * instead of a blank white page. Runtime errors are also logged to the console.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Kairos UI crashed:', error, info?.componentStack ?? '');
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div className="container-page py-20">
          <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-slate-200">
            <p className="text-xs font-bold uppercase tracking-widest text-rose-500">Something broke</p>
            <h1 className="mt-2 text-xl font-extrabold">This page hit an error</h1>
            <p className="mt-3 break-words rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
              {String(error?.message || error)}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button type="button" onClick={() => window.location.reload()} className={buttonStyles({ size: 'sm' })}>
                Reload page
              </button>
              <a href="/" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>Go home</a>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              The full error is in the browser console (F12 → Console).
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
