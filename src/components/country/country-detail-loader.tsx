"use client";

import { useState } from "react";
import type { SyntheticEvent } from "react";

import {
  SngDisplaySection,
  type SngDisplayRow,
} from "@/components/nepal/sng-display-section";
import type { PlanAvailabilityGroup } from "@/lib/country-landing-data";

const PREVIEW_UNIT_COUNT = 6;

type CountryDetailLabels = {
  lowerSingular: string;
  lowerPlural: string;
  higherSingular: string;
  higherPlural: string;
  csvFileName: string;
};

type MetricsPayload = {
  rows: SngDisplayRow[];
};

type PlanAvailabilityPayload = {
  groups: PlanAvailabilityGroup[];
};

type LoadState = "idle" | "loading" | "loaded" | "error";

function lowerFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function unitListKey(groupName: string, unitName: string, index: number) {
  return `${groupName.toLowerCase()}-${unitName.toLowerCase()}-${index}`;
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

function LoadingBlock({ label }: { label: string }) {
  return (
    <div
      className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5"
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <div className="h-4 w-44 animate-pulse rounded-full bg-[var(--border-soft)]" />
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="h-20 animate-pulse rounded-[1rem] bg-[var(--border-soft)]/70" />
        <div className="h-20 animate-pulse rounded-[1rem] bg-[var(--border-soft)]/70" />
        <div className="h-20 animate-pulse rounded-[1rem] bg-[var(--border-soft)]/70" />
      </div>
    </div>
  );
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-[1.25rem] border border-[#d14b4b]/40 bg-[#d14b4b]/10 p-5 text-sm leading-7 text-[var(--foreground)]">
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border border-[#d14b4b]/40 bg-white px-4 text-sm font-medium text-[#b42318] transition-colors hover:bg-[#d14b4b]/10 dark:bg-[var(--surface-strong)]"
      >
        Retry
      </button>
    </div>
  );
}

function AdminGroupCard({
  group,
  labels,
  planSourceAdminLevel,
}: {
  group: PlanAvailabilityGroup;
  labels: CountryDetailLabels;
  planSourceAdminLevel: "lower" | "higher";
}) {
  const previewUnits = group.units.slice(0, PREVIEW_UNIT_COUNT);
  const remainingUnits = group.units.slice(PREVIEW_UNIT_COUNT);
  const lowerPluralLabel = lowerFirst(labels.lowerPlural);
  const lowerSingularLabel = labels.lowerSingular.toLowerCase();

  function renderUnit(unit: PlanAvailabilityGroup["units"][number], index: number) {
    const statusLabel = unit.hasPlanSource
      ? `${unit.name} has an available local/SNG plan source`
      : `${unit.name} does not have an available local/SNG plan source`;

    return (
      <div
        key={unitListKey(group.name, unit.name, index)}
        className="flex items-start gap-3"
      >
        <StatusBadge available={unit.hasPlanSource} label={statusLabel} />
        {unit.link ? (
          <a
            href={unit.link}
            target="_blank"
            rel="noreferrer"
            className="text-sm leading-6 text-[var(--foreground)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:text-[var(--accent)]"
            title={unit.title ?? unit.name}
          >
            {unit.name}
          </a>
        ) : (
          <span className="text-sm leading-6 text-[var(--foreground)]">
            {unit.name}
          </span>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
      <div className="flex flex-col gap-3 border-b border-[var(--border-soft)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge available={group.hasPlanSource} label={group.statusLabel} />
          <div>
            <h4 className="text-lg font-semibold text-[var(--foreground)]">
              {group.name}
            </h4>
            <p className="text-sm text-[var(--muted-foreground)]">
              {group.lowerUnitCount} {lowerPluralLabel}
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          {planSourceAdminLevel === "higher"
            ? group.hasPlanSource
              ? "Plan source loaded"
              : "Plan source missing"
            : `${group.sourceCount} / ${group.lowerUnitCount} ${lowerSingularLabel} plans`}
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
            {remainingUnits.map((unit, index) => renderUnit(unit, index + PREVIEW_UNIT_COUNT))}
          </div>
        </details>
      ) : null}
    </section>
  );
}

export function CountryDetailLoader({
  countrySlug,
  countryName,
  labels,
  planAvailabilityDescription,
  planSourceAdminLevel,
}: {
  countrySlug: string;
  countryName: string;
  labels: CountryDetailLabels;
  planAvailabilityDescription: string;
  planSourceAdminLevel: "lower" | "higher";
}) {
  const [metricsState, setMetricsState] = useState<LoadState>("idle");
  const [metricsRows, setMetricsRows] = useState<SngDisplayRow[]>([]);
  const [planState, setPlanState] = useState<LoadState>("idle");
  const [planGroups, setPlanGroups] = useState<PlanAvailabilityGroup[]>([]);

  async function loadMetrics() {
    setMetricsState("loading");

    try {
      const response = await fetch(`/api/countries/${countrySlug}/sng-metrics`);
      if (!response.ok) {
        throw new Error("Failed to load SNG metrics.");
      }
      const payload = (await response.json()) as MetricsPayload;
      setMetricsRows(payload.rows);
      setMetricsState("loaded");
    } catch {
      setMetricsState("error");
    }
  }

  async function loadPlanAvailability() {
    if (planState === "loading" || planState === "loaded") {
      return;
    }

    setPlanState("loading");

    try {
      const response = await fetch(`/api/countries/${countrySlug}/plan-availability`);
      if (!response.ok) {
        throw new Error("Failed to load plan availability.");
      }
      const payload = (await response.json()) as PlanAvailabilityPayload;
      setPlanGroups(payload.groups);
      setPlanState("loaded");
    } catch {
      setPlanState("error");
    }
  }

  function handlePlanToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    if (event.currentTarget.open) {
      void loadPlanAvailability();
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Detailed SNG metrics
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
              {labels.lowerPlural} metrics and population distribution
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted-foreground)]">
              Load the full chart and sortable table when you need the detailed
              {" "}{labels.lowerSingular.toLowerCase()} records. Keeping this optional makes the
              {" "}{countryName} landing page faster while preserving access to the complete dataset.
            </p>
          </div>

          {metricsState === "idle" ? (
            <button
              type="button"
              onClick={() => void loadMetrics()}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)] transition-transform hover:-translate-y-0.5 hover:brightness-95"
            >
              Load detailed metrics
            </button>
          ) : null}
        </div>

        {metricsState === "loading" ? (
          <div className="mt-5">
            <LoadingBlock label="Loading SNG metrics" />
          </div>
        ) : null}
        {metricsState === "error" ? (
          <div className="mt-5">
            <ErrorBlock
              message="The detailed SNG metrics could not be loaded. The country summary is still available."
              onRetry={() => void loadMetrics()}
            />
          </div>
        ) : null}
        {metricsState === "loaded" ? (
          <SngDisplaySection rows={metricsRows} labels={labels} />
        ) : null}
      </section>

      <details
        className="group rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5"
        onToggle={handlePlanToggle}
      >
        <summary className="flex cursor-pointer list-none flex-col gap-3 marker:hidden sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
              Development plan source availability
            </h3>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-[var(--muted-foreground)]">
              {planAvailabilityDescription}
            </p>
          </div>
          <span className="inline-flex w-fit shrink-0 rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            <span className="group-open:hidden">Expand</span>
            <span className="hidden group-open:inline">Collapse</span>
          </span>
        </summary>

        <div className="mt-5 border-t border-[var(--border-soft)] pt-5">
          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
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

          {planState === "loading" ? (
            <div className="mt-6">
              <LoadingBlock label="Loading development plan source availability" />
            </div>
          ) : null}
          {planState === "error" ? (
            <div className="mt-6">
              <ErrorBlock
                message="The plan-source availability list could not be loaded. Try again or use the analytics workspace directly."
                onRetry={() => void loadPlanAvailability()}
              />
            </div>
          ) : null}
          {planState === "loaded" ? (
            <div className="mt-6 space-y-5">
              {planGroups.map((group) => (
                <AdminGroupCard
                  key={group.name}
                  group={group}
                  labels={labels}
                  planSourceAdminLevel={planSourceAdminLevel}
                />
              ))}
            </div>
          ) : null}
        </div>
      </details>
    </div>
  );
}
