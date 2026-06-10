import { NextResponse } from "next/server";

import { runAiStage } from "@/lib/ai/pipeline";
import { parseAiStageRequest, toStageErrorResponse } from "@/app/api/ai/_utils";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const parsed = await parseAiStageRequest(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const result = await runAiStage("web_context_search", parsed.payload);
    return NextResponse.json(result);
  } catch (error) {
    return toStageErrorResponse("web_context_search", error);
  }
}
