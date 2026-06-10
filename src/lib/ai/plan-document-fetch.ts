import http from "node:http";
import https from "node:https";

const PLAN_DOCUMENT_USER_AGENT = "LDT-AI/1.0";
const MAX_REDIRECTS = 5;
const TLS_CERTIFICATE_ERROR_CODES = new Set([
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "CERT_HAS_EXPIRED",
]);

type PlanDocumentFetchResult = {
  body: Buffer;
  contentType: string;
  finalUrl: string;
  relaxedTls: boolean;
};

function getErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const code = "code" in error ? error.code : null;

  if (typeof code === "string") {
    return code;
  }

  const cause = "cause" in error ? error.cause : null;

  if (!cause || typeof cause !== "object") {
    return null;
  }

  const causeCode = "code" in cause ? cause.code : null;
  return typeof causeCode === "string" ? causeCode : null;
}

export function isNodeTlsCertificateError(error: unknown) {
  const code = getErrorCode(error);
  return code ? TLS_CERTIFICATE_ERROR_CODES.has(code) : false;
}

export function canUseRelaxedTlsForPlanDocumentUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && (parsed.hostname === "gov.zm" || parsed.hostname.endsWith(".gov.zm"));
  } catch {
    return false;
  }
}

async function readFetchResponse(response: Response, requestedUrl: string): Promise<PlanDocumentFetchResult> {
  if (!response.ok) {
    throw new Error(`Unable to fetch plan document (${response.status})`);
  }

  return {
    body: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") ?? "",
    finalUrl: response.url || requestedUrl,
    relaxedTls: false,
  };
}

function fetchWithRelaxedTls(url: string, redirectCount = 0): Promise<PlanDocumentFetchResult> {
  if (redirectCount > MAX_REDIRECTS) {
    return Promise.reject(new Error("Unable to fetch plan document: too many redirects"));
  }

  if (!canUseRelaxedTlsForPlanDocumentUrl(url)) {
    return Promise.reject(new Error(`Relaxed TLS is not allowed for ${url}`));
  }

  const target = new URL(url);
  const client = target.protocol === "https:" ? https : http;
  const requestOptions: http.RequestOptions | https.RequestOptions = {
    headers: {
      "user-agent": PLAN_DOCUMENT_USER_AGENT,
    },
  };

  if (target.protocol === "https:") {
    (requestOptions as https.RequestOptions).rejectUnauthorized = false;
  }

  return new Promise((resolve, reject) => {
    const request = client.request(target, requestOptions, (response) => {
      const statusCode = response.statusCode ?? 0;
      const location = response.headers.location;

      if (
        location &&
        [301, 302, 303, 307, 308].includes(statusCode)
      ) {
        const redirectUrl = new URL(location, target).href;

        response.resume();
        fetchWithRelaxedTls(redirectUrl, redirectCount + 1).then(resolve, reject);
        return;
      }

      const chunks: Buffer[] = [];

      response.on("data", (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      response.on("error", reject);
      response.on("end", () => {
        if (statusCode < 200 || statusCode >= 300) {
          reject(new Error(`Unable to fetch plan document (${statusCode})`));
          return;
        }

        const contentType = response.headers["content-type"];

        resolve({
          body: Buffer.concat(chunks),
          contentType: Array.isArray(contentType) ? contentType[0] ?? "" : contentType ?? "",
          finalUrl: target.href,
          relaxedTls: true,
        });
      });
    });

    request.on("error", reject);
    request.end();
  });
}

export async function fetchPlanDocument(url: string): Promise<PlanDocumentFetchResult> {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": PLAN_DOCUMENT_USER_AGENT,
      },
    });
    return readFetchResponse(response, url);
  } catch (error) {
    if (isNodeTlsCertificateError(error) && canUseRelaxedTlsForPlanDocumentUrl(url)) {
      return fetchWithRelaxedTls(url);
    }

    throw error;
  }
}
