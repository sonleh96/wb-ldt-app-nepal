import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCountryPlanSourcePayloads,
  readPlanSourceWorkbook,
} from "../scripts/lib/plan-sources.mjs";
import { getCountryConfigs } from "../scripts/lib/nepal-data.mjs";

const workbook = readPlanSourceWorkbook("data/SNG Development Plans.xlsx");

function getConfig(code) {
  return getCountryConfigs(code)[0];
}

function countDuplicateKeys(rows, keyFn) {
  const seen = new Map();

  for (const row of rows) {
    const key = keyFn(row);
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }

  return [...seen.values()].filter((count) => count > 1).length;
}

test("Nepal SNG workbook rows are deduped on Supabase upsert keys", () => {
  const payloads = buildCountryPlanSourcePayloads(getConfig("NPL"), workbook);

  assert.equal(
    countDuplicateKeys(payloads.provincePlanSources, (row) =>
      [row.country_code, row.source_sheet, row.province, row.link].join("||"),
    ),
    0,
  );
  assert.equal(
    countDuplicateKeys(payloads.planDocumentSources, (row) =>
      [
        row.country_code,
        row.source_sheet,
        row.plan_level,
        row.province ?? "",
        row.link,
      ].join("||"),
    ),
    0,
  );
});

test("Zambia SNG workbook rows map to district-keyed local plan sources plus one national source", () => {
  const payloads = buildCountryPlanSourcePayloads(getConfig("ZMB"), workbook);
  const localRows = payloads.planDocumentSources.filter(
    (row) => row.plan_level === "province",
  );
  const nationalRows = payloads.planDocumentSources.filter(
    (row) => row.plan_level === "national",
  );

  assert.equal(payloads.provincePlanSources.length, 112);
  assert.equal(localRows.length, 112);
  assert.equal(nationalRows.length, 1);
  assert.equal(localRows.some((row) => row.province === "Chasefu"), false);

  assert.deepEqual(
    localRows.find((row) => row.province === "Chitambo"),
    {
      country_code: "ZMB",
      country: "Zambia",
      source_sheet: "Zambia",
      plan_level: "province",
      province: "Chitambo",
      title: "Chitambo local development plan",
      link: "https://www.chitambocouncil.gov.zm/wp-content/uploads/2024/08/CHITAMBO-IDP_SIMPLIFIED-VERSION-2024.pdf",
      document_type: "local_development_plan",
      score_theme: null,
      notes: "Province: Central",
      priority: 1,
      is_active: true,
    },
  );

  assert.equal(nationalRows[0].province, null);
  assert.equal(nationalRows[0].title, "Zambia 8th National Development Plan");
  assert.equal(
    nationalRows[0].link,
    "https://www.cabinet.gov.zm/newsite/wp-content/uploads/2023/12/8NDP-2022-2026.pdf",
  );
});

test("Serbia SNG workbook rows map to municipality-keyed local plan sources plus one national source", () => {
  const payloads = buildCountryPlanSourcePayloads(getConfig("SRB"), workbook);
  const localRows = payloads.planDocumentSources.filter(
    (row) => row.plan_level === "province",
  );
  const nationalRows = payloads.planDocumentSources.filter(
    (row) => row.plan_level === "national",
  );

  assert.equal(payloads.provincePlanSources.length, 151);
  assert.equal(localRows.length, 151);
  assert.equal(nationalRows.length, 1);
  assert.equal(localRows.some((row) => row.province === "Majdanpek"), false);

  assert.deepEqual(
    localRows.find((row) => row.province === "Bor"),
    {
      country_code: "SRB",
      country: "Serbia",
      source_sheet: "Serbia",
      plan_level: "province",
      province: "Bor",
      title: "Bor local development plan",
      link: "https://bor.rs/wp-content/uploads/2025/01/Plan-razvoja_Grad-Bor-nacrt-kraj-2.pdf",
      document_type: "local_development_plan",
      score_theme: null,
      notes: "District: Borski",
      priority: 1,
      is_active: true,
    },
  );

  assert.equal(nationalRows[0].province, null);
  assert.equal(nationalRows[0].title, "Serbia 2030 Strategy");
  assert.equal(
    nationalRows[0].link,
    "https://rsjp.gov.rs/wp-content/uploads/Srbija-i-Agenda-2030.-februar-2024.-lat.pdf",
  );
});
