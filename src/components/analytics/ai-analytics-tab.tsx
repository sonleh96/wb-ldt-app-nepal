"use client";

import { useMemo, useState } from "react";

import { AiIndicatorChart } from "@/components/analytics/ai-indicator-chart";
import {
  AiAlignmentResult,
  AiIndicatorNarrativeResult,
  AiRecommendationsResult,
  AiSwotResult,
  AiWebContextResult,
  buildRegionalIndicatorRows,
  parseNarrativeSections,
  sectionBodyForTitle,
} from "@/components/analytics/ai-result-renderers";
import type { RegionalIndicatorRow } from "@/components/analytics/ai-result-renderers";
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

const planningContextStages: AiStageName[] = [
  "province_plan_context",
  "national_plan_context",
  "plan_alignment",
];

type AiAnalyticsTabProps = {
  release: AnalyticsPageData["release"];
  selected: AnalyticsPageData["selected"];
  municipality: AnalyticsPageData["municipality"];
  ai: AiTabData;
};

type WorkflowState = "complete" | "running" | "failed" | "blocked" | "optional" | "ready";

type WorkflowStep = {
  number: string;
  title: string;
  detail: string;
  state: WorkflowState;
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

function WorkflowProgressRail({ steps }: { steps: WorkflowStep[] }) {
  const stateStyles: Record<WorkflowState, string> = {
    complete: "border-[rgba(84,162,75,0.34)] bg-[rgba(84,162,75,0.10)] text-[#2f7a2a]",
    running: "border-[rgba(17,138,178,0.42)] bg-[rgba(17,138,178,0.12)] text-[var(--accent)]",
    failed: "border-[rgba(228,87,86,0.34)] bg-[rgba(228,87,86,0.10)] text-[#b23b3a]",
    blocked: "border-[rgba(148,163,184,0.55)] bg-[rgba(148,163,184,0.16)] text-[var(--foreground)]",
    optional: "border-[rgba(251,191,36,0.36)] bg-[rgba(251,191,36,0.10)] text-[#8a6416]",
    ready: "border-[rgba(17,138,178,0.24)] bg-white/80 text-[var(--foreground)]",
  };

  const stateLabels: Record<WorkflowState, string> = {
    complete: "Complete",
    running: "Running",
    failed: "Needs review",
    blocked: "Blocked",
    optional: "Optional",
    ready: "Ready",
  };

  return (
    <section className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4 shadow-[0_14px_36px_rgba(39,62,71,0.06)]">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
            Workflow state
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
            AI recommendation pipeline
          </h3>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
          Scan what is ready, blocked, optional, or already grounded in cached evidence before opening result details.
        </p>
      </div>
      <ol className="mt-4 grid gap-3 lg:grid-cols-5">
        {steps.map((step) => (
          <li
            key={step.number}
            className={`rounded-[1rem] border p-3 ${stateStyles[step.state]}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-xs font-semibold">
                {step.number}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                {stateLabels[step.state]}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold">{step.title}</p>
            <p className="mt-1 text-xs leading-5 opacity-80">{step.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function toFailedStagePayload(stage: AiStageName, payload: unknown): AiStageResponsePayload {
  const errorPayload =
    payload && typeof payload === "object"
      ? (payload as { error?: unknown; errorMessage?: unknown })
      : null;
  const errorMessage =
    typeof errorPayload?.errorMessage === "string"
      ? errorPayload.errorMessage
      : typeof errorPayload?.error === "string"
        ? errorPayload.error
        : "The AI stage request failed.";

  return {
    stage,
    status: "failed",
    cacheHit: false,
    renderedOutput: null,
    structuredOutput: {},
    sourceReferences: [],
    modelName: "n/a",
    promptVersion: "n/a",
    updatedAt: new Date().toISOString(),
    errorMessage,
  };
}

function PlanningEvidencePanel({
  title,
  result,
}: {
  title: string;
  result?: AiStageResponsePayload;
}) {
  const extractedText = getStringValue(result?.structuredOutput.extractedText);
  const summaryText = result?.renderedOutput ?? extractedText;
  const proofText = [result?.renderedOutput, extractedText]
    .filter((value): value is string => Boolean(value))
    .join("\n\n--- Extracted source text ---\n\n");
  const previewText = summaryText
    ? summaryText.replace(/\s+/g, " ").trim().slice(0, 420)
    : null;

  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-white/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-[var(--foreground)]">{title}</h4>
        {result ? (
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
              result.status === "completed"
                ? "bg-[rgba(44,123,229,0.10)] text-[var(--accent)]"
                : "bg-[rgba(214,64,69,0.10)] text-[var(--danger)]"
            }`}
          >
            {result.status}
          </span>
        ) : null}
      </div>
      {result?.status === "failed" ? (
        <p className="mt-3 text-sm text-[var(--danger)]">
          {result.errorMessage ?? "This planning context stage failed."}
        </p>
      ) : previewText ? (
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          {previewText}
          {summaryText && summaryText.length > previewText.length ? "..." : ""}
        </p>
      ) : (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          Not generated yet.
        </p>
      )}
      {proofText ? (
        <details className="mt-3 rounded-[1rem] border border-[var(--border-soft)] bg-white/80 p-3">
          <summary className="cursor-pointer text-sm font-medium text-[var(--foreground)]">
            Show full proof text
          </summary>
          <div className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">
            {proofText}
          </div>
        </details>
      ) : null}
      {result?.sourceReferences.length ? (
        <div className="mt-3 border-t border-[var(--border-soft)] pt-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            Sources
          </p>
          <ul className="mt-2 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.sourceReferences.map((source, index) => (
              <li key={`${source.type}-${source.label}-${source.source}-${index}`}>
                <span className="font-medium text-[var(--foreground)]">{source.label}</span>
                {" - "}
                <span>{source.source}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
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
  ): Promise<AiStageResponsePayload | null> {
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

      const rawPayload = (await response.json()) as unknown;
      const payload = response.ok
        ? (rawPayload as AiStageResponsePayload)
        : toFailedStagePayload(stage, rawPayload);

      if (
        options?.silentMissingCache &&
        payload.status === "failed" &&
        payload.errorMessage?.toLowerCase().includes("no cached")
      ) {
        return null;
      }

      setStageResults((current) => ({
        ...current,
        [stage]: payload,
      }));

      return payload;
    } finally {
      setLoadingStages((current) => {
        const next = { ...current };
        delete next[stage];
        return next;
      });
    }
  }

  const hasIndicatorNarrative = stageResults.indicator_narrative?.status === "completed";
  const hasAlignment = stageResults.plan_alignment?.status === "completed";
  const hasWebContext = stageResults.web_context_search?.status === "completed";
  const hasSwot = stageResults.swot_analysis?.status === "completed";
  const isPlanningContextLoading = planningContextStages.some((stage) => loadingStages[stage]);
  const hasAnyPlanningContextResult = planningContextStages.some((stage) => stageResults[stage]);

  function getWorkflowState(
    stages: AiStageName[],
    options?: { blocked?: boolean; optional?: boolean },
  ): WorkflowState {
    if (stages.some((stage) => loadingStages[stage])) {
      return "running";
    }
    if (stages.some((stage) => stageResults[stage]?.status === "failed")) {
      return "failed";
    }
    if (stages.every((stage) => stageResults[stage]?.status === "completed")) {
      return "complete";
    }
    if (options?.blocked) {
      return "blocked";
    }
    if (options?.optional) {
      return "optional";
    }
    return "ready";
  }

  async function runPlanningContext(mode: "generate" | "regenerate") {
    const provinceContext = await runStage("province_plan_context", mode);
    if (provinceContext?.status !== "completed") {
      return;
    }

    const nationalContext = await runStage("national_plan_context", mode);
    if (nationalContext?.status !== "completed") {
      return;
    }

    await runStage("plan_alignment", mode);
  }

  function buildStageActions(stage: AiStageName, disabled: boolean) {
    return (
      <>
        <StageButton
          label={loadingStages[stage] ? "Working..." : "Run step"}
          onClick={() => void runStage(stage, "generate")}
          disabled={Boolean(loadingStages[stage]) || disabled}
          tone="primary"
        />
        <StageButton
          label={loadingStages[stage] ? "Working..." : "Regenerate"}
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
        label={isLoading ? "Working..." : "Regenerate analysis"}
        onClick={() => void runStage(stage, "regenerate")}
        disabled={isLoading}
      />
    ) : (
      <StageButton
        label={isLoading ? "Working..." : "Run analysis"}
        onClick={() => void runStage(stage, "generate")}
        disabled={isLoading}
        tone="primary"
      />
    );
  }

  const indicatorFooterActions = buildIndicatorFooterActions();
  const indicatorDiagnostics = useMemo(() => {
    const narrativeOutput = stageResults.indicator_narrative?.renderedOutput ?? "";
    if (!narrativeOutput) {
      return new Map<string, RegionalIndicatorRow>();
    }

    const { sections } = parseNarrativeSections(narrativeOutput);
    const strengthening = sectionBodyForTitle(sections, /strengthening/i);
    const weakening = sectionBodyForTitle(sections, /weakening/i);

    return new Map(
      buildRegionalIndicatorRows(ai.indicatorSeries, strengthening, weakening).map((row) => [
        row.label,
        row,
      ]),
    );
  }, [ai.indicatorSeries, stageResults.indicator_narrative?.renderedOutput]);
  const workflowSteps: WorkflowStep[] = [
    {
      number: "1",
      title: "Score evidence",
      detail: "Component charts and narrative",
      state: getWorkflowState(["indicator_narrative"]),
    },
    {
      number: "2",
      title: "Plan alignment",
      detail: "Province, national, and comparison",
      state: getWorkflowState(planningContextStages),
    },
    {
      number: "3",
      title: "Web context",
      detail: hasWebContext ? "Included in later stages" : "Optional enrichment",
      state: getWorkflowState(["web_context_search"], { optional: true }),
    },
    {
      number: "4",
      title: "SWOT",
      detail: "Evidence-backed planning read",
      state: getWorkflowState(["swot_analysis"], {
        blocked: !hasIndicatorNarrative || !hasAlignment,
      }),
    },
    {
      number: "5",
      title: "Recommendations",
      detail: "Ranked public investments",
      state: getWorkflowState(["investment_recommendations"], {
        blocked: !hasIndicatorNarrative || !hasAlignment || !hasSwot,
      }),
    },
  ];

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

      <WorkflowProgressRail steps={workflowSteps} />

      <AiStageCard
        eyebrow="Step 1"
        title="Component score analysis"
        description={`Review the component-score evidence for ${municipality.municipality}, ${municipality.province}. The narrative stage is prompted only from the score-component series, with no planning-document context injected.`}
        result={stageResults.indicator_narrative}
        resultContent={
          stageResults.indicator_narrative ? (
            <AiIndicatorNarrativeResult
              result={stageResults.indicator_narrative}
              indicatorSeries={ai.indicatorSeries}
            />
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
              diagnostic={indicatorDiagnostics.get(series.label)}
            />
          ))}
        </div>
      </AiStageCard>

      <AiStageCard
        eyebrow="Step 2"
        title="Planning context and alignment"
        description={`Retrieve the ${municipality.province} provincial plan context and national plan context, then compare them for the selected municipality and score theme in one run.`}
        actions={
          <>
            <StageButton
              label={isPlanningContextLoading ? "Working..." : "Run planning alignment"}
              onClick={() => void runPlanningContext("generate")}
              disabled={isPlanningContextLoading}
              tone="primary"
            />
            <StageButton
              label={isPlanningContextLoading ? "Working..." : "Regenerate alignment"}
              onClick={() => void runPlanningContext("regenerate")}
              disabled={isPlanningContextLoading || !hasAnyPlanningContextResult}
            />
          </>
        }
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <PlanningEvidencePanel
            title="Provincial plan context"
            result={stageResults.province_plan_context}
          />
          <PlanningEvidencePanel
            title="National plan context"
            result={stageResults.national_plan_context}
          />
        </div>
        {stageResults.plan_alignment ? (
          <div className="mt-4">
            <AiAlignmentResult result={stageResults.plan_alignment} />
          </div>
        ) : null}
      </AiStageCard>

      <AiStageCard
        eyebrow="Step 3"
        title="Add current web context"
        description="Optionally search the web for additional public context relevant to the selected municipality, province, and score. This can enrich later SWOT and recommendation stages without replacing the planning documents."
        actions={buildStageActions("web_context_search", false)}
        result={stageResults.web_context_search}
        resultContent={
          stageResults.web_context_search ? (
            <AiWebContextResult result={stageResults.web_context_search} />
          ) : null
        }
      />

      <AiStageCard
        eyebrow="Step 4"
        title="SWOT analysis"
        description="Generate a municipality SWOT grounded in the chosen score, the indicator narrative, the planning alignment, and any optional web context already added."
        actions={buildStageActions("swot_analysis", !hasIndicatorNarrative || !hasAlignment)}
        result={stageResults.swot_analysis}
        resultContent={
          stageResults.swot_analysis ? (
            <AiSwotResult result={stageResults.swot_analysis} />
          ) : null
        }
      />

      <AiStageCard
        eyebrow="Step 5"
        title="Public investment recommendations"
        description="Generate public project investment recommendations grounded in the accumulated evidence rather than in a separate concept-note stage."
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
