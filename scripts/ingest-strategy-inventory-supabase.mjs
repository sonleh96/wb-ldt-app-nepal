import { readFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

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

function isMissingRelationError(error) {
  return error?.code === "PGRST205" || error?.code === "42P01";
}

function normalizeKeyPart(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function getDocumentKey(record) {
  return [
    normalizeKeyPart(record.lsg_id),
    normalizeKeyPart(record.document_type),
    normalizeKeyPart(record.document_title),
    normalizeKeyPart(record.source_url),
  ].join("|");
}

function validateRecord(record) {
  const requiredFields = [
    "country_code",
    "lsg_id",
    "lsg_name",
    "document_type",
    "source_status",
    "translation_status",
    "parsing_status",
  ];

  for (const field of requiredFields) {
    if (!record[field]) {
      throw new Error(`Strategy inventory record is missing required field: ${field}`);
    }
  }
}

const inputPath = getArgValue(
  "--file",
  "public/data/serbia/strategy_inventory.sample.json",
);
const sourceDatasetName = getArgValue("--source", path.basename(inputPath));
const rawDataset = await readFile(path.join(process.cwd(), inputPath), "utf8");
const dataset = JSON.parse(rawDataset);

const payload = dataset.records.map((record) => {
  validateRecord(record);

  return {
    country_code: record.country_code,
    lsg_id: record.lsg_id,
    lsg_name: record.lsg_name,
    lsg_name_local: record.lsg_name_local ?? null,
    region_name: record.region_name ?? null,
    document_key: getDocumentKey(record),
    document_type: record.document_type,
    document_title: record.document_title ?? null,
    publication_year: record.publication_year ?? null,
    valid_from_year: record.valid_from_year ?? null,
    valid_to_year: record.valid_to_year ?? null,
    source_url: record.source_url ?? null,
    source_status: record.source_status,
    language: record.language ?? "unknown",
    translation_status: record.translation_status,
    parsing_status: record.parsing_status,
    ai_ready: Boolean(record.ai_ready),
    comprehensiveness_score: record.comprehensiveness_score ?? null,
    notes: record.notes ?? null,
    source_dataset_name: sourceDatasetName,
    is_active: true,
    last_updated: record.last_updated ?? dataset.last_updated ?? new Date().toISOString().slice(0, 10),
  };
});

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

const { error } = await supabase
  .schema("analytics")
  .from("strategy_inventory_documents")
  .upsert(payload, {
    onConflict: "country_code,document_key",
  });

if (error) {
  if (isMissingRelationError(error)) {
    throw new Error(
      "Missing analytics.strategy_inventory_documents. Apply supabase/migrations/0011_strategy_inventory_documents.sql and rerun npm run ingest:strategy-inventory.",
    );
  }

  throw error;
}

console.log(
  `Upserted ${payload.length} strategy inventory rows into analytics.strategy_inventory_documents.`,
);
