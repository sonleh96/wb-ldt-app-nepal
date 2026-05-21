import type { AiStageResponsePayload } from "@/lib/ai/types";

function sanitizeMarkdownText(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizePreserveParagraphs(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\r/g, "")
    .trim();
}

function normalizeHeading(text: string) {
  return sanitizeMarkdownText(
    text
      .replace(/^\s*(?:[-*]|\d+[.)])\s*/, "")
      .replace(/[:：]\s*$/, ""),
  ).toLowerCase();
}

function cleanBulletItem(text: string) {
  const cleaned = sanitizeMarkdownText(
    text
      .replace(/^\s*(?:[-*]|\d+[.)])\s*/, "")
      .replace(/^\[?citation\]?[:\-]?/i, "")
      .trim(),
  );

  if (!cleaned) return null;

  const lowered = cleaned.toLowerCase();
  if (
    cleaned === "-" ||
    cleaned === "--" ||
    cleaned === "---" ||
    lowered === "n/a" ||
    lowered === "none" ||
    lowered === "not applicable"
  ) {
    return null;
  }

  return cleaned;
}

function splitParagraphs(text: string) {
  return sanitizePreserveParagraphs(text)
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => sanitizeMarkdownText(block));
}

function hasVisibleText(text: string | null | undefined) {
  return Boolean(text && sanitizeMarkdownText(text).length > 0);
}

function RawOutputFallback({
  text,
  title = "Generated output",
}: {
  text: string | null | undefined;
  title?: string;
}) {
  if (!hasVisibleText(text)) {
    return null;
  }

  return (
    <div className="rounded-[1.15rem] border border-[var(--border-soft)] bg-white p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {title}
      </p>
      <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">
        {sanitizePreserveParagraphs(text ?? "")}
      </div>
    </div>
  );
}

function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "error";
}) {
  const className =
    tone === "success"
      ? "bg-[rgba(84,162,75,0.12)] text-[#2f7a2a]"
      : tone === "error"
        ? "bg-[rgba(228,87,86,0.12)] text-[#b23b3a]"
        : "bg-[rgba(24,37,44,0.06)] text-[var(--muted-foreground)]";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function ResultMeta({ result }: { result: AiStageResponsePayload }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        label={result.status === "completed" ? "Completed" : "Failed"}
        tone={result.status === "completed" ? "success" : "error"}
      />
      <Badge label={result.cacheHit ? "Loaded from cache" : "Freshly generated"} />
      <Badge label={`Model: ${result.modelName}`} />
      <Badge label={`Prompt ${result.promptVersion}`} />
    </div>
  );
}

function SourceList({ result }: { result: AiStageResponsePayload }) {
  if (result.sourceReferences.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 border-t border-[var(--border-soft)] pt-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        Sources
      </p>
      <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
        {result.sourceReferences.map((reference, index) => (
          <li key={`${reference.source}-${index}`}>
            <span className="font-medium text-[var(--foreground)]">{reference.label}</span>
            {" · "}
            <span>{reference.source}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ErrorBlock({ result }: { result: AiStageResponsePayload }) {
  if (!result.errorMessage) {
    return null;
  }

  return <p className="mt-4 text-sm leading-7 text-[#b23b3a]">{result.errorMessage}</p>;
}

type NarrativeSection = {
  title: string;
  body: string[];
};

function parseNarrativeSections(text: string) {
  const lines = text.split(/\r?\n/);
  const sections: NarrativeSection[] = [];
  let current: NarrativeSection | null = null;
  let overallSummary = "";

  const headingRegexes = [
    /^\s*\d+[\.)]\s*\*\*(.+?)\*\*\s*$/,
    /^\s*\*\*(.+?)\*\*\s*$/,
    /^\s*#{1,6}\s+(.+?)\s*$/,
  ];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    let heading: string | null = null;
    for (const regex of headingRegexes) {
      const match = line.match(regex);
      if (match) {
        heading = match[1].trim();
        break;
      }
    }

    if (heading) {
      if (/overall summary/i.test(heading)) {
        current = null;
        overallSummary = "";
      } else {
        current = { title: heading, body: [] };
        sections.push(current);
      }
      continue;
    }

    if (line.toLowerCase().startsWith("overall summary")) {
      overallSummary = line.replace(/overall summary:?/i, "").trim();
      current = null;
      continue;
    }

    if ((overallSummary || /overall/i.test(line)) && !current) {
      overallSummary = `${overallSummary} ${line}`.trim();
      continue;
    }

    if (current) {
      current.body.push(line.replace(/^interpretation:?\s*/i, ""));
    }
  }

  return { sections, overallSummary };
}

function parseAlignmentSections(text: string) {
  const buckets = {
    summary: [] as string[],
    strengths: [] as string[],
    gaps: [] as string[],
    implications: [] as string[],
  };

  let current: keyof typeof buckets = "summary";
  let sawHeading = false;

  for (const rawLine of sanitizePreserveParagraphs(text).split(/\n/)) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const headingCandidate = normalizeHeading(trimmed);

    if (headingCandidate.startsWith("alignment summary")) {
      current = "summary";
      sawHeading = true;
      const remainder = cleanBulletItem(trimmed.split(/:/).slice(1).join(":") || "");
      if (remainder) buckets.summary.push(remainder);
      continue;
    }
    if (
      headingCandidate.startsWith("strongest areas of alignment") ||
      headingCandidate.startsWith("strongest alignment")
    ) {
      current = "strengths";
      sawHeading = true;
      const remainder = cleanBulletItem(trimmed.split(/:/).slice(1).join(":") || "");
      if (remainder) buckets.strengths.push(remainder);
      continue;
    }
    if (
      headingCandidate.startsWith("most important gaps or tensions") ||
      headingCandidate.startsWith("gaps or tensions") ||
      headingCandidate.startsWith("gaps") ||
      headingCandidate.startsWith("tensions")
    ) {
      current = "gaps";
      sawHeading = true;
      const remainder = cleanBulletItem(trimmed.split(/:/).slice(1).join(":") || "");
      if (remainder) buckets.gaps.push(remainder);
      continue;
    }
    if (
      headingCandidate.startsWith("implications for municipal planning") ||
      headingCandidate.startsWith("implications")
    ) {
      current = "implications";
      sawHeading = true;
      const remainder = cleanBulletItem(trimmed.split(/:/).slice(1).join(":") || "");
      if (remainder) buckets.implications.push(remainder);
      continue;
    }

    const item = cleanBulletItem(trimmed);
    if (item) {
      buckets[current].push(item);
    }
  }

  if (!sawHeading) {
    const fallback = splitParagraphs(text);
    if (fallback.length > 0) {
      buckets.summary.push(...fallback);
    }
  }

  return buckets;
}

function parseSwot(text: string) {
  const sections = {
    strengths: [] as string[],
    weaknesses: [] as string[],
    opportunities: [] as string[],
    threats: [] as string[],
    missingInformation: [] as string[],
  };

  let current: keyof typeof sections | null = null;

  for (const rawLine of sanitizePreserveParagraphs(text).split(/\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const heading = normalizeHeading(line);

    if (heading.startsWith("strengths")) {
      current = "strengths";
      continue;
    }
    if (heading.startsWith("weaknesses")) {
      current = "weaknesses";
      continue;
    }
    if (heading.startsWith("opportunities")) {
      current = "opportunities";
      continue;
    }
    if (heading.startsWith("threats")) {
      current = "threats";
      continue;
    }
    if (heading.startsWith("missing information")) {
      current = "missingInformation";
      continue;
    }

    const item = cleanBulletItem(line);
    if (current && item) {
      sections[current].push(item);
    }
  }

  return sections;
}

function parseWebContextSections(text: string) {
  const sections = {
    keyTakeaways: [] as string[],
    policySignals: [] as string[],
    implementationRisks: [] as string[],
    localWhy: [] as string[],
  };

  let current: keyof typeof sections | null = null;

  for (const rawLine of sanitizePreserveParagraphs(text).split(/\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const heading = normalizeHeading(line);

    if (heading.startsWith("key takeaways")) {
      current = "keyTakeaways";
      const remainder = cleanBulletItem(line.split(/:/).slice(1).join(":") || "");
      if (remainder) sections.keyTakeaways.push(remainder);
      continue;
    }
    if (heading.startsWith("policy signals")) {
      current = "policySignals";
      const remainder = cleanBulletItem(line.split(/:/).slice(1).join(":") || "");
      if (remainder) sections.policySignals.push(remainder);
      continue;
    }
    if (heading.startsWith("implementation risks")) {
      current = "implementationRisks";
      const remainder = cleanBulletItem(line.split(/:/).slice(1).join(":") || "");
      if (remainder) sections.implementationRisks.push(remainder);
      continue;
    }
    if (heading.startsWith("why this matters locally")) {
      current = "localWhy";
      const remainder = cleanBulletItem(line.split(/:/).slice(1).join(":") || "");
      if (remainder) sections.localWhy.push(remainder);
      continue;
    }

    const item = cleanBulletItem(line);
    if (current && item) {
      sections[current].push(item);
    }
  }

  return sections;
}

function sourceCitationText(result: AiStageResponsePayload) {
  if (result.sourceReferences.length === 0) return null;
  return result.sourceReferences.map((reference) => reference.label).join("; ");
}

type Recommendation = {
  rank: string;
  title: string;
  projectDescription: string;
  dataJustification: string[];
  planJustification: string[];
  implementationRisks: string[];
  implementationActions: string[];
};

function parseBulletedSection(content: string) {
  const explicitBullets = content
    .split(/\r?\n/)
    .map((line) => cleanBulletItem(line))
    .filter((line): line is string => Boolean(line));

  if (explicitBullets.length > 0) {
    return explicitBullets;
  }

  return splitParagraphs(content).filter(Boolean);
}

function hasRenderableRecommendation(rec: Recommendation) {
  return Boolean(
    rec.title &&
      (rec.projectDescription ||
        rec.dataJustification.length > 0 ||
        rec.planJustification.length > 0 ||
        rec.implementationRisks.length > 0 ||
        rec.implementationActions.length > 0),
  );
}

function parseRecommendations(text: string): Recommendation[] {
  const blocks = text
    .split(/(?=^\s*(?:\*\*)?\d+\.\s+)/m)
    .map((block) => block.trim())
    .filter((block) => /^(?:\*\*)?\d+\./.test(block));

  return blocks.map((block) => {
    const rankMatch = block.match(/^(?:\*\*)?(\d+)\.\s*(.+?)(?:\*\*)?$/m);
    const descMatch = block.match(/(?:\*+)?Project Description:(?:\*+)?\s*([\s\S]*?)(?=(?:\*+)?Data-Based Justification:(?:\*+)?|$)/i);
    const dataMatch = block.match(/(?:\*+)?Data-Based Justification:(?:\*+)?\s*([\s\S]*?)(?=(?:\*+)?Plan-Based Justification:(?:\*+)?|$)/i);
    const planMatch = block.match(/(?:\*+)?Plan-Based Justification:(?:\*+)?\s*([\s\S]*?)(?=(?:\*+)?Implementation Risks:(?:\*+)?|(?:\*+)?Implementation Actions:(?:\*+)?|$)/i);
    const risksMatch = block.match(/(?:\*+)?Implementation Risks:(?:\*+)?\s*([\s\S]*?)(?=(?:\*+)?Implementation Actions:(?:\*+)?|$)/i);
    const actionsMatch = block.match(/(?:\*+)?Implementation Actions:(?:\*+)?\s*([\s\S]*)$/i);

    return {
      rank: rankMatch?.[1] ?? "?",
      title: sanitizeMarkdownText((rankMatch?.[2] ?? "Recommendation").replace(/^\d+\.\s*/, "")),
      projectDescription: sanitizeMarkdownText((descMatch?.[1] ?? "").trim()),
      dataJustification: parseBulletedSection(dataMatch?.[1] ?? ""),
      planJustification: parseBulletedSection(planMatch?.[1] ?? ""),
      implementationRisks: parseBulletedSection(risksMatch?.[1] ?? ""),
      implementationActions: parseBulletedSection(actionsMatch?.[1] ?? ""),
    };
  });
}

export function AiIndicatorNarrativeResult({ result }: { result: AiStageResponsePayload }) {
  if (result.status === "failed") {
    return (
      <div className="mt-6 rounded-[1.5rem] border border-[var(--border-soft)] bg-white/75 p-5">
        <ResultMeta result={result} />
        <ErrorBlock result={result} />
      </div>
    );
  }

  const { sections, overallSummary } = parseNarrativeSections(result.renderedOutput ?? "");

  return (
    <div className="mt-5 rounded-[1.35rem] border border-[var(--border-soft)] bg-white/75 p-4 xl:p-5">
      <ResultMeta result={result} />
      {overallSummary ? (
        <div className="mt-4 rounded-[1.15rem] border border-[var(--border-soft)] bg-[rgba(17,138,178,0.06)] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Overall summary</p>
          <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">{overallSummary}</p>
        </div>
      ) : null}
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Detailed Breakdown of Each Indicator
        </p>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {sections.length > 0 ? sections.map((section) => (
          <div key={section.title} className="rounded-[1.15rem] border border-[var(--border-soft)] bg-white p-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">{section.title}</h3>
            <div className="mt-3 space-y-3 text-sm leading-7 text-[var(--muted-foreground)]">
              {section.body.map((paragraph, index) => (
                <p key={`${section.title}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </div>
        )) : (
          <div className="rounded-[1.25rem] border border-[var(--border-soft)] bg-white p-4 text-sm leading-7 text-[var(--foreground)] whitespace-pre-wrap xl:col-span-2">
            {result.renderedOutput}
          </div>
        )}
      </div>
      <SourceList result={result} />
    </div>
  );
}

export function AiAlignmentResult({ result }: { result: AiStageResponsePayload }) {
  if (result.status === "failed") {
    return (
      <div className="mt-6 rounded-[1.5rem] border border-[var(--border-soft)] bg-white/75 p-5">
        <ResultMeta result={result} />
        <ErrorBlock result={result} />
      </div>
    );
  }

  const sections = parseAlignmentSections(result.renderedOutput ?? "");
  const cards = [
    { title: "Alignment summary", body: sections.summary, tone: "bg-[rgba(17,138,178,0.06)]" },
    { title: "Strongest areas of alignment", body: sections.strengths, tone: "bg-[rgba(84,162,75,0.08)]" },
    { title: "Gaps or tensions", body: sections.gaps, tone: "bg-[rgba(228,87,86,0.08)]" },
    { title: "Implications for municipal planning", body: sections.implications, tone: "bg-[rgba(251,191,36,0.10)]" },
  ];
  const visibleCards = cards.filter((card) => card.body.length > 0);

  return (
    <div className="mt-5 rounded-[1.35rem] border border-[var(--border-soft)] bg-white/75 p-4 xl:p-5">
      <ResultMeta result={result} />
      {visibleCards.length > 0 ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {visibleCards.map((card) => (
            <div key={card.title} className={`rounded-[1.15rem] border border-[var(--border-soft)] p-4 ${card.tone}`}>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{card.title}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--foreground)]">
                {card.body.map((item, index) => (
                  <li key={`${card.title}-${index}`} className="list-disc ml-5">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <RawOutputFallback text={result.renderedOutput} title="Alignment analysis" />
        </div>
      )}
      <SourceList result={result} />
    </div>
  );
}

export function AiSwotResult({ result }: { result: AiStageResponsePayload }) {
  if (result.status === "failed") {
    return (
      <div className="mt-6 rounded-[1.5rem] border border-[var(--border-soft)] bg-white/75 p-5">
        <ResultMeta result={result} />
        <ErrorBlock result={result} />
      </div>
    );
  }

  const swot = parseSwot(result.renderedOutput ?? "");
  const citation = sourceCitationText(result);
  const cards = [
    { title: "Strengths", items: swot.strengths, tone: "bg-[rgba(84,162,75,0.08)]" },
    { title: "Weaknesses", items: swot.weaknesses, tone: "bg-[rgba(228,87,86,0.08)]" },
    { title: "Opportunities", items: swot.opportunities, tone: "bg-[rgba(17,138,178,0.06)]" },
    { title: "Threats", items: swot.threats, tone: "bg-[rgba(251,191,36,0.10)]" },
  ];
  const visibleCards = cards.filter((card) => card.items.length > 0);

  return (
    <div className="mt-5 rounded-[1.35rem] border border-[var(--border-soft)] bg-white/75 p-4 xl:p-5">
      <ResultMeta result={result} />
      {visibleCards.length > 0 || swot.missingInformation.length > 0 ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {visibleCards.map((card) => (
            <div key={card.title} className={`rounded-[1.15rem] border border-[var(--border-soft)] p-4 ${card.tone}`}>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{card.title}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--foreground)]">
                {card.items.map((item, index) => (
                  <li key={`${card.title}-${index}`} className="ml-5 list-disc">
                    {citation ? `${item} [Sources: ${citation}]` : item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {swot.missingInformation.length > 0 ? (
            <div className="rounded-[1.15rem] border border-[var(--border-soft)] bg-white p-4 xl:col-span-2">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Missing information</h3>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--foreground)]">
                {swot.missingInformation.map((item, index) => (
                  <li key={`missing-${index}`} className="ml-5 list-disc">
                    {citation ? `${item} [Sources: ${citation}]` : item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4">
          <RawOutputFallback text={result.renderedOutput} title="SWOT analysis" />
        </div>
      )}
      <SourceList result={result} />
    </div>
  );
}

export function AiRecommendationsResult({ result }: { result: AiStageResponsePayload }) {
  if (result.status === "failed") {
    return (
      <div className="mt-6 rounded-[1.5rem] border border-[var(--border-soft)] bg-white/75 p-5">
        <ResultMeta result={result} />
        <ErrorBlock result={result} />
      </div>
    );
  }

  const recommendations = parseRecommendations(result.renderedOutput ?? "").filter(
    hasRenderableRecommendation,
  );

  return (
    <div className="mt-5 rounded-[1.35rem] border border-[var(--border-soft)] bg-white/75 p-4 xl:p-5">
      <ResultMeta result={result} />
      <div className="mt-4 space-y-4">
        {recommendations.length > 0 ? recommendations.map((rec) => {
          const hasData = rec.dataJustification.length > 0;
          const hasPlan = rec.planJustification.length > 0;
          const hasRisks = rec.implementationRisks.length > 0;
          const hasActions = rec.implementationActions.length > 0;
          return (
            <div key={`${rec.rank}-${rec.title}`} className="rounded-[1.15rem] border border-[var(--border-soft)] bg-white p-4 xl:p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
                  {rec.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    {sanitizeMarkdownText(rec.title).replace(/^\d+\.\s*/, "")}
                  </h3>
                  {rec.projectDescription ? (
                    <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">{rec.projectDescription}</p>
                  ) : null}
                  {(hasData || hasPlan) ? (
                    <div className="mt-4 grid gap-4 xl:grid-cols-2">
                      {hasData ? (
                        <div className="rounded-[0.95rem] bg-[rgba(17,138,178,0.06)] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Data-based justification</p>
                          <ul className="mt-2 space-y-2 text-sm leading-7 text-[var(--foreground)]">
                            {rec.dataJustification.map((item, index) => (
                              <li key={`${rec.title}-data-${index}`} className="ml-5 list-disc">{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {hasPlan ? (
                        <div className="rounded-[0.95rem] bg-[rgba(84,162,75,0.08)] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Plan-based justification</p>
                          <ul className="mt-2 space-y-2 text-sm leading-7 text-[var(--foreground)]">
                            {rec.planJustification.map((item, index) => (
                              <li key={`${rec.title}-plan-${index}`} className="ml-5 list-disc">{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {(hasRisks || hasActions) ? (
                    <div className="mt-4 space-y-4">
                      {hasRisks ? (
                        <div className="rounded-[0.95rem] border border-[var(--border-soft)] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Implementation risks</p>
                          <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--foreground)]">
                            {rec.implementationRisks.map((risk, index) => (
                              <li key={`${rec.title}-risk-${index}`} className="ml-5 list-disc">{risk}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {hasActions ? (
                        <div className="rounded-[0.95rem] border border-[var(--border-soft)] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Implementation actions</p>
                          <ol className="mt-3 space-y-2 text-sm leading-7 text-[var(--foreground)]">
                            {rec.implementationActions.map((action, index) => (
                              <li key={`${rec.title}-action-${index}`} className="ml-5 list-decimal">{action}</li>
                            ))}
                          </ol>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        }) : (
          <RawOutputFallback text={result.renderedOutput} title="Recommendation output" />
        )}
      </div>
      <SourceList result={result} />
    </div>
  );
}

export function AiWebContextResult({ result }: { result: AiStageResponsePayload }) {
  if (result.status === "failed") {
    return (
      <div className="mt-6 rounded-[1.5rem] border border-[var(--border-soft)] bg-white/75 p-5">
        <ResultMeta result={result} />
        <ErrorBlock result={result} />
      </div>
    );
  }

  const sections = parseWebContextSections(result.renderedOutput ?? "");
  const cards = [
    {
      title: "Key takeaways",
      items: sections.keyTakeaways,
      tone: "bg-[rgba(17,138,178,0.06)]",
    },
    {
      title: "Policy signals",
      items: sections.policySignals,
      tone: "bg-[rgba(84,162,75,0.08)]",
    },
    {
      title: "Implementation risks",
      items: sections.implementationRisks,
      tone: "bg-[rgba(228,87,86,0.08)]",
    },
    {
      title: "Why this matters locally",
      items: sections.localWhy,
      tone: "bg-[rgba(251,191,36,0.10)]",
    },
  ].filter((card) => card.items.length > 0);

  return (
    <div className="mt-5 rounded-[1.35rem] border border-[var(--border-soft)] bg-white/75 p-4 xl:p-5">
      <ResultMeta result={result} />
      {cards.length > 0 ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`rounded-[1.15rem] border border-[var(--border-soft)] p-5 ${card.tone}`}
            >
              <h3 className="text-xl font-semibold text-[var(--foreground)]">{card.title}</h3>
              <ul className="mt-4 space-y-3 text-base leading-8 text-[var(--foreground)]">
                {card.items.map((item, index) => (
                  <li key={`${card.title}-${index}`} className="ml-5 list-disc">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : result.renderedOutput ? (
        <div className="mt-4">
          <RawOutputFallback text={result.renderedOutput} title="External context summary" />
        </div>
      ) : null}
      <SourceList result={result} />
    </div>
  );
}
