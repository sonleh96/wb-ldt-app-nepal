const useCases = [
  "Identify municipalities that sit above or below national score baselines.",
  "Inspect how indicator-level performance shapes each pillar score.",
  "Compare a municipality against district peers in the 2D and 3D score views.",
  "Use transparent source metadata to understand what each indicator represents.",
];

const preserved = [
  "Multi-score exploration through 2D and 3D municipality comparison.",
  "Single-score map inspection with municipality highlighting and score drivers.",
  "Supporting pages that explain methodology, resources, and release history.",
];

const changed = [
  "The frontend is rebuilt in Next.js rather than Streamlit.",
  "Supabase is the runtime data source for scores, indicators, and municipality context.",
  "Indicators contribute directly to the three pillars without intermediate dimensions.",
  "The current phase is public analytics only, not the AI decision-engine workflow.",
];

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pb-16 pt-10 sm:px-8 lg:px-12">
      <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-8 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
          About
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
          Understanding the Nepal Local Development Tracker
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-8 text-[var(--muted-foreground)]">
          This page follows the reference app&apos;s long-form About structure,
          but it is rewritten for the Nepal release and the current product
          scope. It explains why the rebuild exists, what analytical questions
          it is designed to answer, and how it differs from the original
          Streamlit implementation.
        </p>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Why this rebuild exists
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            The reference Local Development Tracker showed a useful analytical
            pattern: compare municipalities across a small number of core
            development pillars, then let users inspect the scores, map
            patterns, and supporting indicators that explain those differences.
          </p>
          <p>
            This Nepal rebuild keeps that analytical pattern but replaces the
            technical stack with Next.js, Supabase, Vercel, Plotly, and
            MapLibre. The result is a public-facing analytics product that is
            easier to evolve into a historical, deployment-ready web
            application.
          </p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          What the app is designed to show
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            The Nepal app visualizes municipality-level differences across
            Prosperity, Livability, and Infrastructure. Rather than stopping at
            a single composite number, it exposes the component scores,
            indicator metadata, and map context needed to interpret those
            scores responsibly.
          </p>
          <ul className="space-y-2 pl-5">
            {useCases.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Product objective
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            Provide a public, inspectable municipality analytics surface for
            Nepal rather than a closed score dashboard.
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Technical stack
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            Next.js on the frontend, Supabase for storage and querying, Vercel
            for deployment, Plotly for charts, and MapLibre for the choropleth
            map layer.
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Current boundary
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            The app is currently public and read-only, with one loaded release
            year and an analytics-first scope.
          </p>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          What is preserved and what changed
        </h2>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              Preserved from the reference
            </h3>
            <ul className="mt-4 space-y-2 pl-5 text-sm leading-7 text-[var(--muted-foreground)]">
              {preserved.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              Changed in the Nepal implementation
            </h3>
            <ul className="mt-4 space-y-2 pl-5 text-sm leading-7 text-[var(--muted-foreground)]">
              {changed.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Why transparency matters here
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            Municipality comparison tools are only useful if users can inspect
            the assumptions behind them. That is why the Nepal rebuild exposes
            score drivers, raw indicator labels, source links, and release
            context directly in the interface.
          </p>
          <p>
            The goal is not to present a single definitive answer for local
            development priorities. The goal is to give users a structured way
            to explore differences, identify questions, and support more
            informed planning conversations.
          </p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Contact and inquiries
        </h2>
        <div className="mt-5 space-y-3 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            For questions about the current Nepal implementation, use the
            methodology and resources pages first so the data model and source
            assumptions are clear.
          </p>
          <p>
            Contact: <a href="mailto:sonle.h96@gmail.com" className="underline">sonle.h96@gmail.com</a>
          </p>
        </div>
      </section>
    </main>
  );
}
