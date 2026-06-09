"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Plotly3DChart } from "@/components/analytics/plotly-chart";
import { useTheme } from "@/components/theme/theme-provider";
import type { AdminLabels } from "@/lib/countries";

export type Scatter3DCardProps = {
  selectedProvince: string;
  adminLabels: AdminLabels;
  points: Array<{
    id: string;
    label: string;
    district: string;
    province: string;
    x: number | null;
    y: number | null;
    z: number | null;
    selected: boolean;
  }>;
};

function lowerFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

export function Scatter3DCard({
  selectedProvince,
  adminLabels,
  points,
}: Scatter3DCardProps) {
  const { isDark } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const visiblePoints = points.filter(
    (point): point is typeof point & { x: number; y: number; z: number } =>
      point.x !== null && point.y !== null && point.z !== null,
  );

  const highlighted = visiblePoints.filter((point) => point.selected);
  const sameProvince = visiblePoints.filter(
    (point) => !point.selected && point.province === selectedProvince,
  );
  const others = visiblePoints.filter(
    (point) => !point.selected && point.province !== selectedProvince,
  );
  const chartSurface = isDark ? "rgba(22,32,38,0.96)" : "rgba(245,241,232,0.82)";
  const gridColor = isDark ? "rgba(205,225,233,0.12)" : "rgba(24,37,44,0.12)";
  const axisColor = isDark ? "rgba(205,225,233,0.2)" : "rgba(24,37,44,0.2)";
  const textColor = isDark ? "#edf4f6" : "#18252c";
  const mutedSeries = isDark ? "rgba(205,225,233,0.54)" : "rgba(24,37,44,0.58)";
  const lowerSingular = adminLabels.lower.singular;
  const lowerPlural = adminLabels.lower.plural;
  const higherSingular = adminLabels.higher.singular;
  const hoverLocationTemplate = adminLabels.middle
    ? `${adminLabels.middle.singular}: %{customdata[2]}<br>${higherSingular}: %{customdata[3]}<br>`
    : `${higherSingular}: %{customdata[3]}<br>`;

  return (
    <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
        3D scatterplot
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Prosperity, Infrastructure, and Livability
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
        Rotate, pan, and zoom the point cloud. The selected {lowerFirst(lowerSingular)} is red and the rest of its {lowerFirst(higherSingular)} is orange.
      </p>
      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80">
        <Plotly3DChart
          data={[
            {
              type: "scatter3d",
              mode: "markers",
              name: `Other ${lowerFirst(lowerPlural)}`,
              x: others.map((point) => point.x),
              y: others.map((point) => point.y),
              z: others.map((point) => point.z),
              text: others.map((point) => point.label),
              customdata: others.map((point) => [point.id, point.label, point.district, point.province]),
              marker: {
                color: mutedSeries,
                size: 5,
              },
              hovertemplate:
                `<b>%{text}</b><br>${hoverLocationTemplate}` +
                "Prosperity: %{x:.2f}<br>Infrastructure: %{y:.2f}<br>Livability: %{z:.2f}<extra></extra>",
            },
            {
              type: "scatter3d",
              mode: "markers",
              name: `Same ${lowerFirst(higherSingular)}`,
              x: sameProvince.map((point) => point.x),
              y: sameProvince.map((point) => point.y),
              z: sameProvince.map((point) => point.z),
              text: sameProvince.map((point) => point.label),
              customdata: sameProvince.map((point) => [point.id, point.label, point.district, point.province]),
              marker: {
                color: "#f4a261",
                size: 6,
                line: { color: "#9a4d00", width: 0.6 },
              },
              hovertemplate:
                `<b>%{text}</b><br>${hoverLocationTemplate}` +
                "Prosperity: %{x:.2f}<br>Infrastructure: %{y:.2f}<br>Livability: %{z:.2f}<extra></extra>",
            },
            {
              type: "scatter3d",
              mode: "markers",
              name: `Highlighted ${lowerFirst(lowerSingular)}`,
              x: highlighted.map((point) => point.x),
              y: highlighted.map((point) => point.y),
              z: highlighted.map((point) => point.z),
              text: highlighted.map((point) => point.label),
              customdata: highlighted.map((point) => [point.id, point.label, point.district, point.province]),
              marker: {
                color: "#c1121f",
                size: 8,
                line: { color: "#5f0f16", width: 1 },
              },
              hovertemplate:
                `<b>%{text}</b><br>${hoverLocationTemplate}` +
                "Prosperity: %{x:.2f}<br>Infrastructure: %{y:.2f}<br>Livability: %{z:.2f}<extra></extra>",
            },
          ]}
          layout={{
            autosize: true,
            height: 720,
            margin: { l: 0, r: 0, t: 24, b: 0 },
            paper_bgcolor: "rgba(0,0,0,0)",
            legend: {
              orientation: "h",
              yanchor: "bottom",
              y: 1.02,
              xanchor: "left",
              x: 0,
              font: { color: textColor },
            },
            scene: {
              xaxis: {
                title: { text: "Prosperity", font: { color: textColor } },
                range: [0, 100],
                backgroundcolor: chartSurface,
                gridcolor: gridColor,
                zerolinecolor: axisColor,
                tickfont: { color: textColor },
              },
              yaxis: {
                title: { text: "Infrastructure", font: { color: textColor } },
                range: [0, 100],
                backgroundcolor: chartSurface,
                gridcolor: gridColor,
                zerolinecolor: axisColor,
                tickfont: { color: textColor },
              },
              zaxis: {
                title: { text: "Livability", font: { color: textColor } },
                range: [0, 100],
                backgroundcolor: chartSurface,
                gridcolor: gridColor,
                zerolinecolor: axisColor,
                tickfont: { color: textColor },
              },
              bgcolor: "rgba(0,0,0,0)",
              aspectmode: "cube",
              camera: {
                eye: { x: 1.5, y: 1.45, z: 0.95 },
              },
            },
          }}
          config={{ responsive: true, displaylogo: false }}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler
          onClick={(event) => {
            const point = event.points?.[0];
            const municipalityId = point?.customdata?.[0];
            if (typeof municipalityId !== "string" || municipalityId.length === 0) {
              return;
            }
            const nextParams = new URLSearchParams(searchParams.toString());
            nextParams.set("municipality", municipalityId);
            router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
          }}
        />
      </div>
    </section>
  );
}
