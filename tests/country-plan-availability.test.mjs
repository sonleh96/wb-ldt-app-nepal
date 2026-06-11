import assert from "node:assert/strict";
import test from "node:test";

import { getCountryBySlug } from "../src/lib/countries.ts";
import { getPlanAvailabilityDisclosure } from "../src/lib/country-plan-availability.ts";

test("plan source availability disclosure is collapsed by default", () => {
  const serbia = getCountryBySlug("serbia");
  assert.ok(serbia);

  const disclosure = getPlanAvailabilityDisclosure(serbia);

  assert.equal(disclosure.defaultOpen, false);
  assert.equal(disclosure.trackedUnitLabel, "municipalities");
  assert.match(disclosure.description, /local\/SNG plan links/);
});

test("higher-level plan countries describe higher administrative units", () => {
  const nepal = getCountryBySlug("nepal");
  assert.ok(nepal);

  const disclosure = getPlanAvailabilityDisclosure(nepal);

  assert.equal(disclosure.defaultOpen, false);
  assert.equal(disclosure.trackedUnitLabel, "provinces");
});
