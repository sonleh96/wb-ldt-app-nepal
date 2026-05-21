import "server-only";

export function getOpenAiModel() {
  return process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
}

function collectText(value: unknown): string[] {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectText(item));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;
  const texts: string[] = [];

  if (typeof record.output_text === "string") {
    texts.push(...collectText(record.output_text));
  }

  if (typeof record.text === "string") {
    texts.push(...collectText(record.text));
  }

  if ("content" in record) {
    texts.push(...collectText(record.content));
  }

  if ("output" in record) {
    texts.push(...collectText(record.output));
  }

  if ("summary" in record) {
    texts.push(...collectText(record.summary));
  }

  return texts;
}

export async function generateOpenAiText({
  system,
  prompt,
  model = getOpenAiModel(),
}: {
  system: string;
  prompt: string;
  model?: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: system }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const text = collectText(payload).join("\n\n").trim();

  if (!text) {
    throw new Error(`OpenAI returned an empty response. Payload keys: ${Object.keys(payload).join(", ")}`);
  }

  return {
    model,
    text,
  };
}
