import Link from "next/link";

import { AiAnalyticsTab } from "@/components/analytics/ai-analytics-tab";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import { ChoroplethMapCard } from "@/components/analytics/choropleth-map";
import { MunicipalitySummaryCard } from "@/components/analytics/municipality-summary-card";
import { Scatter2DCard } from "@/components/analytics/scatter-2d";
import { Scatter3DLoader } from "@/components/analytics/scatter-3d-loader";
import { ScoreWaterfallSection } from "@/components/analytics/score-waterfall-section";
import { getAnalyticsPageData } from "@/lib/data/queries";

function getSearchValue(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function buildTabHref(
  searchParams: Record<string, string | string[] | undefined>,
  tab: string,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "tab") {
      continue;
    }

    if (Array.isArray(value)) {
      if (value[0]) {
        params.set(key, value[0]);
      }
      continue;
    }

    if (value) {
      params.set(key, value);
    }
  }

  params.set("tab", tab);
  return `/analytics?${params.toString()}`;
}

function SelectControl({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex min-w-0 w-full flex-col gap-2">
      <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full min-w-0 rounded-2xl border border-[var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--foreground)] outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const data = await getAnalyticsPageData(resolvedSearchParams);
  const selectedTab = getSearchValue(resolvedSearchParams.tab, "multi");

  return (
    <main className="mx-auto flex w-full max-w-[95vw] flex-1 flex-col px-6 pb-16 pt-10 sm:px-8 lg:px-10">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
          Analytics
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              Municipality development analysis
            </h1>
            <p className="mt-3 max-w-4xl text-base leading-8 text-[var(--muted-foreground)]">
              The analytics surface is split across three workflows: a multi-score comparison view, a single-score
              map and indicator view, and an AI planning workflow for staged narrative, alignment, SWOT, and
              investment recommendation generation.
            </p>
          </div>
          <div className="rounded-full border border-[var(--border-strong)] bg-white/70 px-4 py-2 text-sm text-[var(--muted-foreground)]">
            Latest Data Year: {data.release.year}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="self-start xl:sticky xl:top-24">
          <div className="space-y-4">
            <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
              <div className="flex flex-col gap-3">
                <Link
                  href={buildTabHref(resolvedSearchParams, "multi")}
                  className={`rounded-full px-5 py-2.5 text-center text-sm font-medium transition-colors ${
                    selectedTab === "multi"
                      ? "bg-[var(--accent)] text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)]"
                      : "border border-[var(--border-soft)] bg-white/75 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Multi-Score Analysis
                </Link>
                <Link
                  href={buildTabHref(resolvedSearchParams, "single")}
                  className={`rounded-full px-5 py-2.5 text-center text-sm font-medium transition-colors ${
                    selectedTab === "single"
                      ? "bg-[var(--accent)] text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)]"
                      : "border border-[var(--border-soft)] bg-white/75 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Single Score Analysis
                </Link>
                <Link
                  href={buildTabHref(resolvedSearchParams, "ai")}
                  className={`rounded-full px-5 py-2.5 text-center text-sm font-medium transition-colors ${
                    selectedTab === "ai"
                      ? "bg-[var(--accent)] text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)]"
                      : "border border-[var(--border-soft)] bg-white/75 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  AI PIM Recommendations
                </Link>
              </div>
            </section>

            <AnalyticsFilters
              years={data.filters.years}
              provinces={data.filters.provinces}
              municipalities={data.filters.municipalities}
              selected={data.selected}
              selectedTab={selectedTab}
              mode="sidebar"
            />

            <MunicipalitySummaryCard
              municipality={data.municipality}
              nationalScoreAverages={data.nationalAverages.scores}
              compact
            />
          </div>
        </aside>

        {selectedTab === "ai" ? (
          <AiAnalyticsTab
            key={`${data.release.key}:${data.municipality.id}:${data.ai.selectedScoreId}`}
            release={data.release}
            selected={data.selected}
            municipality={data.municipality}
            ai={data.ai}
          />
        ) : selectedTab === "single" ? (
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Single score and indicator analysis
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--muted-foreground)]">
              Use the choropleth to inspect a single pillar score or indicator across Nepal. Click on the map to change the highlighted municipality, then use the driver chart and metadata panel to understand what is pulling that municipality above or below the national baseline.
            </p>
          </section>

          <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
            <form className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto]">
              <input type="hidden" name="tab" value="single" />
              <input type="hidden" name="year" value={String(data.selected.year)} />
              <input type="hidden" name="province" value={data.selected.province} />
              <input type="hidden" name="municipality" value={data.selected.municipalityId} />
              <input type="hidden" name="x" value={data.selected.xMetricId} />
              <input type="hidden" name="y" value={data.selected.yMetricId} />
              <input type="hidden" name="ai_score" value={data.selected.aiScoreId} />
              <SelectControl
                label="Map metric"
                name="metric"
                defaultValue={data.selected.metricId}
                options={data.filters.metrics.map((metric) => ({
                  value: metric.id,
                  label: metric.label,
                }))}
              />
              <button
                type="submit"
                className="inline-flex h-[46px] items-center justify-center self-end rounded-full bg-[var(--accent)] px-5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)]"
              >
                Apply
              </button>
            </form>
          </section>

          <div className="mt-8 space-y-6">
            <section>
              <ChoroplethMapCard
                features={data.map.features}
                metric={data.map.metric}
                selectedCompositeKey={data.municipality.compositeKey}
                coverageLabel={data.map.coverageLabel}
                minimum={data.map.summary.minimum}
                maximum={data.map.summary.maximum}
              />
            </section>
            <ScoreWaterfallSection
              groups={data.waterfalls}
              municipalityName={data.municipality.municipality}
              provinceName={data.municipality.province}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Multi-score analysis
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--muted-foreground)]">
              Compare municipalities across the three core pillars first in two dimensions and then in the full 3D score space. The selected municipality is highlighted in red, while other municipalities in the same province are highlighted in orange to match the comparison logic of the reference app.
            </p>
          </section>

          <section className="space-y-6">
            <Scatter2DCard
              xLabel={data.scatter2d.xMetric.label}
              yLabel={data.scatter2d.yMetric.label}
              selectedProvince={data.municipality.province}
              controls={
                <form className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <input type="hidden" name="tab" value="multi" />
                  <input type="hidden" name="year" value={String(data.selected.year)} />
                  <input type="hidden" name="province" value={data.selected.province} />
                  <input type="hidden" name="municipality" value={data.selected.municipalityId} />
                  <input type="hidden" name="metric" value={data.selected.metricId} />
                  <input type="hidden" name="ai_score" value={data.selected.aiScoreId} />
                  <SelectControl
                    label="Scatter X"
                    name="x"
                    defaultValue={data.selected.xMetricId}
                    options={data.filters.scoreMetrics.map((metric) => ({
                      value: metric.id,
                      label: metric.label,
                    }))}
                  />
                  <SelectControl
                    label="Scatter Y"
                    name="y"
                    defaultValue={data.selected.yMetricId}
                    options={data.filters.scoreMetrics.map((metric) => ({
                      value: metric.id,
                      label: metric.label,
                    }))}
                  />
                  <button
                    type="submit"
                    className="inline-flex h-[46px] items-center justify-center self-end rounded-full bg-[var(--accent)] px-5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)]"
                  >
                    Apply
                  </button>
                </form>
              }
              points={data.scatter2d.points}
            />
            <Scatter3DLoader
              selectedProvince={data.municipality.province}
              points={data.scatter3d.points}
            />
          </section>
        </div>
      )}
      </div>
    </main>
  );
}
