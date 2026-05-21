import "server-only";

async function readErrorText(response: Response) {
  try {
    const text = await response.text();
    return text.trim() || response.statusText;
  } catch {
    return response.statusText;
  }
}

export async function tryExtractWithExa(url: string) {
  const apiKey = process.env.EXA_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch("https://api.exa.ai/contents", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      urls: [url],
      text: true,
    }),
  });

  if (!response.ok) {
    const message = await readErrorText(response);
    throw new Error(`Exa content extraction failed (${response.status}): ${message}`);
  }

  const payload = (await response.json()) as {
    results?: Array<{
      text?: string;
      title?: string;
      url?: string;
    }>;
  };

  const result = payload.results?.[0];
  const text = result?.text?.trim();

  if (!text) {
    return null;
  }

  return {
    title: result?.title ?? url,
    sourceUrlOrPath: result?.url ?? url,
    extractedText: text,
    metadata: {
      provider: "exa",
    },
  };
}

export type ExaSearchHit = {
  title: string;
  url: string;
  text: string;
  publishedDate: string | null;
  score: number | null;
};

export async function searchWithExa(query: string, numResults = 5): Promise<ExaSearchHit[]> {
  const apiKey = process.env.EXA_API_KEY;

  if (!apiKey) {
    throw new Error("EXA_API_KEY is not configured.");
  }

  const searchResponse = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query,
      type: "auto",
      numResults,
    }),
  });

  if (!searchResponse.ok) {
    const message = await readErrorText(searchResponse);
    throw new Error(`Exa search failed (${searchResponse.status}): ${message}`);
  }

  const searchPayload = (await searchResponse.json()) as {
    results?: Array<{
      title?: string;
      url?: string;
      publishedDate?: string;
      score?: number;
    }>;
  };

  const urls = (searchPayload.results ?? [])
    .map((result) => result.url?.trim())
    .filter((url): url is string => Boolean(url));

  if (urls.length === 0) {
    return [];
  }

  const contentsResponse = await fetch("https://api.exa.ai/contents", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      urls,
      text: true,
    }),
  });

  if (!contentsResponse.ok) {
    const message = await readErrorText(contentsResponse);
    throw new Error(`Exa content fetch failed (${contentsResponse.status}): ${message}`);
  }

  const contentsPayload = (await contentsResponse.json()) as {
    results?: Array<{
      url?: string;
      title?: string;
      text?: string;
    }>;
  };

  const contentsByUrl = new Map(
    (contentsPayload.results ?? []).map((result) => [
      result.url ?? "",
      {
        title: result.title ?? null,
        text: result.text?.trim() ?? "",
      },
    ]),
  );

  return (searchPayload.results ?? [])
    .map((result) => {
      const url = result.url?.trim();
      if (!url) {
        return null;
      }

      const content = contentsByUrl.get(url);
      if (!content?.text) {
        return null;
      }

      return {
        title: content.title ?? result.title ?? url,
        url,
        text: content.text,
        publishedDate: result.publishedDate ?? null,
        score: typeof result.score === "number" ? result.score : null,
      };
    })
    .filter((hit): hit is ExaSearchHit => Boolean(hit));
}
