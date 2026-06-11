import { readFile } from "node:fs/promises";
import path from "node:path";

import Link from "next/link";

import {
  buildCountryHomeModel,
  type CountryHomeGroup,
} from "@/lib/country-home";
import type { Country } from "@/lib/countries";
import type { AnalyticsDataset } from "@/types/analytics";

const PREVIEW_UNIT_COUNT = 6;

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

function AdminGroupCard({
  group,
  lowerPlural,
}: {
  group: CountryHomeGroup;
  lowerPlural: string;
}) {
  const previewUnits = group.lowerUnits.slice(0, PREVIEW_UNIT_COUNT);
  const remainingUnits = group.lowerUnits.slice(PREVIEW_UNIT_COUNT);
  const lowerPluralLabel = lowerFirst(lowerPlural);

  return (
    <section className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
      <div className="flex flex-col gap-3 border-b border-[var(--border-soft)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            {group.name}
          </h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            {group.lowerUnits.length} {lowerPluralLabel}
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          Data loaded
        </span>
      </div>

      <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
        {previewUnits.map((unitName, index) => (
          <div
            key={unitListKey(group.name, unitName, index)}
            className="flex items-start gap-3"
          >
            <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
            <span className="text-sm leading-6 text-[var(--foreground)]">
              {unitName}
            </span>
          </div>
        ))}
      </div>

      {remainingUnits.length > 0 ? (
        <details className="mt-5 rounded-[1.2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4">
          <summary className="cursor-pointer list-none text-sm font-medium text-[var(--foreground)] marker:hidden">
            Show {remainingUnits.length} more {lowerPluralLabel}
          </summary>
          <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
            {remainingUnits.map((unitName, index) => (
              <div
                key={unitListKey(group.name, unitName, index + PREVIEW_UNIT_COUNT)}
                className="flex items-start gap-3"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                <span className="text-sm leading-6 text-[var(--foreground)]">
                  {unitName}
                </span>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}

export async function CountryLandingPage({ country }: { country: Country }) {
  const dataset = await loadCountryDataset(country);
  const model = buildCountryHomeModel(country, dataset);
  const lowerSingular = country.adminLabels.lower.singular;
  const lowerPlural = country.adminLabels.lower.plural;
  const higherSingular = country.adminLabels.higher.singular;
  const higherPlural = country.adminLabels.higher.plural;
  const lowerSingularLabel = lowerFirst(lowerSingular);
  const lowerPluralLabel = lowerFirst(lowerPlural);
  const higherPluralLabel = lowerFirst(higherPlural);

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
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href={`/${country.slug}/analytics`}
              className="inline-flex min-h-[58px] items-center justify-center rounded-full bg-[var(--accent)] px-8 py-4 text-base font-medium text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)] transition-transform hover:-translate-y-0.5 hover:brightness-95 sm:min-w-[12rem]"
            >
              <span className="flex flex-col items-center leading-tight">
                <span>Analyze {lowerSingularLabel}</span>
                <span>metrics</span>
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[58px] items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-8 py-4 text-base font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-strong)] sm:min-w-[12rem]"
            >
              Compare countries
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

          <div className="mt-8 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Local planning documents
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
              {country.planningDocuments.message}
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
              {higherSingular} coverage
            </h3>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-[var(--muted-foreground)]">
              Each {higherSingular.toLowerCase()} below lists the loaded{" "}
              {lowerPluralLabel} that can be explored in the analytics workspace.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {model.groups.map((group) => (
              <AdminGroupCard
                key={group.name}
                group={group}
                lowerPlural={lowerPlural}
              />
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
