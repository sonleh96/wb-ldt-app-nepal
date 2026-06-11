import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Nepal country page uses the shared country landing layout", async () => {
  const source = await readFile("src/app/nepal/page.tsx", "utf8");

  assert.match(source, /CountryLandingPage/);
  assert.match(source, /getCountryBySlug\("nepal"\)/);
  assert.doesNotMatch(source, /SngDisplaySection/);
  assert.doesNotMatch(source, /getSupabaseServerClient/);
});
