import path from "node:path";
import { readFile } from "node:fs/promises";

import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

import { getCountryConfigs } from "./lib/nepal-data.mjs";
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

function rankProvincePlanPriority(notes) {
  const value = (notes ?? "").toLowerCase();

  if (value.includes("5-year")) {
    return 1;
  }

  if (value.includes("master plan")) {
    return 2;
  }

  if (value.includes("development plan")) {
    return 3;
  }

  return 4;
}

function isMissingRelationError(error) {
  return error?.code === "PGRST205" || error?.code === "42P01";
}

function cleanString(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function buildPayloadForRow(config, row) {
  if (config.code === "NPL") {
    const province = cleanString(row.Province);
    const link = cleanString(row.Link);
    const notes = cleanString(row.Notes);

    if (!province || !link) {
      return null;
    }

    return {
      country_code: config.code,
      country: config.name,
      source_sheet: config.name,
      province,
      link,
      notes,
      priority: rankProvincePlanPriority(notes),
    };
  }

  const admin2 = cleanString(row.Admin_2);
  const admin1 = cleanString(row.Admin_1);
  const link = cleanString(row.URL);

  if (!admin2 || !link) {
    return null;
  }

  return {
    country_code: config.code,
    country: config.name,
    source_sheet: config.name,
    province: admin2,
    link,
    notes: admin1 ? `Admin 1: ${admin1}` : null,
    priority: 1,
  };
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
const workbookPath = path.join(process.cwd(), "data/SNG Development Plans.xlsx");
const workbookBuffer = await readFile(workbookPath);
const workbook = XLSX.read(workbookBuffer, { type: "buffer" });

for (const config of configs) {
  const sheet = workbook.Sheets[config.name];

  if (!sheet) {
    throw new Error(`${config.name} sheet not found in data/SNG Development Plans.xlsx.`);
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const payload = rows
    .map((row) => buildPayloadForRow(config, row))
    .filter(Boolean);

  if (payload.length === 0) {
    console.log(`No ${config.name} province/local plan source URLs to upsert.`);
    continue;
  }

  const { error } = await supabase
    .schema("analytics")
    .from("province_plan_sources")
    .upsert(payload, {
      onConflict: "country_code,source_sheet,province,link",
    });

  if (error) {
    if (isMissingRelationError(error)) {
      throw new Error(
        "Missing analytics.province_plan_sources. Apply supabase/migrations/0005_province_plan_sources.sql and rerun this ingest.",
      );
    }

    throw error;
  }

  console.log(`Upserted ${payload.length} ${config.name} plan source rows into analytics.province_plan_sources.`);
}
