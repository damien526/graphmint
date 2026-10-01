export type ChartType =
  | "bar"
  | "bar-horizontal"
  | "line"
  | "area"
  | "pie"
  | "donut"
  | "scatter";

export interface Series {
  name: string;
  values: (number | null)[];
}

export interface ChartData {
  labels: string[];
  series: Series[];
}

export type Background = "white" | "cream" | "dark" | "transparent";
export type Aspect = "wide" | "classic" | "square";
export type LegendPosition = "top" | "bottom" | "none";

export interface ChartOptions {
  title: string;
  subtitle: string;
  xLabel: string;
  yLabel: string;
  palette: string;
  background: Background;
  legend: LegendPosition;
  showValues: boolean;
  showGrid: boolean;
  smooth: boolean;
  stacked: boolean;
  rounded: boolean;
  showPercent: boolean;
  sortSlices: boolean;
  aspect: Aspect;
  fontScale: number; // 0.85 | 1 | 1.2
  watermark: boolean;
}

export interface ChartSpec {
  type: ChartType;
  data: ChartData;
  options: ChartOptions;
}

export const DEFAULT_OPTIONS: ChartOptions = {
  title: "",
  subtitle: "",
  xLabel: "",
  yLabel: "",
  palette: "mint",
  background: "white",
  legend: "top",
  showValues: false,
  showGrid: true,
  smooth: true,
  stacked: false,
  rounded: true,
  showPercent: true,
  sortSlices: false,
  aspect: "wide",
  fontScale: 1,
  watermark: true,
};

export const CHART_TYPE_LABELS: Record<ChartType, string> = {
  bar: "Bar",
  "bar-horizontal": "Horizontal bar",
  line: "Line",
  area: "Area",
  pie: "Pie",
  donut: "Donut",
  scatter: "Scatter",
};
