import { NextResponse } from "next/server";

import type { AiStageRequestPayload } from "@/lib/ai/types";

function serializeStageError(error: unknown) {
  if (error instanceof Error) {
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

  return {
    ok: true as const,
    payload: payload as AiStageRequestPayload,
  };
}

export function toStageErrorResponse(stage: string, error: unknown) {
  const message = serializeStageError(error);

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
