import fs from "node:fs/promises";
import path from "node:path";

import {
  buildCountryAnalyticsData,
  buildCountryMatchedGeojson,
  getCountryConfigs,
} from "./lib/nepal-data.mjs";

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function getArgValue(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return fallback;
  }

  return process.argv[index + 1] ?? fallback;
}

const countryArg = getArgValue("--country", "all");
const configs = getCountryConfigs(countryArg);

for (const config of configs) {
  const [analyticsData, matchedGeojson] = await Promise.all([
    buildCountryAnalyticsData(config.code),
    buildCountryMatchedGeojson(config.code),
  ]);
  const analyticsPath = path.join(ROOT_DIR, config.analyticsOutputPath);
  const mapPath = path.join(ROOT_DIR, config.mapOutputPath);

  await fs.mkdir(path.dirname(analyticsPath), { recursive: true });
  await fs.mkdir(path.dirname(mapPath), { recursive: true });

  await fs.writeFile(
    analyticsPath,
    `${JSON.stringify(analyticsData, null, 2)}\n`,
    "utf8",
  );

  await fs.writeFile(
    mapPath,
    `${JSON.stringify(matchedGeojson)}\n`,
    "utf8",
  );

  console.log(
    `Generated ${config.code} analytics dataset with ${analyticsData.coverage.analyticsMunicipalityCount} admin units, ${analyticsData.years.length} years, and ${matchedGeojson.features.length} mapped features.`,
  );
}
