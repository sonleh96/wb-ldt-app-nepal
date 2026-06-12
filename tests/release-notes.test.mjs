import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("release notes use specific versioned sections", async () => {
  const source = await readFile("src/app/release-notes/page.tsx", "utf8");

  assert.match(source, /Versioning guide/);
  assert.match(source, /Major/);
  assert.match(source, /Minor/);
  assert.match(source, /Patch/);
  assert.match(source, /Operational pre-release/);
  assert.match(source, /June 12, 2026/);
  assert.match(source, /Release v1\.4/);
  assert.match(source, /Strategy inventory dashboard/);
  assert.match(source, /AI planning and document context/);
  assert.match(source, /Serbia and Zambia now have live country landing pages/);
  assert.match(source, /Bundled generated analytics JSON files/);
});
