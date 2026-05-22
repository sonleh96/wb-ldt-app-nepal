"use client";

import { PlotlyChart } from "@/components/analytics/plotly-chart";
import { useTheme } from "@/components/theme/theme-provider";
import type { RegionalIndicatorRow } from "@/components/analytics/ai-result-renderers";
import type { AiIndicatorSeries } from "@/lib/ai/types";

type AiIndicatorChartProps = {
  series: AiIndicatorSeries;
  municipalityLabel: string;
  provinceLabel: string;
  diagnostic?: RegionalIndicatorRow;
};

function formatScoreValue(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "n/a";
  }

  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function AiIndicatorChart({
  series,
  municipalityLabel,
  provinceLabel,
  diagnostic,
}: AiIndicatorChartProps) {
  const { isDark } = useTheme();
  const textColor = isDark ? "#edf4f6" : "#18252c";
  const gridColor = isDark ? "rgba(205,225,233,0.1)" : "rgba(24,37,44,0.08)";
  const chartSurface = isDark ? "rgba(22,32,38,0.96)" : "#ffffff";
  const mutedSeries = isDark ? "rgba(205,225,233,0.58)" : "rgba(24,37,44,0.7)";
  const signal = diagnostic?.direction;

  return (
    <section className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            {series.label}
          </h3>
          {signal ? (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                signal === "Strength"
                  ? "bg-[rgba(84,162,75,0.12)] text-[#2f7a2a]"
                  : signal === "Watchpoint"
                    ? "bg-[rgba(251,191,36,0.16)] text-[#8a6416]"
                    : "bg-[rgba(24,37,44,0.06)] text-[var(--muted-foreground)]"
              }`}
            >
              {signal}
            </span>
          ) : null}
        </div>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          {series.description ?? "No description available."}
        </p>
        {diagnostic ? (
          <div className="rounded-[1rem] border border-[var(--border-soft)] bg-[rgba(17,138,178,0.06)] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              {diagnostic.year ? `Latest ${diagnostic.year} values` : "Latest year values"}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--foreground)]">
              {formatScoreValue(diagnostic.municipalityValue)} municipality
              {" | "}
              {formatScoreValue(diagnostic.provinceAverage)} province avg
              {" | "}
              {formatScoreValue(diagnostic.nationalAverage)} national avg
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {diagnostic.interpretation}
            </p>
          </div>
        ) : null}
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Component score plotted on a 0-100 scale
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-[var(--border-soft)]">
        <PlotlyChart
          data={[
            {
              type: "scatter",
              mode: "lines+markers",
              name: municipalityLabel,
              x: series.points.map((point) => point.year),
              y: series.points.map((point) => point.municipalityValue),
              marker: { color: "#118ab2", size: 8 },
              line: { color: "#118ab2", width: 3 },
            },
            {
              type: "scatter",
              mode: "lines+markers",
              name: `${provinceLabel} average`,
              x: series.points.map((point) => point.year),
              y: series.points.map((point) => point.provinceAverage),
              marker: { color: "#f4a261", size: 7 },
              line: { color: "#f4a261", width: 2, dash: "dot" },
            },
            {
              type: "scatter",
              mode: "lines+markers",
              name: "National average",
              x: series.points.map((point) => point.year),
              y: series.points.map((point) => point.nationalAverage),
              marker: { color: mutedSeries, size: 7 },
              line: { color: mutedSeries, width: 2, dash: "dash" },
            },
          ]}
          layout={{
            autosize: true,
            height: 360,
            margin: { l: 58, r: 20, t: 28, b: 48 },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: chartSurface,
            hovermode: "x unified",
            legend: {
              orientation: "h",
              yanchor: "bottom",
              y: 1.02,
              xanchor: "left",
              x: 0,
              font: { color: textColor },
            },
            xaxis: {
              title: { text: "Year", font: { color: textColor } },
              type: "category",
              showgrid: true,
              gridcolor: gridColor,
              tickfont: { color: textColor },
            },
            yaxis: {
              title: { text: "Score", font: { color: textColor } },
              showgrid: true,
              gridcolor: gridColor,
              zeroline: false,
              range: [0, 100],
              tick0: 0,
              dtick: 20,
              tickfont: { color: textColor },
            },
          }}
          config={{ responsive: true, displaylogo: false }}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler
        />
      </div>
    </section>
  );
}
