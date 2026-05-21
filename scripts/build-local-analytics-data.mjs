import fs from "node:fs/promises";
import path from "node:path";

import { buildMatchedGeojson, buildNepalAnalyticsData } from "./lib/nepal-data.mjs";

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const GENERATED_DIR = path.join(ROOT_DIR, "src", "generated");
const PUBLIC_DATA_DIR = path.join(ROOT_DIR, "public", "data");

await fs.mkdir(GENERATED_DIR, { recursive: true });
await fs.mkdir(PUBLIC_DATA_DIR, { recursive: true });

const [analyticsData, matchedGeojson] = await Promise.all([
  buildNepalAnalyticsData(),
  buildMatchedGeojson(),
]);

await fs.writeFile(
  path.join(GENERATED_DIR, "analytics-data.json"),
  `${JSON.stringify(analyticsData, null, 2)}\n`,
  "utf8",
);

await fs.writeFile(
  path.join(PUBLIC_DATA_DIR, "nepal-municipalities.geojson"),
  `${JSON.stringify(matchedGeojson)}\n`,
  "utf8",
);

console.log(
  `Generated analytics dataset with ${analyticsData.municipalities.length} municipalities and ${matchedGeojson.features.length} mapped features.`,
);

