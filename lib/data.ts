import type { ChartData, ChartSpec, ChartType } from "./types";
import { DEFAULT_OPTIONS } from "./types";

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
    const spec = JSON.parse(json) as ChartSpec;
    if (!spec?.type || !spec?.data || !spec?.options) return null;
    return { ...spec, options: { ...DEFAULT_OPTIONS, ...spec.options } };
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
