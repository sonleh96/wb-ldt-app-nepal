import { readFile } from "node:fs/promises";
import path from "node:path";

import Link from "next/link";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AnalyticsDataset } from "@/types/analytics";

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

export default async function NepalHome() {
  const metrics = await getHomeMetrics();
  const populationLabel = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(metrics.totalPopulation);
  const totalAreaLabel = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(metrics.totalAreaKm2);

  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-[var(--border-soft)] bg-[radial-gradient(circle_at_top,var(--hero-glow),transparent_38%),linear-gradient(180deg,var(--hero-wash-start),var(--hero-wash-end))]">
        <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
          <h1 className="mt-8 max-w-6xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            Explore Local Infrastructure and Institutional Development in Nepal
          </h1>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/analytics"
              className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)] transition-transform hover:-translate-y-0.5 hover:brightness-95"
            >
              Country Deepdive
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-strong)]"
            >
              Country Portal
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
    </main>
  );
}
