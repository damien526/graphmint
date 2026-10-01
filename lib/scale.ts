/** Nice linear scale helpers (d3-style). */

function niceNum(range: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / Math.pow(10, exponent);
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exponent);
}

export interface NiceScale {
  min: number;
  max: number;
  ticks: number[];
}

export function niceScale(dataMin: number, dataMax: number, maxTicks = 6): NiceScale {
  if (!isFinite(dataMin) || !isFinite(dataMax)) return { min: 0, max: 1, ticks: [0, 0.5, 1] };
  if (dataMin === dataMax) {
    if (dataMin === 0) return { min: 0, max: 1, ticks: [0, 0.5, 1] };
    dataMin = dataMin > 0 ? 0 : dataMin * 1.2;
    dataMax = dataMax > 0 ? dataMax * 1.2 : 0;
  }
  // Bars and areas read better anchored at zero
  const range = niceNum(dataMax - dataMin, false);
  const spacing = niceNum(range / (maxTicks - 1), true);
  const min = Math.floor(dataMin / spacing) * spacing;
  const max = Math.ceil(dataMax / spacing) * spacing;
  const ticks: number[] = [];
  for (let v = min; v <= max + spacing / 2; v += spacing) {
    ticks.push(Math.abs(v) < spacing * 1e-8 ? 0 : v);
  }
  return { min, max, ticks };
}

const compactFmt = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const plainFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function formatNumber(v: number, compact = false): string {
  if (!isFinite(v)) return "";
  if (compact || Math.abs(v) >= 10000) return compactFmt.format(v);
  return plainFmt.format(v);
}

export function formatPercent(v: number): string {
  return `${(v * 100).toFixed(v * 100 >= 10 ? 0 : 1)}%`;
}

/** Monotone cubic path through points (d3 curveMonotoneX). */
export function monotonePath(pts: [number, number][]): string {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M${pts[0][0]},${pts[0][1]}`;
  if (n === 2) return `M${pts[0][0]},${pts[0][1]}L${pts[1][0]},${pts[1][1]}`;

  const dx: number[] = [], dy: number[] = [], slope: number[] = [], tangent: number[] = new Array(n);
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1][0] - pts[i][0]);
    dy.push(pts[i + 1][1] - pts[i][1]);
    slope.push(dy[i] / (dx[i] || 1e-9));
  }
  tangent[0] = slope[0];
  tangent[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) tangent[i] = 0;
    else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      tangent[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]);
    }
  }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const t = dx[i] / 3;
    d += `C${pts[i][0] + t},${pts[i][1] + t * tangent[i]} ${pts[i + 1][0] - t},${
      pts[i + 1][1] - t * tangent[i + 1]
    } ${pts[i + 1][0]},${pts[i + 1][1]}`;
  }
  return d;
}

export function linearPath(pts: [number, number][]): string {
  if (pts.length === 0) return "";
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join("");
}

/** Rect path with only the top corners rounded (for bars). */
export function roundedTopRect(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w / 2, h));
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${
    y + rr
  }V${y + h}Z`;
}

/** Rect path with only the right corners rounded (for horizontal bars). */
export function roundedRightRect(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, h / 2, w));
  return `M${x},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h - rr}Q${x + w},${
    y + h
  } ${x + w - rr},${y + h}H${x}Z`;
}
