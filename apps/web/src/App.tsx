/**
 * App.tsx — Development placeholder
 *
 * This is a temporary landing screen shown during the initial setup phase.
 * It will be replaced with the full application shell once the foundation
 * is complete.
 */
function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* Status badge */}
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        <span>Development Mode — Foundation Setup</span>
      </div>

      {/* Product name */}
      <h1 className="mb-3 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
        KENENISA{' '}
        <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          OS
        </span>
      </h1>

      {/* Tagline */}
      <p className="mb-2 text-lg font-medium text-slate-300 sm:text-xl">
        Personal Engineering &amp; Career Operating System
      </p>

      {/* Subtitle */}
      <p className="mb-12 max-w-md text-sm text-slate-500">
        This is a development placeholder. The full application is under active construction.
      </p>

      {/* Status grid */}
      <div className="grid w-full max-w-sm gap-3 text-left">
        {[
          { label: 'Monorepo', status: 'complete' },
          { label: 'TypeScript', status: 'complete' },
          { label: 'Frontend', status: 'complete' },
          { label: 'Backend', status: 'complete' },
          { label: 'Authentication', status: 'pending' },
          { label: 'Database', status: 'pending' },
          { label: 'Dashboard', status: 'pending' },
        ].map(({ label, status }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
          >
            <span className="text-sm text-slate-400">{label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                status === 'complete'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-slate-500/15 text-slate-500'
              }`}
            >
              {status === 'complete' ? '✓ Complete' : 'Pending'}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;
