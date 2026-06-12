const methodSteps = [
  {
    title: "Step 1 - Build a unified facility baseline",
    body:
      "Geocoding begins with OpenStreetMap as the open-source foundation, supplemented by official or partner data where it exists. Reconciling fragmented public, private, and partner sources into a single planning-grade map is itself a contribution, and it is reproducible. With an experienced data scientist and local counterpart, this first baseline can often be completed in roughly two to three days.",
  },
  {
    title: "Step 2 - Model realistic travel to produce a coverage baseline",
    body:
      "Access is computed through both driving and walking lenses. This distinction matters because a facility that looks close on a road map may still be several hours away on foot. Walking-based analysis exposes the rural access gap and allows measures such as population within 10 km driving distance or within 60 minutes walking distance to be calculated nationally and then disaggregated to subnational tiers.",
  },
  {
    title: "Step 3 - Disaggregate to subnational governments",
    body:
      "National averages mask subnational inequity. The framework produces access metrics for every level of government where boundary data exist. Drawing on the SNG-WOFI database, the analysis can identify the locality with the lowest measured access and give subnational governments a concrete, comparable metric.",
  },
  {
    title: "Step 4 - Optimize placement of new facilities",
    body:
      "The model evaluates candidate sites and identifies locations that would reach the largest number of currently underserved people. It quantifies the incremental impact of each additional site, producing a diminishing-returns curve that helps planners and finance counterparts sequence investment decisions.",
  },
] as const;

const demonstrationCases = [
  {
    country: "Nepal",
    population: "~30",
    area: "143,350",
    levels: "2 - national and region",
    baseline: "99.8",
    lowestAccess: "Darchula (82%)",
    gap: "Limited access for residents near Himalayan terrain",
  },
  {
    country: "Malawi",
    population: "~21",
    area: "118,480",
    levels: "2 - national and region",
    baseline: "66.8",
    lowestAccess: "Likoma (5.2%)",
    gap: "Concentrated rural pockets",
  },
  {
    country: "Serbia",
    population: "~10",
    area: "88,360",
    levels: "3 - national and districts/LGU",
    baseline: "99.9",
    lowestAccess: "Zlatiborski (99.6%)",
    gap: "Subnational pockets despite high national density",
  },
  {
    country: "Uzbekistan",
    population: "~37",
    area: "440,650",
    levels: "2 - national and region",
    baseline: "97",
    lowestAccess: "Karaulibazar (4%)",
    gap: "Little to no coverage in remote areas",
  },
  {
    country: "Zambia",
    population: "~22",
    area: "752,610",
    levels: "2 - national and province",
    baseline: "80.9",
    lowestAccess: "Sinazongwe (3.2%)",
    gap: "Significant gaps in remote districts",
  },
] as const;

const replicationRequirements = [
  "1-2 days to assemble and clean the facility registry from open data plus any official lists.",
  "1 day to run the baseline access model and produce national and subnational outputs.",
  "1 day to run the optimization and produce the diminishing-returns curve.",
] as const;

const limitations = [
  {
    title: "Incomplete registries",
    body:
      "Countries rarely maintain unified, publicly accessible facility lists. The baseline always involves reconciling multiple sources, and the resulting map reflects data quality as much as ground truth. Private providers are frequently undercounted.",
  },
  {
    title: "Physical access is necessary but not sufficient",
    body:
      "The analysis measures whether a person can reach a facility within a given time or distance. It does not measure whether medicines, staffing, diagnostics, or service readiness are adequate once they arrive.",
  },
  {
    title: "Travel assumptions are modeled, not observed",
    body:
      "Walking speeds, road quality, and vehicle availability are estimated from global datasets and adjusted where local data allow. Validation against household survey travel-time data can improve confidence.",
  },
  {
    title: "Primary health care may be decentralized",
    body:
      "Where local governments operate and maintain facilities, the question is whether residents use facilities inside their jurisdiction or can practically access better-located services outside it.",
  },
] as const;

const countryStudies = [
  {
    country: "Nepal",
    url: "https://datanalytics.worldbank.org/content/1cc36c57-f12d-4aa8-92a2-196bb0ea605f/?country=nepal",
  },
  {
    country: "Malawi",
    url: "https://datanalytics.worldbank.org/content/1cc36c57-f12d-4aa8-92a2-196bb0ea605f/?country=malawi",
  },
  {
    country: "Serbia",
    url: "https://datanalytics.worldbank.org/content/1cc36c57-f12d-4aa8-92a2-196bb0ea605f/?country=serbia",
  },
  {
    country: "Uzbekistan",
    url: "https://datanalytics.worldbank.org/content/1cc36c57-f12d-4aa8-92a2-196bb0ea605f/?country=uzbekistan",
  },
  {
    country: "Zambia",
    url: "https://datanalytics.worldbank.org/content/1cc36c57-f12d-4aa8-92a2-196bb0ea605f/?country=zambia",
  },
] as const;

const lessons = [
  "Averages mislead; equity-minded planning needs spatial coverage as its unit of analysis.",
  "Initial access estimates force policy makers to ask whether clinic, hospital, and road registries are complete.",
  "Modeling how people actually travel, often on foot, produces a more honest baseline and better targeting.",
  "Optimizing early dollars matters: the first few well-placed sites usually yield the largest gains.",
  "Embedding the workflow in routine planning cycles is essential so governments can rerun scenarios as budgets and demographics evolve.",
  "Done well, the workflow cuts site-selection time from months to days while drawing on current geospatial evidence.",
] as const;

const references = [
  "Kaiser, Kai-Alexander, Kim, Hyunseok, Mroczka, Fabienne, & Singh, Kaushiki. (2026). Public Finance Review Fundamentals: Enhancing Public Investment Development Outcomes. Washington, DC: Global Governance Practice, forthcoming.",
  "World Bank. (2021). Timor-Leste Public Expenditure Review Changing Course: Towards Better and More Sustainable Spending.",
  "World Bank. (2025a). pim-pam.net Digital Decision Support Resources: Workplan 2026. Washington, DC: Prosperity Vertical Governance Department.",
  "World Bank. (2025b). pim-pam.net Geospatial Planning and Budgeting Platform Country Data Cube Data Catalogue.",
] as const;

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pb-16 pt-10 sm:px-8 lg:px-12">
      <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-8 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
          About
        </p>
        <h1 className="mt-4 max-w-5xl text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
          pim-pam.net Geospatial Planning and Budgeting Public Infrastructure Access QuickStart
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-8 text-[var(--muted-foreground)] sm:text-lg">
          This page summarizes the motivation, method, and early country
          applications of the pim-pam.net Geospatial Planning and Budgeting
          Public Infrastructure Access tool. The tool measures and improves
          spatial access to public services at subnational levels, with primary
          health care as the initial application.
        </p>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--muted-foreground)]">
          This version follows the May 22, 2026 QuickStart note prepared as a
          complement to the World Bank Group Public Finance Review Fundamental
          guidance note for Public Investment Management.
        </p>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          The problem averages hide
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            When distance is the binding constraint, geography - not budgets or
            bed counts alone - determines whether people can realistically reach
            care. Traditional indicators like facility totals or spending levels
            may look reassuring in aggregate, but they do not reveal whether
            communities can get services within a reasonable travel time.
          </p>
          <p>
            A spatial lens makes access measurable and actionable. The GPB PIA
            tool operationalizes cost-effectiveness analysis by identifying the
            public infrastructure investments with the greatest marginal impact
            on access. If a new facility costs USD 1 million and reaches 10,000
            new beneficiaries, its impact is USD 100 per beneficiary; a poorly
            placed facility may have little or no access impact.
          </p>
          <p>
            The result is a practical bridge between strategic planning,
            program-based budgeting, and location-based evidence. It turns
            access gaps into quantifiable indicators that can be used in annual
            and medium-term budgeting conversations.
          </p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          The method: four steps, any country
        </h2>
        <p className="mt-5 max-w-4xl text-sm leading-8 text-[var(--muted-foreground)]">
          The workflow is designed to be identical regardless of geography or
          income level. Country, population grid, road network, and facility
          list are inputs, not hard-coded assumptions.
        </p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {methodSteps.map((step) => (
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
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          GPB PIA demonstration cases
        </h2>
        <p className="mt-5 max-w-4xl text-sm leading-8 text-[var(--muted-foreground)]">
          The table below shows the kind of country comparison the tool
          produces. It makes visible where national access looks strong but
          subnational pockets remain underserved.
        </p>
        <div className="mt-6 overflow-x-auto rounded-[1.25rem] border border-[var(--border-soft)]">
          <table className="min-w-[58rem] border-collapse bg-[var(--surface)] text-left text-sm">
            <thead className="bg-[var(--accent-soft)]/70 text-[var(--foreground)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Country</th>
                <th className="px-4 py-3 font-semibold">Population (million)</th>
                <th className="px-4 py-3 font-semibold">Area (km2)</th>
                <th className="px-4 py-3 font-semibold">Levels covered</th>
                <th className="px-4 py-3 font-semibold">Baseline access, 10 km drive (%)</th>
                <th className="px-4 py-3 font-semibold">Lowest-access locality</th>
                <th className="px-4 py-3 font-semibold">Walking coverage gap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)] text-[var(--muted-foreground)]">
              {demonstrationCases.map((row) => (
                <tr key={row.country}>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {row.country}
                  </td>
                  <td className="px-4 py-3">{row.population}</td>
                  <td className="px-4 py-3">{row.area}</td>
                  <td className="px-4 py-3">{row.levels}</td>
                  <td className="px-4 py-3">{row.baseline}</td>
                  <td className="px-4 py-3">{row.lowestAccess}</td>
                  <td className="px-4 py-3">{row.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Replicability: adding the next country
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            The method and online tools are designed for replication,
            scalability, and sustainability. OpenStreetMap coverage is now
            sufficient for meaningful analysis in virtually every low- and
            middle-income country, while stronger official data systems can
            make a country application move faster.
          </p>
          <ul className="space-y-2 pl-5">
            {replicationRequirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            That puts a complete first-pass country analysis within roughly a
            week of starting. The framework, not the analyst&apos;s familiarity
            with a particular place, carries the replication.
          </p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Key limitations and what the numbers do not capture
        </h2>
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
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          What the country studies show
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            Malawi illustrates the walking-versus-driving gap most starkly.
            Predominantly rural settlement patterns and limited transport
            options mean that national averages obscure concentrated pockets of
            unmet need. A small number of well-placed facilities or outreach
            points can deliver outsized first-round gains.
          </p>
          <p>
            Serbia shows that strong national indicators and high facility
            density do not automatically translate into equitable or resilient
            access. Subnational analysis reveals persistent pockets of
            underservice when realistic travel conditions, staffing, supplies,
            and emergency transport constraints are considered.
          </p>
          <p>
            Zambia demonstrates the value of applying the method at large
            geographic scale. With a dispersed population, high-resolution
            analysis avoids coarse averages and gives planners a shared basis
            for deciding where to start, how far to go, and when to shift from
            new builds to complementary investments.
          </p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {countryStudies.map((study) => (
            <a
              key={study.country}
              href={study.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-[1rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {study.country} GPB PIA demonstration
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Cross-cutting lessons
        </h2>
        <ul className="mt-5 space-y-3 pl-5 text-sm leading-8 text-[var(--muted-foreground)]">
          {lessons.map((lesson) => (
            <li key={lesson}>{lesson}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Working with sector teams
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            Realizing the agenda requires more than technical deployment. The
            GPB PIA approach is most effective when integrated into ongoing
            work by health, education, transport, and social protection teams
            that are already grappling with coverage gaps, investment
            decisions, and service delivery constraints.
          </p>
          <p>
            The tool&apos;s value multiplies when used not as a standalone
            product but as a shared analytical foundation for lending
            operations, sector strategies, country partnership frameworks, and
            development plan reviews.
          </p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Further resources and contacts
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            Country teams interested in applying these approaches may schedule
            a 3-4 hour GPB PIA Masterclass or request a tailored briefing on
            related Infrastructure Governance 2.0 diagnostics and other
            pim-pam.net digital tools.
          </p>
          <p>
            Contact the World Bank Global PIM-PAM Solutions Team: Kai-Alexander
            Kaiser, Hyunseok Kim, Fabienne Mroczka, and Kaushiki Singh.
          </p>
          <p>
            The team thanks the global partners of the World Bank Financial
            Management Umbrella Program and the Japan Quality of Infrastructure
            Investment Partnership program for supporting this work.
          </p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Selected references
        </h2>
        <ul className="mt-5 space-y-3 pl-5 text-sm leading-7 text-[var(--muted-foreground)]">
          {references.map((reference) => (
            <li key={reference}>{reference}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
