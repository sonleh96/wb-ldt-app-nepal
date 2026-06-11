import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const runtimeFiles = [
  "src/lib/data/queries.ts",
  "src/components/country/country-landing-page.tsx",
  "src/app/nepal/page.tsx",
];

test("server runtime does not read generated analytics assets from process.cwd paths", async () => {
  for (const file of runtimeFiles) {
    const source = await readFile(file, "utf8");
    const usesGeneratedAssetPath =
      source.includes("fallbackDataPath") ||
      source.includes("mapDataPath") ||
      source.includes("src/generated/analytics-data.json");
    const importsRuntimeFileRead =
      source.includes('from "node:fs/promises"') ||
      source.includes('from "node:path"');

    assert.equal(
      importsRuntimeFileRead && usesGeneratedAssetPath,
      false,
      `${file} should use statically imported generated assets instead of runtime file reads`,
    );
  }
});

test("Next config parses statically imported GeoJSON assets as JSON", async () => {
  const source = await readFile("next.config.ts", "utf8");

  assert.match(source, /test:\s*\/\\\.geojson\$\/,/);
  assert.match(source, /type:\s*["']json["']/);
});

test("AI route tracing includes generated analytics fallbacks", async () => {
  const source = await readFile("next.config.ts", "utf8");

  assert.match(source, /"\/api\/ai\/national-plan-context"/);
  assert.match(source, /\.\.\.analyticsFallbackFiles/);
});
