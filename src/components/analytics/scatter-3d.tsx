"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PlotlyChart } from "@/components/analytics/plotly-chart";

type Scatter3DCardProps = {
  selectedProvince: string;
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

export function Scatter3DCard({ selectedProvince, points }: Scatter3DCardProps) {
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

  return (
    <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_50px_rgba(39,62,71,0.08)]">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
        3D scatterplot
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Prosperity, Infrastructure, and Livability
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
        Rotate, pan, and zoom the point cloud. The selected municipality is red and the rest of its province is orange.
      </p>
      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80">
        <PlotlyChart
          data={[
            {
              type: "scatter3d",
              mode: "markers",
              name: "Other municipalities",
              x: others.map((point) => point.x),
              y: others.map((point) => point.y),
              z: others.map((point) => point.z),
              text: others.map((point) => point.label),
              customdata: others.map((point) => [point.id, point.label, point.district, point.province]),
              marker: {
                color: "rgba(24,37,44,0.58)",
                size: 5,
              },
              hovertemplate:
                "<b>%{text}</b><br>District: %{customdata[2]}<br>Province: %{customdata[3]}<br>" +
                "Prosperity: %{x:.2f}<br>Infrastructure: %{y:.2f}<br>Livability: %{z:.2f}<extra></extra>",
            },
            {
              type: "scatter3d",
              mode: "markers",
              name: "Same province",
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
                "<b>%{text}</b><br>District: %{customdata[2]}<br>Province: %{customdata[3]}<br>" +
                "Prosperity: %{x:.2f}<br>Infrastructure: %{y:.2f}<br>Livability: %{z:.2f}<extra></extra>",
            },
            {
              type: "scatter3d",
              mode: "markers",
              name: "Highlighted municipality",
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
                "<b>%{text}</b><br>District: %{customdata[2]}<br>Province: %{customdata[3]}<br>" +
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
            },
            scene: {
              xaxis: {
                title: { text: "Prosperity" },
                range: [0, 100],
                backgroundcolor: "rgba(245,241,232,0.82)",
                gridcolor: "rgba(24,37,44,0.12)",
                zerolinecolor: "rgba(24,37,44,0.2)",
              },
              yaxis: {
                title: { text: "Infrastructure" },
                range: [0, 100],
                backgroundcolor: "rgba(245,241,232,0.82)",
                gridcolor: "rgba(24,37,44,0.12)",
                zerolinecolor: "rgba(24,37,44,0.2)",
              },
              zaxis: {
                title: { text: "Livability" },
                range: [0, 100],
                backgroundcolor: "rgba(245,241,232,0.82)",
                gridcolor: "rgba(24,37,44,0.12)",
                zerolinecolor: "rgba(24,37,44,0.2)",
              },
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
