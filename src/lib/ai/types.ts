import type { ScoreWaterfallGroup } from "@/types/analytics";

export const aiStageNames = [
  "indicator_narrative",
  "province_plan_context",
  "national_plan_context",
  "web_context_search",
  "plan_alignment",
  "swot_analysis",
  "investment_recommendations",
] as const;

export type AiStageName = (typeof aiStageNames)[number];

export type AiDocumentContentMode = "full_text" | "chunked_text";

export type AiDocumentPassage = {
  id: string;
  title: string | null;
  text: string;
};

export type AiDocumentChunk = {
  id: string;
  text: string;
  sectionLabel: string | null;
  startOffset: number;
  endOffset: number;
  retrievalScore: number | null;
};

export type AiDocumentContext = {
  sourceType: "province_plan" | "national_plan";
  title: string;
  province: string | null;
  sourceUrlOrPath: string;
  contentMode: AiDocumentContentMode;
  extractedText: string;
  passages: AiDocumentPassage[];
  chunks: AiDocumentChunk[];
  extractionMetadata: Record<string, unknown>;
  contentFingerprint: string;
  extractionVersion: string;
};

export type AiStageSourceReference = {
  label: string;
  type: "document" | "indicator_series" | "generated" | "web_search";
  source: string;
  metadata?: Record<string, unknown>;
};

export type AiWebContextHit = {
  title: string;
  url: string;
  snippet: string;
  publishedDate: string | null;
  score: number | null;
};

export type AiStageCacheEntry = {
  stage: AiStageName;
  status: "completed" | "failed";
  cacheHit: boolean;
  renderedOutput: string | null;
  structuredOutput: Record<string, unknown>;
  sourceReferences: AiStageSourceReference[];
  modelName: string;
  promptVersion: string;
  invalidationVersion: string;
  updatedAt: string | null;
  errorMessage: string | null;
};

export type AiIndicatorSeriesPoint = {
  year: number;
  municipalityValue: number | null;
  provinceAverage: number | null;
  nationalAverage: number | null;
};

export type AiIndicatorSeries = {
  componentId: string;
  indicatorId: string;
  label: string;
  description: string | null;
  points: AiIndicatorSeriesPoint[];
  singleYearOnly: boolean;
};

export type ProvincePlanCandidate = {
  province: string;
  title: string;
  link: string;
  notes: string | null;
  priority: number;
  documentType: string | null;
  scoreTheme: string | null;
};

export type NationalPlanSource = {
  title: string;
  link: string;
  notes: string | null;
  priority: number;
  documentType: string | null;
  scoreTheme: string | null;
};

export type AiTabData = {
  scoreOptions: Array<{ id: string; label: string }>;
  selectedScoreId: string;
  indicatorSeries: AiIndicatorSeries[];
  cachedStages: Partial<Record<AiStageName, AiStageCacheEntry>>;
  provincePlanCandidates: ProvincePlanCandidate[];
};

export type AiStageMode = "generate" | "regenerate" | "load_cached";

export type AiStageRequestPayload = {
  releaseKey: string;
  year: number;
  municipalityId: string;
  scoreId: string;
  mode: AiStageMode;
};

export type AiStageResponsePayload = {
  stage: AiStageName;
  status: "completed" | "failed";
  cacheHit: boolean;
  renderedOutput: string | null;
  structuredOutput: Record<string, unknown>;
  sourceReferences: AiStageSourceReference[];
  modelName: string;
  promptVersion: string;
  updatedAt: string | null;
  errorMessage: string | null;
};

export type AiPipelineContext = {
  releaseKey: string;
  year: number;
  municipality: {
    id: string;
    name: string;
    district: string;
    province: string;
  };
  score: {
    id: string;
    label: string;
  };
  indicatorSeries: AiIndicatorSeries[];
  waterfalls: ScoreWaterfallGroup[];
  provincePlanCandidates: ProvincePlanCandidate[];
};
