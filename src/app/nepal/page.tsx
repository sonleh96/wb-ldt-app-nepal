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

type ProvinceMunicipalityGroup = {
  province: string;
  hasProvincePlan: boolean;
  municipalities: string[];
};

type NepalHomeData = {
  metrics: HomeMetrics;
  provinceGroups: ProvinceMunicipalityGroup[];
};

const PREVIEW_MUNICIPALITY_COUNT = 6;

function normalizeProvinceName(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z]/g, "");

  if (normalized === "sudurpashchim" || normalized === "sudurpaschim") {
    return "sudurpaschim";
  }

  return normalized;
}

function StatusBadge({
  available,
  label,
}: {
  available: boolean;
  label: string;
}) {
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-md border text-xs font-semibold ${
        available
          ? "border-[#2b8a3e]/50 bg-[#2b8a3e]/15 text-[#62d77a]"
          : "border-[#d14b4b]/50 bg-[#d14b4b]/12 text-[#ff8a8a]"
      }`}
      aria-label={label}
      title={label}
    >
      {available ? "✓" : "X"}
    </span>
  );
}

async function getNepalHomeData(): Promise<NepalHomeData> {
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
  const provincePlans = new Set<string>();

  try {
    const supabase = getSupabaseServerClient().schema("analytics");
    const { data, error } = await supabase
      .from("plan_document_sources")
      .select("plan_level, province")
      .eq("country", "Nepal")
      .eq("source_sheet", "Nepal")
      .eq("is_active", true);

    if (!error) {
      for (const row of data ?? []) {
        if (row.plan_level === "province" && typeof row.province === "string") {
          provincePlans.add(normalizeProvinceName(row.province));
        }
      }

      provincialPlanCount = provincePlans.size;
      nationalPlanCount = (data ?? []).filter((row) => row.plan_level === "national").length;
    }
  } catch {
    nationalPlanCount = 0;
    provincialPlanCount = 0;
  }

  const groupedMunicipalities = new Map<string, string[]>();

  for (const municipality of dataset.municipalities) {
    const existing = groupedMunicipalities.get(municipality.province) ?? [];
    existing.push(municipality.municipality);
    groupedMunicipalities.set(municipality.province, existing);
  }

  const provinceGroups = Array.from(groupedMunicipalities.entries())
    .map(([province, municipalities]) => ({
      province,
      hasProvincePlan: provincePlans.has(normalizeProvinceName(province)),
      municipalities: municipalities.sort((left, right) => left.localeCompare(right)),
    }))
    .sort((left, right) => left.province.localeCompare(right.province));

  return {
    metrics: {
      municipalityCount,
      provinceCount,
      provincialPlanCount,
      nationalPlanCount,
      totalPopulation,
      totalAreaKm2,
    },
    provinceGroups,
  };
}

export default async function NepalHome() {
  const { metrics, provinceGroups } = await getNepalHomeData();
  const populationLabel = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(metrics.totalPopulation);
  const totalAreaLabel = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(metrics.totalAreaKm2);

  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-[var(--border-soft)] bg-[radial-gradient(circle_at_top,var(--hero-glow),transparent_38%),linear-gradient(180deg,var(--hero-wash-start),var(--hero-wash-end))]">
        <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
          <h1 className="mt-6 max-w-6xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-[3.4rem]">
            Explore Local Economic Development in Nepal
          </h1>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/analytics"
              className="inline-flex min-h-[58px] items-center justify-center rounded-full bg-[var(--accent)] px-8 py-4 text-base font-medium text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)] transition-transform hover:-translate-y-0.5 hover:brightness-95 sm:min-w-[12rem]"
            >
              <span className="flex flex-col items-center leading-tight">
                <span>Local Development</span>
                <span>Deep Dive</span>
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[58px] items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-8 py-4 text-base font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-strong)] sm:min-w-[12rem]"
            >
              Back to Country Portal
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <article className="rounded-[1.9rem] border border-[var(--border-strong)] bg-white/80 p-7 shadow-[0_18px_45px_rgba(39,62,71,0.08)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Country snapshot
          </p>
          <div className="mt-5 grid gap-4 xl:grid-cols-3">
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
            <div className="rounded-[1.4rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                National development plan
              </p>
              <a
                href="http://elibrary.moest.gov.np/bitstream/123456789/308/1/16.pdf"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-2xl font-semibold text-[var(--foreground)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:text-[var(--accent)]"
              >
                Available | 2024-2028
              </a>
            </div>
          </div>
        </article>
      </section>

      <section className="mx-auto mt-10 mb-16 w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <article className="rounded-[1.9rem] border border-[var(--border-strong)] bg-white/80 p-7 shadow-[0_18px_45px_rgba(39,62,71,0.08)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Administrative levels
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Provinces and Municipalities
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--muted-foreground)]">
            Nepal adopted a three-tiered federal system under its 2015 Constitution,
            replacing a centralized unitary state. The system is designed to decentralize
            power, promote inclusive representation, and distribute resources across three
            levels of government: Federal, Provincial, and Local. The LDT focuses on the
            latter two levels. <strong>There are, currently, 7 provinces and 753 municipalities.</strong>
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <div className="flex items-center gap-3 text-[var(--foreground)]">
              <StatusBadge
                available={true}
                label="Development Plan available"
              />
              <span>Development Plan available</span>
            </div>
            <div className="flex items-center gap-3 text-[var(--foreground)]">
              <StatusBadge
                available={false}
                label="Development Plan not available"
              />
              <span>Development Plan not available</span>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {provinceGroups.map((group) => (
              (() => {
                const previewMunicipalities = group.municipalities.slice(0, PREVIEW_MUNICIPALITY_COUNT);
                const remainingMunicipalities = group.municipalities.slice(PREVIEW_MUNICIPALITY_COUNT);

                return (
                  <section
                    key={group.province}
                    className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5"
                  >
                    <div className="flex flex-col gap-3 border-b border-[var(--border-soft)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <StatusBadge
                          available={group.hasProvincePlan}
                          label={
                            group.hasProvincePlan
                              ? `${group.province} has an available provincial development plan`
                              : `${group.province} does not have an available provincial development plan`
                          }
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--foreground)]">
                            {group.province}
                          </h3>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {group.municipalities.length} municipalities
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
                      {previewMunicipalities.map((municipality) => (
                        <div key={`${group.province}-${municipality}`} className="flex items-start gap-3">
                          <StatusBadge
                            available={false}
                            label={`${municipality} does not have an available local development plan in the current source table`}
                          />
                          <span className="text-sm leading-6 text-[var(--foreground)]">
                            {municipality}
                          </span>
                        </div>
                      ))}
                    </div>

                    {remainingMunicipalities.length > 0 ? (
                      <details className="mt-5 rounded-[1.2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4">
                        <summary className="cursor-pointer list-none text-sm font-medium text-[var(--foreground)] marker:hidden">
                          Show {remainingMunicipalities.length} more municipalities
                        </summary>
                        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
                          {remainingMunicipalities.map((municipality) => (
                            <div key={`${group.province}-${municipality}`} className="flex items-start gap-3">
                              <StatusBadge
                                available={false}
                                label={`${municipality} does not have an available local development plan in the current source table`}
                              />
                              <span className="text-sm leading-6 text-[var(--foreground)]">
                                {municipality}
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </section>
                );
              })()
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
