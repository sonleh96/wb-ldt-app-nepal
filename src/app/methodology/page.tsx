import { canonicalLabelMappings, scoreLabelMappings } from "@/lib/data/labels";

const indicatorSelection = [
  "Expert review of municipal development signals relevant to prosperity, livability, and infrastructure.",
  "Practical availability of data that can be processed consistently at municipality scale.",
  "Ability to standardize raw indicators into score-ready series across a historical model.",
  "Relevance to public comparison, map-based inspection, and future update cycles.",
];

const pillars = [
  {
    title: "Prosperity",
    body:
      "Prosperity focuses on economic activity and development intensity. In the current Nepal release, it is represented through nighttime luminosity, built area development, tourism intensity, and agricultural land-related measures.",
    items: [
      "Nighttime luminosity as a proxy for energy use and economic intensity.",
      "Per-capita and per-area luminosity measures for normalized comparison.",
      "Built area development, tourism activity, and agricultural land signals.",
    ],
  },
  {
    title: "Livability",
    body:
      "Livability focuses on the environmental and human-development conditions that shape daily life. In the current release, it is driven directly by indicator scores rather than intermediate dimensions.",
    items: [
      "Air quality conditions.",
      "Emissions and emissions per area.",
      "Deforestation-related change signals.",
    ],
  },
  {
    title: "Infrastructure",
    body:
      "Infrastructure focuses on service availability, connectivity, and physical-system resilience. It combines digital access, service accessibility, and transport climate-risk indicators.",
    items: [
      "Broadband and mobile internet performance.",
      "Key structure internet access and accessibility to health and school services.",
      "Road and railway flood and heatwave risk indicators.",
    ],
  },
];

const satelliteSources = [
  "VIIRS Nighttime Day/Night Band Composites Version 1",
  "ERA5 Hourly Reanalysis",
  "Dynamic World V1",
  "OpenWeatherMaps Air Pollution",
];

const geospatialSources = [
  "GADM 4.1 Level 2 Boundaries",
  "WorldPop New Global 2 Population Data",
  "OpenStreetMap and Openrouteservice",
  "WRI Aqueduct Flood Hazard Maps Version 2",
  "Climate Trace",
];

const processingNotes = [
  "Raster, vector, and point-based inputs are aggregated to municipality level through preprocessing pipelines before the app reads them.",
  "Indicators are normalized where appropriate by population or area so municipalities of different sizes remain comparable.",
  "Indicator values and scores are loaded to Supabase and exposed through a historical-ready data model even though only one year is currently available.",
  "The frontend does not recompute the official score CSV; it reads stored scores and supporting component values directly.",
];

const limitations = {
  data: [
    "Only one historical year is currently loaded in the Nepal release.",
    "Boundary reconciliation is incomplete, so map coverage is limited to the intersection of analytics keys and boundary features.",
    "Some indicators have sparse coverage and should be interpreted carefully when comparing municipalities.",
  ],
  methodological: [
    "Equal-weight aggregation may not reflect every policy priority or local planning preference.",
    "Municipality-level aggregation can hide within-municipality variation.",
    "Cross-source differences in collection methods and resolution can affect comparability.",
  ],
  product: [
    "The public Nepal rebuild currently focuses on analytics and maps rather than AI-assisted recommendations.",
    "The current release is read-only and does not yet include an automated public refresh workflow.",
  ],
};

export default function MethodologyPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pb-16 pt-10 sm:px-8 lg:px-12">
      <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-8 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
          Methodology
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
          Data sources, processing methods, and analytical framework
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-8 text-[var(--muted-foreground)]">
          This page follows the structure of the reference methodology section
          but is rewritten for the Nepal release and the current public
          analytics scope. It explains how municipality-level indicators are
          assembled, standardized, and exposed through the app without carrying
          over Serbia-specific or Western Balkans-specific content.
        </p>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">Overview</h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            The Nepal Local Development Tracker provides a municipality-level
            framework for comparing development conditions across three core
            pillars: Prosperity, Livability, and Infrastructure. The current
            release emphasizes public exploration through maps, scatterplots,
            score drivers, and indicator metadata.
          </p>
          <p>
            The methodology combines geospatial and tabular indicators,
            preprocessing pipelines, canonical label mappings, and a
            Supabase-backed historical data model. The official score CSV is
            treated as authoritative in the app runtime.
          </p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Indicator Selection and Framework
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            The Nepal release uses a pillar-based framework to assess municipal
            development conditions and priorities. Indicators were selected to
            support a practical public analytics product while remaining
            grounded in available municipal-scale data.
          </p>
          <ul className="space-y-2 pl-5">
            {indicatorSelection.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            Unlike the reference app, the Nepal score structure does not use
            intermediate dimensions. Indicators contribute directly to the three
            pillars through their stored component scores.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <article
            key={pillar.title}
            className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-6"
          >
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              {pillar.title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
              {pillar.body}
            </p>
            <ul className="mt-4 space-y-2 pl-5 text-sm leading-7 text-[var(--muted-foreground)]">
              {pillar.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">Data Sources</h2>
        <div className="mt-5 space-y-6 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            The Nepal release integrates multiple public and global data sources
            to support scalable municipality-level analysis. Source links are
            also attached directly to indicators within the application.
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                Satellite and environmental sources
              </h3>
              <ul className="mt-4 space-y-2 pl-5">
                {satelliteSources.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                Geospatial and infrastructure sources
              </h3>
              <ul className="mt-4 space-y-2 pl-5">
                {geospatialSources.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <div className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              Data coverage and resolution
            </h3>
            <ul className="mt-4 space-y-2 pl-5">
              <li>
                Geographic resolution: municipality level across the Nepal
                release.
              </li>
              <li>
                Temporal model: historical-ready, with the current public
                release containing one year.
              </li>
              <li>
                Update model: designed for later automated refreshes after the
                current manual ingestion phase.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Data Processing and Integration
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            Raw raster, vector, and tabular inputs are processed outside the
            frontend before being loaded into Supabase. The app itself is a
            query and visualization layer over already prepared municipality
            data.
          </p>
          <ul className="space-y-2 pl-5">
            {processingNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            Canonical label mappings are applied during ingestion to harmonize
            raw column names with the product-facing indicator labels used
            across charts, metadata panels, and documentation.
          </p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Scoring and Aggregation
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            The current Nepal release follows the official score CSV. Each
            pillar score is an equal-weight arithmetic mean of its component
            indicator scores, with null components skipped where data is
            missing.
          </p>
          <p>
            In practice, that means the app does not infer new weights or apply
            a second scoring model at runtime. It reads stored component scores,
            pillar scores, and supporting municipality context directly from the
            database.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              Admin column standardization
            </h3>
            <div className="mt-4 space-y-3 text-sm text-[var(--muted-foreground)]">
              {canonicalLabelMappings.map((mapping) => (
                <div
                  key={mapping.raw}
                  className="rounded-2xl bg-[var(--accent-soft)]/55 p-4"
                >
                  <p className="font-mono text-xs text-[var(--foreground)]">
                    {mapping.raw}
                  </p>
                  <p className="mt-2">{mapping.canonical}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              Score column standardization
            </h3>
            <div className="mt-4 space-y-3 text-sm text-[var(--muted-foreground)]">
              {scoreLabelMappings.map((mapping) => (
                <div
                  key={mapping.raw}
                  className="rounded-2xl bg-[var(--accent-soft)]/55 p-4"
                >
                  <p className="font-mono text-xs text-[var(--foreground)]">
                    {mapping.raw}
                  </p>
                  <p className="mt-2">{mapping.canonical}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Current Analytical Scope
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            The reference product includes an AI-assisted decision-support
            layer. The Nepal rebuild currently does not expose that workflow.
            This release focuses on public analytics, including map comparison,
            scatter-based municipality comparison, score-driver inspection, and
            source transparency.
          </p>
          <p>
            If an AI-assisted recommendation layer is introduced later, it
            should remain explicitly traceable to the underlying indicator and
            score evidence rather than replacing the analytical views already in
            the app.
          </p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Limitations and Considerations
        </h2>
        <div className="mt-5 grid gap-6 lg:grid-cols-3">
          <article className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              Data limitations
            </h3>
            <ul className="mt-4 space-y-2 pl-5 text-sm leading-7 text-[var(--muted-foreground)]">
              {limitations.data.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              Methodological considerations
            </h3>
            <ul className="mt-4 space-y-2 pl-5 text-sm leading-7 text-[var(--muted-foreground)]">
              {limitations.methodological.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              Product considerations
            </h3>
            <ul className="mt-4 space-y-2 pl-5 text-sm leading-7 text-[var(--muted-foreground)]">
              {limitations.product.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          References and Further Information
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            Indicator descriptions are grounded in the Nepal metadata workbook,
            and source links are surfaced directly in the application’s
            indicator metadata panel. The charting and map views should be read
            as decision-support tools for comparison and prioritization rather
            than as final policy prescriptions.
          </p>
          <p>
            For implementation details, use the resources and release notes
            pages alongside this methodology page.
          </p>
        </div>
      </section>

    </main>
  );
}
