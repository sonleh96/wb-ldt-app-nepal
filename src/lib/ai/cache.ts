import "server-only";

import { createHash } from "node:crypto";

import { getSupabaseServerClient } from "@/lib/supabase/server";

import type {
  AiDocumentContext,
  AiStageCacheEntry,
  AiStageName,
  AiStageSourceReference,
} from "@/lib/ai/types";

const AI_INVALIDATION_VERSION = process.env.AI_INVALIDATION_VERSION ?? "v1";

function isMissingRelationError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? error.code : null;
  return code === "PGRST205" || code === "42P01";
}

export function getAiPromptVersion() {
  return process.env.AI_PROMPT_VERSION ?? "v2";
}

export function getAiInvalidationVersion() {
  return AI_INVALIDATION_VERSION;
}

export function createFingerprint(input: unknown) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export type AiStageCacheLookup = {
  stage: AiStageName;
  releaseKey: string;
  year: number;
  municipalityId: string;
  province: string;
  scoreId: string;
  modelName: string;
  promptVersion: string;
  inputFingerprint: string;
};

export async function loadAiStageCache(
  lookup: AiStageCacheLookup,
): Promise<AiStageCacheEntry | null> {
  const supabase = getSupabaseServerClient().schema("analytics");

  try {
    const { data, error } = await supabase
      .from("ai_stage_cache")
      .select(
        "stage_name, status, rendered_output, structured_output, source_references, model_name, prompt_version, invalidation_version, updated_at, error_message",
      )
      .eq("stage_name", lookup.stage)
      .eq("release_key", lookup.releaseKey)
      .eq("year", lookup.year)
      .eq("municipality_id", lookup.municipalityId)
      .eq("province", lookup.province)
      .eq("score_id", lookup.scoreId)
      .eq("model_name", lookup.modelName)
      .eq("prompt_version", lookup.promptVersion)
      .eq("invalidation_version", getAiInvalidationVersion())
      .eq("input_fingerprint", lookup.inputFingerprint)
      .maybeSingle();

    if (error) {
      if (isMissingRelationError(error)) {
        return null;
      }

      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      stage: data.stage_name as AiStageName,
      status: data.status as "completed" | "failed",
      cacheHit: true,
      renderedOutput: data.rendered_output,
      structuredOutput: (data.structured_output ?? {}) as Record<string, unknown>,
      sourceReferences: (data.source_references ?? []) as AiStageSourceReference[],
      modelName: data.model_name,
      promptVersion: data.prompt_version,
      invalidationVersion: data.invalidation_version,
      updatedAt: data.updated_at,
      errorMessage: data.error_message,
    };
  } catch (error) {
    if (isMissingRelationError(error)) {
      return null;
    }

    throw error;
  }
}

export async function loadLatestAiStageCacheByScope({
  stage,
  releaseKey,
  year,
  municipalityId,
  province,
  scoreId,
}: {
  stage: AiStageName;
  releaseKey: string;
  year: number;
  municipalityId: string;
  province: string;
  scoreId: string;
}): Promise<AiStageCacheEntry | null> {
  const supabase = getSupabaseServerClient().schema("analytics");

  try {
    const { data, error } = await supabase
      .from("ai_stage_cache")
      .select(
        "stage_name, status, rendered_output, structured_output, source_references, model_name, prompt_version, invalidation_version, updated_at, error_message",
      )
      .eq("stage_name", stage)
      .eq("release_key", releaseKey)
      .eq("year", year)
      .eq("municipality_id", municipalityId)
      .eq("province", province)
      .eq("score_id", scoreId)
      .eq("invalidation_version", getAiInvalidationVersion())
      .eq("status", "completed")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingRelationError(error)) {
        return null;
      }

      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      stage: data.stage_name as AiStageName,
      status: data.status as "completed" | "failed",
      cacheHit: true,
      renderedOutput: data.rendered_output,
      structuredOutput: (data.structured_output ?? {}) as Record<string, unknown>,
      sourceReferences: (data.source_references ?? []) as AiStageSourceReference[],
      modelName: data.model_name,
      promptVersion: data.prompt_version,
      invalidationVersion: data.invalidation_version,
      updatedAt: data.updated_at,
      errorMessage: data.error_message,
    };
  } catch (error) {
    if (isMissingRelationError(error)) {
      return null;
    }

    throw error;
  }
}

export async function saveAiStageCache(
  lookup: AiStageCacheLookup & {
    renderedOutput: string | null;
    structuredOutput: Record<string, unknown>;
    sourceReferences: AiStageSourceReference[];
    promptHash: string;
    status: "completed" | "failed";
    errorMessage: string | null;
  },
) {
  const supabase = getSupabaseServerClient().schema("analytics");

  try {
    const { error } = await supabase.from("ai_stage_cache").upsert(
      {
        stage_name: lookup.stage,
        release_key: lookup.releaseKey,
        year: lookup.year,
        municipality_id: lookup.municipalityId,
        province: lookup.province,
        score_id: lookup.scoreId,
        model_name: lookup.modelName,
        prompt_version: lookup.promptVersion,
        invalidation_version: getAiInvalidationVersion(),
        input_fingerprint: lookup.inputFingerprint,
        prompt_hash: lookup.promptHash,
        status: lookup.status,
        rendered_output: lookup.renderedOutput,
        structured_output: lookup.structuredOutput,
        source_references: lookup.sourceReferences,
        error_message: lookup.errorMessage,
      },
      {
        onConflict:
          "stage_name,release_key,year,municipality_id,province,score_id,model_name,prompt_version,invalidation_version,input_fingerprint",
      },
    );

    if (error && !isMissingRelationError(error)) {
      throw error;
    }
  } catch (error) {
    if (!isMissingRelationError(error)) {
      throw error;
    }
  }
}

export async function loadDocumentContext(
  sourceType: AiDocumentContext["sourceType"],
  province: string | null,
  sourceUrlOrPath: string,
  contentFingerprint: string,
  extractionVersion: string,
): Promise<AiDocumentContext | null> {
  const supabase = getSupabaseServerClient().schema("analytics");

  try {
    const query = supabase
      .from("ai_document_contexts")
      .select(
        "source_type, title, province, source_url_or_path, content_mode, extracted_text, passages, chunks, extraction_metadata, content_fingerprint, extraction_version",
      )
      .eq("source_type", sourceType)
      .eq("source_url_or_path", sourceUrlOrPath)
      .eq("content_fingerprint", contentFingerprint)
      .eq("extraction_version", extractionVersion);

    const { data, error } = province
      ? await query.eq("province", province).maybeSingle()
      : await query.is("province", null).maybeSingle();

    if (error) {
      if (isMissingRelationError(error)) {
        return null;
      }

      throw error;
    }

    if (!data) {
      return null;
    }

    return toDocumentContext(data);
  } catch (error) {
    if (isMissingRelationError(error)) {
      return null;
    }

    throw error;
  }
}

type DocumentContextRow = {
  source_type: string;
  title: string;
  province: string | null;
  source_url_or_path: string;
  content_mode: string;
  extracted_text: string;
  passages: unknown;
  chunks: unknown;
  extraction_metadata: unknown;
  content_fingerprint: string;
  extraction_version: string;
};

function toDocumentContext(data: DocumentContextRow): AiDocumentContext {
  return {
    sourceType: data.source_type as AiDocumentContext["sourceType"],
    title: data.title,
    province: data.province,
    sourceUrlOrPath: data.source_url_or_path,
    contentMode: data.content_mode as AiDocumentContext["contentMode"],
    extractedText: data.extracted_text,
    passages: data.passages as AiDocumentContext["passages"],
    chunks: data.chunks as AiDocumentContext["chunks"],
    extractionMetadata: (data.extraction_metadata ?? {}) as Record<string, unknown>,
    contentFingerprint: data.content_fingerprint,
    extractionVersion: data.extraction_version,
  };
}

export async function loadLatestDocumentContextBySource(
  sourceType: AiDocumentContext["sourceType"],
  province: string | null,
  sourceUrlOrPath: string,
  extractionVersion: string,
): Promise<AiDocumentContext | null> {
  const supabase = getSupabaseServerClient().schema("analytics");

  try {
    const query = supabase
      .from("ai_document_contexts")
      .select(
        "source_type, title, province, source_url_or_path, content_mode, extracted_text, passages, chunks, extraction_metadata, content_fingerprint, extraction_version",
      )
      .eq("source_type", sourceType)
      .eq("source_url_or_path", sourceUrlOrPath)
      .eq("extraction_version", extractionVersion)
      .order("updated_at", { ascending: false })
      .limit(1);

    const { data, error } = province
      ? await query.eq("province", province).maybeSingle()
      : await query.is("province", null).maybeSingle();

    if (error) {
      if (isMissingRelationError(error)) {
        return null;
      }

      throw error;
    }

    return data ? toDocumentContext(data) : null;
  } catch (error) {
    if (isMissingRelationError(error)) {
      return null;
    }

    throw error;
  }
}

export async function saveDocumentContext(context: AiDocumentContext) {
  const supabase = getSupabaseServerClient().schema("analytics");

  try {
    const { error } = await supabase.from("ai_document_contexts").upsert(
      {
        source_type: context.sourceType,
        title: context.title,
        province: context.province,
        source_url_or_path: context.sourceUrlOrPath,
        content_mode: context.contentMode,
        extracted_text: context.extractedText,
        passages: context.passages,
        chunks: context.chunks,
        extraction_metadata: context.extractionMetadata,
        content_fingerprint: context.contentFingerprint,
        extraction_version: context.extractionVersion,
      },
      {
        onConflict:
          "source_type,province,source_url_or_path,content_fingerprint,extraction_version",
      },
    );

    if (error && !isMissingRelationError(error)) {
      throw error;
    }
  } catch (error) {
    if (!isMissingRelationError(error)) {
      throw error;
    }
  }
}
