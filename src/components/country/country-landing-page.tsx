import Link from "next/link";

import { CountryContextPanel } from "@/components/country/country-context-panel";
import { CountryDetailLoader } from "@/components/country/country-detail-loader";
import { buildCountryHomeModel } from "@/lib/country-home";
import { getCountryLandingActions } from "@/lib/country-landing-actions";
import { loadCountryDataset } from "@/lib/country-landing-data";
import { getPlanAvailabilityDisclosure } from "@/lib/country-plan-availability";
import type { Country } from "@/lib/countries";

function lowerFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
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
  const actions = getCountryLandingActions(country);
  const leftActions = actions.filter((action) => action.align === "left");
  const rightActions = actions.filter((action) => action.align === "right");
  const planAvailabilityDisclosure = getPlanAvailabilityDisclosure(country);

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

      <CountryContextPanel country={country} />

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

          <CountryDetailLoader
            countrySlug={country.slug}
            countryName={country.name}
            labels={{
              lowerSingular,
              lowerPlural,
              higherSingular,
              higherPlural,
              csvFileName: `${country.slug}-sng-${lowerSingularLabel}-metrics.csv`,
            }}
            planAvailabilityDescription={planAvailabilityDisclosure.description}
            planSourceAdminLevel={country.planningDocuments.planSourceAdminLevel}
          />
        </article>
      </section>
    </main>
  );
}
