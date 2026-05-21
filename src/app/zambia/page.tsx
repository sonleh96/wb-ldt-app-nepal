import Link from "next/link";

export default function ZambiaPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-18 sm:px-8 lg:px-10">
      <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[linear-gradient(135deg,var(--surface-strong),var(--surface-muted))] p-8 shadow-[0_18px_50px_var(--surface-shadow)] sm:p-10">
        <span className="inline-flex rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
          Zambia
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
          Country data under construction
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted-foreground)] sm:text-lg">
          Zambia has its own route already, but the country dataset and release workflow are still being prepared.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)]"
          >
            Back to country portal
          </Link>
        </div>
      </section>
    </main>
  );
}
