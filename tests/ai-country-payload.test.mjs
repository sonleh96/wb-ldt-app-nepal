import assert from "node:assert/strict";
import test from "node:test";

import { validateAiStageRequestPayload } from "../src/lib/ai/request.ts";

const validPayload = {
  countryCode: "ZMB",
  releaseKey: "zmb-2025-v1",
  year: 2025,
  municipalityId: "zmb-2025-v1:chitambo",
  scoreId: "prosperity_score",
  mode: "generate",
};

test("AI stage payload validation rejects requests without a country code", () => {
  const missingCountryCode = {
    releaseKey: validPayload.releaseKey,
    year: validPayload.year,
    municipalityId: validPayload.municipalityId,
    scoreId: validPayload.scoreId,
    mode: validPayload.mode,
  };

  const result = validateAiStageRequestPayload(missingCountryCode);

  assert.equal(result.ok, false);
  assert.equal(result.error, "Invalid AI stage request payload.");
});

test("AI stage payload validation rejects unknown country codes", () => {
  const result = validateAiStageRequestPayload({
    ...validPayload,
    countryCode: "BAD",
  });

  assert.equal(result.ok, false);
  assert.equal(result.error, "Invalid AI stage request payload.");
});

test("AI stage payload validation accepts supported country-aware requests", () => {
  const result = validateAiStageRequestPayload(validPayload);

  assert.equal(result.ok, true);
  assert.deepEqual(result.payload, validPayload);
});
