import path from "node:path";
import { readFile } from "node:fs/promises";

import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

import { loadLocalEnv } from "./lib/load-env.mjs";

await loadLocalEnv();

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

const workbookPath = path.join(process.cwd(), "data/SNG Development Plans.xlsx");
const workbookBuffer = await readFile(workbookPath);
const workbook = XLSX.read(workbookBuffer, { type: "buffer" });
const sheet = workbook.Sheets.Nepal;

if (!sheet) {
  throw new Error("Nepal sheet not found in data/SNG Development Plans.xlsx.");
}

const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

const payload = rows
  .map((row) => {
    const province = String(row.Province ?? "").trim();
    const link = String(row.Link ?? "").trim();
    const notes = String(row.Notes ?? "").trim() || null;

    if (!province || !link) {
      return null;
    }

    return {
      country: "Nepal",
      source_sheet: "Nepal",
      province,
      link,
      notes,
      priority: rankProvincePlanPriority(notes),
    };
  })
  .filter(Boolean);

const { error } = await supabase
  .schema("analytics")
  .from("province_plan_sources")
  .upsert(payload, {
    onConflict: "country,source_sheet,province,link",
  });

if (error) {
  if (isMissingRelationError(error)) {
    throw new Error(
      "Missing analytics.province_plan_sources. Apply supabase/migrations/0005_province_plan_sources.sql and rerun this ingest.",
    );
  }

  throw error;
}

console.log(`Upserted ${payload.length} Nepal province plan source rows into analytics.province_plan_sources.`);
