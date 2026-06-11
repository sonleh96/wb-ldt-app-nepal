import assert from "node:assert/strict";
import test from "node:test";

import { getCountryBySlug } from "../src/lib/countries.ts";
import { getCountryLandingActions } from "../src/lib/country-landing-actions.ts";

test("Serbia country landing actions put strategy inventory next to analytics", () => {
  const country = getCountryBySlug("serbia");
  assert.ok(country);

  const actions = getCountryLandingActions(country);

  assert.deepEqual(
    actions.map((action) => [action.label, action.href, action.align]),
    [
      ["Analyze municipality metrics", "/serbia/analytics", "left"],
      ["Strategy inventory", "/serbia/strategy-inventory", "left"],
      ["Return to Homepage", "/", "right"],
    ],
  );
});

test("Countries without strategy inventory keep only analytics and homepage actions", () => {
  const country = getCountryBySlug("zambia");
  assert.ok(country);

  const actions = getCountryLandingActions(country);

  assert.deepEqual(
    actions.map((action) => [action.label, action.href, action.align]),
    [
      ["Analyze district metrics", "/zambia/analytics", "left"],
      ["Return to Homepage", "/", "right"],
    ],
  );
});
