import type { ScoreWaterfallGroup } from "@/types/analytics";

type ScoreWaterfallSectionProps = {
  groups: ScoreWaterfallGroup[];
  municipalityName: string;
  provinceName: string;
};

function formatValue(value: number | null, fractionDigits = 1) {
  return value === null ? "n/a" : value.toFixed(fractionDigits);
}

function TooltipIcon({ text }: { text: string | null }) {
  return (
    <span className="group relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] text-[11px] font-medium text-[var(--muted-foreground)]">
      i
      <span className="pointer-events-none absolute left-6 top-1/2 z-10 hidden w-64 -translate-y-1/2 rounded-2xl border border-[var(--border-soft)] bg-[var(--tooltip-bg)] px-3 py-2 text-left text-xs font-normal leading-5 text-[var(--tooltip-foreground)] shadow-[0_18px_50px_rgba(39,62,71,0.28)] group-hover:block">
        {text ?? "No description available."}
      </span>
    </span>
  );
}

function WaterfallCard({
  group,
  municipalityName,
  provinceName,
}: {
  group: ScoreWaterfallGroup;
  municipalityName: string;
  provinceName: string;
}) {
  const visibleRows = group.rows.filter(
    (row): row is typeof row & { contribution: number } => row.contribution !== null,
  );

  const axisExtent =
    Math.max(
      ...visibleRows.map((row) => Math.abs(row.contribution)),
      Math.abs(group.totalDifference ?? 0),
      1,
    ) * 1.2;

  return (
    <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
        Waterfall chart
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        {group.scoreLabel}
      </h2>
      <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
        Selected municipality: {municipalityName}, {provinceName}
      </p>
      <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
        Component impacts are shown as weighted score-point differences relative to the national average.
      </p>

      <div className="mt-6 rounded-[1.5rem] border border-[var(--border-soft)] bg-white/75 p-5">
        <div className="text-center">
          <p className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
            {group.scoreLabel}: {formatValue(group.municipalityScore)}
          </p>
          <p className="mt-2 text-base text-[var(--muted-foreground)]">
            Country average: {formatValue(group.nationalScore)} | Difference:{" "}
            <span
              className={
                group.totalDifference !== null && group.totalDifference >= 0
                  ? "text-[#54a24b]"
                  : "text-[#e45756]"
              }
            >
              {group.totalDifference !== null && group.totalDifference >= 0 ? "+" : ""}
              {formatValue(group.totalDifference)}
              {" "}
              points
            </span>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-8 text-sm">
          <span className="text-[#e45756]">← Below average</span>
          <span className="text-[#54a24b]">Above average →</span>
        </div>

        <div className="mt-6 space-y-4">
          {visibleRows.map((row) => {
            const width = Math.max((Math.abs(row.contribution) / axisExtent) * 50, 1.5);
            const left = row.contribution >= 0 ? 50 : 50 - width;

            return (
              <div
                key={row.componentId}
                className="grid gap-4 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)_120px] md:items-center"
              >
                <div className="flex items-center justify-end gap-2 text-right">
                  <span className="text-base text-[var(--foreground)]">
                    {row.label.replace(/ Score$/, "")}
                  </span>
                  <TooltipIcon text={row.description} />
                </div>

                <div className="relative h-12 overflow-hidden rounded-full bg-[rgba(24,37,44,0.05)]">
                  <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[rgba(24,37,44,0.35)]" />
                  <div
                    className="absolute top-1/2 h-8 -translate-y-1/2 rounded-full"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: row.contribution >= 0 ? "#54a24b" : "#e45756",
                    }}
                  />
                </div>

                <div className="text-right">
                  <p className="font-mono text-base text-[var(--foreground)]">
                    {row.contribution >= 0 ? "+" : ""}
                    {row.contribution.toFixed(2)}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {formatValue(row.municipalityValue)} vs {formatValue(row.nationalValue)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            Impact on score (compared to the country average)
          </p>
        </div>
      </div>
    </section>
  );
}

export function ScoreWaterfallSection({
  groups,
  municipalityName,
  provinceName,
}: ScoreWaterfallSectionProps) {
  return (
    <section className="space-y-6">
      {groups.map((group) => (
        <WaterfallCard
          key={group.scoreId}
          group={group}
          municipalityName={municipalityName}
          provinceName={provinceName}
        />
      ))}
    </section>
  );
}
