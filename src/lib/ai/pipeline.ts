import "server-only";

import {
  createFingerprint,
  getAiInvalidationVersion,
  getAiPromptVersion,
  loadAiStageCache,
  loadLatestAiStageCacheByScope,
  saveDocumentContext,
  saveAiStageCache,
} from "@/lib/ai/cache";
import { searchWithExa, tryExtractWithExa } from "@/lib/ai/exa";
import { generateOpenAiText, getOpenAiModel } from "@/lib/ai/openai";
import {
  basePlanningSystemPrompt,
  buildIndicatorNarrativePrompt,
  buildInvestmentRecommendationsPrompt,
  buildPlanAlignmentPrompt,
  buildSwotPrompt,
  buildWebContextSummaryPrompt,
} from "@/lib/ai/prompts";
import type {
  AiDocumentContext,
  AiPipelineContext,
  AiStageName,
  AiStageRequestPayload,
  AiStageResponsePayload,
  AiStageSourceReference,
} from "@/lib/ai/types";
import { getAiPipelineContextForRequest } from "@/lib/data/queries";

const DOCUMENT_MODEL_NAME = "document-parser";

function buildDocumentStageOutput(context: AiDocumentContext, sourceLabel: string) {
  const excerpt = context.passages.slice(0, 12).map((passage) => passage.text).join("\n\n");
  const previewText = excerpt || context.extractedText.slice(0, 12000);

  return {
    renderedOutput: [
      `Source: ${sourceLabel}`,
      `Title: ${context.title}`,
      `Content mode: ${context.contentMode}`,
      `Captured passages: ${context.passages.length}`,
      "",
      previewText,
    ].join("\n"),
    structuredOutput: {
      sourceType: context.sourceType,
      title: context.title,
      province: context.province,
      sourceUrlOrPath: context.sourceUrlOrPath,
      contentMode: context.contentMode,
      extractedText: context.extractedText,
      extractionMetadata: context.extractionMetadata,
      passages: context.passages,
      chunks: context.chunks,
      contentFingerprint: context.contentFingerprint,
      extractionVersion: context.extractionVersion,
    },
  };
}

function documentFromStructuredOutput(
  output: Record<string, unknown>,
  fallbackSourceType: AiDocumentContext["sourceType"],
): AiDocumentContext | null {
  const title = typeof output.title === "string" ? output.title : null;
  const sourceUrlOrPath =
    typeof output.sourceUrlOrPath === "string" ? output.sourceUrlOrPath : null;
  const extractedText =
    typeof output.extractedText === "string" ? output.extractedText : null;
  const contentFingerprint =
    typeof output.contentFingerprint === "string" ? output.contentFingerprint : null;
  const extractionVersion =
    typeof output.extractionVersion === "string" ? output.extractionVersion : null;
  const contentMode =
    output.contentMode === "chunked_text" ? "chunked_text" : "full_text";

  if (!title || !sourceUrlOrPath || !extractedText || !contentFingerprint || !extractionVersion) {
    return null;
  }

  return {
    sourceType:
      output.sourceType === "national_plan" || output.sourceType === "province_plan"
        ? output.sourceType
        : fallbackSourceType,
    title,
    province: typeof output.province === "string" ? output.province : null,
    sourceUrlOrPath,
    contentMode,
    extractedText,
    passages: Array.isArray(output.passages)
      ? (output.passages as AiDocumentContext["passages"])
      : [],
    chunks: Array.isArray(output.chunks)
      ? (output.chunks as AiDocumentContext["chunks"])
      : [],
    extractionMetadata:
      output.extractionMetadata && typeof output.extractionMetadata === "object"
        ? (output.extractionMetadata as AiDocumentContext["extractionMetadata"])
        : {},
    contentFingerprint,
    extractionVersion,
  };
}

function buildStageFingerprint(stage: AiStageName, input: unknown) {
  return createFingerprint({
    stage,
    input,
    invalidationVersion: getAiInvalidationVersion(),
  });
}

function buildWebContextQuery(context: AiPipelineContext) {
  return [
    `"${context.municipality.province}" Nepal development plan`,
    `"${context.municipality.name}" municipality`,
    `"${context.score.label}"`,
    "public investment priorities",
  ].join(" ");
}

function buildWebContextStageOutput(
  hits: Array<{
    title: string;
    url: string;
    text: string;
    publishedDate: string | null;
    score: number | null;
  }>,
  summary: string,
) {
  return {
    renderedOutput: summary,
    structuredOutput: {
      queryHits: hits.map((hit) => ({
        title: hit.title,
        url: hit.url,
        snippet: hit.text.slice(0, 1800),
        publishedDate: hit.publishedDate,
        score: hit.score,
      })),
    },
  };
}

function getWebContextSummaryFromStage(
  stage: AiStageResponsePayload | null,
) {
  if (stage?.status !== "completed") {
    return null;
  }

  const hits = Array.isArray(stage.structuredOutput.queryHits)
    ? stage.structuredOutput.queryHits
    : [];

  if (hits.length === 0) {
    return null;
  }

  return stage.renderedOutput;
}

function toCacheEntry({
  stage,
  cacheHit,
  renderedOutput,
  structuredOutput,
  sourceReferences,
  modelName,
  promptVersion,
  errorMessage,
}: {
  stage: AiStageName;
  cacheHit: boolean;
  renderedOutput: string | null;
  structuredOutput: Record<string, unknown>;
  sourceReferences: AiStageSourceReference[];
  modelName: string;
  promptVersion: string;
  errorMessage?: string | null;
}): AiStageResponsePayload {
  return {
    stage,
    status: errorMessage ? "failed" : "completed",
    cacheHit,
    renderedOutput,
    structuredOutput,
    sourceReferences,
    modelName,
    promptVersion,
    updatedAt: new Date().toISOString(),
    errorMessage: errorMessage ?? null,
  };
}

function toFailureStage(
  stage: AiStageName,
  modelName: string,
  message: string,
): AiStageResponsePayload {
  return {
    stage,
    status: "failed",
    cacheHit: false,
    renderedOutput: null,
    structuredOutput: {},
    sourceReferences: [],
    modelName,
    promptVersion: getAiPromptVersion(),
    updatedAt: new Date().toISOString(),
    errorMessage: message,
  };
}

function chooseProvincePlanUrl(context: AiPipelineContext) {
  return [...context.provincePlanCandidates].sort((left, right) => left.priority - right.priority)[0] ?? null;
}

async function getCachedEntry(
  stage: AiStageName,
  context: AiPipelineContext,
  modelName: string,
  inputFingerprint: string,
) {
  const cached = await loadAiStageCache({
    stage,
    releaseKey: context.releaseKey,
    year: context.year,
    municipalityId: context.municipality.id,
    province: context.municipality.province,
    scoreId: context.score.id,
    modelName,
    promptVersion: getAiPromptVersion(),
    inputFingerprint,
  });

  return cached?.status === "completed" ? cached : null;
}

async function persistEntry(
  stage: AiStageName,
  context: AiPipelineContext,
  modelName: string,
  inputFingerprint: string,
  promptHash: string,
  response: AiStageResponsePayload,
) {
  await saveAiStageCache({
    stage,
    releaseKey: context.releaseKey,
    year: context.year,
    municipalityId: context.municipality.id,
    province: context.municipality.province,
    scoreId: context.score.id,
    modelName,
    promptVersion: getAiPromptVersion(),
    inputFingerprint,
    promptHash,
    renderedOutput: response.renderedOutput,
    structuredOutput: response.structuredOutput,
    sourceReferences: response.sourceReferences,
    status: response.status,
    errorMessage: response.errorMessage,
  });
}

async function persistEntrySafely(
  stage: AiStageName,
  context: AiPipelineContext,
  modelName: string,
  inputFingerprint: string,
  promptHash: string,
  response: AiStageResponsePayload,
) {
  try {
    await persistEntry(stage, context, modelName, inputFingerprint, promptHash, response);
  } catch (error) {
    console.error(`Failed to persist AI stage ${stage}:`, error);
  }
}

async function runIndicatorNarrativeStage(
  context: AiPipelineContext,
  mode: AiStageRequestPayload["mode"],
) {
  const modelName = getOpenAiModel();
  const prompt = buildIndicatorNarrativePrompt(context);
  const inputFingerprint = buildStageFingerprint("indicator_narrative", {
    municipality: context.municipality,
    score: context.score,
    indicatorSeries: context.indicatorSeries,
  });
  const promptHash = createFingerprint({
    system: basePlanningSystemPrompt,
    prompt,
  });

  if (mode !== "regenerate") {
    const cached = await getCachedEntry("indicator_narrative", context, modelName, inputFingerprint);
    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      };
    }
    if (mode === "load_cached") {
      return toFailureStage("indicator_narrative", modelName, "No cached indicator narrative found.");
    }
  }

  const generated = await generateOpenAiText({
    system: basePlanningSystemPrompt,
    prompt,
    model: modelName,
  });

  const response = toCacheEntry({
    stage: "indicator_narrative",
    cacheHit: false,
    renderedOutput: generated.text,
    structuredOutput: {
      municipality: context.municipality,
      score: context.score,
    },
    sourceReferences: [
      {
        label: `${context.score.label} indicator series`,
        type: "indicator_series",
        source: "supabase",
      },
    ],
    modelName,
    promptVersion: getAiPromptVersion(),
  });

  await persistEntrySafely(
    "indicator_narrative",
    context,
    modelName,
    inputFingerprint,
    promptHash,
    response,
  );
  return response;
}

async function getProvinceDocumentContext(context: AiPipelineContext) {
  const chosen = chooseProvincePlanUrl(context);

  if (!chosen) {
    throw new Error(`No province plan link found for ${context.municipality.province}.`);
  }

  try {
    const { getProvincePlanContext } = await import("@/lib/ai/documents");
    const direct = await getProvincePlanContext(context.municipality.province);
    return {
      document: direct.context,
      sourceReferences: [
        {
          label: direct.context.title,
          type: "document" as const,
          source: direct.context.sourceUrlOrPath,
          metadata: {
            provider: "direct_parse",
            province: context.municipality.province,
            candidates: direct.candidates,
          },
        },
      ],
    };
  } catch (directError) {
    const exaResult = await tryExtractWithExa(chosen.link);

    if (!exaResult) {
      throw directError;
    }

    const document: AiDocumentContext = {
      sourceType: "province_plan",
      title: exaResult.title,
      province: context.municipality.province,
      sourceUrlOrPath: exaResult.sourceUrlOrPath,
      contentMode: "full_text",
      extractedText: exaResult.extractedText,
      passages: exaResult.extractedText
        .split(/\n{2,}/)
        .map((passage) => passage.trim())
        .filter((passage) => passage.length > 80)
        .slice(0, 80)
        .map((passage, index) => ({
          id: `passage-${index + 1}`,
          title: null,
          text: passage,
        })),
      chunks: [],
      extractionMetadata: {
        ...(exaResult.metadata ?? {}),
        candidateNotes: chosen.notes,
        fallbackReason:
          directError instanceof Error ? directError.message : "direct province-plan parse failed",
        chunkingReady: true,
      },
      contentFingerprint: createFingerprint(exaResult.extractedText),
      extractionVersion: "v2",
    };

    await saveDocumentContext(document);

    return {
      document,
      sourceReferences: [
        {
          label: exaResult.title,
          type: "document" as const,
          source: exaResult.sourceUrlOrPath,
          metadata: {
            provider: "exa_fallback",
            province: context.municipality.province,
          },
        },
      ],
    };
  }
}

async function runProvincePlanStage(
  context: AiPipelineContext,
  mode: AiStageRequestPayload["mode"],
) {
  const chosen = chooseProvincePlanUrl(context);
  const inputFingerprint = buildStageFingerprint("province_plan_context", {
    province: context.municipality.province,
    selectedPlanUrl: chosen?.link ?? null,
    extractionVersion: "v2",
    displayVersion: "v2",
  });

  if (mode !== "regenerate") {
    const cached = await getCachedEntry("province_plan_context", context, DOCUMENT_MODEL_NAME, inputFingerprint);
    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      };
    }
    if (mode === "load_cached") {
      return toFailureStage("province_plan_context", DOCUMENT_MODEL_NAME, "No cached province plan context found.");
    }
  }

  const { document, sourceReferences } = await getProvinceDocumentContext(context);
  const stageOutput = buildDocumentStageOutput(document, `${context.municipality.province} provincial plan`);
  const response = toCacheEntry({
    stage: "province_plan_context",
    cacheHit: false,
    renderedOutput: stageOutput.renderedOutput,
    structuredOutput: stageOutput.structuredOutput,
    sourceReferences,
    modelName: DOCUMENT_MODEL_NAME,
    promptVersion: getAiPromptVersion(),
  });

  await persistEntrySafely(
    "province_plan_context",
    context,
    DOCUMENT_MODEL_NAME,
    inputFingerprint,
    inputFingerprint,
    response,
  );

  return response;
}

async function runNationalPlanStage(
  context: AiPipelineContext,
  mode: AiStageRequestPayload["mode"],
) {
  const { getNationalPlanContext, loadNationalPlanSources } = await import("@/lib/ai/documents");
  const selectedNationalSources = await loadNationalPlanSources(context.score.id);
  const inputFingerprint = buildStageFingerprint("national_plan_context", {
    scoreId: context.score.id,
    selectedPlanUrls: selectedNationalSources.map((source) => source.link),
    extractionVersion: "v2",
    displayVersion: "v2",
  });

  if (mode !== "regenerate") {
    const cached = await getCachedEntry("national_plan_context", context, DOCUMENT_MODEL_NAME, inputFingerprint);
    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      };
    }
    if (mode === "load_cached") {
      return toFailureStage("national_plan_context", DOCUMENT_MODEL_NAME, "No cached national plan context found.");
    }
  }

  const { context: document, sources } = await getNationalPlanContext(context.score.id);
  const stageOutput = buildDocumentStageOutput(
    document,
    sources.length === 1 ? "Nepal national plan" : "Nepal national planning documents",
  );
  const response = toCacheEntry({
    stage: "national_plan_context",
    cacheHit: false,
    renderedOutput: stageOutput.renderedOutput,
    structuredOutput: stageOutput.structuredOutput,
    sourceReferences: sources.map((source) => ({
      label: source.title,
      type: "document" as const,
      source: source.link,
      metadata: {
        documentType: source.documentType,
        scoreTheme: source.scoreTheme,
        priority: source.priority,
      },
    })),
    modelName: DOCUMENT_MODEL_NAME,
    promptVersion: getAiPromptVersion(),
  });

  await persistEntrySafely(
    "national_plan_context",
    context,
    DOCUMENT_MODEL_NAME,
    inputFingerprint,
    inputFingerprint,
    response,
  );

  return response;
}

async function loadRequiredStage(stage: AiStageName, context: AiPipelineContext) {
  return loadLatestAiStageCacheByScope({
    stage,
    releaseKey: context.releaseKey,
    year: context.year,
    municipalityId: context.municipality.id,
    province: context.municipality.province,
    scoreId: context.score.id,
  });
}

async function runWebContextSearchStage(
  context: AiPipelineContext,
  mode: AiStageRequestPayload["mode"],
) {
  const modelName = getOpenAiModel();
  const searchQuery = buildWebContextQuery(context);
  const inputFingerprint = buildStageFingerprint("web_context_search", {
    municipality: context.municipality,
    score: context.score,
    searchQuery,
    searchProvider: "exa",
    searchVersion: "v1",
  });

  if (mode !== "regenerate") {
    const cached = await getCachedEntry("web_context_search", context, modelName, inputFingerprint);
    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      };
    }
    if (mode === "load_cached") {
      return toFailureStage("web_context_search", modelName, "No cached web context found.");
    }
  }

  let hits: Array<{
    title: string;
    url: string;
    text: string;
    publishedDate: string | null;
    score: number | null;
  }> = [];

  try {
    hits = await searchWithExa(searchQuery, 5);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The web context search provider raised an unexpected error.";

    const response = toCacheEntry({
      stage: "web_context_search",
      cacheHit: false,
      renderedOutput: `No additional web context was injected. The optional Exa web search failed: ${message}`,
      structuredOutput: {
        queryHits: [],
        skipped: true,
        reason: message,
      },
      sourceReferences: [],
      modelName,
      promptVersion: getAiPromptVersion(),
    });

    await persistEntrySafely(
      "web_context_search",
      context,
      modelName,
      inputFingerprint,
      inputFingerprint,
      response,
    );

    return response;
  }

  if (hits.length === 0) {
    const response = toCacheEntry({
      stage: "web_context_search",
      cacheHit: false,
      renderedOutput:
        "No additional web context was injected. No reliable external search results were retrieved for the selected municipality and score.",
      structuredOutput: {
        queryHits: [],
        skipped: true,
        reason: "No reliable Exa search results were available.",
      },
      sourceReferences: [],
      modelName,
      promptVersion: getAiPromptVersion(),
    });

    await persistEntrySafely(
      "web_context_search",
      context,
      modelName,
      inputFingerprint,
      inputFingerprint,
      response,
    );

    return response;
  }

  const prompt = buildWebContextSummaryPrompt({
    context,
    hits,
  });
  const promptHash = createFingerprint({
    system: basePlanningSystemPrompt,
    prompt,
  });

  const generated = await generateOpenAiText({
    system: basePlanningSystemPrompt,
    prompt,
    model: modelName,
  });

  const stageOutput = buildWebContextStageOutput(hits, generated.text);
  const response = toCacheEntry({
    stage: "web_context_search",
    cacheHit: false,
    renderedOutput: stageOutput.renderedOutput,
    structuredOutput: stageOutput.structuredOutput,
    sourceReferences: hits.map((hit) => ({
      label: hit.title,
      type: "web_search" as const,
      source: hit.url,
      metadata: {
        publishedDate: hit.publishedDate,
        searchScore: hit.score,
      },
    })),
    modelName,
    promptVersion: getAiPromptVersion(),
  });

  await persistEntrySafely(
    "web_context_search",
    context,
    modelName,
    inputFingerprint,
    promptHash,
    response,
  );
  return response;
}

async function runAlignmentStage(
  context: AiPipelineContext,
  mode: AiStageRequestPayload["mode"],
) {
  const modelName = getOpenAiModel();
  const [provinceStage, nationalStage] = await Promise.all([
    loadRequiredStage("province_plan_context", context),
    loadRequiredStage("national_plan_context", context),
  ]);
  const webContextStage = await loadRequiredStage("web_context_search", context);

  if (
    !provinceStage ||
    !nationalStage ||
    provinceStage.status === "failed" ||
    nationalStage.status === "failed" ||
    !provinceStage.structuredOutput.sourceUrlOrPath ||
    !nationalStage.structuredOutput.sourceUrlOrPath
  ) {
    return toFailureStage("plan_alignment", modelName, "Province and national plan contexts must be available before alignment can run.");
  }

  const provinceDocument = documentFromStructuredOutput(
    provinceStage.structuredOutput,
    "province_plan",
  );
  const nationalDocument = documentFromStructuredOutput(
    nationalStage.structuredOutput,
    "national_plan",
  );

  if (!provinceDocument || !nationalDocument) {
    return toFailureStage(
      "plan_alignment",
      modelName,
      "Province and national plan contexts were cached, but could not be reconstructed for alignment.",
    );
  }

  const prompt = buildPlanAlignmentPrompt(
    provinceDocument,
    nationalDocument,
    context,
    getWebContextSummaryFromStage(webContextStage),
  );
  const inputFingerprint = buildStageFingerprint("plan_alignment", {
    provinceFingerprint: provinceDocument.contentFingerprint,
    nationalFingerprint: nationalDocument.contentFingerprint,
    webContext: getWebContextSummaryFromStage(webContextStage),
    municipality: context.municipality,
    score: context.score,
  });
  const promptHash = createFingerprint({
    system: basePlanningSystemPrompt,
    prompt,
  });

  if (mode !== "regenerate") {
    const cached = await getCachedEntry("plan_alignment", context, modelName, inputFingerprint);
    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      };
    }
    if (mode === "load_cached") {
      return toFailureStage("plan_alignment", modelName, "No cached plan alignment found.");
    }
  }

  const generated = await generateOpenAiText({
    system: basePlanningSystemPrompt,
    prompt,
    model: modelName,
  });
  const response = toCacheEntry({
    stage: "plan_alignment",
    cacheHit: false,
    renderedOutput: generated.text,
    structuredOutput: {
      municipality: context.municipality,
      province: context.municipality.province,
    },
    sourceReferences: [
      {
        label: provinceDocument.title,
        type: "document",
        source: provinceDocument.sourceUrlOrPath,
      },
      {
        label: nationalDocument.title,
        type: "document",
        source: nationalDocument.sourceUrlOrPath,
      },
      ...(webContextStage?.sourceReferences ?? []),
    ],
    modelName,
    promptVersion: getAiPromptVersion(),
  });
  await persistEntrySafely(
    "plan_alignment",
    context,
    modelName,
    inputFingerprint,
    promptHash,
    response,
  );
  return response;
}

async function runSwotStage(
  context: AiPipelineContext,
  mode: AiStageRequestPayload["mode"],
) {
  const modelName = getOpenAiModel();
  const indicatorStage = await loadRequiredStage("indicator_narrative", context);
  if (!indicatorStage?.renderedOutput) {
    return toFailureStage("swot_analysis", modelName, "Indicator narrative must be generated before SWOT can run.");
  }

  const [provinceStage, nationalStage] = await Promise.all([
    loadRequiredStage("province_plan_context", context),
    loadRequiredStage("national_plan_context", context),
  ]);
  const webContextStage = await loadRequiredStage("web_context_search", context);

  if (!provinceStage?.structuredOutput || !nationalStage?.structuredOutput) {
    return toFailureStage(
      "swot_analysis",
      modelName,
      "Province and national plan contexts must be generated before SWOT can run.",
    );
  }

  const provinceDocument = documentFromStructuredOutput(
    provinceStage.structuredOutput,
    "province_plan",
  );
  const nationalDocument = documentFromStructuredOutput(
    nationalStage.structuredOutput,
    "national_plan",
  );

  if (!provinceDocument || !nationalDocument) {
    return toFailureStage(
      "swot_analysis",
      modelName,
      "Province and national plan contexts were cached, but could not be reconstructed for SWOT generation.",
    );
  }

  const prompt = buildSwotPrompt({
    context,
    indicatorNarrative: indicatorStage.renderedOutput,
    provinceDocument,
    nationalDocument,
    webContextSummary: getWebContextSummaryFromStage(webContextStage),
  });
  const inputFingerprint = buildStageFingerprint("swot_analysis", {
    indicatorNarrative: indicatorStage.renderedOutput,
    provinceFingerprint: provinceDocument.contentFingerprint,
    nationalFingerprint: nationalDocument.contentFingerprint,
    webContext: getWebContextSummaryFromStage(webContextStage),
    municipality: context.municipality,
    score: context.score,
  });
  const promptHash = createFingerprint({
    system: basePlanningSystemPrompt,
    prompt,
  });

  if (mode !== "regenerate") {
    const cached = await getCachedEntry("swot_analysis", context, modelName, inputFingerprint);
    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      };
    }
    if (mode === "load_cached") {
      return toFailureStage("swot_analysis", modelName, "No cached SWOT analysis found.");
    }
  }

  const generated = await generateOpenAiText({
    system: basePlanningSystemPrompt,
    prompt,
    model: modelName,
  });
  const response = toCacheEntry({
    stage: "swot_analysis",
    cacheHit: false,
    renderedOutput: generated.text,
    structuredOutput: {
      municipality: context.municipality,
      score: context.score,
    },
    sourceReferences: [
      {
        label: "Indicator narrative",
        type: "generated",
        source: "indicator_narrative",
      },
      {
        label: provinceDocument.title,
        type: "document",
        source: provinceDocument.sourceUrlOrPath,
      },
      {
        label: nationalDocument.title,
        type: "document",
        source: nationalDocument.sourceUrlOrPath,
      },
      ...(webContextStage?.sourceReferences ?? []),
    ],
    modelName,
    promptVersion: getAiPromptVersion(),
  });
  await persistEntrySafely(
    "swot_analysis",
    context,
    modelName,
    inputFingerprint,
    promptHash,
    response,
  );
  return response;
}

async function runRecommendationsStage(
  context: AiPipelineContext,
  mode: AiStageRequestPayload["mode"],
) {
  const modelName = getOpenAiModel();
  const [indicatorStage, alignmentStage, swotStage] = await Promise.all([
    loadRequiredStage("indicator_narrative", context),
    loadRequiredStage("plan_alignment", context),
    loadRequiredStage("swot_analysis", context),
  ]);
  const webContextStage = await loadRequiredStage("web_context_search", context);

  if (!indicatorStage?.renderedOutput || !alignmentStage?.renderedOutput || !swotStage?.renderedOutput) {
    return toFailureStage(
      "investment_recommendations",
      modelName,
      "Indicator narrative, plan alignment, and SWOT analysis must be available before recommendations can run.",
    );
  }

  const prompt = buildInvestmentRecommendationsPrompt({
    context,
    indicatorNarrative: indicatorStage.renderedOutput,
    alignment: alignmentStage.renderedOutput,
    swot: swotStage.renderedOutput,
    webContextSummary: getWebContextSummaryFromStage(webContextStage),
  });
  const inputFingerprint = buildStageFingerprint("investment_recommendations", {
    indicatorNarrative: indicatorStage.renderedOutput,
    alignment: alignmentStage.renderedOutput,
    swot: swotStage.renderedOutput,
    webContext: getWebContextSummaryFromStage(webContextStage),
    municipality: context.municipality,
    score: context.score,
  });
  const promptHash = createFingerprint({
    system: basePlanningSystemPrompt,
    prompt,
  });

  if (mode !== "regenerate") {
    const cached = await getCachedEntry("investment_recommendations", context, modelName, inputFingerprint);
    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      };
    }
    if (mode === "load_cached") {
      return toFailureStage("investment_recommendations", modelName, "No cached investment recommendations found.");
    }
  }

  const generated = await generateOpenAiText({
    system: basePlanningSystemPrompt,
    prompt,
    model: modelName,
  });
  const response = toCacheEntry({
    stage: "investment_recommendations",
    cacheHit: false,
    renderedOutput: generated.text,
    structuredOutput: {
      municipality: context.municipality,
      score: context.score,
    },
    sourceReferences: [
      {
        label: "Indicator narrative",
        type: "generated",
        source: "indicator_narrative",
      },
      {
        label: "Plan alignment",
        type: "generated",
        source: "plan_alignment",
      },
      {
        label: "SWOT analysis",
        type: "generated",
        source: "swot_analysis",
      },
      ...(webContextStage?.sourceReferences ?? []),
    ],
    modelName,
    promptVersion: getAiPromptVersion(),
  });
  await persistEntrySafely(
    "investment_recommendations",
    context,
    modelName,
    inputFingerprint,
    promptHash,
    response,
  );
  return response;
}

export async function runAiStage(
  stage: AiStageName,
  payload: AiStageRequestPayload,
): Promise<AiStageResponsePayload> {
  const context = await getAiPipelineContextForRequest({
    year: payload.year,
    municipalityId: payload.municipalityId,
    scoreId: payload.scoreId,
    includeProvincePlanCandidates:
      stage === "province_plan_context" || stage === "plan_alignment",
  });

  switch (stage) {
    case "indicator_narrative":
      return runIndicatorNarrativeStage(context, payload.mode);
    case "province_plan_context":
      return runProvincePlanStage(context, payload.mode);
    case "national_plan_context":
      return runNationalPlanStage(context, payload.mode);
    case "web_context_search":
      return runWebContextSearchStage(context, payload.mode);
    case "plan_alignment":
      return runAlignmentStage(context, payload.mode);
    case "swot_analysis":
      return runSwotStage(context, payload.mode);
    case "investment_recommendations":
      return runRecommendationsStage(context, payload.mode);
    default:
      return toFailureStage(stage, getOpenAiModel(), "Unsupported AI stage.");
  }
}
