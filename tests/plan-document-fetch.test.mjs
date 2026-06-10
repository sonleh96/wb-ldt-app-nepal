import assert from "node:assert/strict";
import test from "node:test";

import {
  canUseRelaxedTlsForPlanDocumentUrl,
  isNodeTlsCertificateError,
} from "../src/lib/ai/plan-document-fetch.ts";

test("plan document fetch helper recognizes Node certificate-chain fetch failures", () => {
  const error = new TypeError("fetch failed", {
    cause: Object.assign(new Error("unable to verify the first certificate"), {
      code: "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
    }),
  });

  assert.equal(isNodeTlsCertificateError(error), true);
});

test("relaxed TLS fallback is limited to known planning-document hosts", () => {
  assert.equal(
    canUseRelaxedTlsForPlanDocumentUrl(
      "https://www.cabinet.gov.zm/newsite/wp-content/uploads/2023/12/8NDP-2022-2026.pdf",
    ),
    true,
  );
  assert.equal(
    canUseRelaxedTlsForPlanDocumentUrl("https://example.com/not-a-plan.pdf"),
    false,
  );
});

test("relaxed TLS fallback includes Zambia government local-plan hosts", () => {
  assert.equal(
    canUseRelaxedTlsForPlanDocumentUrl(
      "https://www.chitambocouncil.gov.zm/wp-content/uploads/2024/08/CHITAMBO-IDP_SIMPLIFIED-VERSION-2024.pdf",
    ),
    true,
  );
  assert.equal(
    canUseRelaxedTlsForPlanDocumentUrl("https://ziflp.org.zm/wp-content/uploads/2024/02/Katete_District-IDP.pdf"),
    false,
  );
});
