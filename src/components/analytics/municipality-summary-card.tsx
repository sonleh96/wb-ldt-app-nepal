import { ScoreStatCard } from "@/components/analytics/score-stat-card";
import type { MunicipalityRecord } from "@/types/analytics";

type MunicipalitySummaryCardProps = {
  municipality: MunicipalityRecord;
  nationalScoreAverages: Record<string, number | null>;
  compact?: boolean;
};

function formatValue(value: number | null) {
  return value === null ? "n/a" : value.toFixed(1);
}

export function MunicipalitySummaryCard({
  municipality,
  nationalScoreAverages,
  compact = false,
}: MunicipalitySummaryCardProps) {
  return (
    <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
        Municipality summary
      </p>
      <h2
        className={`mt-4 font-semibold tracking-tight text-[var(--foreground)] ${
          compact ? "text-2xl" : "text-3xl"
        }`}
      >
        {municipality.municipality}
      </h2>
      <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
        {municipality.district}, {municipality.province}
      </p>

      <div className={`mt-6 grid gap-4 ${compact ? "grid-cols-1" : "sm:grid-cols-3"}`}>
        <ScoreStatCard
          label={`Prosperity (${formatValue(nationalScoreAverages.prosperity_score)} nat.)`}
          value={formatValue(municipality.scores.prosperity_score ?? null)}
        />
        <ScoreStatCard
          label={`Infrastructure (${formatValue(nationalScoreAverages.infrastructure_score)} nat.)`}
          value={formatValue(municipality.scores.infrastructure_score ?? null)}
          tone="warm"
        />
        <ScoreStatCard
          label={`Livability (${formatValue(nationalScoreAverages.livability_score)} nat.)`}
          value={formatValue(municipality.scores.livability_score ?? null)}
        />
      </div>

      <div className={`mt-6 grid gap-4 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
        <div className="rounded-2xl border border-[var(--border-soft)] bg-white/70 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Population
          </p>
          <p className="mt-2 font-mono text-lg text-[var(--foreground)]">
            {municipality.context.population?.toLocaleString() ?? "n/a"}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border-soft)] bg-white/70 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Total land area
          </p>
          <p className="mt-2 font-mono text-lg text-[var(--foreground)]">
            {municipality.context.totalLandAreaKm2?.toFixed(2) ?? "n/a"} km2
          </p>
        </div>
      </div>
    </section>
  );
}
