import type { Country } from "@/lib/countries";

export function CountryContextPanel({ country }: { country: Country }) {
  const context = country.profile.context;

  return (
    <section className="mx-auto mt-10 w-full max-w-7xl px-6 sm:px-8 lg:px-12">
      <article className="rounded-[1.9rem] border border-[var(--border-strong)] bg-white/80 p-7 shadow-[0_18px_45px_rgba(39,62,71,0.08)]">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Country context
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Why this workspace matters
            </h2>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--muted-foreground)]">
              {context.summary}
            </p>
          </div>

          <div className="rounded-[1.35rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Source references
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {context.sourceLinks.map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] dark:bg-[var(--surface-strong)]"
                >
                  {source.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {context.highlights.map((highlight) => (
            <div
              key={highlight}
              className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--muted-foreground)]"
            >
              {highlight}
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
