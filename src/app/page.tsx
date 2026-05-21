import { readFile } from "node:fs/promises";
import path from "node:path";

import Image from "next/image";
import Link from "next/link";

import ausLogo from "../../images/aus_logo.webp";
import euLogo from "../../images/eu_logo.webp";
import swissLogo from "../../images/swiss_logo.webp";
import wbLogo from "../../images/wb_logo.webp";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AnalyticsDataset } from "@/types/analytics";

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

type HomeMetrics = {
  municipalityCount: number;
  provinceCount: number;
  provincialPlanCount: number;
  nationalPlanCount: number;
  totalPopulation: number;
  totalAreaKm2: number;
};

async function getHomeMetrics(): Promise<HomeMetrics> {
  const datasetPath = path.join(process.cwd(), "src/generated/analytics-data.json");
  const dataset = JSON.parse(await readFile(datasetPath, "utf8")) as AnalyticsDataset;

  const municipalityCount = dataset.municipalities.length;
  const provinceCount = new Set(
    dataset.municipalities.map((municipality) => municipality.province),
  ).size;
  const totalPopulation = dataset.municipalities.reduce((sum, municipality) => {
    return sum + (municipality.context.population ?? 0);
  }, 0);
  const rawTotalArea = dataset.municipalities.reduce((sum, municipality) => {
    return sum + (municipality.context.totalLandAreaKm2 ?? 0);
  }, 0);
  const totalAreaKm2 = rawTotalArea > 1_000_000 ? rawTotalArea / 1_000_000 : rawTotalArea;

  let provincialPlanCount = 0;
  let nationalPlanCount = 0;

  try {
    const supabase = getSupabaseServerClient().schema("analytics");
    const { data, error } = await supabase
      .from("plan_document_sources")
      .select("plan_level, province")
      .eq("country", "Nepal")
      .eq("source_sheet", "Nepal")
      .eq("is_active", true);

    if (!error) {
      provincialPlanCount = new Set(
        (data ?? [])
          .filter((row) => row.plan_level === "province" && typeof row.province === "string")
          .map((row) => row.province),
      ).size;
      nationalPlanCount = (data ?? []).filter((row) => row.plan_level === "national").length;
    }
  } catch {
    nationalPlanCount = 0;
    provincialPlanCount = 0;
  }

  return {
    municipalityCount,
    provinceCount,
    provincialPlanCount,
    nationalPlanCount,
    totalPopulation,
    totalAreaKm2,
  };
}

export default async function Home() {
  const metrics = await getHomeMetrics();
  const populationLabel = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(metrics.totalPopulation);
  const totalAreaLabel = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(metrics.totalAreaKm2);

  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-[var(--border-soft)] bg-[radial-gradient(circle_at_top,_rgba(17,138,178,0.16),_transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.8),rgba(245,241,232,0.42))]">
        <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
          <span className="inline-flex w-fit rounded-full border border-[var(--border-strong)] bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)] shadow-sm backdrop-blur">
            Local Development Tracker
          </span>
          <h1 className="mt-8 max-w-6xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            Interactive and data-driven Public Investment Management solution for Nepal
          </h1>
          <p className="mt-6 max-w-5xl text-base leading-8 text-[var(--muted-foreground)] sm:text-lg">
            Leveraging geospatial data and advanced analytics to rank municipalities across Nepal, the Local Development Tracker, part of the World Bank&apos;s Geospatial Planning &amp; Budgeting Platform (GPBP), helps policymakers identify communities facing the greatest development challenges. This tool reveals the drivers behind these challenges, enabling informed decisions to promote prosperity, livability, and sustainable infrastructure development where it&apos;s needed most.
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

      <section className="mx-auto mt-14 w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <article className="rounded-[1.9rem] border border-[var(--border-strong)] bg-white/80 p-7 shadow-[0_18px_45px_rgba(39,62,71,0.08)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Current release
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[1.4rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Municipalities
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                {metrics.municipalityCount}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Provinces covered
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                {metrics.provinceCount}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Provincial plans available
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                {metrics.provincialPlanCount}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                National plans available
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                {metrics.nationalPlanCount}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Total population
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                {populationLabel}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Total area
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                {totalAreaLabel} km2
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="mx-auto mt-10 mb-16 w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <article className="rounded-[1.9rem] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,245,238,0.96))] p-7 shadow-[0_18px_45px_rgba(39,62,71,0.08)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            What this version includes
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
