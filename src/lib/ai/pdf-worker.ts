import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const nodeRequire = createRequire(import.meta.url);

type PdfWorkerGlobal = typeof globalThis & {
  pdfjsWorker?: {
    WorkerMessageHandler: unknown;
  };
  DOMMatrix?: typeof DOMMatrix;
  ImageData?: typeof ImageData;
  Path2D?: typeof Path2D;
};

class TextExtractionDOMMatrix {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;

  constructor(init?: number[]) {
    if (Array.isArray(init)) {
      if (init.length >= 6) {
        [this.a, this.b, this.c, this.d, this.e, this.f] = init;
      } else if (init.length === 0) {
        return;
      }
    }
  }

  multiplySelf() {
    return this;
  }

  preMultiplySelf() {
    return this;
  }

  translateSelf() {
    return this;
  }

  scaleSelf() {
    return this;
  }

  rotateSelf() {
    return this;
  }

  invertSelf() {
    return this;
  }

  transformPoint(point: unknown) {
    return point;
  }
}

class TextExtractionImageData {
  colorSpace = "srgb";
  data: Uint8ClampedArray;
  height: number;
  width: number;

  constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
    if (typeof dataOrWidth === "number") {
      this.width = dataOrWidth;
      this.height = widthOrHeight;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
      return;
    }

    this.data = dataOrWidth;
    this.width = widthOrHeight;
    this.height = height ?? 0;
  }
}

class TextExtractionPath2D {
  addPath() {}
}

export function installPdfJsNodePolyfills() {
  const workerGlobal = globalThis as PdfWorkerGlobal;

  // PDF.js initializes rendering primitives even for text extraction. Vercel
  // functions do not always bundle @napi-rs/canvas, so provide minimal shims
  // before importing pdfjs/pdf-parse. These are not intended for rendering.
  workerGlobal.DOMMatrix ??= TextExtractionDOMMatrix as unknown as typeof DOMMatrix;
  workerGlobal.ImageData ??= TextExtractionImageData as unknown as typeof ImageData;
  workerGlobal.Path2D ??= TextExtractionPath2D as unknown as typeof Path2D;
}

export function resolvePdfWorkerSourceForNode() {
  return pathToFileURL(
    nodeRequire.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs"),
  ).href;
}

export async function installPdfWorkerGlobalForNode() {
  installPdfJsNodePolyfills();

  const workerGlobal = globalThis as PdfWorkerGlobal;

  if (workerGlobal.pdfjsWorker?.WorkerMessageHandler) {
    return;
  }

  const workerModule = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  workerGlobal.pdfjsWorker = {
    WorkerMessageHandler: workerModule.WorkerMessageHandler,
  };
}
