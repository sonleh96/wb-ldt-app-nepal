import Image from "next/image";

import pilDiagram from "../../../images/PIL Diagram.png";
import { canonicalLabelMappings, scoreLabelMappings } from "@/lib/data/labels";

const indicatorSelection = [
  "Relevance to local development outcomes that can inform public investment and planning dialogue.",
  "Availability at a subnational scale that can be harmonized across countries and administrative systems.",
  "Ability to convert raw measures into comparable 0-100 score series with transparent interpretation.",
  "Coverage across the Prosperity, Infrastructure, and Livability dimensions of the PIL framework.",
];

const pillars = [
  {
    title: "Prosperity",
    body:
      "Prosperity captures local economic activity, productive intensity, and development opportunity. In the current country releases, it draws heavily on nighttime luminosity, built-area development, tourism activity, and agriculture-related land signals where available.",
    items: [
      "Nighttime luminosity as a proxy for economic intensity and access to electricity-enabled activity.",
      "Population- and area-normalized measures so dense urban centers and smaller local units can be compared more fairly.",
      "Country-specific economic signals, such as tourism or agricultural land indicators, where they can be processed consistently.",
    ],
  },
  {
    title: "Infrastructure",
    body:
      "Infrastructure measures the availability, reach, and resilience of systems that support local service delivery and connectivity. It combines digital access, service accessibility, transport networks, and climate-risk exposure where those data are available.",
    items: [
      "Broadband and mobile internet performance.",
      "Accessibility to schools, health facilities, and key local services.",
      "Road and railway exposure to flood, heat, and other climate-related hazards.",
    ],
  },
  {
    title: "Livability",
    body:
      "Livability reflects environmental and human-development conditions that shape daily life. The indicator set differs by country data availability, but it is designed to make environmental stress and quality-of-life signals visible at local scale.",
    items: [
      "Air quality and emissions indicators.",
      "Land-cover, deforestation, or green-space signals where available.",
      "Human-development access indicators that complement infrastructure and prosperity scores.",
    ],
  },
];

const dataSources = [
  {
    title: "Satellite and environmental data",
    items: [
      "VIIRS nighttime lights for luminosity-based economic activity measures.",
      "ERA5, OpenWeatherMaps, Climate Trace, and related climate or environmental datasets.",
      "Dynamic World and other land-cover products for built-area, vegetation, and land-use signals.",
    ],
  },
  {
    title: "Geospatial and infrastructure data",
    items: [
      "Administrative boundary files aligned to the relevant local-government tiers for each country.",
      "WorldPop and other gridded population sources for population aggregation and normalization.",
      "OpenStreetMap, Openrouteservice, WRI Aqueduct, and related spatial datasets for accessibility, transport, and risk measures.",
    ],
  },
  {
    title: "Official and planning sources",
    items: [
      "National development plans, local strategies, budgets, and other planning documents where source links are available.",
      "Official country data, partner data, and validated administrative references used to interpret local conditions.",
      "Indicator metadata that records source provenance and interpretation notes for user review.",
    ],
  },
];

const preprocessingSteps = [
  {
    title: "Boundary reconciliation",
    body:
      "Administrative names, identifiers, and geometries are harmonized so indicator tables, map boundaries, and planning-document records refer to the same local units.",
  },
  {
    title: "Spatial aggregation",
    body:
      "Raster, vector, network, and point datasets are aggregated to the relevant local-government level. Raster values are summarized within boundaries; point and network features are spatially joined or measured by coverage, access, or exposure.",
  },
  {
    title: "Normalization",
    body:
      "Indicators are normalized by population, area, or another appropriate denominator when raw totals would otherwise favor larger local units.",
  },
  {
    title: "Temporal alignment",
    body:
      "Input data are assigned to annual releases where possible. When countries have multi-year releases, the same local-unit keys are preserved so users can compare trends over time.",
  },
];

const scoringSteps = [
  "Raw indicator values are transformed into comparable score values on a 0-100 scale, where higher values represent stronger relative performance for that indicator unless explicitly documented otherwise.",
  "Component scores are grouped under Prosperity, Infrastructure, and Livability according to the PIL framework.",
  "Pillar scores use transparent equal-weight aggregation across available component scores unless a country-specific methodology states otherwise.",
  "Missing component values are not imputed inside the public app; they are skipped in aggregation where the prepared score tables identify them as missing.",
  "Published score tables are treated as the authoritative score source for maps, scatterplots, driver charts, and country landing-page summaries.",
];

const limitations = [
  {
    title: "Data coverage",
    items: [
      "Not every indicator is available for every country, year, or local unit.",
      "Open geospatial sources can be incomplete or unevenly updated across territories.",
      "Planning-document coverage depends on whether source links are available and machine-readable.",
    ],
  },
  {
    title: "Spatial interpretation",
    items: [
      "Local-government averages can hide neighborhood-level variation.",
      "Boundary changes, naming differences, and language differences can affect matching quality.",
      "Maps and scores should be read as screening evidence, not as a substitute for project appraisal.",
    ],
  },
  {
    title: "Scoring interpretation",
    items: [
      "Equal weighting is transparent, but it may not reflect every sector priority or local policy preference.",
      "A high score does not automatically mean a local unit has no investment needs; it indicates relative standing within the release.",
      "Score results should be validated against local knowledge, sector diagnostics, and official planning processes.",
    ],
  },
];

export default function MethodologyPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pb-16 pt-10 sm:px-8 lg:px-12">
      <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-8 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
          Methodology
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
          Indicator logic, data processing, and score calculation
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-8 text-[var(--muted-foreground)]">
          The Local Development Tracker turns geospatial, environmental, infrastructure,
          and planning data into comparable local-government indicators. This page explains
          how indicators are selected, processed, normalized, and aggregated into the
          Prosperity, Infrastructure, and Livability scores used throughout the app.
        </p>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">Overview</h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            The methodology is designed for country replication. Each country keeps its own
            administrative labels and planning context, while the analytical logic stays
            consistent: collect local indicators, harmonize them to the relevant subnational
            units, convert them into comparable scores, and expose the results for maps,
            scatterplots, driver analysis, and planning review.
          </p>
          <p>
            The framework is intentionally transparent. Users should be able to see the
            indicator source, understand how raw data becomes a score, and interpret the
            result as screening evidence for further validation.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Analytical architecture
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
          PIL framework diagram
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-8 text-[var(--muted-foreground)]">
          The PIL framework organizes local development evidence around Prosperity,
          Infrastructure, and Livability. The diagram shows how indicator evidence can
          be connected to planning interpretation and investment prioritization.
        </p>
        <div className="mt-6 rounded-[1.25rem] border border-[var(--border-soft)] bg-white p-4">
          <Image
            src={pilDiagram}
            alt="PIL framework diagram linking local development indicators to planning and investment logic"
            className="h-auto w-full rounded-[1rem]"
            priority
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Indicator Selection Logic
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            Indicators are selected to balance policy relevance with practical data coverage.
            The aim is not to include every possible local development measure, but to build
            a coherent evidence base that can be maintained and compared across local units.
          </p>
          <ul className="space-y-2 pl-5">
            {indicatorSelection.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">Data Acquisition</h2>
        <p className="mt-5 max-w-4xl text-sm leading-8 text-[var(--muted-foreground)]">
          The LDT combines scalable global datasets with country-specific sources where
          available. Each source is selected for its relevance to local development, spatial
          coverage, and ability to be processed into local-government units.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {dataSources.map((sourceGroup) => (
            <article
              key={sourceGroup.title}
              className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5"
            >
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                {sourceGroup.title}
              </h3>
              <ul className="mt-4 space-y-2 pl-5 text-sm leading-7 text-[var(--muted-foreground)]">
                {sourceGroup.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Preprocessing and Integration
        </h2>
        <p className="mt-5 max-w-4xl text-sm leading-8 text-[var(--muted-foreground)]">
          Raw data are prepared before they are exposed in the app. The preprocessing
          pipeline converts heterogeneous input formats into consistent local-unit records
          that can be compared, mapped, and summarized.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {preprocessingSteps.map((step) => (
            <article
              key={step.title}
              className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5"
            >
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                {step.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Score Calculation and Aggregation
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            Score calculation follows a simple interpretation rule: local units are compared
            against other local units in the same release, and higher scores indicate stronger
            relative performance for the selected indicator or pillar unless the metadata says
            otherwise.
          </p>
          <ul className="space-y-2 pl-5">
            {scoringSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              Administrative field standardization
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
              Score field standardization
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
          Limitations and Interpretation
        </h2>
        <div className="mt-5 grid gap-6 lg:grid-cols-3">
          {limitations.map((limitation) => (
            <article
              key={limitation.title}
              className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5"
            >
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                {limitation.title}
              </h3>
              <ul className="mt-4 space-y-2 pl-5 text-sm leading-7 text-[var(--muted-foreground)]">
                {limitation.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          References and Further Information
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            Indicator descriptions, source references, and interpretation notes are surfaced
            through the indicator metadata views in the analytics workspace. Users should read
            charts and scores as decision-support evidence for discussion, validation, and
            prioritization rather than as final project-selection decisions.
          </p>
        </div>
      </section>
    </main>
  );
}
