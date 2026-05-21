"use client";

import { PlotlyChart } from "@/components/analytics/plotly-chart";
import { useTheme } from "@/components/theme/theme-provider";
import type { AiIndicatorSeries } from "@/lib/ai/types";

type AiIndicatorChartProps = {
  series: AiIndicatorSeries;
  municipalityLabel: string;
  provinceLabel: string;
};

export function AiIndicatorChart({
  series,
  municipalityLabel,
  provinceLabel,
}: AiIndicatorChartProps) {
  const { isDark } = useTheme();
  const textColor = isDark ? "#edf4f6" : "#18252c";
  const gridColor = isDark ? "rgba(205,225,233,0.1)" : "rgba(24,37,44,0.08)";
  const chartSurface = isDark ? "rgba(22,32,38,0.96)" : "#ffffff";
  const mutedSeries = isDark ? "rgba(205,225,233,0.58)" : "rgba(24,37,44,0.7)";

  return (
    <section className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          {series.label}
        </h3>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          {series.description ?? "No description available."}
        </p>
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
