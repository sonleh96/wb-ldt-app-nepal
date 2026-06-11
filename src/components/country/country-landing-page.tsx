import { readFile } from "node:fs/promises";
import path from "node:path";

import Link from "next/link";

import {
  SngDisplaySection,
  type SngDisplayRow,
} from "@/components/nepal/sng-display-section";
import {
  buildCountryHomeModel,
  type CountryHomeGroup,
} from "@/lib/country-home";
import { getCountryLandingActions } from "@/lib/country-landing-actions";
import type { Country } from "@/lib/countries";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AnalyticsDataset } from "@/types/analytics";
import type { MunicipalityRecord } from "@/types/analytics";

const PREVIEW_UNIT_COUNT = 6;

type LocalPlanSource = {
  planUnitName: string;
  title: string;
  link: string;
};

type LocalPlanSourceRow = {
  province: string | null;
  title: string;
  link: string;
};

function lowerFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function unitListKey(groupName: string, unitName: string, index: number) {
  return `${groupName.toLowerCase()}-${unitName.toLowerCase()}-${index}`;
}

async function loadCountryDataset(country: Country) {
  const datasetPath = path.join(process.cwd(), country.fallbackDataPath);
  const raw = await readFile(datasetPath, "utf8");
  return JSON.parse(raw) as AnalyticsDataset;
}

function normalizePlanKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function latestRows(dataset: AnalyticsDataset) {
  const latestYear = Math.max(dataset.release.year, ...dataset.years);
  const rows = dataset.municipalities.filter((municipality) => municipality.year === latestYear);

  return rows.length > 0 ? rows : dataset.municipalities;
}

function averageScore(values: Array<number | null | undefined>) {
  const numericValues = values.filter((value): value is number => Number.isFinite(value));

  if (numericValues.length === 0) {
    return null;
  }

  const total = numericValues.reduce((sum, value) => sum + value, 0);
  return Number((total / numericValues.length).toFixed(2));
}

function getPlanUnitName(country: Country, row: MunicipalityRecord) {
  return country.planningDocuments.planSourceAdminLevel === "lower"
    ? row.municipality
    : row.province;
}

async function loadLocalPlanSources(country: Country): Promise<LocalPlanSource[]> {
  try {
    const supabase = getSupabaseServerClient().schema("analytics");
    const { data, error } = await supabase
      .from("plan_document_sources")
      .select("province, title, link")
      .eq("country_code", country.code)
      .eq("plan_level", "province")
      .eq("is_active", true)
      .order("province", { ascending: true })
      .order("priority", { ascending: true });

    if (error) {
      return [];
    }

    const seen = new Set<string>();
    const sources: LocalPlanSource[] = [];

    for (const row of (data ?? []) as LocalPlanSourceRow[]) {
      if (!row.province || !row.link) {
        continue;
      }

      const key = normalizePlanKey(row.province);
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      sources.push({
        planUnitName: row.province,
        title: row.title,
        link: row.link,
      });
    }

    return sources;
  } catch {
    return [];
  }
}

function buildPlanSourceMap(sources: LocalPlanSource[]) {
  return new Map(sources.map((source) => [normalizePlanKey(source.planUnitName), source]));
}

function buildSngRows(
  country: Country,
  dataset: AnalyticsDataset,
  planSourcesByUnit: Map<string, LocalPlanSource>,
): SngDisplayRow[] {
  return latestRows(dataset)
    .map((row) => {
      const planUnitName = getPlanUnitName(country, row);
      const planSource = planSourcesByUnit.get(normalizePlanKey(planUnitName)) ?? null;
      const infrastructureScore = row.scores.infrastructure_score ?? null;
      const livabilityScore = row.scores.livability_score ?? null;
      const prosperityScore = row.scores.prosperity_score ?? null;

      return {
        rowKey: `${country.code}-${row.compositeKey}`,
        municipality: row.municipality,
        province: row.province,
        population: row.context.population,
        totalLandAreaKm2: row.context.totalLandAreaKm2,
        infrastructureScore,
        livabilityScore,
        prosperityScore,
        pilAggregate: averageScore([
          infrastructureScore,
          livabilityScore,
          prosperityScore,
        ]),
        hasDevelopmentStrategy: Boolean(planSource),
        strategyLevel: planSource
          ? country.planningDocuments.planSourceAdminLevel === "lower"
            ? country.adminLabels.lower.singular
            : country.adminLabels.higher.singular
          : null,
        link: planSource?.link ?? null,
      };
    })
    .sort((left, right) => left.municipality.localeCompare(right.municipality));
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
      className={`inline-flex h-6 min-w-8 items-center justify-center rounded-md border px-1.5 text-[10px] font-semibold uppercase ${
        available
          ? "border-[#2b8a3e]/50 bg-[#2b8a3e]/15 text-[#2b8a3e]"
          : "border-[#d14b4b]/50 bg-[#d14b4b]/12 text-[#b42318]"
      }`}
      aria-label={label}
      title={label}
    >
      {available ? "Yes" : "No"}
    </span>
  );
}

function AdminGroupCard({
  group,
  lowerPlural,
  lowerSingular,
  planSourcesByUnit,
  planSourceAdminLevel,
}: {
  group: CountryHomeGroup;
  lowerPlural: string;
  lowerSingular: string;
  planSourcesByUnit: Map<string, LocalPlanSource>;
  planSourceAdminLevel: Country["planningDocuments"]["planSourceAdminLevel"];
}) {
  const previewUnits = group.lowerUnits.slice(0, PREVIEW_UNIT_COUNT);
  const remainingUnits = group.lowerUnits.slice(PREVIEW_UNIT_COUNT);
  const lowerPluralLabel = lowerFirst(lowerPlural);
  const sourceCount =
    planSourceAdminLevel === "higher"
      ? Number(planSourcesByUnit.has(normalizePlanKey(group.name)))
      : group.lowerUnits.filter((unitName) => planSourcesByUnit.has(normalizePlanKey(unitName))).length;
  const groupHasPlanSource = sourceCount > 0;
  const groupStatusLabel =
    planSourceAdminLevel === "higher"
      ? groupHasPlanSource
        ? `${group.name} has an available plan source`
        : `${group.name} does not have an available plan source`
      : `${sourceCount} of ${group.lowerUnits.length} ${lowerPluralLabel} have available local/SNG plan sources`;

  function renderUnit(unitName: string, index: number) {
    const source = planSourcesByUnit.get(normalizePlanKey(unitName));
    const statusLabel = source
      ? `${unitName} has an available local/SNG plan source`
      : `${unitName} does not have an available local/SNG plan source`;

    return (
      <div
        key={unitListKey(group.name, unitName, index)}
        className="flex items-start gap-3"
      >
        <StatusBadge available={Boolean(source)} label={statusLabel} />
        {source ? (
          <a
            href={source.link}
            target="_blank"
            rel="noreferrer"
            className="text-sm leading-6 text-[var(--foreground)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:text-[var(--accent)]"
          >
            {unitName}
          </a>
        ) : (
          <span className="text-sm leading-6 text-[var(--foreground)]">
            {unitName}
          </span>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
      <div className="flex flex-col gap-3 border-b border-[var(--border-soft)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge available={groupHasPlanSource} label={groupStatusLabel} />
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              {group.name}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {group.lowerUnits.length} {lowerPluralLabel}
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          {planSourceAdminLevel === "higher"
            ? groupHasPlanSource
              ? "Plan source loaded"
              : "Plan source missing"
            : `${sourceCount} / ${group.lowerUnits.length} ${lowerSingular.toLowerCase()} plans`}
        </span>
      </div>

      <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
        {previewUnits.map(renderUnit)}
      </div>

      {remainingUnits.length > 0 ? (
        <details className="mt-5 rounded-[1.2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4">
          <summary className="cursor-pointer list-none text-sm font-medium text-[var(--foreground)] marker:hidden">
            Show {remainingUnits.length} more {lowerPluralLabel}
          </summary>
          <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
            {remainingUnits.map((unitName, index) =>
              renderUnit(unitName, index + PREVIEW_UNIT_COUNT),
            )}
          </div>
        </details>
      ) : null}
    </section>
  );
}

export async function CountryLandingPage({ country }: { country: Country }) {
  const dataset = await loadCountryDataset(country);
  const localPlanSources = await loadLocalPlanSources(country);
  const planSourcesByUnit = buildPlanSourceMap(localPlanSources);
  const sngRows = buildSngRows(country, dataset, planSourcesByUnit);
  const model = buildCountryHomeModel(country, dataset);
  const lowerSingular = country.adminLabels.lower.singular;
  const lowerPlural = country.adminLabels.lower.plural;
  const higherSingular = country.adminLabels.higher.singular;
  const higherPlural = country.adminLabels.higher.plural;
  const lowerSingularLabel = lowerFirst(lowerSingular);
  const lowerPluralLabel = lowerFirst(lowerPlural);
  const higherPluralLabel = lowerFirst(higherPlural);
  const actions = getCountryLandingActions(country);
  const leftActions = actions.filter((action) => action.align === "left");
  const rightActions = actions.filter((action) => action.align === "right");

  function actionClassName(variant: "primary" | "secondary") {
    const baseClassName =
      "inline-flex min-h-[58px] items-center justify-center rounded-full px-8 py-4 text-base font-medium transition-colors sm:min-w-[12rem]";

    return variant === "primary"
      ? `${baseClassName} bg-[var(--accent)] text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)] transition-transform hover:-translate-y-0.5 hover:brightness-95`
      : `${baseClassName} border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-strong)]`;
  }

  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-[var(--border-soft)] bg-[radial-gradient(circle_at_top,var(--hero-glow),transparent_38%),linear-gradient(180deg,var(--hero-wash-start),var(--hero-wash-end))]">
        <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
          <h1 className="mt-6 max-w-6xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-[3.4rem]">
            {country.name} subnational analytics for local economic development
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-8 text-[var(--muted-foreground)] sm:text-lg">
            Review {higherPluralLabel} and {lowerPluralLabel} coverage, compare
            population and PIL indicators, and trace which planning documents are
            available for analysis.
          </p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-4 sm:flex-row">
              {leftActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={actionClassName(action.variant)}
                >
                  {action.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-4 sm:ml-auto sm:flex-row">
              {rightActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={actionClassName(action.variant)}
                >
                  {action.label}
                </Link>
              ))}
            </div>
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
                Population covered
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                {model.populationLabel}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Land area covered
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                {model.areaLabel}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                National development plan
              </p>
              <a
                href={country.profile.strategy.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-2xl font-semibold text-[var(--foreground)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:text-[var(--accent)]"
              >
                {country.profile.strategy.title}
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
            {higherPlural} and {lowerPlural}
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--muted-foreground)]">
            This country entry point focuses on the subnational tiers used in the
            LDT: {model.higherCount} {higherPluralLabel} and {model.lowerCount}{" "}
            {lowerPluralLabel} in the {model.latestYear} release.
          </p>

          <SngDisplaySection
            rows={sngRows}
            labels={{
              lowerSingular,
              lowerPlural,
              higherSingular,
              higherPlural,
              csvFileName: `${country.slug}-sng-${lowerSingularLabel}-metrics.csv`,
            }}
          />

          <div className="mt-8">
            <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
              Development plan source availability
            </h3>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-[var(--muted-foreground)]">
              {country.planningDocuments.message} This section tracks which{" "}
              {country.planningDocuments.planSourceAdminLevel === "lower"
                ? lowerPluralLabel
                : higherPluralLabel}{" "}
              currently have local/SNG plan links available for AI-assisted analysis.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <div className="flex items-center gap-3 text-[var(--foreground)]">
              <StatusBadge
                available={true}
                label="Development plan source available"
              />
              <span>Plan source available</span>
            </div>
            <div className="flex items-center gap-3 text-[var(--foreground)]">
              <StatusBadge
                available={false}
                label="Development plan source not available"
              />
              <span>Plan source not available</span>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {model.groups.map((group) => (
              <AdminGroupCard
                key={group.name}
                group={group}
                lowerPlural={lowerPlural}
                lowerSingular={lowerSingular}
                planSourcesByUnit={planSourcesByUnit}
                planSourceAdminLevel={country.planningDocuments.planSourceAdminLevel}
              />
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
