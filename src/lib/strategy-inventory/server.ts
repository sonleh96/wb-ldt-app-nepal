import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildStrategyInventoryDataset,
} from "@/lib/strategy-inventory/source";
import type {
  StrategyInventoryDataset,
  StrategyInventoryRecord,
} from "@/lib/strategy-inventory/types";

type LoadStrategyInventoryDatasetOptions = {
  countryCode: string;
  countryName: string;
  expectedLsgCount: number;
  samplePath: string;
};

type StrategyInventoryDocumentRow = StrategyInventoryRecord & {
  is_active?: boolean;
};

function isMissingRelationError(error: { code?: string } | null | undefined) {
  return error?.code === "PGRST205" || error?.code === "42P01";
}

async function loadSampleDataset(samplePath: string) {
  const datasetPath = path.join(process.cwd(), samplePath);
  const rawDataset = await readFile(datasetPath, "utf8");

  return JSON.parse(rawDataset) as StrategyInventoryDataset;
}

async function loadSupabaseDataset({
  countryCode,
  countryName,
  expectedLsgCount,
}: Omit<LoadStrategyInventoryDatasetOptions, "samplePath">) {
  const supabase = getSupabaseServerClient().schema("analytics");
  const { data, error } = await supabase
    .from("strategy_inventory_documents")
    .select(
      "country_code, lsg_id, lsg_name, lsg_name_local, region_name, document_type, document_title, publication_year, valid_from_year, valid_to_year, source_url, source_status, language, translation_status, parsing_status, ai_ready, comprehensiveness_score, notes, last_updated",
    )
    .eq("country_code", countryCode)
    .eq("is_active", true)
    .order("lsg_name", { ascending: true })
    .order("document_type", { ascending: true });

  if (error) {
    if (isMissingRelationError(error)) {
      return null;
    }

    throw error;
  }

  const records = (data ?? []) as StrategyInventoryDocumentRow[];

  if (records.length === 0) {
    return null;
  }

  return buildStrategyInventoryDataset({
    countryCode,
    countryName,
    expectedLsgCount,
    isSampleData: false,
    records,
  });
}

export async function loadStrategyInventoryDataset(
  options: LoadStrategyInventoryDatasetOptions,
) {
  try {
    const supabaseDataset = await loadSupabaseDataset(options);

    if (supabaseDataset) {
      return supabaseDataset;
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Missing required environment variable:")
    ) {
      return loadSampleDataset(options.samplePath);
    }

    throw error;
  }

  return loadSampleDataset(options.samplePath);
}
