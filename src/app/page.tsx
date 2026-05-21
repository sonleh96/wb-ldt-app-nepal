import Image from "next/image";

import ausLogo from "../../images/aus_logo.webp";
import euLogo from "../../images/eu_logo.webp";
import swissLogo from "../../images/swiss_logo.webp";
import wbLogo from "../../images/wb_logo.webp";
import { CountrySelector } from "@/components/home/country-selector";

const capabilityCards = [
  {
    title: "Multi-score analysis",
    body: "Compare municipalities in 2D and 3D score space, inspect peer positions, and isolate the selected municipality against provincial and national baselines.",
  },
  {
    title: "Single-score analysis",
    body: "Switch the map between pillar scores and indicators, then inspect choropleth coverage, score drivers, and municipality-level context in one workflow.",
  },
  {
    title: "AI planning workflow",
    body: "Generate staged component-score narratives, provincial versus national alignment, SWOT analysis, and public investment recommendations for a selected municipality.",
  },
  {
    title: "Planning evidence and transparency",
    body: "Combine provincial plan sources, a national plan, external web context, methodology references, and release tracking so every result stays inspectable.",
  },
] as const;

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-[var(--border-soft)] bg-[radial-gradient(circle_at_top,var(--hero-glow),transparent_38%),linear-gradient(180deg,var(--hero-wash-start),var(--hero-wash-end))]">
        <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
          <h1 className="mt-8 max-w-6xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            Harness Big Data and AI
            <br />
            to empower Local PIM Decisions
          </h1>
          <div className="mt-6 max-w-5xl space-y-4 text-base leading-8 text-[var(--muted-foreground)] sm:text-lg">
            <p>
              The GPB LDT is designed to help decision-makers at national and sub-national levels
              prioritize measures, including public investment and asset management, to strengthen
              local economic development (LED). The LDT allows for a focus on up to two levels of
              sub-national governments, for example provinces and districts.
            </p>
            <p>
              The GPB LDT enables rapid analysis of key sub-national development indicators across
              the dimensions of Prosperity, Livability, and Infrastructure. The composite measures
              are proxied by the best available big data, ranging from satellite nightlights to
              climate change risk modeling layers.
            </p>
            <p>
              The GPB LDT provides a Generative AI complication and analysis of all available local
              development strategies, and how these benchmark against existing Prosperity,
              Livability, and Infrastructure measures.
            </p>
          </div>
          <CountrySelector />
        </div>
      </section>

      <section className="mx-auto mb-16 w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <article className="rounded-[1.9rem] border border-[var(--border-soft)] bg-[linear-gradient(180deg,var(--panel-gradient-start),var(--panel-gradient-end))] p-7 shadow-[0_18px_45px_var(--surface-shadow)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            What the LDT provides
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {capabilityCards.map((capability) => (
              <div
                key={capability.title}
                className="rounded-[1.35rem] border border-[var(--border-soft)] bg-white/75 p-5"
              >
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                  {capability.title}
                </h2>
                <p className="mt-3 text-base leading-8 text-[var(--muted-foreground)]">
                  {capability.body}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mx-auto mb-16 w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <article className="rounded-[1.9rem] border border-[var(--border-soft)] bg-white/78 p-7 shadow-[0_18px_45px_rgba(39,62,71,0.08)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Implemented by
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex min-h-24 items-center rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] px-5 py-4 shadow-[0_12px_30px_rgba(39,62,71,0.06)]">
              <Image src={wbLogo} alt="The World Bank" className="h-11 w-auto" priority />
            </div>
            <div className="flex min-h-24 items-center rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] px-5 py-4 shadow-[0_12px_30px_rgba(39,62,71,0.06)]">
              <Image src={euLogo} alt="European Union" className="h-11 w-auto" priority />
            </div>
            <div className="flex min-h-24 items-center rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] px-5 py-4 shadow-[0_12px_30px_rgba(39,62,71,0.06)]">
              <Image
                src={ausLogo}
                alt="Australian Government Department of Foreign Affairs and Trade"
                className="h-11 w-auto"
                priority
              />
            </div>
            <div className="flex min-h-24 items-center rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] px-5 py-4 shadow-[0_12px_30px_rgba(39,62,71,0.06)]">
              <Image src={swissLogo} alt="Swiss Confederation" className="h-11 w-auto" priority />
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
