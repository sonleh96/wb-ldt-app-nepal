import assert from "node:assert/strict";
import test from "node:test";

import nextConfig from "../next.config.ts";

test("Serbia strategy inventory route traces its fallback dataset for Vercel", () => {
  assert.deepEqual(
    nextConfig.outputFileTracingIncludes?.["/serbia/strategy-inventory"],
    ["./public/data/serbia/strategy_inventory.sample.json"],
  );
});

test("Zambia strategy inventory route traces its fallback dataset for Vercel", () => {
  assert.deepEqual(
    nextConfig.outputFileTracingIncludes?.["/zambia/strategy-inventory"],
    ["./public/data/zambia/strategy_inventory.sample.json"],
  );
});
