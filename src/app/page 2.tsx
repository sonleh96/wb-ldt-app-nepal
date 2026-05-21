import Link from "next/link";

const capabilities = [
  {
    title: "Multi-score analysis",
    body: "Compare municipalities in 2D and 3D score space, inspect peer positions, and isolate the currently selected municipality against its district context.",
  },
  {
    title: "Single-score analysis",
    body: "Switch the map between pillar scores and individual indicators, then inspect municipality-level score drivers and metadata in one place.",
  },
  {
    title: "Transparent methodology",
    body: "Expose canonical indicator labels, descriptions, source links, and score composition without hiding the current data limitations.",
  },
];

const implementationNotes = [
  "The score CSV is authoritative and is not recomputed inside the app.",
  "The database schema is already historical-capable even though only the 2025 release is loaded now.",
  "Interactive charts are implemented with Plotly and the map layer is delivered through MapLibre.",
  "Current map coverage reflects the reconciled intersection between the analytics CSVs and the boundary geometry set.",
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-[var(--border-soft)] bg-[radial-gradient(circle_at_top,_rgba(17,138,178,0.16),_transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.8),rgba(245,241,232,0.42))]">
        <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
          <span className="inline-flex w-fit rounded-full border border-[var(--border-strong)] bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)] shadow-sm backdrop-blur">
            Nepal Local Development Tracker
          </span>
          <h1 className="mt-8 max-w-5xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            Interactive municipality development analysis for Nepal.
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-8 text-[var(--muted-foreground)] sm:text-lg">
            This rebuild follows the product structure of the reference decision engine while replacing the underlying stack with Next.js, Supabase, Vercel, and MapLibre. The current focus is the public analytics surface: multi-score comparisons, single-score maps, score drivers, and transparent methodology.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/analytics"
              className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)] transition-transform hover:-translate-y-0.5 hover:brightness-95"
            >
              Launch the App
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/75 px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-white"
            >
              Read the Context
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 grid w-full max-w-7xl gap-6 px-6 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
        <article className="rounded-[1.9rem] border border-[var(--border-strong)] bg-white/80 p-7 shadow-[0_18px_45px_rgba(39,62,71,0.08)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Current release
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.4rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Year
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">2025</p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Municipalities
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">757</p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Core pillars
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">3</p>
            </div>
          </div>
        </article>

        <article className="rounded-[1.9rem] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,245,238,0.96))] p-7 shadow-[0_18px_45px_rgba(39,62,71,0.08)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            What this version includes
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {capabilities.map((capability) => (
              <div key={capability.title} className="rounded-[1.35rem] border border-[var(--border-soft)] bg-white/75 p-4">
                <h2 className="text-base font-semibold text-[var(--foreground)]">{capability.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{capability.body}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mx-auto mt-10 mb-16 grid w-full max-w-7xl gap-6 px-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
        <article className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-6 shadow-[0_14px_40px_rgba(39,62,71,0.08)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Implementation notes</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--muted-foreground)]">
            {implementationNotes.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-6 shadow-[0_14px_40px_rgba(39,62,71,0.08)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Suggested reading order</h2>
          <ol className="mt-5 space-y-3 text-sm leading-7 text-[var(--muted-foreground)]">
            <li>1. Start on the analytics route to inspect the municipality views.</li>
            <li>2. Review the methodology page to understand the pillar construction and canonical label mapping.</li>
            <li>3. Use the resources and release notes pages for implementation context and change tracking.</li>
          </ol>
        </article>
      </section>
    </main>
  );
}
