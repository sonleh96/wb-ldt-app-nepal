import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const nodeRequire = createRequire(import.meta.url);

type PdfWorkerGlobal = typeof globalThis & {
  pdfjsWorker?: {
    WorkerMessageHandler: unknown;
  };
};

export function resolvePdfWorkerSourceForNode() {
  return pathToFileURL(
    nodeRequire.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs"),
  ).href;
}

export async function installPdfWorkerGlobalForNode() {
  const workerGlobal = globalThis as PdfWorkerGlobal;

  if (workerGlobal.pdfjsWorker?.WorkerMessageHandler) {
    return;
  }

  const workerModule = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  workerGlobal.pdfjsWorker = {
    WorkerMessageHandler: workerModule.WorkerMessageHandler,
  };
}
