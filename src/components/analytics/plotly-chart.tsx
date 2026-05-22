"use client";

import dynamic from "next/dynamic";
import type { CSSProperties, ComponentType } from "react";

type PlotlyClickPoint = {
  customdata?: unknown[];
};

type PlotlyClickEvent = {
  points?: PlotlyClickPoint[];
};

export type PlotlyChartProps = {
  data: unknown[];
  layout?: Record<string, unknown>;
  config?: Record<string, unknown>;
  style?: CSSProperties;
  useResizeHandler?: boolean;
  onClick?: (event: PlotlyClickEvent) => void;
};

const PlotlyChart = dynamic(async () => {
  const [plotlyModule, scatterModule, scatter3dModule, factoryModule] = await Promise.all([
    import("plotly.js/lib/core"),
    import("plotly.js/lib/scatter"),
    import("plotly.js/lib/scatter3d"),
    import("react-plotly.js/factory"),
  ]);

  const Plotly = (plotlyModule as { default?: unknown }).default ?? plotlyModule;
  const scatter = (scatterModule as { default?: unknown }).default ?? scatterModule;
  const scatter3d = (scatter3dModule as { default?: unknown }).default ?? scatter3dModule;
  (Plotly as { register: (modules: unknown[]) => void }).register([scatter, scatter3d]);

  return factoryModule.default(Plotly as never);
}, { ssr: false }) as ComponentType<PlotlyChartProps>;

export { PlotlyChart };
