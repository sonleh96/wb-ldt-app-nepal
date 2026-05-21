import Link from "next/link";

const resources = [
  {
    title: "Methodology and scoring notes",
    body:
      "A full explanation of the current indicator framework, data processing path, scoring logic, and release limitations for the Nepal app.",
    href: "/methodology",
    cta: "Open methodology",
  },
  {
    title: "Analytics application",
    body:
      "The public-facing municipality analysis surface with map-based inspection, scatterplots, score drivers, and indicator metadata.",
    href: "/analytics",
    cta: "Launch the app",
  },
  {
    title: "Release notes",
    body:
      "A running log of what has already been implemented in the Nepal rebuild and how the product shell has evolved toward the reference.",
    href: "/release-notes",
    cta: "Review release notes",
  },
];

const additionalResources = [
  "The current Nepal release is built from the municipality admin CSV, the score CSV, the municipality boundary GeoJSON, and the indicator metadata workbook.",
  "Indicator source links are surfaced directly in the app through the metadata panel rather than hidden in separate documentation.",
  "The current product scope is analytics-first; the reference AI decision-engine workflow is still intentionally out of scope.",
];

export default function ResourcesPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pb-16 pt-10 sm:px-8 lg:px-12">
      <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-8 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
          Resources
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
          Documentation and implementation references
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-8 text-[var(--muted-foreground)]">
          This page follows the structure of the reference resources section
          but is rewritten for the Nepal release. It points users to the pages
          and materials that explain how the current product works.
        </p>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <div className="space-y-6">
          {resources.map((resource) => (
            <article
              key={resource.title}
              className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] p-6"
            >
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                {resource.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                {resource.body}
              </p>
              <div className="mt-5">
                <Link
                  href={resource.href}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
                >
                  {resource.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Additional resources
        </h2>
        <ul className="mt-5 space-y-3 pl-5 text-sm leading-7 text-[var(--muted-foreground)]">
          {additionalResources.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Contact and inquiries
        </h2>
        <div className="mt-5 space-y-3 text-sm leading-8 text-[var(--muted-foreground)]">
          <p>
            For questions about the current public analytics release or requests
            for supporting documentation, use the methodology and release notes
            pages first, then contact the project maintainer if needed.
          </p>
          <p>
            Contact: <a href="mailto:sonle.h96@gmail.com" className="underline">sonle.h96@gmail.com</a>
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-8 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Explore the Nepal LDT analytics
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--muted-foreground)]">
          Launch the current municipality analytics experience to inspect the
          map, compare municipalities, and review score drivers and source
          metadata.
        </p>
        <div className="mt-6">
          <Link
            href="/analytics"
            className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-[var(--background)] transition-transform hover:-translate-y-0.5"
          >
            Launch the App
          </Link>
        </div>
      </section>
    </main>
  );
}
