import { createClient } from "@supabase/supabase-js";

import {
  ADMIN_CANONICAL_MAPPINGS,
  buildNepalAnalyticsData,
} from "./lib/nepal-data.mjs";
import { loadLocalEnv } from "./lib/load-env.mjs";

await loadLocalEnv();

function isMissingRelationError(error) {
  return error?.code === "PGRST205" || error?.code === "42P01";
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

const analyticsData = await buildNepalAnalyticsData();
const rawAdminColumnByCanonicalLabel = Object.fromEntries(
  Object.entries(ADMIN_CANONICAL_MAPPINGS).map(([raw, canonical]) => [
    canonical,
    raw,
  ]),
);

const releasePayload = {
  release_key: analyticsData.release.key,
  year: analyticsData.release.year,
  label: `Nepal LDT ${analyticsData.release.year}`,
  admin_file_name: analyticsData.release.adminFileName,
  score_file_name: analyticsData.release.scoreFileName,
  geojson_file_name: analyticsData.release.geojsonFileName,
  is_active: true,
};

const { data: releaseRows, error: releaseError } = await supabase
  .schema("analytics")
  .from("dataset_releases")
  .upsert(releasePayload, { onConflict: "release_key" })
  .select("id")
  .limit(1);

if (releaseError) {
  throw releaseError;
}

const releaseId = releaseRows[0].id;

const municipalitiesPayload = analyticsData.municipalities.map((municipality) => ({
  municipality: municipality.municipality,
  district: municipality.district,
  province: municipality.province,
  municipality_slug: municipality.slug.municipality,
  district_slug: municipality.slug.district,
  province_slug: municipality.slug.province,
  composite_key: municipality.compositeKey,
}));

const { data: municipalityRows, error: municipalityError } = await supabase
  .schema("analytics")
  .from("municipalities")
  .upsert(municipalitiesPayload, {
    onConflict: "composite_key",
  })
  .select("id, composite_key");

if (municipalityError) {
  throw municipalityError;
}

const municipalityIdByKey = new Map(
  municipalityRows.map((row) => [row.composite_key, row.id]),
);

const indicatorPayload = analyticsData.indicatorDefinitions.map((indicator) => ({
  id: indicator.id,
  canonical_name: indicator.label,
  raw_admin_column: rawAdminColumnByCanonicalLabel[indicator.label] ?? null,
  description: indicator.description,
  higher_is_better: indicator.higherIsBetter,
  pillar: indicator.pillar,
  display_order: indicator.sortOrder,
}));

const { error: indicatorError } = await supabase
  .schema("analytics")
  .from("indicators")
  .upsert(indicatorPayload, { onConflict: "id" });

if (indicatorError) {
  throw indicatorError;
}

const scoreComponentPayload = analyticsData.scoreDefinitions.flatMap((definition) =>
  definition.componentIds.map((componentId, index) => ({
    id: componentId,
    canonical_name: definition.componentLabels[index] ?? componentId,
    pillar: definition.pillar,
    parent_score_id: definition.id,
    display_order: index + 1,
  })),
);

const { error: scoreComponentError } = await supabase
  .schema("analytics")
  .from("score_components")
  .upsert(scoreComponentPayload, { onConflict: "id" });

if (scoreComponentError) {
  if (isMissingRelationError(scoreComponentError)) {
    throw new Error(
      "Missing analytics.score_components. Apply supabase/migrations/0003_component_and_context_tables.sql and rerun npm run ingest:supabase.",
    );
  }
  throw scoreComponentError;
}

const sourcePayload = analyticsData.indicatorDefinitions.flatMap((indicator) =>
  indicator.sources.map((source, index) => ({
    indicator_id: indicator.id,
    label: source.label,
    url: source.url,
    sort_order: index,
  })),
);

await supabase.schema("analytics").from("indicator_sources").delete().gt("id", 0);
const { error: sourceError } = await supabase
  .schema("analytics")
  .from("indicator_sources")
  .insert(sourcePayload);

if (sourceError) {
  throw sourceError;
}

const indicatorValuePayload = analyticsData.municipalities.flatMap((municipality) =>
  Object.entries(municipality.indicators).map(([indicatorId, numericValue]) => ({
    release_id: releaseId,
    municipality_id: municipalityIdByKey.get(municipality.compositeKey),
    indicator_id: indicatorId,
    year: municipality.year,
    numeric_value: numericValue,
  })),
);

const { error: indicatorValueError } = await supabase
  .schema("analytics")
  .from("municipality_indicator_values")
  .upsert(indicatorValuePayload, {
    onConflict: "release_id,municipality_id,indicator_id",
  });

if (indicatorValueError) {
  throw indicatorValueError;
}

const scoreValuePayload = analyticsData.municipalities.flatMap((municipality) =>
  analyticsData.scoreDefinitions.map((definition) => ({
    release_id: releaseId,
    municipality_id: municipalityIdByKey.get(municipality.compositeKey),
    score_id: definition.id,
    year: municipality.year,
    score_value: municipality.scores[definition.id],
  })),
);

const { error: scoreValueError } = await supabase
  .schema("analytics")
  .from("municipality_score_values")
  .upsert(scoreValuePayload, {
    onConflict: "release_id,municipality_id,score_id",
  });

if (scoreValueError) {
  throw scoreValueError;
}

const scoreComponentValuePayload = analyticsData.municipalities.flatMap((municipality) =>
  Object.entries(municipality.scoreComponents).map(([componentId, scoreValue]) => ({
    release_id: releaseId,
    municipality_id: municipalityIdByKey.get(municipality.compositeKey),
    component_id: componentId,
    year: municipality.year,
    score_value: scoreValue,
  })),
);

const { error: scoreComponentValueError } = await supabase
  .schema("analytics")
  .from("municipality_score_component_values")
  .upsert(scoreComponentValuePayload, {
    onConflict: "release_id,municipality_id,component_id",
  });

if (scoreComponentValueError) {
  if (isMissingRelationError(scoreComponentValueError)) {
    throw new Error(
      "Missing analytics.municipality_score_component_values. Apply supabase/migrations/0003_component_and_context_tables.sql and rerun npm run ingest:supabase.",
    );
  }
  throw scoreComponentValueError;
}

const contextValuePayload = analyticsData.municipalities.map((municipality) => ({
  release_id: releaseId,
  municipality_id: municipalityIdByKey.get(municipality.compositeKey),
  year: municipality.year,
  population:
    municipality.context.population === null
      ? null
      : Math.round(municipality.context.population),
  total_land_area_km2: municipality.context.totalLandAreaKm2,
  total_road_length_km: municipality.context.totalRoadLengthKm,
  total_railway_length_km: municipality.context.totalRailwayLengthKm,
  road_flood_risk_km: municipality.context.roadFloodRiskKm,
  road_heatwave_risk_km: municipality.context.roadHeatwaveRiskKm,
  railway_flood_risk_km: municipality.context.railwayFloodRiskKm,
  railway_heatwave_risk_km: municipality.context.railwayHeatwaveRiskKm,
}));

const { error: contextValueError } = await supabase
  .schema("analytics")
  .from("municipality_context_values")
  .upsert(contextValuePayload, {
    onConflict: "release_id,municipality_id",
  });

if (contextValueError) {
  if (isMissingRelationError(contextValueError)) {
    throw new Error(
      "Missing analytics.municipality_context_values. Apply supabase/migrations/0003_component_and_context_tables.sql and rerun npm run ingest:supabase.",
    );
  }
  throw contextValueError;
}

console.log(
  `Ingested Nepal analytics release ${analyticsData.release.key}. Boundary geometries still need a dedicated PostGIS load path.`,
);
