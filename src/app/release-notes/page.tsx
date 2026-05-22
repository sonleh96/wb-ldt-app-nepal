const releases = [
  {
    version: "Release v1.3",
    date: "May 21, 2026",
    notes: [
      "Home page reworked into a country portal with a selector-based entry flow for multiple countries, with under-construction routes for non-live countries.",
      "Header branding, country landing pages, and supporting content shells were simplified to match the new portal structure and cleaner navigation model.",
      "Country landing-page copy and CTAs were tightened so each entry page emphasizes the deep-dive path and summary content.",
      "Persistent dark mode was added across the app, including themed analytics charts, improved tooltip contrast, and hydration-safe theme initialization.",
    ],
  },
  {
    version: "Release v1.2",
    date: "May 21, 2026",
    notes: [
      "AI planning workflow refined with cleaner web-context output, denser alignment bullets, and full-width implementation-risk sections in recommendation cards.",
      "Step 1 AI analysis now plots actual 0-100 component scores instead of raw indicator values, with chart ranges fixed to score semantics.",
      "Web-search result presentation simplified so the UI keeps only the summary and source list instead of rendering per-source cards.",
      "Analytics UI wording and controls tightened, including shorter action labels and cleaned-up helper text in the AI tab.",
    ],
  },
  {
    version: "Release v1.1",
    date: "May 20, 2026",
    notes: [
      "Staged AI workflow added for indicator narrative, provincial plan context, national plan context, web context, alignment, SWOT, and investment recommendations.",
      "Document parsing and AI stage caching wired into Supabase-backed server routes for repeatable municipality analysis.",
      "Result renderers added for structured alignment, SWOT, recommendations, and web-context views on the analytics route.",
      "Release notes, methodology, and supporting content pages aligned with the expanded analytics-plus-AI product shape.",
    ],
  },
  {
    version: "Release v1.0",
    date: "May 18, 2026",
    notes: [
      "Reference-style route structure restored with Home, Launch App, Methodology, Release Notes, and About pages.",
      "Interactive Plotly 2D and 3D scatterplots added with hover, zoom, click selection, and axis labels.",
      "MapLibre choropleth shipped as the default municipality map view.",
      "Supabase-backed score, component, municipality context, and analytics query layers completed for the public app.",
    ],
  },
];

export default function ReleaseNotesPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 pb-16 pt-10 sm:px-8 lg:px-12">
      <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-8 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Release notes</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
          Application milestones
        </h1>
      </section>

      <section className="space-y-6">
        {releases.map((release) => (
          <article key={release.version} className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">{release.version}</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{release.date}</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted-foreground)]">
              {release.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
