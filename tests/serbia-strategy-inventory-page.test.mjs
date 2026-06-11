import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const serbiaPagePath = new URL("../src/app/serbia/strategy-inventory/page.tsx", import.meta.url);
const zambiaPagePath = new URL("../src/app/zambia/strategy-inventory/page.tsx", import.meta.url);

test("Serbia strategy inventory uses the 161 municipality universe", async () => {
  const source = await readFile(serbiaPagePath, "utf8");

  assert.match(source, /expectedLsgCount:\s*161/);
  assert.doesNotMatch(source, /expectedLsgCount:\s*148/);
});

test("Zambia strategy inventory uses the 116 district universe", async () => {
  const source = await readFile(zambiaPagePath, "utf8");

  assert.match(source, /countryCode:\s*"ZMB"/);
  assert.match(source, /expectedLsgCount:\s*116/);
});
