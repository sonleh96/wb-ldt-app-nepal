import assert from "node:assert/strict";
import test from "node:test";

import {
  installPdfJsNodePolyfills,
  installPdfWorkerGlobalForNode,
  resolvePdfWorkerSourceForNode,
} from "../src/lib/ai/pdf-worker.ts";

test("PDF worker source resolves to an importable PDF.js worker module", async () => {
  const workerSource = resolvePdfWorkerSourceForNode();
  const workerModule = await import(workerSource);

  assert.equal(workerSource.startsWith("file://"), true);
  assert.equal(typeof workerModule.WorkerMessageHandler, "function");
});

test("PDF worker installer exposes WorkerMessageHandler on globalThis for PDF.js fake worker setup", async () => {
  delete globalThis.pdfjsWorker;

  await installPdfWorkerGlobalForNode();

  assert.equal(typeof globalThis.pdfjsWorker?.WorkerMessageHandler, "function");
});

test("PDF.js Node polyfills allow pdf-parse to import without native canvas", async () => {
  installPdfJsNodePolyfills();

  const pdfParseModule = await import("pdf-parse");

  assert.equal(typeof pdfParseModule.PDFParse, "function");
  assert.equal(typeof globalThis.DOMMatrix, "function");
});
