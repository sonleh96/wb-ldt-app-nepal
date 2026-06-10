import type { AiDocumentContext, AiIndicatorSeries, AiPipelineContext } from "@/lib/ai/types";

function formatSeries(series: AiIndicatorSeries[], localUnitLabel: string) {
  return series
    .map((item) => {
      const latest = item.points[item.points.length - 1];
      return [
        `Score component: ${item.label}`,
        `Description: ${item.description ?? "No description available."}`,
        `Latest ${localUnitLabel.toLowerCase()} score (${latest?.year ?? "n/a"}): ${latest?.municipalityValue ?? "n/a"}`,
        `Latest higher-admin average score (${latest?.year ?? "n/a"}): ${latest?.provinceAverage ?? "n/a"}`,
        `Latest national average score (${latest?.year ?? "n/a"}): ${latest?.nationalAverage ?? "n/a"}`,
      ].join("\n");
    })
    .join("\n\n");
}

function excerptDocument(document: AiDocumentContext) {
  return document.passages
    .slice(0, 10)
    .map((passage, index) => `Passage ${index + 1}: ${passage.text}`)
    .join("\n\n");
}

function excerptWebContext(summary: string | null) {
  return summary?.trim() ? summary.trim() : "No optional external web context was provided.";
}

export const basePlanningSystemPrompt = [
  "You are assisting public-sector planners with subnational development analysis.",
  "Work only in English.",
  "The only score themes are Prosperity Score, Infrastructure Score, and Livability Score.",
  "Indicators contribute directly to scores. Do not refer to dimensions or intermediate themes.",
  "Write clearly for policy and investment decision makers.",
  "Be evidence-based and explicit when a conclusion is limited by weak evidence.",
  "Return plain text with explicit section headings.",
  "Do not use markdown emphasis such as **bold** or _italics_.",
  "Do not emit empty bullets, placeholder bullets, or filler text.",
  "Cite evidence in-line at the end of each bullet using the format [Sources: ...].",
].join(" ");

export function buildIndicatorNarrativePrompt(context: AiPipelineContext) {
  return [
    `Country: ${context.country.name}`,
    `${context.localPlanUnitLabel}: ${context.localPlanUnitName}`,
    `Selected unit: ${context.municipality.name}, ${context.municipality.province}`,
    `Selected score: ${context.score.label}`,
    "",
    "Indicator evidence:",
    formatSeries(context.indicatorSeries, context.localPlanUnitLabel),
    "",
    "Write a concise local development narrative focused only on the selected score.",
    "Explain which indicators appear to strengthen the selected unit, which weaken it, and what that suggests about local development conditions.",
    "Do not use any local/SNG plan or national plan context in this stage.",
  ].join("\n");
}

export function buildPlanAlignmentPrompt(
  provinceDocument: AiDocumentContext,
  nationalDocument: AiDocumentContext,
  context: AiPipelineContext,
  webContextSummary?: string | null,
) {
  return [
    `Country: ${context.country.name}`,
    `${context.localPlanUnitLabel}: ${context.localPlanUnitName}`,
    `Selected unit: ${context.municipality.name}, ${context.municipality.province}`,
    `Selected score: ${context.score.label}`,
    "",
    "Local/SNG plan excerpts:",
    excerptDocument(provinceDocument),
    "",
    "National plan excerpts:",
    excerptDocument(nationalDocument),
    "",
    "Optional external web context:",
    excerptWebContext(webContextSummary ?? null),
    "",
    "Task: assess whether the local/SNG plan is aligned with the national plan for the selected unit and score theme.",
    "",
    "Return plain text only. Use exactly these section headings in this exact order:",
    "Alignment summary",
    "Strongest areas of alignment",
    "Most important gaps or tensions",
    "Implications for local planning",
    "",
    "Formatting rules:",
    "- Under each heading, write 4 to 6 bullet points.",
    "- Keep each bullet concise: one sentence, or at most two short sentences.",
    "- Every bullet must end with in-line citations in this exact format: [Sources: Local/SNG plan; National plan] or [Sources: Local/SNG plan; National plan; Web context].",
    "- Do not use markdown emphasis, tables, or numbering.",
    "- Do not repeat the heading names inside the bullets.",
    "- Make implications operational for local planning, budgeting, or sequencing.",
  ].join("\n");
}

export function buildSwotPrompt({
  context,
  indicatorNarrative,
  provinceDocument,
  nationalDocument,
  webContextSummary,
}: {
  context: AiPipelineContext;
  indicatorNarrative: string;
  provinceDocument: AiDocumentContext;
  nationalDocument: AiDocumentContext;
  webContextSummary?: string | null;
}) {
  return [
    `Country: ${context.country.name}`,
    `${context.localPlanUnitLabel}: ${context.localPlanUnitName}`,
    `Selected unit: ${context.municipality.name}, ${context.municipality.province}`,
    `Selected score: ${context.score.label}`,
    "",
    "Indicator narrative:",
    indicatorNarrative,
    "",
    "Local/SNG plan excerpts:",
    excerptDocument(provinceDocument),
    "",
    "National plan excerpts:",
    excerptDocument(nationalDocument),
    "",
    "Optional external web context:",
    excerptWebContext(webContextSummary ?? null),
    "",
    "Task: create a SWOT analysis for this selected unit focused on the selected score.",
    "",
    "Return plain text only. Use exactly these section headings in this exact order:",
    "Strengths",
    "Weaknesses",
    "Opportunities",
    "Threats",
    "Missing information",
    "",
    "Formatting rules:",
    "- For Strengths, Weaknesses, Opportunities, and Threats, write exactly 3 bullet points each.",
    "- For Missing information, write 0 to 2 bullet points only if a meaningful evidence gap exists.",
    "- Every bullet must end with in-line citations in this exact format: [Sources: Indicator narrative; Local/SNG plan] or a similar evidence combination.",
    "- Do not use markdown emphasis, placeholder bullets, or empty bullets.",
    "- Strengths and Weaknesses must be grounded primarily in the indicator narrative.",
    "- Opportunities and Threats must connect indicator evidence to local/SNG and national planning context.",
    "- Make each bullet decision-relevant for public investment planning rather than generic commentary.",
  ].join("\n");
}

export function buildInvestmentRecommendationsPrompt({
  context,
  indicatorNarrative,
  alignment,
  swot,
  webContextSummary,
}: {
  context: AiPipelineContext;
  indicatorNarrative: string;
  alignment: string;
  swot: string;
  webContextSummary?: string | null;
}) {
  return [
    `Country: ${context.country.name}`,
    `${context.localPlanUnitLabel}: ${context.localPlanUnitName}`,
    `Selected unit: ${context.municipality.name}, ${context.municipality.province}`,
    `Selected score: ${context.score.label}`,
    "",
    "Indicator narrative:",
    indicatorNarrative,
    "",
    "Local/SNG vs national alignment:",
    alignment,
    "",
    "SWOT analysis:",
    swot,
    "",
    "Optional external web context:",
    excerptWebContext(webContextSummary ?? null),
    "",
    "Task: generate public project investment recommendations.",
    "",
    "Return plain text only as a ranked list of exactly 3 recommendations.",
    "Use this exact template for each recommendation:",
    "",
    "1. Recommendation title",
    "Project Description:",
    "A short paragraph.",
    "Data-Based Justification:",
    "- Bullet 1 [Sources: ...]",
    "- Bullet 2 [Sources: ...]",
    "Plan-Based Justification:",
    "- Bullet 1 [Sources: ...]",
    "- Bullet 2 [Sources: ...]",
    "Implementation Risks:",
    "- Bullet 1 [Sources: ...]",
    "- Bullet 2 [Sources: ...]",
    "Implementation Actions:",
    "1. Action one",
    "2. Action two",
    "3. Action three",
    "",
    "Rules:",
    "- Recommendations must be concrete public investment proposals, not abstract policy ideas.",
    "- Recommendations must be ranked from highest to lowest priority.",
    "- Project descriptions must mention the selected unit and selected score theme where useful.",
    "- Data-Based Justification must draw from the indicator narrative.",
    "- Plan-Based Justification must connect to the local/SNG plan, national plan, and optional web context when relevant.",
    "- Implementation Risks must be specific and operational.",
    "- Do not use markdown emphasis or tables.",
  ].join("\n");
}

export function buildWebContextSummaryPrompt({
  context,
  hits,
}: {
  context: AiPipelineContext;
  hits: Array<{
    title: string;
    url: string;
    text: string;
    publishedDate: string | null;
    score: number | null;
  }>;
}) {
  const hitText = hits
    .map((hit, index) =>
      [
        `Hit ${index + 1}: ${hit.title}`,
        `URL: ${hit.url}`,
        `Published: ${hit.publishedDate ?? "unknown"}`,
        `Search score: ${hit.score ?? "unknown"}`,
        `Excerpt: ${hit.text.slice(0, 2500)}`,
      ].join("\n"),
    )
    .join("\n\n");

  return [
    `Country: ${context.country.name}`,
    `${context.localPlanUnitLabel}: ${context.localPlanUnitName}`,
    `Selected unit: ${context.municipality.name}, ${context.municipality.province}`,
    `Selected score: ${context.score.label}`,
    "",
    "External web search results:",
    hitText,
    "",
    "Summarize the most decision-relevant external context for local planning.",
    "Use a short structured format with the headings: Key takeaways, Policy signals, Implementation risks, and Why this matters locally.",
    "Do not fabricate details not present in the search results.",
  ].join("\n");
}
