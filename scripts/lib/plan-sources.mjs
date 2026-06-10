import { readFileSync } from "node:fs";

import XLSX from "xlsx";

const NATIONAL_PLAN_SOURCES = {
  ZMB: {
    title: "Zambia 8th National Development Plan",
    link: "https://www.cabinet.gov.zm/newsite/wp-content/uploads/2023/12/8NDP-2022-2026.pdf",
    documentType: "national_development_plan",
  },
  SRB: {
    title: "Serbia 2030 Strategy",
    link: "https://rsjp.gov.rs/wp-content/uploads/Srbija-i-Agenda-2030.-februar-2024.-lat.pdf",
    documentType: "national_development_plan",
  },
};

const LOCAL_ADMIN_NOTES = {
  ZMB: "Province",
  SRB: "District",
};

export function cleanString(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

export function rankProvincePlanPriority(notes) {
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

export function readPlanSourceWorkbook(workbookPath) {
  const workbookBuffer = readFileSync(workbookPath);
  return XLSX.read(workbookBuffer, { type: "buffer" });
}

function getRowsForCountry(config, workbook) {
  const sheet = workbook.Sheets[config.name];

  if (!sheet) {
    throw new Error(`${config.name} sheet not found in data/SNG Development Plans.xlsx.`);
  }

  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

function buildNepalProvincePlanSource(config, row) {
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

function buildLocalProvincePlanSource(config, row) {
  const localUnit = cleanString(row.Admin_2);
  const parentUnit = cleanString(row.Admin_1);
  const link = cleanString(row.URL);
  const parentLabel = LOCAL_ADMIN_NOTES[config.code] ?? "Admin 1";

  if (!localUnit || !link) {
    return null;
  }

  return {
    country_code: config.code,
    country: config.name,
    source_sheet: config.name,
    province: localUnit,
    link,
    notes: parentUnit ? `${parentLabel}: ${parentUnit}` : null,
    priority: 1,
  };
}

function buildPlanDocumentSourceFromProvinceSource(config, row) {
  const isNepal = config.code === "NPL";
  const title = isNepal
    ? `${row.province} provincial development plan`
    : `${row.province} local development plan`;
  const documentType = isNepal ? "development_plan" : "local_development_plan";

  return {
    country_code: row.country_code,
    country: row.country,
    source_sheet: row.source_sheet,
    plan_level: "province",
    province: row.province,
    title,
    link: row.link,
    document_type: documentType,
    score_theme: null,
    notes: row.notes,
    priority: row.priority,
    is_active: true,
  };
}

function buildNationalPlanDocumentSource(config) {
  const source = NATIONAL_PLAN_SOURCES[config.code];

  if (!source) {
    return null;
  }

  return {
    country_code: config.code,
    country: config.name,
    source_sheet: config.name,
    plan_level: "national",
    province: null,
    title: source.title,
    link: source.link,
    document_type: source.documentType,
    score_theme: null,
    notes: null,
    priority: 1,
    is_active: true,
  };
}

function dedupeRows(rows, keyFn) {
  const seen = new Set();
  const deduped = [];

  for (const row of rows) {
    const key = keyFn(row);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(row);
  }

  return deduped;
}

export function buildCountryPlanSourcePayloads(config, workbook) {
  const rows = getRowsForCountry(config, workbook);
  const provincePlanSources = dedupeRows(
    rows
      .map((row) =>
        config.code === "NPL"
          ? buildNepalProvincePlanSource(config, row)
          : buildLocalProvincePlanSource(config, row),
      )
      .filter(Boolean),
    (row) => [row.country_code, row.source_sheet, row.province, row.link].join("||"),
  );
  const planDocumentSources = dedupeRows(
    provincePlanSources.map((row) =>
      buildPlanDocumentSourceFromProvinceSource(config, row),
    ),
    (row) =>
      [
        row.country_code,
        row.source_sheet,
        row.plan_level,
        row.province ?? "",
        row.link,
      ].join("||"),
  );
  const nationalSource = buildNationalPlanDocumentSource(config);

  if (nationalSource) {
    planDocumentSources.push(nationalSource);
  }

  return {
    provincePlanSources,
    planDocumentSources,
  };
}
