"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PlotlyChart } from "@/components/analytics/plotly-chart";

type Scatter2DCardProps = {
  xLabel: string;
  yLabel: string;
  selectedProvince: string;
  controls?: ReactNode;
  points: Array<{
    id: string;
    label: string;
    district: string;
    province: string;
    x: number | null;
    y: number | null;
    selected: boolean;
  }>;
};

export function Scatter2DCard({
  xLabel,
  yLabel,
  selectedProvince,
  controls,
  points,
}: Scatter2DCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const visiblePoints = points.filter(
    (point): point is typeof point & { x: number; y: number } =>
      point.x !== null && point.y !== null,
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
        2D scatterplot
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        {yLabel} vs {xLabel}
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
        Hover for score values, drag to zoom, and click a municipality to make it the active comparison target.
      </p>
      {controls ? <div className="mt-5">{controls}</div> : null}
      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80">
        <PlotlyChart
          data={[
            {
              type: "scatter",
              mode: "markers",
              name: "Other municipalities",
              x: others.map((point) => point.x),
              y: others.map((point) => point.y),
              text: others.map((point) => point.label),
              customdata: others.map((point) => [point.id, point.label, point.district, point.province]),
              marker: {
                color: "rgba(24,37,44,0.62)",
                size: 8,
              },
              hovertemplate:
                "<b>%{text}</b><br>District: %{customdata[2]}<br>Province: %{customdata[3]}<br>" +
                `${xLabel}: %{x:.2f}<br>${yLabel}: %{y:.2f}<extra></extra>`,
            },
            {
              type: "scatter",
              mode: "markers",
              name: "Same province",
              x: sameProvince.map((point) => point.x),
              y: sameProvince.map((point) => point.y),
              text: sameProvince.map((point) => point.label),
              customdata: sameProvince.map((point) => [point.id, point.label, point.district, point.province]),
              marker: {
                color: "#f4a261",
                size: 10,
                line: { color: "#9a4d00", width: 0.6 },
              },
              hovertemplate:
                "<b>%{text}</b><br>District: %{customdata[2]}<br>Province: %{customdata[3]}<br>" +
                `${xLabel}: %{x:.2f}<br>${yLabel}: %{y:.2f}<extra></extra>`,
            },
            {
              type: "scatter",
              mode: "markers",
              name: "Highlighted municipality",
              x: highlighted.map((point) => point.x),
              y: highlighted.map((point) => point.y),
              text: highlighted.map((point) => point.label),
              customdata: highlighted.map((point) => [point.id, point.label, point.district, point.province]),
              marker: {
                color: "#c1121f",
                size: 13,
                line: { color: "#5f0f16", width: 1 },
              },
              hovertemplate:
                "<b>%{text}</b><br>District: %{customdata[2]}<br>Province: %{customdata[3]}<br>" +
                `${xLabel}: %{x:.2f}<br>${yLabel}: %{y:.2f}<extra></extra>`,
            },
          ]}
          layout={{
            autosize: true,
            height: 720,
            margin: { l: 72, r: 28, t: 48, b: 72 },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "#ffffff",
            hovermode: "closest",
            legend: {
              orientation: "h",
              yanchor: "bottom",
              y: 1.02,
              xanchor: "left",
              x: 0,
            },
            xaxis: {
              title: { text: xLabel },
              range: [0, 100],
              showgrid: true,
              gridcolor: "rgba(24,37,44,0.08)",
              zeroline: false,
              linecolor: "rgba(24,37,44,0.34)",
              mirror: true,
            },
            yaxis: {
              title: { text: yLabel },
              range: [0, 100],
              showgrid: true,
              gridcolor: "rgba(24,37,44,0.08)",
              zeroline: false,
              linecolor: "rgba(24,37,44,0.34)",
              mirror: true,
            },
            shapes: [
              {
                type: "rect",
                x0: 50,
                x1: 100,
                y0: 50,
                y1: 100,
                fillcolor: "rgba(132, 199, 129, 0.18)",
                line: { width: 0 },
                layer: "below",
              },
              {
                type: "rect",
                x0: 0,
                x1: 50,
                y0: 50,
                y1: 100,
                fillcolor: "rgba(242, 204, 143, 0.18)",
                line: { width: 0 },
                layer: "below",
              },
              {
                type: "rect",
                x0: 50,
                x1: 100,
                y0: 0,
                y1: 50,
                fillcolor: "rgba(242, 204, 143, 0.18)",
                line: { width: 0 },
                layer: "below",
              },
              {
                type: "rect",
                x0: 0,
                x1: 50,
                y0: 0,
                y1: 50,
                fillcolor: "rgba(205, 92, 92, 0.16)",
                line: { width: 0 },
                layer: "below",
              },
              {
                type: "line",
                x0: 50,
                x1: 50,
                y0: 0,
                y1: 100,
                line: { color: "rgba(24,37,44,0.55)", width: 1.5, dash: "dash" },
              },
              {
                type: "line",
                x0: 0,
                x1: 100,
                y0: 50,
                y1: 50,
                line: { color: "rgba(24,37,44,0.55)", width: 1.5, dash: "dash" },
              },
            ],
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
