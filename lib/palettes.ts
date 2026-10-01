import type { Background } from "./types";

export interface Palette {
  id: string;
  label: string;
  colors: string[];
}

export const PALETTES: Palette[] = [
  {
    id: "mint",
    label: "Mint",
    colors: ["#0fa678", "#1e77c2", "#f4a340", "#e15a51", "#7c5cd6", "#12b5b0", "#d84f8f", "#5b6472"],
  },
  {
    id: "dusk",
    label: "Dusk",
    colors: ["#f2545b", "#f7a072", "#ffd166", "#83b692", "#4d9de0", "#7768ae", "#e3879e", "#465362"],
  },
  {
    id: "ocean",
    label: "Ocean",
    colors: ["#0f6bae", "#26a5c9", "#0b8a6f", "#66c3d0", "#4fd0a5", "#28527a", "#8bb8e8", "#123c5e"],
  },
  {
    id: "berry",
    label: "Berry",
    colors: ["#c4457f", "#5b2a86", "#e77fa7", "#9163cb", "#8e2f5c", "#d84727", "#f5853f", "#3c1642"],
  },
  {
    id: "forest",
    label: "Forest",
    colors: ["#3f6634", "#7fb069", "#a47148", "#b5c99a", "#e0a458", "#90a955", "#6f4518", "#414833"],
  },
  {
    id: "neon",
    label: "Neon",
    colors: ["#2dd4bf", "#a78bfa", "#fb7185", "#facc15", "#38bdf8", "#4ade80", "#f472b6", "#fb923c"],
  },
  {
    id: "mono",
    label: "Ink",
    colors: ["#1c2230", "#4b5563", "#8b93a1", "#c3c9d4", "#2f3a4d", "#6b7280", "#a5adba", "#e2e6ec"],
  },
  {
    id: "pastel",
    label: "Pastel",
    colors: ["#7fc8f8", "#ffb5a7", "#b8e0d2", "#f9dc5c", "#cdb4db", "#a8dadc", "#ffcad4", "#94d1be"],
  },
];

export function getPalette(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

export function seriesColor(paletteId: string, index: number): string {
  const { colors } = getPalette(paletteId);
  return colors[index % colors.length];
}

export interface CanvasTheme {
  fill: string; // svg background
  text: string;
  subtext: string;
  grid: string;
  axis: string;
  sliceStroke: string; // gap color between pie slices
}

export const CANVAS_THEMES: Record<Background, CanvasTheme> = {
  white: {
    fill: "#ffffff",
    text: "#1c2230",
    subtext: "#6b7280",
    grid: "#eceef2",
    axis: "#c7ccd6",
    sliceStroke: "#ffffff",
  },
  cream: {
    fill: "#faf6ef",
    text: "#2b2620",
    subtext: "#82796c",
    grid: "#ece5d8",
    axis: "#cfc6b5",
    sliceStroke: "#faf6ef",
  },
  dark: {
    fill: "#101623",
    text: "#eef1f6",
    subtext: "#8b93a1",
    grid: "#232b3b",
    axis: "#3a4356",
    sliceStroke: "#101623",
  },
  transparent: {
    fill: "none",
    text: "#1c2230",
    subtext: "#6b7280",
    grid: "#e5e7eb",
    axis: "#c7ccd6",
    sliceStroke: "#ffffff",
  },
};
