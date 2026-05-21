import { createClient } from "@supabase/supabase-js";

import { buildMatchedGeojson, buildNepalAnalyticsData } from "./lib/nepal-data.mjs";
import { loadLocalEnv } from "./lib/load-env.mjs";

await loadLocalEnv();

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

const [analyticsData, matchedGeojson] = await Promise.all([
  buildNepalAnalyticsData(),
  buildMatchedGeojson(),
]);

const { data: releaseRows, error: releaseError } = await supabase
  .schema("analytics")
  .from("dataset_releases")
  .select("id")
  .eq("release_key", analyticsData.release.key)
  .limit(1);

if (releaseError) {
  throw releaseError;
}

if (!releaseRows || releaseRows.length === 0) {
  throw new Error(
    `Dataset release ${analyticsData.release.key} does not exist yet. Run npm run ingest:supabase first.`,
  );
}

const releaseId = releaseRows[0].id;

const { data: municipalityRows, error: municipalityError } = await supabase
  .schema("analytics")
  .from("municipalities")
  .select("id, composite_key");

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

for (const municipality of analyticsData.municipalities) {
  if (!municipality.mapAvailable) {
    issueRows.push({
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

const matchedKeys = new Set(analyticsData.mapFeatureKeys);

for (const feature of matchedGeojson.features) {
  matchedKeys.add(feature.properties.compositeKey);
}

const rawGeojson = await (await import("./lib/nepal-data.mjs")).buildMatchedGeojson();
void rawGeojson;

const allBoundaryOnly = analyticsData.coverage.boundaryOnlyCount;
if (allBoundaryOnly > 0) {
  issueRows.push({
    release_id: releaseId,
    issue_type: "boundary_coverage_summary",
    source_file: analyticsData.release.geojsonFileName,
    details: {
      boundaryOnlyCount: allBoundaryOnly,
    },
  });
}

await supabase
  .schema("analytics")
  .from("boundary_ingest_issues")
  .delete()
  .eq("release_id", releaseId);

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
  `Ingested ${features.length} matched municipality boundaries for release ${analyticsData.release.key}.`,
);
