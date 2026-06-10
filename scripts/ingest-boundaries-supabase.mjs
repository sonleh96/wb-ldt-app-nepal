import { createClient } from "@supabase/supabase-js";

import {
  buildCountryAnalyticsData,
  buildCountryMatchedGeojson,
  getCountryConfigs,
} from "./lib/nepal-data.mjs";
import { loadLocalEnv } from "./lib/load-env.mjs";

await loadLocalEnv();

function getArgValue(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return fallback;
  }

  return process.argv[index + 1] ?? fallback;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const supabase = createClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

const countryArg = getArgValue("--country", "NPL");
const configs = getCountryConfigs(countryArg);
const boundaryJobs = [];
const missingReleases = [];

for (const config of configs) {
  const [analyticsData, matchedGeojson] = await Promise.all([
    buildCountryAnalyticsData(config.code),
    buildCountryMatchedGeojson(config.code),
  ]);
  const latestYear = analyticsData.years[analyticsData.years.length - 1];
  const latestReleaseKey = analyticsData.release.key;

  const { data: releaseRows, error: releaseError } = await supabase
    .schema("analytics")
    .from("dataset_releases")
    .select("id")
    .eq("country_code", config.code)
    .eq("release_key", latestReleaseKey)
    .eq("year", latestYear)
    .limit(1);

  if (releaseError) {
    throw releaseError;
  }

  if (!releaseRows || releaseRows.length === 0) {
    missingReleases.push({
      countryCode: config.code,
      releaseKey: latestReleaseKey,
    });
    continue;
  }

  boundaryJobs.push({
    config,
    analyticsData,
    matchedGeojson,
    latestYear,
    latestReleaseKey,
    releaseId: releaseRows[0].id,
  });
}

if (missingReleases.length > 0) {
  throw new Error(
    [
      "Cannot ingest boundaries because dataset releases are missing:",
      ...missingReleases.map(
        (release) => `- ${release.countryCode}: ${release.releaseKey}`,
      ),
      "",
      `Run npm run ingest:supabase -- --country ${countryArg} first, then rerun npm run ingest:boundaries -- --country ${countryArg}.`,
    ].join("\n"),
  );
}

for (const {
  config,
  analyticsData,
  matchedGeojson,
  latestYear,
  latestReleaseKey,
  releaseId,
} of boundaryJobs) {
  const { data: municipalityRows, error: municipalityError } = await supabase
    .schema("analytics")
    .from("municipalities")
    .select("id, composite_key")
    .eq("country_code", config.code);

  if (municipalityError) {
    throw municipalityError;
  }

  const municipalityIdByKey = new Map(
    municipalityRows.map((row) => [row.composite_key, row.id]),
  );
  const features = matchedGeojson.features.map((feature) => ({
    municipalityId: municipalityIdByKey.get(feature.properties.compositeKey),
    sourceFeatureKey: feature.properties.compositeKey,
    geometry: JSON.stringify(feature.geometry),
    rawProperties: feature.properties,
  }));

  for (const feature of features) {
    if (!feature.municipalityId) {
      continue;
    }

    const { error } = await supabase
      .schema("analytics")
      .rpc("upsert_municipality_boundary", {
        p_municipality_id: feature.municipalityId,
        p_source_feature_key: feature.sourceFeatureKey,
        p_geojson: feature.geometry,
        p_raw_properties: feature.rawProperties,
      });

    if (error) {
      throw error;
    }
  }

  const issueRows = [];
  const latestMunicipalities = analyticsData.municipalities.filter(
    (municipality) => municipality.year === latestYear,
  );

  for (const municipality of latestMunicipalities) {
    if (!municipality.mapAvailable) {
      issueRows.push({
        country_code: config.code,
        release_id: releaseId,
        issue_type: "analytics_only_key",
        municipality: municipality.municipality,
        district: municipality.district,
        province: municipality.province,
        source_file: analyticsData.release.adminFileName,
        details: {
          compositeKey: municipality.compositeKey,
        },
      });
    }
  }

  if (analyticsData.coverage.boundaryOnlyCount > 0) {
    issueRows.push({
      country_code: config.code,
      release_id: releaseId,
      issue_type: "boundary_coverage_summary",
      source_file: analyticsData.release.geojsonFileName,
      details: {
        boundaryOnlyCount: analyticsData.coverage.boundaryOnlyCount,
      },
    });
  }

  await supabase
    .schema("analytics")
    .from("boundary_ingest_issues")
    .delete()
    .eq("release_id", releaseId)
    .eq("country_code", config.code);

  if (issueRows.length > 0) {
    const { error: issuesError } = await supabase
      .schema("analytics")
      .from("boundary_ingest_issues")
      .insert(issueRows);

    if (issuesError) {
      throw issuesError;
    }
  }

  console.log(
    `Ingested ${features.length} matched ${config.name} boundaries for release ${latestReleaseKey}.`,
  );
}
