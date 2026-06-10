import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const aiApiRoot = path.join(process.cwd(), "src/app/api/ai");

test("AI API routes explicitly use the Node.js runtime on Vercel", async () => {
  const entries = await readdir(aiApiRoot, { withFileTypes: true });
  const routeFiles = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(aiApiRoot, entry.name, "route.ts"));

  assert.ok(routeFiles.length > 0, "expected at least one AI route");

  for (const routeFile of routeFiles) {
    const source = await readFile(routeFile, "utf8");

    assert.match(
      source,
      /export\s+const\s+runtime\s*=\s*["']nodejs["']/,
      `${path.relative(process.cwd(), routeFile)} must export runtime = "nodejs"`,
    );
    assert.match(
      source,
      /export\s+const\s+maxDuration\s*=\s*300/,
      `${path.relative(process.cwd(), routeFile)} must export maxDuration = 300`,
    );
  }
});
