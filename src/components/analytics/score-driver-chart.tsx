"use client";

import { PlotlyChart } from "@/components/analytics/plotly-chart";
import { useTheme } from "@/components/theme/theme-provider";

type ScoreDriverChartCardProps = {
  title: string;
  rows: Array<{
    componentId: string;
    label: string;
    municipalityValue: number | null;
    nationalValue: number | null;
    delta: number | null;
  }>;
};

function mean(values: Array<number | null>) {
  const filtered = values.filter((value): value is number => Number.isFinite(value));
  if (filtered.length === 0) {
    return null;
  }

  const total = filtered.reduce((sum, value) => sum + value, 0);
  return total / filtered.length;
}

export function ScoreDriverChartCard({
  title,
  rows,
}: ScoreDriverChartCardProps) {
  const { isDark } = useTheme();
  const validComponentCount = Math.max(
    rows.filter(
      (row) =>
        Number.isFinite(row.municipalityValue) && Number.isFinite(row.nationalValue),
    ).length,
    1,
  );

  const municipalityScore = mean(rows.map((row) => row.municipalityValue));
  const nationalScore = mean(rows.map((row) => row.nationalValue));

  const contributions = rows
    .map((row) => {
      const delta =
        Number.isFinite(row.municipalityValue) && Number.isFinite(row.nationalValue)
          ? (row.municipalityValue as number) - (row.nationalValue as number)
          : null;

      return {
        ...row,
        contribution:
          delta === null ? null : Number((delta / validComponentCount).toFixed(2)),
      };
    })
    .sort(
      (left, right) =>
        Math.abs(left.contribution ?? 0) - Math.abs(right.contribution ?? 0),
    );

  const chartRows = contributions.filter(
    (row): row is typeof row & { contribution: number } => row.contribution !== null,
  );

  const totalDiff =
    municipalityScore !== null && nationalScore !== null
      ? municipalityScore - nationalScore
      : chartRows.reduce((sum, row) => sum + row.contribution, 0);

  const maxAbs = Math.max(
    ...chartRows.map((row) => Math.abs(row.contribution)),
    Math.abs(totalDiff),
    1,
  );
  const axisExtent = maxAbs * 1.4;
  const scoreLabel = title.replace(/ Score$/, "");
  const diffColor = totalDiff >= 0 ? "#54a24b" : "#e45756";
  const diffSign = totalDiff >= 0 ? "+" : "";
  const textColor = isDark ? "#edf4f6" : "#18252c";
  const mutedColor = isDark ? "#96abb2" : "#5b6b74";
  const gridColor = isDark ? "rgba(205,225,233,0.1)" : "rgba(24,37,44,0.08)";
  const zeroLineColor = isDark ? "rgba(205,225,233,0.48)" : "rgba(91,107,116,0.8)";

  return (
    <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
        Waterfall chart
      </p>
      <div className="mt-3">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
          Component impacts are shown as weighted score-point differences relative to the national average.
        </p>
      </div>
      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80">
        <PlotlyChart
          data={[
            {
              type: "bar",
              orientation: "h",
              y: chartRows.map((row) => row.label.replace(/ Score$/, "")),
              x: chartRows.map((row) => row.contribution),
              marker: {
                color: chartRows.map((row) =>
                  row.contribution >= 0 ? "#54a24b" : "#e45756",
                ),
              },
              text: chartRows.map((row) => `${row.contribution >= 0 ? "+" : ""}${row.contribution.toFixed(2)}`),
              textposition: "outside",
              customdata: chartRows.map((row) => [
                row.label,
                row.municipalityValue,
                row.nationalValue,
                row.contribution,
              ]),
              hovertemplate:
                "<b>%{customdata[0]}</b><br>" +
                "Municipality: %{customdata[1]:.1f}<br>" +
                "National: %{customdata[2]:.1f}<br>" +
                "Impact: %{customdata[3]:+.2f} points<extra></extra>",
            },
          ]}
          layout={{
            autosize: true,
            height: Math.max(380, 120 + chartRows.length * 58),
            margin: { l: 24, r: 44, t: 110, b: 68 },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(255,255,255,0)",
            showlegend: false,
            title: {
              text:
                `<b>${scoreLabel} Score: ${municipalityScore?.toFixed(1) ?? "n/a"}</b><br>` +
                `<span style="font-size:14px">Country average: ${nationalScore?.toFixed(1) ?? "n/a"} | ` +
                `Difference: <span style="color:${diffColor}">${diffSign}${totalDiff.toFixed(1)} points</span></span>`,
              x: 0.5,
              xanchor: "center",
              y: 0.96,
              font: { size: 20, color: textColor },
            },
            xaxis: {
              title: {
                text: "Impact on score (compared to the country average)",
                font: { size: 14, color: textColor },
              },
              tickfont: { size: 12, color: mutedColor },
              range: [-axisExtent, axisExtent],
              zeroline: true,
              zerolinewidth: 2,
              zerolinecolor: zeroLineColor,
              showgrid: true,
              gridwidth: 1,
              gridcolor: gridColor,
            },
            yaxis: {
              title: { text: "" },
              tickfont: { size: 14, color: textColor },
              automargin: true,
            },
            annotations: [
              {
                x: -axisExtent * 0.5,
                y: 1.02,
                xref: "x",
                yref: "paper",
                text: "← Below average",
                showarrow: false,
                font: { size: 12, color: "#e45756" },
                xanchor: "center",
              },
              {
                x: axisExtent * 0.5,
                y: 1.02,
                xref: "x",
                yref: "paper",
                text: "Above average →",
                showarrow: false,
                font: { size: 12, color: "#54a24b" },
                xanchor: "center",
              },
            ],
          }}
          config={{ responsive: true, displaylogo: false }}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler
        />
      </div>
    </section>
  );
}
