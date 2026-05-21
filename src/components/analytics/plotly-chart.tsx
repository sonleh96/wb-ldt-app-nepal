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
  const [plotlyModule, factoryModule] = await Promise.all([
    import("plotly.js-dist-min"),
    import("react-plotly.js/factory"),
  ]);

  const Plotly = (plotlyModule as { default?: unknown }).default ?? plotlyModule;
  return factoryModule.default(Plotly as never);
}, { ssr: false }) as ComponentType<PlotlyChartProps>;

export { PlotlyChart };
