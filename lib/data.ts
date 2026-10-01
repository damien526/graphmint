import type { ChartData, ChartOptions, ChartSpec, ChartType } from "./types";
import { DEFAULT_OPTIONS } from "./types";
import { PALETTES } from "./palettes";

const CHART_TYPES: ChartType[] = ["bar", "bar-horizontal", "line", "area", "pie", "donut", "scatter"];
const MAX_ROWS = 500;
const MAX_SERIES = 12;
const MAX_DECODED_JSON = 2_000_000; // bytes of JSON a share link may expand to

/**
 * Validate and clamp a spec coming from an untrusted source
 * (share-link hash or localStorage). Returns null if unusable.
 */
export function sanitizeSpec(raw: unknown): ChartSpec | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!CHART_TYPES.includes(r.type as ChartType)) return null;

  const d = r.data as { labels?: unknown; series?: unknown } | undefined;
  if (!d || !Array.isArray(d.labels) || !Array.isArray(d.series)) return null;

  const labels = d.labels.slice(0, MAX_ROWS).map((l) => String(l ?? "").slice(0, 200));
  const series = d.series.slice(0, MAX_SERIES).map((s, i) => {
    const sr = (s ?? {}) as { name?: unknown; values?: unknown };
    const values = (Array.isArray(sr.values) ? sr.values : [])
      .slice(0, labels.length)
      .map((v) => (typeof v === "number" && isFinite(v) ? v : null));
    while (values.length < labels.length) values.push(null);
    return { name: String(sr.name ?? `Series ${i + 1}`).slice(0, 120), values };
  });
  if (!series.length) return null;

  const o = (r.options ?? {}) as Record<string, unknown>;
  const str = (v: unknown, max: number, fallback: string) =>
    typeof v === "string" ? v.slice(0, max) : fallback;
  const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
  const pick = <T,>(v: unknown, allowed: readonly T[], fallback: T): T =>
    allowed.includes(v as T) ? (v as T) : fallback;

  const options: ChartOptions = {
    title: str(o.title, 200, DEFAULT_OPTIONS.title),
    subtitle: str(o.subtitle, 300, DEFAULT_OPTIONS.subtitle),
    xLabel: str(o.xLabel, 120, DEFAULT_OPTIONS.xLabel),
    yLabel: str(o.yLabel, 120, DEFAULT_OPTIONS.yLabel),
    palette: PALETTES.some((p) => p.id === o.palette) ? (o.palette as string) : DEFAULT_OPTIONS.palette,
    background: pick(o.background, ["white", "cream", "dark", "transparent"] as const, DEFAULT_OPTIONS.background),
    legend: pick(o.legend, ["top", "bottom", "none"] as const, DEFAULT_OPTIONS.legend),
    aspect: pick(o.aspect, ["wide", "classic", "square"] as const, DEFAULT_OPTIONS.aspect),
    fontScale: pick(o.fontScale, [0.85, 1, 1.2] as const, DEFAULT_OPTIONS.fontScale),
    showValues: bool(o.showValues, DEFAULT_OPTIONS.showValues),
    showGrid: bool(o.showGrid, DEFAULT_OPTIONS.showGrid),
    smooth: bool(o.smooth, DEFAULT_OPTIONS.smooth),
    stacked: bool(o.stacked, DEFAULT_OPTIONS.stacked),
    rounded: bool(o.rounded, DEFAULT_OPTIONS.rounded),
    showPercent: bool(o.showPercent, DEFAULT_OPTIONS.showPercent),
    sortSlices: bool(o.sortSlices, DEFAULT_OPTIONS.sortSlices),
    watermark: bool(o.watermark, DEFAULT_OPTIONS.watermark),
  };

  return { type: r.type as ChartType, data: { labels, series }, options };
}

/** Parse pasted TSV/CSV text (from Excel, Sheets, or a .csv file) into ChartData. */
export function parseDelimited(text: string): ChartData | null {
  const clean = text.replace(/\r\n?/g, "\n").trim();
  if (!clean) return null;
  const delim = clean.includes("\t") ? "\t" : clean.includes(";") && !clean.includes(",") ? ";" : ",";
  const rows = splitRows(clean, delim);
  if (!rows.length) return null;

  // Header detection: first row has non-numeric cells beyond the first column
  const first = rows[0];
  const hasHeader =
    rows.length > 1 && first.slice(1).some((c) => c.trim() !== "" && !isNumeric(c));
  const header = hasHeader ? first : null;
  const body = hasHeader ? rows.slice(1) : rows;
  if (!body.length) return null;

  const nCols = Math.max(...body.map((r) => r.length));
  if (nCols < 2) return null;

  const labels = body.map((r) => (r[0] ?? "").trim());
  const series = [];
  for (let c = 1; c < nCols; c++) {
    series.push({
      name: header ? (header[c] ?? "").trim() : rowsSeriesName(c),
      values: body.map((r) => toNumber(r[c])),
    });
  }
  return { labels, series };
}

function rowsSeriesName(c: number) {
  return `Series ${c}`;
}

function splitRows(text: string, delim: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delim) {
      row.push(cur);
      cur = "";
    } else if (ch === "\n") {
      row.push(cur);
      cur = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cur += ch;
  }
  row.push(cur);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

function isNumeric(s: string): boolean {
  return toNumber(s) !== null;
}

/** Tolerant number parsing: "1,234.5", "1 234,5", "42%", "$1.2" all work. */
export function toNumber(raw: string | undefined): number | null {
  if (raw == null) return null;
  let s = raw.trim().replace(/[€$£%\s ]/g, "");
  if (!s) return null;
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (hasComma) {
    const parts = s.split(",");
    s = parts.length === 2 && parts[1].length !== 3 ? s.replace(",", ".") : s.replace(/,/g, "");
  }
  const v = parseFloat(s);
  return isFinite(v) ? v : null;
}

/* ---------- URL sharing (no backend) ---------- */

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function encodeSpec(spec: ChartSpec): Promise<string> {
  const json = JSON.stringify(spec);
  const input = new TextEncoder().encode(json);
  const stream = new Blob([input]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
  return bytesToBase64Url(compressed);
}

export async function decodeSpec(hash: string): Promise<ChartSpec | null> {
  try {
    const bytes = base64UrlToBytes(hash);
    const stream = new Blob([bytes.buffer as ArrayBuffer]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    const json = await new Response(stream).text();
    if (json.length > MAX_DECODED_JSON) return null;
    return sanitizeSpec(JSON.parse(json));
  } catch {
    return null;
  }
}

/* ---------- sample datasets per chart type ---------- */

export function sampleSpec(type: ChartType): ChartSpec {
  const base = { ...DEFAULT_OPTIONS };
  switch (type) {
    case "pie":
      return {
        type,
        data: {
          labels: ["Organic search", "Direct", "Social", "Referral", "Email"],
          series: [{ name: "Traffic", values: [46, 24, 14, 10, 6] }],
        },
        options: { ...base, title: "Where our visitors come from", subtitle: "Share of sessions, last 30 days", aspect: "square" },
      };
    case "donut":
      return {
        type,
        data: {
          labels: ["Rent", "Groceries", "Transport", "Savings", "Leisure", "Other"],
          series: [{ name: "Budget", values: [1150, 420, 180, 400, 250, 140] }],
        },
        options: { ...base, title: "Monthly budget breakdown", subtitle: "In dollars per month", aspect: "square" },
      };
    case "line":
      return {
        type,
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          series: [
            { name: "2025", values: [12, 15, 14, 19, 24, 28, 31, 30, 26, 22, 17, 14] },
            { name: "2024", values: [10, 11, 13, 15, 19, 23, 26, 25, 22, 18, 13, 11] },
          ],
        },
        options: { ...base, title: "Website visitors per month", subtitle: "In thousands of sessions" },
      };
    case "area":
      return {
        type,
        data: {
          labels: ["2019", "2020", "2021", "2022", "2023", "2024", "2025"],
          series: [
            { name: "Subscriptions", values: [8, 14, 24, 38, 52, 71, 96] },
            { name: "One-time sales", values: [22, 20, 24, 26, 25, 28, 30] },
          ],
        },
        options: { ...base, title: "Revenue growth by segment", subtitle: "In thousands of dollars", stacked: true },
      };
    case "scatter":
      return {
        type,
        data: {
          labels: ["1.2", "2.1", "2.8", "3.5", "4.2", "4.9", "5.6", "6.3", "7.1", "7.8", "8.4", "9.2"],
          series: [
            { name: "Study hours vs score", values: [52, 55, 61, 64, 70, 68, 75, 79, 83, 85, 88, 93] },
          ],
        },
        options: { ...base, title: "Study time vs exam score", subtitle: "Each dot is one student", xLabel: "Hours studied per week", yLabel: "Exam score", legend: "none" },
      };
    case "bar-horizontal":
      return {
        type,
        data: {
          labels: ["Python", "JavaScript", "TypeScript", "Java", "C#", "Go", "Rust"],
          series: [{ name: "Developers", values: [51, 49, 38, 30, 27, 14, 13] }],
        },
        options: { ...base, title: "Most used programming languages", subtitle: "% of developers, 2025 survey", legend: "none", aspect: "classic" },
      };
    case "bar":
    default:
      return {
        type: "bar",
        data: {
          labels: ["Q1", "Q2", "Q3", "Q4"],
          series: [
            { name: "Product A", values: [38, 52, 61, 74] },
            { name: "Product B", values: [24, 30, 41, 58] },
          ],
        },
        options: { ...base, title: "Quarterly sales by product", subtitle: "In thousands of units" },
      };
  }
}
