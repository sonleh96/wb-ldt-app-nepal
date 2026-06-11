import assert from "node:assert/strict";
import test from "node:test";

import nextConfig from "../next.config.ts";

test("strategy inventory route traces its fallback dataset for Vercel", () => {
  assert.deepEqual(
    nextConfig.outputFileTracingIncludes?.["/serbia/strategy-inventory"],
    ["./public/data/serbia/strategy_inventory.sample.json"],
  );
});
