"use client";

import { useMemo, useState } from "react";

import { AiIndicatorChart } from "@/components/analytics/ai-indicator-chart";
import {
  AiAlignmentResult,
  AiIndicatorNarrativeResult,
  AiRecommendationsResult,
  AiSwotResult,
  AiWebContextResult,
} from "@/components/analytics/ai-result-renderers";
import { AiStageCard } from "@/components/analytics/ai-stage-card";
import type {
  AiStageName,
  AiStageResponsePayload,
  AiTabData,
} from "@/lib/ai/types";
import type { AnalyticsPageData } from "@/types/analytics";

const stageRouteMap: Record<AiStageName, string> = {
  indicator_narrative: "/api/ai/indicator-narrative",
  province_plan_context: "/api/ai/province-plan-context",
  national_plan_context: "/api/ai/national-plan-context",
  web_context_search: "/api/ai/web-context-search",
  plan_alignment: "/api/ai/plan-alignment",
  swot_analysis: "/api/ai/swot-analysis",
  investment_recommendations: "/api/ai/investment-recommendations",
};

type AiAnalyticsTabProps = {
  release: AnalyticsPageData["release"];
  selected: AnalyticsPageData["selected"];
  municipality: AnalyticsPageData["municipality"];
  ai: AiTabData;
};

function StageButton({
  onClick,
  label,
  disabled = false,
  tone = "secondary",
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  tone?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-[42px] items-center justify-center rounded-full px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
        tone === "primary"
          ? "bg-[var(--accent)] text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)]"
          : "border border-[var(--border-soft)] bg-white/80 text-[var(--foreground)]"
      }`}
    >
      {label}
    </button>
  );
}

export function AiAnalyticsTab({
  release,
  selected,
  municipality,
  ai,
}: AiAnalyticsTabProps) {
  const [stageResults, setStageResults] = useState<
    Partial<Record<AiStageName, AiStageResponsePayload>>
  >(ai.cachedStages as Partial<Record<AiStageName, AiStageResponsePayload>>);
  const [loadingStages, setLoadingStages] = useState<
    Partial<Record<AiStageName, string>>
  >({});

  const basePayload = useMemo(
    () => ({
      releaseKey: release.key,
      year: release.year,
      municipalityId: municipality.id,
      scoreId: ai.selectedScoreId,
    }),
    [ai.selectedScoreId, municipality.id, release.key, release.year],
  );

  async function runStage(
    stage: AiStageName,
    mode: "generate" | "regenerate" | "load_cached",
    options?: { silentMissingCache?: boolean },
  ) {
    setLoadingStages((current) => ({ ...current, [stage]: mode }));

    try {
      const response = await fetch(stageRouteMap[stage], {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ...basePayload,
          mode,
        }),
      });

      const payload = (await response.json()) as AiStageResponsePayload;

      if (
        options?.silentMissingCache &&
        payload.status === "failed" &&
        payload.errorMessage?.toLowerCase().includes("no cached")
      ) {
        return;
      }

      setStageResults((current) => ({
        ...current,
        [stage]: payload,
      }));
    } finally {
      setLoadingStages((current) => {
        const next = { ...current };
        delete next[stage];
        return next;
      });
    }
  }

  const hasIndicatorNarrative = stageResults.indicator_narrative?.status === "completed";
  const hasProvinceContext = stageResults.province_plan_context?.status === "completed";
  const hasNationalContext = stageResults.national_plan_context?.status === "completed";
  const hasAlignment = stageResults.plan_alignment?.status === "completed";
  const hasSwot = stageResults.swot_analysis?.status === "completed";

  function buildStageActions(stage: AiStageName, disabled: boolean) {
    return (
      <>
        <StageButton
          label={loadingStages[stage] ? "Working..." : "Generate"}
          onClick={() => void runStage(stage, "generate")}
          disabled={Boolean(loadingStages[stage]) || disabled}
          tone="primary"
        />
        <StageButton
          label={loadingStages[stage] ? "Working..." : "Reload"}
          onClick={() => void runStage(stage, "regenerate")}
          disabled={Boolean(loadingStages[stage]) || disabled}
        />
      </>
    );
  }

  function buildIndicatorFooterActions() {
    const stage = "indicator_narrative";
    const hasResult = Boolean(stageResults[stage]);
    const isLoading = Boolean(loadingStages[stage]);

    return hasResult ? (
      <StageButton
        label={isLoading ? "Working..." : "Reload"}
        onClick={() => void runStage(stage, "regenerate")}
        disabled={isLoading}
      />
    ) : (
      <StageButton
        label={isLoading ? "Working..." : "Generate"}
        onClick={() => void runStage(stage, "generate")}
        disabled={isLoading}
        tone="primary"
      />
    );
  }

  const indicatorFooterActions = buildIndicatorFooterActions();

  return (
    <div className="space-y-5">
      <AiStageCard
        eyebrow="AI planning workflow"
        title="Choose municipality and score"
        description="Use the shared municipality selector in the sidebar, then choose the score theme for the AI planning workflow here. The AI flow currently supports only Prosperity, Infrastructure, and Livability."
      >
        <form className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
          <input type="hidden" name="tab" value="ai" />
          <input type="hidden" name="year" value={String(selected.year)} />
          <input type="hidden" name="province" value={selected.province} />
          <input type="hidden" name="municipality" value={selected.municipalityId} />
          <input type="hidden" name="metric" value={selected.metricId} />
          <input type="hidden" name="x" value={selected.xMetricId} />
          <input type="hidden" name="y" value={selected.yMetricId} />
          <label className="flex min-w-0 w-full flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              AI score theme
            </span>
            <select
              name="ai_score"
              defaultValue={ai.selectedScoreId}
              className="w-full min-w-0 rounded-2xl border border-[var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--foreground)] outline-none"
            >
              {ai.scoreOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="inline-flex h-[46px] items-center justify-center self-end rounded-full bg-[var(--accent)] px-5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)]"
          >
            Apply
          </button>
        </form>
      </AiStageCard>

      <AiStageCard
        eyebrow="Step 1"
        title="Component score analysis"
        description={`Review the component-score evidence for ${municipality.municipality}, ${municipality.province}. The narrative stage is prompted only from the score-component series, with no planning-document context injected.`}
        result={stageResults.indicator_narrative}
        resultContent={
          stageResults.indicator_narrative ? (
            <AiIndicatorNarrativeResult result={stageResults.indicator_narrative} />
          ) : null
        }
        footerActions={indicatorFooterActions}
      >
        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {ai.indicatorSeries.map((series) => (
            <AiIndicatorChart
              key={series.componentId}
              series={series}
              municipalityLabel={municipality.municipality}
              provinceLabel={municipality.province}
            />
          ))}
        </div>
      </AiStageCard>

      <div className="grid gap-5 xl:grid-cols-2">
        <AiStageCard
          eyebrow="Step 2"
          title="Extract Provincial Development Plan"
          description={`Resolve the selected municipality to ${municipality.province}, retrieve the province development plan from the Nepal workbook links, and parse it into reusable context.`}
          actions={buildStageActions("province_plan_context", false)}
          result={stageResults.province_plan_context}
        />

        <AiStageCard
          eyebrow="Step 3"
          title="Extract National Development Plan"
          description="Retrieve the national planning documents from the Supabase source registry and normalize them into the same document-context shape used for the province plan."
          actions={buildStageActions("national_plan_context", false)}
          result={stageResults.national_plan_context}
        />
      </div>

      <AiStageCard
        eyebrow="Step 4"
        title="Search web context"
        description="Optionally search the web for additional public context relevant to the selected municipality, province, and score. This can enrich later alignment, SWOT, and recommendation stages without replacing the planning documents."
        actions={buildStageActions("web_context_search", false)}
        result={stageResults.web_context_search}
        resultContent={
          stageResults.web_context_search ? (
            <AiWebContextResult result={stageResults.web_context_search} />
          ) : null
        }
      />

      <AiStageCard
        eyebrow="Step 5"
        title="Provincial vs national alignment"
        description="Check whether the province plan is aligned with the national plan for the selected municipality and score context."
        actions={buildStageActions("plan_alignment", !hasProvinceContext || !hasNationalContext)}
        result={stageResults.plan_alignment}
        resultContent={
          stageResults.plan_alignment ? (
            <AiAlignmentResult result={stageResults.plan_alignment} />
          ) : null
        }
      />

      <AiStageCard
        eyebrow="Step 6"
        title="SWOT analysis"
        description="Generate a municipality SWOT grounded in the chosen score, the indicator narrative, and both planning-document contexts."
        actions={buildStageActions("swot_analysis", !hasIndicatorNarrative || !hasProvinceContext || !hasNationalContext)}
        result={stageResults.swot_analysis}
        resultContent={
          stageResults.swot_analysis ? (
            <AiSwotResult result={stageResults.swot_analysis} />
          ) : null
        }
      />

      <AiStageCard
        eyebrow="Step 7"
        title="Public investment recommendations"
        description="Generate Zambia-style public project investment recommendations grounded in the accumulated evidence rather than in a separate concept-note stage."
        actions={buildStageActions("investment_recommendations", !hasIndicatorNarrative || !hasAlignment || !hasSwot)}
        result={stageResults.investment_recommendations}
        resultContent={
          stageResults.investment_recommendations ? (
            <AiRecommendationsResult result={stageResults.investment_recommendations} />
          ) : null
        }
      />
    </div>
  );
}
