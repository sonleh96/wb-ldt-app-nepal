import { NextResponse } from "next/server";

import { runAiStage } from "@/lib/ai/pipeline";
import { parseAiStageRequest, toStageErrorResponse } from "@/app/api/ai/_utils";

export async function POST(request: Request) {
  const parsed = await parseAiStageRequest(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const result = await runAiStage("swot_analysis", parsed.payload);
    return NextResponse.json(result);
  } catch (error) {
    return toStageErrorResponse("swot_analysis", error);
  }
}
