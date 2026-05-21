"use client";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pb-16 pt-10 sm:px-8 lg:px-12">
      <div className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-8 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
          Analytics error
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          The analytics surface failed to load.
        </h1>
        <p className="mt-4 text-base leading-8 text-[var(--muted-foreground)]">
          {error.message ||
            "A recoverable rendering error occurred while preparing the analytics view."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-[var(--background)]"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
