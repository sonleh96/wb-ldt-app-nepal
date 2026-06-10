import { createClient } from "@supabase/supabase-js";

import { getCountryConfigs } from "./lib/nepal-data.mjs";
import { loadLocalEnv } from "./lib/load-env.mjs";
import {
  buildCountryPlanSourcePayloads,
  readPlanSourceWorkbook,
} from "./lib/plan-sources.mjs";

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
const workbook = readPlanSourceWorkbook("data/SNG Development Plans.xlsx");

async function upsertPlanDocumentSources(rows) {
  for (const row of rows) {
    let query = supabase
      .schema("analytics")
      .from("plan_document_sources")
      .select("id")
      .eq("country_code", row.country_code)
      .eq("source_sheet", row.source_sheet)
      .eq("plan_level", row.plan_level)
      .eq("link", row.link);

    query = row.province ? query.eq("province", row.province) : query.is("province", null);

    const { data: existingRows, error: lookupError } = await query.limit(1);

    if (lookupError) {
      if (isMissingRelationError(lookupError)) {
        throw new Error(
          "Missing analytics.plan_document_sources. Apply supabase/migrations/0007_plan_document_sources.sql and supabase/migrations/0010_multi_country.sql, then rerun this ingest.",
        );
      }

      throw lookupError;
    }

    const existingId = existingRows?.[0]?.id;

    if (existingId) {
      const { error } = await supabase
        .schema("analytics")
        .from("plan_document_sources")
        .update(row)
        .eq("id", existingId);

      if (error) {
        throw error;
      }
    } else {
      const { error } = await supabase
        .schema("analytics")
        .from("plan_document_sources")
        .insert(row);

      if (error) {
        if (isMissingRelationError(error)) {
          throw new Error(
            "Missing analytics.plan_document_sources. Apply supabase/migrations/0007_plan_document_sources.sql and supabase/migrations/0010_multi_country.sql, then rerun this ingest.",
          );
        }

        throw error;
      }
    }
  }
}

for (const config of configs) {
  const { provincePlanSources, planDocumentSources } = buildCountryPlanSourcePayloads(
    config,
    workbook,
  );

  if (provincePlanSources.length === 0) {
    console.log(`No ${config.name} province/local plan source URLs to upsert.`);
  } else {
    const { error } = await supabase
      .schema("analytics")
      .from("province_plan_sources")
      .upsert(provincePlanSources, {
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

    console.log(
      `Upserted ${provincePlanSources.length} ${config.name} plan source rows into analytics.province_plan_sources.`,
    );
  }

  await upsertPlanDocumentSources(planDocumentSources);
  console.log(
    `Upserted ${planDocumentSources.length} ${config.name} rows into analytics.plan_document_sources.`,
  );
}
