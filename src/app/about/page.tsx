import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

import aiRecommendationsImage from "../../../images/about-ldt-ai-recommendations.png";
import aiSwotImage from "../../../images/about-ldt-ai-swot.png";
import gpbToolsLogo from "../../../images/about-ldt-gpb-tools-logo.png";
import pilQuadrantImage from "../../../images/about-ldt-2d-quadrant.png";
import pilRankingImage from "../../../images/about-ldt-3d-pil-ranking.png";
import pimpamLogo from "../../../images/about-ldt-pimpam-logo.png";
import populationDistributionImage from "../../../images/about-ldt-population-distribution.png";
import projectSelectionImage from "../../../images/about-ldt-project-selection.png";
import sizeDistributionImage from "../../../images/about-ldt-size-distribution.png";
import strategyAvailabilityImage from "../../../images/about-ldt-strategy-availability.png";
import worldBankLogo from "../../../images/about-ldt-world-bank-logo.png";

type Figure = {
  src: StaticImageData;
  alt: string;
  caption: string;
};

const layerOneSteps = [
  {
    title: "Step 1 - Define the relevant levels of sub-national government",
    body:
      "Two sub-national administrative levels most relevant to the analysis are determined based on their degree of self-governance and discretionary budget control. Regions with partial to full control over budgets are better positioned to plan, invest in, and implement public projects.",
  },
  {
    title: "Step 2 - Upload the best-available boundary files",
    body:
      "Boundaries from official or highly reputable sources are examined for geographical accuracy, administrative consistency, and data vintage. These boundaries form the spatial unit to which indicators, scores, maps, and local analytics are linked.",
  },
  {
    title: "Step 3 - Generate PIL indicators from global big data",
    body:
      "Global geospatial, environmental, infrastructure, and tabular datasets are processed into comparable sub-national indicators for Prosperity, Livability, and Infrastructure. Inputs include VIIRS nighttime lights, WorldPop, GADM, OpenStreetMap, Openrouteservice, Dynamic World, ERA5, WRI Aqueduct, Climate TRACE, and other public datasets.",
  },
  {
    title: "Step 4 - Validate levels and trends for sample SNGs",
    body:
      "Sample municipalities or target SNGs are reviewed for plausible levels, spatial patterns, rankings, outliers, and score drivers. Results are compared with national statistics, administrative records, and local knowledge where available.",
  },
  {
    title: "Step 5 - Add national statistical and administrative data",
    body:
      "Global indicators provide a scalable first-pass view, but country-specific data strengthen interpretation. This may include own-source revenue, migration, employment, demographics, local strategies, national plans, project pipelines, and other planning documents.",
  },
] as const;

const layerTwoSteps = [
  "Build a registry of target local governments with official name, province, district, type, population, area, boundary ID, and available strategy documents.",
  "Analyze PIL scores while identifying strengths and watchpoints across Prosperity, Livability, Infrastructure, and the PIL aggregate.",
  "Identify, consolidate, and assess alignment across national, provincial, sector, donor, and local development strategies.",
  "Use GenAI and reputable web context to produce municipality-level planning narratives, development gaps, likely drivers, peer comparisons, and policy alignment.",
  "Generate evidence-backed SWOT analysis for each local government using PIL scores, strategy content, opportunities, and risks.",
  "Translate PIL evidence, strategy alignment, and SWOT outputs into public investment and asset-management recommendations.",
] as const;

const highlightFigures: Figure[] = [
  {
    src: pilRankingImage,
    alt: "Three-dimensional PIL ranking view for sub-national governments",
    caption:
      "SNGs can be ranked across three-dimensional Prosperity, Infrastructure, and Livability measures.",
  },
  {
    src: pilQuadrantImage,
    alt: "Two-dimensional quadrant analysis for prosperity and livability",
    caption:
      "Users can use 2D quadrant analysis for further insights, such as identifying high-prosperity and high-livability leaders.",
  },
  {
    src: strategyAvailabilityImage,
    alt: "Strategy inventory availability view",
    caption:
      "The analysis shows where SNG development strategies are available.",
  },
  {
    src: populationDistributionImage,
    alt: "Population size distribution view",
    caption:
      "The tool also maps population size distribution across localities.",
  },
  {
    src: aiSwotImage,
    alt: "AI-powered SWOT analysis panel",
    caption:
      "AI-powered SWOT analysis brings together insights from PIL scores and development strategy mapping.",
  },
] as const;

const limitations = [
  {
    title: "Big-data proxies require validation",
    body:
      "Many PIL indicators are based on global geospatial datasets. These sources allow rapid, comparable analysis, but they may not perfectly reflect local conditions. Nighttime lights, accessibility layers, climate models, emissions estimates, and other proxy indicators should be checked against national statistics, administrative records, and local knowledge where available.",
  },
  {
    title: "Administrative boundaries and SNG definitions matter",
    body:
      "Results depend on the sub-national level selected for analysis. District-level diagnostics may hide municipal differences, while municipal-level diagnostics may be too granular for some financing instruments. The chosen geography should match the policy question and the level of government with relevant planning, budgeting, or asset-management responsibility.",
  },
  {
    title: "Local strategy documents may be missing, outdated, or uneven",
    body:
      "The quality of the strategy registry depends on what is publicly available and what counterparts can provide. Where local plans are unavailable, the LDT can still use PIL evidence and higher-level plans, but recommendations should be treated as first-pass planning inputs rather than substitutes for local strategy preparation.",
  },
  {
    title: "AI outputs need human review and source transparency",
    body:
      "AI-generated narratives, SWOTs, and investment recommendations should be inspectable. Users should be able to see which indicators, strategy documents, and source materials support each output. AI can accelerate synthesis, but sector teams, country teams, and local counterparts should review outputs before they inform policy dialogue or project pipelines.",
  },
  {
    title: "PIL scores do not capture every implementation constraint",
    body:
      "A low infrastructure or livability score may indicate a priority issue, but it does not establish project feasibility, fiscal affordability, readiness, procurement capacity, land availability, or operation and maintenance sustainability. The LDT should feed into public investment management processes where concepts can be screened, appraised, selected, and sequenced.",
  },
] as const;

const countryRows = [
  {
    country: "Nepal",
    focus: "Municipalities",
    levelOne: "7 provinces",
    levelTwo: "753",
    strategies: "0*",
    topic: "Two municipalities from each of Madhesh, Karnali, and Sudurpashchim provinces",
  },
  {
    country: "Serbia",
    focus: "Municipalities",
    levelOne: "29 districts",
    levelTwo: "145 Local Self Governments (LSGs)**",
    strategies: "~90%***",
    topic: "LIID Early Investors",
  },
  {
    country: "Zambia",
    focus: "Districts",
    levelOne: "10 provinces",
    levelTwo: "116",
    strategies: "~60%",
    topic: "Mining Districts",
  },
] as const;

const references = [
  "Kaiser, Kai-Alexander, Kim, Hyunseok, Mroczka, Fabienne, & Singh, Kaushiki. (2026). Public Finance Review Fundamentals: Enhancing Public Investment Development Outcomes. Washington, DC: Global Governance Practice, forthcoming.",
  "World Bank. (2025a). pim-pam.net Digital Decision Support Resources: Workplan 2026. Washington, DC: Prosperity Vertical Governance Department Public Infrastructure Investment and Asset Governance Community of Practice.",
  "World Bank. (2025b). pim-pam.net Geospatial Planning and Budgeting Platform Country Data Cube Data Catalogue. Washington, DC & Vienna, Austria: Prosperity Vertical Governance Department Public Finance and Procurement Unit.",
] as const;

function FigureCard({ figure, priority = false }: { figure: Figure; priority?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
      <Image
        src={figure.src}
        alt={figure.alt}
        className="h-auto w-full rounded-[0.9rem]"
        priority={priority}
      />
      <figcaption className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
        {figure.caption}
      </figcaption>
    </figure>
  );
}

function SectionCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className={eyebrow ? "mt-3 text-2xl font-semibold text-[var(--foreground)]" : "text-2xl font-semibold text-[var(--foreground)]"}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pb-16 pt-10 sm:px-8 lg:px-12">
      <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-8 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
        <div className="flex flex-wrap items-center gap-5 rounded-[1.25rem] border border-[var(--border-soft)] bg-white/70 p-4">
          <Image src={worldBankLogo} alt="The World Bank" className="h-10 w-auto" priority />
          <Image src={pimpamLogo} alt="PIM-PAM" className="h-12 w-auto" priority />
          <Image src={gpbToolsLogo} alt="GPB Tools" className="h-14 w-auto" priority />
        </div>
        <p className="mt-8 text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
          pim-pam.net Geospatial Planning and Budgeting Tools
        </p>
        <h1 className="mt-4 max-w-5xl text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-[2.8rem] lg:whitespace-nowrap lg:text-[3.25rem]">
          Local Development Tracker QuickStart
        </h1>
        <p className="mt-3 text-sm font-medium text-[var(--muted-foreground)]">
          This version: May 23, 2026
        </p>
        <p className="mt-6 max-w-4xl text-base leading-8 text-[var(--muted-foreground)] sm:text-lg">
          This note sets out the motivation, method, and early country
          applications for the pim-pam.net Geospatial Planning and Budgeting
          Local Development Tracker tool. The LDT is designed to identify key
          development and public investment gaps at sub-national levels,
          illustrated through applications in Nepal, Serbia, and Zambia.
        </p>
      </section>

      <SectionCard title="The sub-national challenge">
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            Sub-national governments are vital to realizing frontline
            development outcomes, including territorial development and job
            creation. Yet relevant SNG levels, population size, and geographic
            scale vary substantially across countries.
          </p>
          <p>
            Statistical and administrative data concerning key development
            indicators may be missing or outdated. SNGs may also lack local
            development strategies that best address their challenges and
            opportunities. Big data from non-traditional and geospatial sources,
            including satellites, can help address these gaps.
          </p>
          <p>
            The GPB LDT enables rapid analysis of sub-national development
            indicators across Prosperity, Livability, and Infrastructure. It
            deploys a curated list of development indicators, then uses data
            analytics, visualization, and AI extensions to help users identify
            patterns, trends, and planning insights.
          </p>
          <p>
            At the individual SNG level, local development strategies are often
            the starting point for understanding priorities. These documents are
            often dispersed, voluminous, uneven in quality, or out of date. The
            GPB LDT applies systematic AI analytics to assemble as comprehensive
            a repository of local strategy documents as possible.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="The method: two layers, any country">
        <p className="mt-5 max-w-4xl text-sm leading-8 text-[var(--muted-foreground)]">
          The GPB LDT workflow has two complementary layers. The first builds a
          sub-national data baseline. The second maps development strategies and
          translates the evidence into planning and public investment options.
        </p>
      </SectionCard>

      <SectionCard eyebrow="Layer 1" title="Build the sub-national evidence base">
        <p className="mt-5 max-w-4xl text-sm leading-8 text-[var(--muted-foreground)]">
          The first layer creates the spatial and statistical foundation for
          evidence-based analysis.
        </p>
        <div className="mt-6">
          <FigureCard
            figure={{
              src: sizeDistributionImage,
              alt: "Municipality population distribution chart",
              caption: "Figure. Understand the size distribution of localities.",
            }}
            priority
          />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {layerOneSteps.map((step) => (
            <article
              key={step.title}
              className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5"
            >
              <h3 className="text-xl font-semibold text-[var(--foreground)]">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                {step.body}
              </p>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard eyebrow="Layer 2" title="Map strategies and translate diagnostics into PIM options">
        <p className="mt-5 max-w-4xl text-sm leading-8 text-[var(--muted-foreground)]">
          The second layer connects the data baseline and multi-level government
          development strategies to the planning process.
        </p>
        <ol className="mt-6 grid gap-4 lg:grid-cols-2">
          {layerTwoSteps.map((step, index) => (
            <li
              key={step}
              className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--muted-foreground)]"
            >
              <span className="mb-3 inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">
                Step {index + 1}
              </span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </SectionCard>

      <SectionCard title="Figure 1. Panel of GPB LDT highlights">
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {highlightFigures.map((figure, index) => (
            <FigureCard key={figure.caption} figure={figure} priority={index < 2} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Replicability: adding the next country">
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            The LDT has been designed for replication across country settings.
            The workflow does not depend on one country&apos;s administrative
            system, data architecture, or planning terminology. Country,
            sub-national level, boundary file, indicator set, population layer,
            strategy documents, and complementary administrative data are inputs
            to a common method.
          </p>
          <p>
            Global geospatial and big-data sources can provide a consistent
            first-pass baseline for nearly any country and sub-national
            geography. Country-specific data can then be added where available
            to improve relevance and interpretation.
          </p>
          <p>
            The main time driver is not redesigning the method. It is the
            availability, quality, and validation of country boundaries, local
            strategies, and complementary administrative data. Once these inputs
            are assembled, the LDT provides a repeatable structure for turning
            local evidence into planning insights.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Key limitations and validation needs">
        <p className="mt-5 max-w-4xl text-sm leading-8 text-[var(--muted-foreground)]">
          The LDT is most useful when its limitations are explicit. It provides
          a structured starting point for local development diagnostics, not a
          final judgment on local performance or project priority.
        </p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {limitations.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5"
            >
              <h3 className="text-xl font-semibold text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                {item.body}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-5 rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5 text-sm leading-8 text-[var(--muted-foreground)]">
          The central principle is simple: use the LDT to make local
          development patterns visible, then validate, contextualize, and
          translate those patterns through the country&apos;s planning and PIM
          systems.
        </p>
      </SectionCard>

      <SectionCard title="Selected country findings">
        <p className="mt-5 max-w-4xl text-sm leading-8 text-[var(--muted-foreground)]">
          The three country applications below illustrate how the same method
          adapts to different planning contexts: filling local evidence gaps
          where strategies are missing, moving from diagnostics to
          investment-ready project matching, and focusing on a specific class of
          localities such as mining districts.
        </p>
        <div className="mt-6 overflow-x-auto rounded-[1.25rem] border border-[var(--border-soft)]">
          <table className="min-w-[58rem] border-collapse bg-[var(--surface)] text-left text-sm">
            <thead className="bg-[var(--accent-soft)]/70 text-[var(--foreground)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Country</th>
                <th className="px-4 py-3 font-semibold">Level of focus</th>
                <th className="px-4 py-3 font-semibold"># SNGs (Level 1)</th>
                <th className="px-4 py-3 font-semibold"># SNGs (Level 2)</th>
                <th className="px-4 py-3 font-semibold">% with strategies</th>
                <th className="px-4 py-3 font-semibold">Focus topic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)] text-[var(--muted-foreground)]">
              {countryRows.map((row) => (
                <tr key={row.country}>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {row.country}
                  </td>
                  <td className="px-4 py-3">{row.focus}</td>
                  <td className="px-4 py-3">{row.levelOne}</td>
                  <td className="px-4 py-3">{row.levelTwo}</td>
                  <td className="px-4 py-3">{row.strategies}</td>
                  <td className="px-4 py-3">{row.topic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-1 text-xs leading-6 text-[var(--muted-foreground)]">
          <p>* Provincial strategies are available.</p>
          <p>** For Serbia, 174 if Kosovo is included.</p>
          <p>*** For Serbia, the 95% figure does not include Kosovo.</p>
        </div>
      </SectionCard>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Nepal: filling local planning evidence gaps
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted-foreground)]">
            <p>
              Nepal is a strong test case because the binding constraint is not
              the absence of local authority, but the absence of consistently
              available local planning evidence.
            </p>
            <p>
              Municipal development plans are not systematically available or
              disclosed. The LDT can use PIL diagnostics, provincial strategies,
              and Nepal&apos;s Sixteenth Plan as higher-level policy anchors to
              generate first-pass local development narratives and investment
              recommendations.
            </p>
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Serbia: moving from diagnostics to investment readiness
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted-foreground)]">
            <p>
              Serbia demonstrates how the LDT can move beyond local diagnostics
              to investment-ready project matching, supporting efforts around a
              national ePIM system and the LIID program.
            </p>
            <p>
              The Veliko Gradiste example moves from school-access and
              digital-readiness evidence to recommendations on early childhood
              services, school infrastructure, digital equipment, and dual
              education linked to local labour-market needs.
            </p>
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Zambia: local development, mining districts, and the 9th NDP
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted-foreground)]">
            <p>
              Zambia illustrates how the LDT can support spatial dimensions of
              the 9th National Development Plan and specific development
              challenges in mining districts.
            </p>
            <p>
              Mining districts are an important test case for linking local
              economic development, PIM, environmental risk, fiscal
              benefit-sharing, ESG risk, infrastructure, and public financial
              management.
            </p>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <FigureCard
          figure={{
            src: aiRecommendationsImage,
            alt: "AI-powered project recommendations screenshot",
            caption:
              "Figure 3. AI-powered project recommendations combining PIL indicators, relevant web search, and multi-level development plans.",
          }}
        />
        <FigureCard
          figure={{
            src: projectSelectionImage,
            alt: "Curated existing projects in Serbia screenshot",
            caption:
              "Figure 4. Curated existing projects in Serbia to serve as the basis for initial project planning.",
          }}
        />
      </section>

      <SectionCard title="Further resources and contacts">
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            Country teams interested in applying these approaches may schedule a
            3-4 hour GPB LDT Masterclass, apply the tools in their country
            context, or request a tailored briefing on related Infrastructure
            Governance 2.0 diagnostics and other pim-pam.net digital tools.
          </p>
          <p>
            Contact the World Bank Global PIM-PAM Solutions Team:
            Kai-Alexander Kaiser, Hyunseok Kim, Fabienne Mroczka, and Kaushiki
            Singh.
          </p>
          <p>
            The team thanks the global partners of the World Bank Financial
            Management Umbrella Program and the Japan Quality of Infrastructure
            Investment Partnership program for supporting this work.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Selected references">
        <ul className="mt-5 space-y-3 pl-5 text-sm leading-7 text-[var(--muted-foreground)]">
          {references.map((reference) => (
            <li key={reference}>{reference}</li>
          ))}
        </ul>
      </SectionCard>
    </main>
  );
}
