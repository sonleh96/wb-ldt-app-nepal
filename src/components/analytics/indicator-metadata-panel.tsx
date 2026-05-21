import type {
  IndicatorDefinition,
  ScoreComponentDefinition,
  ScoreDefinition,
} from "@/types/analytics";

type IndicatorMetadataPanelProps = {
  indicator: IndicatorDefinition | null;
  scoreDefinition: ScoreDefinition;
  scoreComponents: ScoreComponentDefinition[];
};

export function IndicatorMetadataPanel({
  indicator,
  scoreDefinition,
  scoreComponents,
}: IndicatorMetadataPanelProps) {
  if (!indicator) {
    return (
      <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
          Metric metadata
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          {scoreDefinition.label}
        </h2>
        <div className="mt-6 space-y-3 text-sm leading-7 text-[var(--muted-foreground)]">
          <p>
            This score is read directly from the canonical score CSV and not
            recomputed in the application.
          </p>
          <div className="rounded-2xl border border-[var(--border-soft)] bg-white/70 p-4">
            <p className="font-medium text-[var(--foreground)]">Components</p>
            <ul className="mt-3 space-y-2">
              {scoreComponents.map((component) => (
                <li
                  key={component.id}
                  className="flex items-start justify-between gap-3"
                >
                  <span>{component.label}</span>
                  <span className="group relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] bg-white text-[11px] font-medium text-[var(--muted-foreground)]">
                    i
                    <span className="pointer-events-none absolute right-0 top-6 z-10 hidden w-64 rounded-2xl border border-[var(--border-soft)] bg-[var(--foreground)] px-3 py-2 text-left text-xs font-normal leading-5 text-white shadow-[0_18px_50px_rgba(39,62,71,0.28)] group-hover:block">
                      {component.description ?? "No description available."}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
        Indicator metadata
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        {indicator.label}
      </h2>
      <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
        {indicator.description ?? "No description available."}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-[rgba(17,138,178,0.12)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
          {indicator.pillar ?? "unassigned"}
        </span>
        <span className="rounded-full bg-[rgba(224,122,95,0.12)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
          {indicator.higherIsBetter ? "Higher is better" : "Lower is better"}
        </span>
      </div>
      <div className="mt-6 space-y-3">
        {indicator.sources.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border border-[var(--border-soft)] bg-white/70 p-4 text-sm text-[var(--foreground)] hover:bg-white"
          >
            {source.label}
          </a>
        ))}
      </div>
    </section>
  );
}
