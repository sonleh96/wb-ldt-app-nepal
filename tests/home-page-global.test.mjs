import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("home page derives loaded LSG stats from all country datasets", async () => {
  const source = await readFile("src/app/page.tsx", "utf8");

  assert.match(source, /@\/generated\/analytics-data\.json/);
  assert.match(source, /@\/generated\/zambia\/analytics-data\.json/);
  assert.match(source, /@\/generated\/serbia\/analytics-data\.json/);
  assert.match(source, /totalLoadedLsgs/);
  assert.match(source, /Latest data year/);
  assert.doesNotMatch(source, /Nepal LSGs currently loaded/);
  assert.doesNotMatch(source, /Nepal release/);
});
