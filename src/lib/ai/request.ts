import type { AiStageRequestPayload } from "@/lib/ai/types";

const supportedCountryCodes = new Set(["NPL", "ZMB", "SRB"]);
const supportedModes = new Set(["generate", "regenerate", "load_cached"]);

export function validateAiStageRequestPayload(
  payload: Partial<AiStageRequestPayload> | null | undefined,
):
  | { ok: true; payload: AiStageRequestPayload }
  | { ok: false; error: "Invalid AI stage request payload." } {
  if (
    !payload ||
    typeof payload.countryCode !== "string" ||
    !supportedCountryCodes.has(payload.countryCode) ||
    typeof payload.releaseKey !== "string" ||
    typeof payload.year !== "number" ||
    typeof payload.municipalityId !== "string" ||
    typeof payload.scoreId !== "string" ||
    typeof payload.mode !== "string" ||
    !supportedModes.has(payload.mode)
  ) {
    return {
      ok: false,
      error: "Invalid AI stage request payload.",
    };
  }

  return {
    ok: true,
    payload: payload as AiStageRequestPayload,
  };
}
