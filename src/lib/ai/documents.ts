import "server-only";

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

import {
  loadDocumentContext,
  loadLatestDocumentContextBySource,
  saveDocumentContext,
} from "@/lib/ai/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AiDocumentContext,
  NationalPlanSource,
  ProvincePlanCandidate,
} from "@/lib/ai/types";

const DOCUMENT_EXTRACTION_VERSION = "v2";
const nodeRequire = createRequire(import.meta.url);

let pdfWorkerConfigured = false;
let pdfWorkerConfigurationPromise: Promise<void> | null = null;
let pdfParseModulePromise: Promise<typeof import("pdf-parse")> | null = null;

async function loadPdfParseModule() {
  pdfParseModulePromise ??= import("pdf-parse");
  return pdfParseModulePromise;
}

async function ensurePdfWorkerConfigured() {
  if (pdfWorkerConfigured) {
    return;
  }

  if (pdfWorkerConfigurationPromise) {
    return pdfWorkerConfigurationPromise;
  }

  pdfWorkerConfigurationPromise = (async () => {
    const pdfParseEntrypoint = nodeRequire.resolve("pdf-parse");
    const pdfParsePackageRoot = path.resolve(path.dirname(pdfParseEntrypoint), "../../..");
    const candidatePaths = [
      path.join(pdfParsePackageRoot, "dist/pdf-parse/cjs/pdf.worker.mjs"),
      path.join(pdfParsePackageRoot, "dist/worker/pdf.worker.mjs"),
      path.join(pdfParsePackageRoot, "dist/pdf-parse/esm/pdf.worker.mjs"),
      path.join(process.cwd(), "node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs"),
      path.join(process.cwd(), "node_modules/pdf-parse/dist/worker/pdf.worker.mjs"),
    ];

    let workerBuffer: Buffer | null = null;

    for (const workerPath of candidatePaths) {
      try {
        workerBuffer = await readFile(workerPath);
        break;
      } catch (error) {
        if (
          !error ||
          typeof error !== "object" ||
          !("code" in error) ||
          error.code !== "ENOENT"
        ) {
          throw error;
        }
      }
    }

    if (!workerBuffer) {
      throw new Error("Unable to locate the pdf-parse worker file in the deployed runtime.");
    }
    const workerSource = `data:text/javascript;base64,${workerBuffer.toString("base64")}`;

    const { PDFParse } = await loadPdfParseModule();
    PDFParse.setWorker(workerSource);
    pdfWorkerConfigured = true;
  })();

  return pdfWorkerConfigurationPromise;
}

function toFingerprint(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPassagesFromText(text: string) {
  return text
    .split(/\n{2,}/)
    .map((passage) => passage.trim())
    .filter((passage) => passage.length > 80)
    .slice(0, 80)
    .map((passage, index) => ({
      id: `passage-${index + 1}`,
      title: null,
      text: passage,
    }));
}

function chooseProvincePlan(candidates: ProvincePlanCandidate[]) {
  return [...candidates].sort((left, right) => left.priority - right.priority)[0] ?? null;
}

type PlanDocumentSourceRow = {
  plan_level: "province" | "national";
  province: string | null;
  title: string;
  link: string;
  notes: string | null;
  priority: number;
  document_type: string | null;
  score_theme: string | null;
  is_active: boolean;
};

type PlanDocumentSource = {
  planLevel: "province" | "national";
  province: string | null;
  title: string;
  link: string;
  notes: string | null;
  priority: number;
  documentType: string | null;
  scoreTheme: string | null;
  isActive: boolean;
};

function isMissingRelationError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? error.code : null;
  return code === "PGRST205" || code === "42P01";
}

let planDocumentSourcesCache: PlanDocumentSource[] | null = null;

function getScoreThemeFromScoreId(scoreId: string) {
  const normalized = scoreId.toLowerCase();

  if (normalized.startsWith("prosperity")) {
    return "prosperity";
  }

  if (normalized.startsWith("infrastructure")) {
    return "infrastructure";
  }

  if (normalized.startsWith("livability")) {
    return "livability";
  }

  return null;
}

async function loadPlanDocumentSources(): Promise<PlanDocumentSource[]> {
  if (planDocumentSourcesCache !== null) {
    return planDocumentSourcesCache;
  }

  const supabase = getSupabaseServerClient().schema("analytics");
  const { data, error } = await supabase
    .from("plan_document_sources")
    .select("plan_level, province, title, link, notes, priority, document_type, score_theme, is_active")
    .eq("country", "Nepal")
    .eq("source_sheet", "Nepal")
    .eq("is_active", true)
    .order("plan_level", { ascending: true })
    .order("province", { ascending: true })
    .order("priority", { ascending: true });

  if (error) {
    if (isMissingRelationError(error)) {
      throw new Error(
        "Missing analytics.plan_document_sources. Apply the new Supabase migration before running the AI planning-document stages.",
      );
    }

    throw error;
  }

  planDocumentSourcesCache = ((data ?? []) as PlanDocumentSourceRow[]).map((row) => ({
    planLevel: row.plan_level,
    province: row.province,
    title: row.title,
    link: row.link,
    notes: row.notes,
    priority: row.priority,
    documentType: row.document_type,
    scoreTheme: row.score_theme,
    isActive: row.is_active,
  }));

  if (planDocumentSourcesCache.length === 0) {
    throw new Error(
      "No Nepal plan-document source rows were found in analytics.plan_document_sources. Run the plan-source migration and ingest first.",
    );
  }

  return planDocumentSourcesCache;
}

export async function loadProvincePlanCandidates(): Promise<ProvincePlanCandidate[]> {
  const sources = await loadPlanDocumentSources();
  const provincePlanCandidates = sources
    .filter((source) => source.planLevel === "province" && source.province)
    .map((source) => ({
      province: source.province ?? "",
      title: source.title,
      link: source.link,
      notes: source.notes,
      priority: source.priority,
      documentType: source.documentType,
      scoreTheme: source.scoreTheme,
    }));

  if (provincePlanCandidates.length === 0) {
    throw new Error(
      "No Nepal province-plan source rows were found in analytics.plan_document_sources. Run the plan-source migration and ingest first.",
    );
  }

  return provincePlanCandidates;
}

export async function getProvincePlanCandidatesForProvince(province: string) {
  const candidates = await loadProvincePlanCandidates();
  return candidates.filter((candidate) => candidate.province === province);
}

export async function loadNationalPlanSources(scoreId?: string): Promise<NationalPlanSource[]> {
  const sources = await loadPlanDocumentSources();
  const scoreTheme = scoreId ? getScoreThemeFromScoreId(scoreId) : null;
  const nationalPlanSources = sources
    .filter((source) => source.planLevel === "national")
    .filter((source) => source.scoreTheme === null || scoreTheme === null || source.scoreTheme === scoreTheme)
    .map((source) => ({
      title: source.title,
      link: source.link,
      notes: source.notes,
      priority: source.priority,
      documentType: source.documentType,
      scoreTheme: source.scoreTheme,
    }))
    .sort((left, right) => left.priority - right.priority);

  if (nationalPlanSources.length === 0) {
    throw new Error(
      "No Nepal national-plan source rows were found in analytics.plan_document_sources for the selected score context.",
    );
  }

  return nationalPlanSources;
}

async function parsePdfFromBuffer(buffer: Buffer) {
  await ensurePdfWorkerConfigured();
  const { PDFParse } = await loadPdfParseModule();
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  return result.text.trim();
}

async function parseRemoteDocument(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Nepal-LDT-AI/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch plan document (${response.status})`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("pdf") || url.toLowerCase().endsWith(".pdf")) {
    const buffer = Buffer.from(await response.arrayBuffer());
    return parsePdfFromBuffer(buffer);
  }

  const html = await response.text();
  return stripHtml(html);
}

function buildNationalSourceCollectionPath(sources: NationalPlanSource[]) {
  const sourceDescriptor = sources
    .map((source) => `${source.title}|${source.link}|${source.scoreTheme ?? "all"}`)
    .join("||");
  return `supabase://analytics.plan_document_sources/national/${toFingerprint(sourceDescriptor)}`;
}

export async function getNationalPlanContext(scoreId?: string): Promise<{
  context: AiDocumentContext;
  sources: NationalPlanSource[];
}> {
  const sources = await loadNationalPlanSources(scoreId);
  const sourceCollectionPath = buildNationalSourceCollectionPath(sources);
  const sourceFingerprint = toFingerprint(sources.map((source) => source.link).join("||"));
  const latestCached = await loadLatestDocumentContextBySource(
    "national_plan",
    null,
    sourceCollectionPath,
    DOCUMENT_EXTRACTION_VERSION,
  );

  if (latestCached) {
    return {
      context: latestCached,
      sources,
    };
  }

  const cached = await loadDocumentContext(
    "national_plan",
    null,
    sourceCollectionPath,
    sourceFingerprint,
    DOCUMENT_EXTRACTION_VERSION,
  );

  if (cached) {
    return {
      context: cached,
      sources,
    };
  }

  const extractedDocuments = await Promise.all(
    sources.map(async (source) => ({
      source,
      extractedText: await parseRemoteDocument(source.link),
    })),
  );
  const extractedText = extractedDocuments
    .map(({ source, extractedText: text }, index) =>
      [
        `Document ${index + 1}: ${source.title}`,
        `Source: ${source.link}`,
        "",
        text,
      ].join("\n"),
    )
    .join("\n\n---\n\n");
  const contentFingerprint = toFingerprint(
    extractedDocuments
      .map(({ source, extractedText: text }) => `${source.title}\n${source.link}\n${text}`)
      .join("\n\n===\n\n"),
  );
  const recached = await loadDocumentContext(
    "national_plan",
    null,
    sourceCollectionPath,
    contentFingerprint,
    DOCUMENT_EXTRACTION_VERSION,
  );

  if (recached) {
    return {
      context: recached,
      sources,
    };
  }

  const context: AiDocumentContext = {
    sourceType: "national_plan",
    title:
      sources.length === 1
        ? sources[0]?.title ?? "Nepal National Plan"
        : `Nepal national planning corpus (${sources.length} documents)`,
    province: null,
    sourceUrlOrPath: sourceCollectionPath,
    contentMode: "full_text",
    extractedText,
    passages: buildPassagesFromText(extractedText),
    chunks: [],
    extractionMetadata: {
      parser: "remote_plan_sources",
      sourceCount: sources.length,
      sources: sources.map((source) => ({
        title: source.title,
        link: source.link,
        documentType: source.documentType,
        scoreTheme: source.scoreTheme,
        priority: source.priority,
      })),
      chunkingReady: true,
    },
    contentFingerprint,
    extractionVersion: DOCUMENT_EXTRACTION_VERSION,
  };

  await saveDocumentContext(context);
  return {
    context,
    sources,
  };
}

export async function getProvincePlanContext(province: string): Promise<{
  context: AiDocumentContext;
  candidates: ProvincePlanCandidate[];
}> {
  const candidates = await getProvincePlanCandidatesForProvince(province);
  const chosen = chooseProvincePlan(candidates);

  if (!chosen) {
    throw new Error(`No province plan link found for ${province}.`);
  }

  const sourceUrlOrPath = chosen.link;
  const latestCached = await loadLatestDocumentContextBySource(
    "province_plan",
    province,
    sourceUrlOrPath,
    DOCUMENT_EXTRACTION_VERSION,
  );

  if (latestCached) {
    return {
      context: latestCached,
      candidates,
    };
  }

  const cached = await loadDocumentContext(
    "province_plan",
    province,
    sourceUrlOrPath,
    toFingerprint(sourceUrlOrPath),
    DOCUMENT_EXTRACTION_VERSION,
  );

  if (cached) {
    return {
      context: cached,
      candidates,
    };
  }

  const extractedText = await parseRemoteDocument(sourceUrlOrPath);
  const contentFingerprint = toFingerprint(extractedText);
  const recached = await loadDocumentContext(
    "province_plan",
    province,
    sourceUrlOrPath,
    contentFingerprint,
    DOCUMENT_EXTRACTION_VERSION,
  );

  if (recached) {
    return {
      context: recached,
      candidates,
    };
  }

  const context: AiDocumentContext = {
    sourceType: "province_plan",
    title: `${province} provincial development plan`,
    province,
    sourceUrlOrPath,
    contentMode: "full_text",
    extractedText,
    passages: buildPassagesFromText(extractedText),
    chunks: [],
    extractionMetadata: {
      notes: chosen.notes,
      parser: sourceUrlOrPath.toLowerCase().endsWith(".pdf") ? "pdf-parse" : "html-strip",
      candidateCount: candidates.length,
      chunkingReady: true,
    },
    contentFingerprint,
    extractionVersion: DOCUMENT_EXTRACTION_VERSION,
  };

  await saveDocumentContext(context);

  return {
    context,
    candidates,
  };
}
