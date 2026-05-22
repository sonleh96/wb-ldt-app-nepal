import path from "node:path";
import { readFile } from "node:fs/promises";

import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";

import { loadLocalEnv } from "./lib/load-env.mjs";

await loadLocalEnv();

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function isMissingRelationError(error) {
  return error?.code === "PGRST205" || error?.code === "42P01";
}

function cleanString(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function parseNumber(value) {
  const text = String(value ?? "").replace(/,/g, "").trim();
  if (!text) {
    return null;
  }

  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseInteger(value) {
  const parsed = parseNumber(value);
  return parsed === null ? null : Math.round(parsed);
}

function parseBoolean(value) {
  return String(value ?? "").trim().toLowerCase() === "yes";
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

const sourceFileName = "sng_display_table.csv";
const csvPath = path.join(process.cwd(), "data", sourceFileName);
const csvContent = await readFile(csvPath, "utf8");
const rows = parse(csvContent, {
  columns: true,
  bom: true,
  skip_empty_lines: true,
  trim: true,
});

const payload = rows
  .map((row) => {
    const municipality = cleanString(row.Municipality);
    const district = cleanString(row.District);
    const province = cleanString(row.Province);

    if (!municipality || !district || !province) {
      return null;
    }

    return {
      municipality,
      district,
      province,
      population: parseInteger(row.Population),
      total_land_area_km2: parseNumber(row["Total Land Area (km2)"]),
      infrastructure_score: parseNumber(row["Infrastructure Score"]),
      livability_score: parseNumber(row["Livability Score"]),
      prosperity_score: parseNumber(row["Prosperity Score"]),
      pil_aggregate: parseNumber(row["PIL Aggregate"]),
      has_development_strategy: parseBoolean(row["Has Development Strategy"]),
      strategy_level: cleanString(row["Strategy Level"]),
      link: cleanString(row.Link),
      source_file_name: sourceFileName,
      updated_at: new Date().toISOString(),
    };
  })
  .filter(Boolean);

const { error } = await supabase
  .schema("analytics")
  .from("sng_display_table")
  .upsert(payload, {
    onConflict: "municipality,district,province",
  });

if (error) {
  if (isMissingRelationError(error)) {
    throw new Error(
      "Missing analytics.sng_display_table. Apply supabase/migrations/0009_sng_display_table.sql and rerun npm run ingest:sng-display.",
    );
  }

  throw error;
}

console.log(`Upserted ${payload.length} rows into analytics.sng_display_table.`);
