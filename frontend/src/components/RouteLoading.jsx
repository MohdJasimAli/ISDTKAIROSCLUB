import Spinner from './ui/Spinner.jsx';

export default function RouteLoading() {
  return (
    <div className="container-page py-16" role="status" aria-live="polite" aria-busy="true">
      <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
        <Spinner aria-hidden="true" size="lg" className="border-indigo-200 border-t-indigo-600" />
        <p className="text-sm">Loading page…</p>
      </div>
    </div>
  );
}
