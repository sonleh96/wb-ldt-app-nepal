import { NextResponse } from "next/server";

import type { AiStageRequestPayload } from "@/lib/ai/types";

function isAiGenerationAllowed(request: Request) {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  if (process.env.AI_GENERATION_ENABLED === "true") {
    return true;
  }

  const adminToken = process.env.AI_ADMIN_TOKEN;
  if (!adminToken) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;
  const headerToken = request.headers.get("x-ai-admin-token");

  return bearerToken === adminToken || headerToken === adminToken;
}

function serializeStageError(error: unknown) {
  if (error instanceof Error) {
    const cause = (error as Error & { cause?: unknown }).cause;

    if (cause instanceof Error && cause.message && cause.message !== error.message) {
      return `${error.message}: ${cause.message}`;
    }

    if (typeof cause === "string" && cause && cause !== error.message) {
      return `${error.message}: ${cause}`;
    }

    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    const serialized = JSON.stringify(error);
    return serialized && serialized !== "{}"
      ? serialized
      : "Unknown AI stage failure.";
  } catch {
    return "Unknown AI stage failure.";
  }
}

export async function parseAiStageRequest(request: Request) {
  const payload = (await request.json()) as Partial<AiStageRequestPayload>;

  if (
    !payload ||
    typeof payload.releaseKey !== "string" ||
    typeof payload.year !== "number" ||
    typeof payload.municipalityId !== "string" ||
    typeof payload.scoreId !== "string" ||
    (payload.mode !== "generate" &&
      payload.mode !== "regenerate" &&
      payload.mode !== "load_cached")
  ) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "Invalid AI stage request payload.",
        },
        { status: 400 },
      ),
    };
  }

  if (payload.mode !== "load_cached" && !isAiGenerationAllowed(request)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error:
            "AI generation is disabled. Enable it with AI_GENERATION_ENABLED=true or provide a valid AI admin token.",
        },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    payload: payload as AiStageRequestPayload,
  };
}

export function toStageErrorResponse(stage: string, error: unknown) {
  const message = serializeStageError(error);
  console.error(`AI stage ${stage} failed:`, error);

  return NextResponse.json(
    {
      stage,
      status: "failed",
      cacheHit: false,
      renderedOutput: null,
      structuredOutput: {},
      sourceReferences: [],
      modelName: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      promptVersion: process.env.AI_PROMPT_VERSION ?? "v1",
      updatedAt: new Date().toISOString(),
      errorMessage: message,
    },
    { status: 500 },
  );
}
