export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function FullPageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-zinc-500">
      <Spinner />
      <p className="text-sm">{label}</p>
    </div>
  );
}
