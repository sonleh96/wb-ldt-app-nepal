import assert from "node:assert/strict";
import test from "node:test";

import {
  buildStrategyInventoryDataset,
  getStrategyInventoryDocumentKey,
} from "../src/lib/strategy-inventory/source.ts";

const rows = [
  {
    country_code: "SRB",
    lsg_id: "ada",
    lsg_name: "Ada",
    lsg_name_local: "Ada",
    region_name: "North Banat",
    document_type: "budget",
    document_title: "Budget 2024",
    publication_year: 2024,
    valid_from_year: 2024,
    valid_to_year: 2024,
    source_url: "https://example.com/ada-budget.pdf",
    source_status: "found",
    language: "sr",
    translation_status: "needs_translation",
    parsing_status: "not_started",
    ai_ready: false,
    comprehensiveness_score: null,
    notes: "Needs translation.",
    last_updated: "2026-06-10",
  },
  {
    country_code: "SRB",
    lsg_id: "belgrade-barajevo",
    lsg_name: "Belgrade-Barajevo",
    region_name: "Belgrade",
    document_type: "strategy",
    document_title: "Strategy 2030",
    publication_year: 2023,
    source_url: "https://example.com/barajevo.pdf",
    source_status: "found",
    language: "sr_en",
    translation_status: "translated",
    parsing_status: "parsed",
    ai_ready: true,
    last_updated: "2026-06-11",
  },
];

test("document key is stable for Supabase upserts", () => {
  assert.equal(
    getStrategyInventoryDocumentKey(rows[0]),
    "ada|budget|budget 2024|https://example.com/ada-budget.pdf",
  );
});

test("Supabase strategy inventory rows map to a dashboard dataset", () => {
  const dataset = buildStrategyInventoryDataset({
    countryCode: "SRB",
    countryName: "Serbia",
    expectedLsgCount: 148,
    isSampleData: false,
    records: rows,
  });

  assert.equal(dataset.country_code, "SRB");
  assert.equal(dataset.country_name, "Serbia");
  assert.equal(dataset.expected_lsg_count, 148);
  assert.equal(dataset.is_sample_data, false);
  assert.equal(dataset.last_updated, "2026-06-11");
  assert.deepEqual(
    dataset.records.map((record) => record.lsg_name),
    ["Ada", "Belgrade-Barajevo"],
  );
});
