type ScoreStatCardProps = {
  label: string;
  value: string;
  tone?: "cool" | "warm";
};

export function ScoreStatCard({
  label,
  value,
  tone = "cool",
}: ScoreStatCardProps) {
  const toneClass =
    tone === "warm"
      ? "bg-[rgba(224,122,95,0.12)]"
      : "bg-[rgba(17,138,178,0.12)]";

  return (
    <div className={`rounded-2xl border border-[var(--border-soft)] p-4 ${toneClass}`}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-3 font-mono text-2xl font-semibold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}
