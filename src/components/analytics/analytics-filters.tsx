type AnalyticsFiltersProps = {
  years: number[];
  provinces: string[];
  municipalities: Array<{
    id: string;
    label: string;
  }>;
  selected: {
    year: number;
    province: string;
    municipalityId: string;
    metricId: string;
    xMetricId: string;
    yMetricId: string;
    aiScoreId: string;
  };
  selectedTab: string;
  mode?: "top" | "sidebar";
};

function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  defaultValue: string;
}) {
  return (
    <label className="flex min-w-0 w-full flex-col gap-2">
      <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full min-w-0 rounded-2xl border border-[var(--border-soft)] bg-white/80 px-4 py-3 text-sm text-[var(--foreground)] outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AnalyticsFilters({
  years,
  provinces,
  municipalities,
  selected,
  selectedTab,
  mode = "top",
}: AnalyticsFiltersProps) {
  const isSidebar = mode === "sidebar";

  return (
    <section className={`rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 shadow-[0_18px_50px_rgba(39,62,71,0.08)] ${isSidebar ? "" : "mt-8"}`}>
      <form className={`grid gap-4 ${isSidebar ? "" : "xl:grid-cols-6"}`}>
        <input type="hidden" name="tab" value={selectedTab} />
        <input type="hidden" name="metric" value={selected.metricId} />
        <input type="hidden" name="x" value={selected.xMetricId} />
        <input type="hidden" name="y" value={selected.yMetricId} />
        <input type="hidden" name="ai_score" value={selected.aiScoreId} />
        <SelectField
          label="Year"
          name="year"
          defaultValue={String(selected.year)}
          options={years.map((year) => ({
            value: String(year),
            label: String(year),
          }))}
        />
        <SelectField
          label="Province"
          name="province"
          defaultValue={selected.province}
          options={provinces.map((province) => ({
            value: province,
            label: province === "all" ? "All provinces" : province,
          }))}
        />
        <SelectField
          label="Highlighted municipality"
          name="municipality"
          defaultValue={selected.municipalityId}
          options={municipalities.map((municipality) => ({
            value: municipality.id,
            label: municipality.label,
          }))}
        />
        <button
          type="submit"
          className={`inline-flex h-[46px] items-center justify-center rounded-full px-5 text-sm font-medium ${
            isSidebar
              ? "w-full bg-[var(--accent)] text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)]"
              : "bg-[var(--foreground)] text-[var(--background)]"
          }`}
        >
          Apply
        </button>
      </form>
    </section>
  );
}
