import React from "react";
import type { ChartSpec, ChartData, ChartOptions } from "../types";
import { CANVAS_THEMES, getPalette, type CanvasTheme } from "../palettes";
import {
  niceScale,
  formatNumber,
  formatPercent,
  monotonePath,
  linearPath,
  roundedTopRect,
  roundedRightRect,
} from "../scale";

export const FONT_STACK =
  "'Inter','Inter Fallback','Helvetica Neue',Helvetica,Arial,sans-serif";

const SIZES = {
  wide: { w: 960, h: 540 },
  classic: { w: 960, h: 680 },
  square: { w: 760, h: 760 },
} as const;

interface Layout {
  w: number;
  h: number;
  theme: CanvasTheme;
  colors: string[];
  fs: (n: number) => number;
  plot: { x: number; y: number; w: number; h: number };
  legendItems: { name: string; color: string }[];
}

function estimateWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.58;
}

function usedSeries(data: ChartData) {
  return data.series.filter((s) => s.name.trim() !== "" || s.values.some((v) => v != null));
}

function buildLayout(spec: ChartSpec): Layout {
  const { options: o } = spec;
  const { w, h } = SIZES[o.aspect];
  const theme = CANVAS_THEMES[o.background];
  const colors = getPalette(o.palette).colors;
  const fs = (n: number) => Math.round(n * o.fontScale * 10) / 10;

  const pad = 36;
  let top = pad - 6;
  if (o.title.trim()) top += fs(27) * 1.25;
  if (o.subtitle.trim()) top += fs(15.5) * 1.5;
  if (o.title.trim() || o.subtitle.trim()) top += 14;

  const series = usedSeries(spec.data);
  const isRadial = spec.type === "pie" || spec.type === "donut";
  const legendItems =
    o.legend === "none"
      ? []
      : isRadial
        ? spec.data.labels.map((l, i) => ({ name: l || `Slice ${i + 1}`, color: colors[i % colors.length] }))
        : series.length > 1
          ? series.map((s, i) => ({ name: s.name || `Series ${i + 1}`, color: colors[i % colors.length] }))
          : [];

  const legendRows = legendItems.length
    ? Math.max(
        1,
        Math.ceil(
          legendItems.reduce((acc, it) => acc + estimateWidth(it.name, fs(13.5)) + 34, 0) /
            (w - pad * 2),
        ),
      )
    : 0;
  const legendH = legendRows * fs(24);

  if (o.legend === "top" && legendItems.length) top += legendH + 8;

  let bottom = h - pad + 4;
  if (o.watermark) bottom -= fs(14);
  if (o.legend === "bottom" && legendItems.length) bottom -= legendH + 6;
  if (o.xLabel.trim() && !isRadial) bottom -= fs(20);

  return {
    w,
    h,
    theme,
    colors,
    fs,
    plot: { x: pad, y: top, w: w - pad * 2, h: bottom - top },
    legendItems,
  };
}

/* ---------- shared chrome ---------- */

function Header({ spec, L }: { spec: ChartSpec; L: Layout }) {
  const { options: o } = spec;
  const els: React.ReactElement[] = [];
  let y = 36;
  if (o.title.trim()) {
    y += L.fs(27) * 0.8;
    els.push(
      <text key="t" x={36} y={y} fontSize={L.fs(27)} fontWeight={700} fill={L.theme.text} letterSpacing="-0.4">
        {o.title}
      </text>,
    );
    y += L.fs(27) * 0.45;
  }
  if (o.subtitle.trim()) {
    y += L.fs(15.5);
    els.push(
      <text key="s" x={36} y={y} fontSize={L.fs(15.5)} fill={L.theme.subtext}>
        {o.subtitle}
      </text>,
    );
  }
  return <g>{els}</g>;
}

function Legend({ L, at }: { L: Layout; at: "top" | "bottom" }) {
  if (!L.legendItems.length) return null;
  const fsz = L.fs(13.5);
  const rowH = L.fs(24);
  let x = 36;
  const startY =
    at === "top" ? L.plot.y - rowH * 0.55 - 8 : L.plot.y + L.plot.h + L.fs(20);
  let row = 0;
  const items = L.legendItems.map((it, i) => {
    const itemW = estimateWidth(it.name, fsz) + 34;
    if (x + itemW > L.w - 36 && x > 36) {
      x = 36;
      row++;
    }
    const cx = x;
    x += itemW;
    const y = startY + row * rowH * (at === "top" ? -1 : 1);
    return (
      <g key={i}>
        <rect x={cx} y={y - fsz * 0.78} width={fsz * 0.85} height={fsz * 0.85} rx={3.5} fill={it.color} />
        <text x={cx + fsz * 0.85 + 8} y={y} fontSize={fsz} fill={L.theme.subtext} fontWeight={500}>
          {it.name}
        </text>
      </g>
    );
  });
  return <g>{items}</g>;
}

function Watermark({ L }: { L: Layout }) {
  return (
    <text
      x={L.w - 36}
      y={L.h - 18}
      fontSize={L.fs(11.5)}
      fill={L.theme.subtext}
      opacity={0.65}
      textAnchor="end"
      fontWeight={500}
    >
      graphmint.app
    </text>
  );
}

/* ---------- axis charts ---------- */

interface AxisFrame {
  x0: number;
  y0: number; // top-left of inner plot
  iw: number;
  ih: number;
  scale: ReturnType<typeof niceScale>;
  toY: (v: number) => number;
}

function buildAxisFrame(L: Layout, dataMin: number, dataMax: number, o: ChartOptions, xLabelSpace: number): AxisFrame {
  const scale = niceScale(Math.min(0, dataMin), Math.max(0, dataMax));
  const yTickW = Math.max(...scale.ticks.map((t) => estimateWidth(formatNumber(t, true), L.fs(12.5)))) + 12;
  const yLabelSpace = o.yLabel.trim() ? L.fs(22) : 0;
  const x0 = L.plot.x + yTickW + yLabelSpace;
  const iw = L.plot.w - yTickW - yLabelSpace;
  const ih = L.plot.h - xLabelSpace;
  const toY = (v: number) => L.plot.y + ih - ((v - scale.min) / (scale.max - scale.min || 1)) * ih;
  return { x0, y0: L.plot.y, iw, ih, scale, toY };
}

function YAxis({ L, F, o }: { L: Layout; F: AxisFrame; o: ChartOptions }) {
  return (
    <g>
      {F.scale.ticks.map((t, i) => (
        <g key={i}>
          {o.showGrid && (
            <line
              x1={F.x0}
              x2={F.x0 + F.iw}
              y1={F.toY(t)}
              y2={F.toY(t)}
              stroke={t === 0 ? L.theme.axis : L.theme.grid}
              strokeWidth={t === 0 ? 1.4 : 1}
            />
          )}
          <text
            x={F.x0 - 10}
            y={F.toY(t) + L.fs(4)}
            fontSize={L.fs(12.5)}
            fill={L.theme.subtext}
            textAnchor="end"
          >
            {formatNumber(t, true)}
          </text>
        </g>
      ))}
      {o.yLabel.trim() && (
        <text
          transform={`translate(${L.plot.x + L.fs(10)},${F.y0 + F.ih / 2}) rotate(-90)`}
          fontSize={L.fs(13)}
          fill={L.theme.subtext}
          textAnchor="middle"
          fontWeight={500}
        >
          {o.yLabel}
        </text>
      )}
    </g>
  );
}

function XCategoryLabels({
  L,
  F,
  labels,
  slotW,
  o,
}: {
  L: Layout;
  F: AxisFrame;
  labels: string[];
  slotW: number;
  o: ChartOptions;
}) {
  const fsz = L.fs(12.5);
  const maxW = Math.max(1, ...labels.map((l) => estimateWidth(l, fsz)));
  const rotate = maxW > slotW - 8;
  const y = F.y0 + F.ih + L.fs(20);
  return (
    <g>
      {labels.map((l, i) => {
        const cx = F.x0 + slotW * i + slotW / 2;
        return rotate ? (
          <text
            key={i}
            x={cx}
            y={y - 4}
            fontSize={fsz}
            fill={L.theme.subtext}
            textAnchor="end"
            transform={`rotate(-32 ${cx} ${y - 4})`}
          >
            {l}
          </text>
        ) : (
          <text key={i} x={cx} y={y} fontSize={fsz} fill={L.theme.subtext} textAnchor="middle">
            {l}
          </text>
        );
      })}
      {o.xLabel.trim() && (
        <text
          x={F.x0 + F.iw / 2}
          y={F.y0 + F.ih + (rotate ? L.fs(58) : L.fs(44))}
          fontSize={L.fs(13)}
          fill={L.theme.subtext}
          textAnchor="middle"
          fontWeight={500}
        >
          {o.xLabel}
        </text>
      )}
    </g>
  );
}

function seriesExtent(series: { values: (number | null)[] }[], stacked: boolean, labelsLen: number) {
  let min = 0,
    max = 0;
  if (stacked) {
    for (let i = 0; i < labelsLen; i++) {
      let pos = 0,
        neg = 0;
      for (const s of series) {
        const v = s.values[i];
        if (v == null || !isFinite(v)) continue;
        if (v >= 0) pos += v;
        else neg += v;
      }
      max = Math.max(max, pos);
      min = Math.min(min, neg);
    }
  } else {
    for (const s of series)
      for (const v of s.values) {
        if (v == null || !isFinite(v)) continue;
        max = Math.max(max, v);
        min = Math.min(min, v);
      }
  }
  return { min, max };
}

function BarChart({ spec, L, horizontal }: { spec: ChartSpec; L: Layout; horizontal: boolean }) {
  const o = spec.options;
  const series = usedSeries(spec.data);
  const labels = spec.data.labels;
  const n = labels.length;
  if (!n || !series.length) return <EmptyPlot L={L} />;
  const { min, max } = seriesExtent(series, o.stacked, n);

  if (!horizontal) {
    const xSpace = L.fs(28) + (o.xLabel.trim() ? L.fs(22) : 0);
    const F = buildAxisFrame(L, min, max, o, xSpace);
    const slotW = F.iw / n;
    const groupPad = slotW * 0.18;
    const nBars = o.stacked ? 1 : series.length;
    const barW = Math.max(2, (slotW - groupPad * 2) / nBars - (nBars > 1 ? 3 : 0));
    const r = o.rounded ? Math.min(7, barW / 2.5) : 0;
    const zero = F.toY(0);

    const bars: React.ReactElement[] = [];
    const valueLabels: React.ReactElement[] = [];
    for (let i = 0; i < n; i++) {
      let posAcc = 0,
        negAcc = 0;
      series.forEach((s, si) => {
        const v = s.values[i];
        if (v == null || !isFinite(v)) return;
        const color = L.colors[si % L.colors.length];
        let x: number, w: number, yTop: number, hgt: number, isTopOfStack = false;
        if (o.stacked) {
          x = F.x0 + slotW * i + groupPad;
          w = slotW - groupPad * 2;
          if (v >= 0) {
            yTop = F.toY(posAcc + v);
            hgt = F.toY(posAcc) - yTop;
            posAcc += v;
          } else {
            yTop = F.toY(negAcc);
            hgt = F.toY(negAcc + v) - yTop;
            negAcc += v;
          }
          isTopOfStack =
            v >= 0 &&
            series.slice(si + 1).every((ss) => (ss.values[i] ?? 0) <= 0);
        } else {
          x = F.x0 + slotW * i + groupPad + si * (barW + 3);
          w = barW;
          yTop = v >= 0 ? F.toY(v) : zero;
          hgt = Math.abs(F.toY(v) - zero);
        }
        if (hgt <= 0) return;
        const useRound = r > 0 && (!o.stacked || isTopOfStack) && v >= 0;
        bars.push(
          useRound ? (
            <path key={`${si}-${i}`} d={roundedTopRect(x, yTop, w, hgt, r)} fill={color} />
          ) : (
            <rect key={`${si}-${i}`} x={x} y={yTop} width={w} height={hgt} fill={color} />
          ),
        );
        if (o.showValues && !o.stacked) {
          valueLabels.push(
            <text
              key={`v${si}-${i}`}
              x={x + w / 2}
              y={v >= 0 ? yTop - L.fs(6) : yTop + hgt + L.fs(13)}
              fontSize={L.fs(11.5)}
              fill={L.theme.subtext}
              textAnchor="middle"
              fontWeight={600}
            >
              {formatNumber(v, true)}
            </text>,
          );
        }
      });
      if (o.showValues && o.stacked) {
        const total = series.reduce((a, s) => a + Math.max(0, s.values[i] ?? 0), 0);
        valueLabels.push(
          <text
            key={`vt${i}`}
            x={F.x0 + slotW * i + slotW / 2}
            y={F.toY(total) - L.fs(6)}
            fontSize={L.fs(11.5)}
            fill={L.theme.subtext}
            textAnchor="middle"
            fontWeight={600}
          >
            {formatNumber(total, true)}
          </text>,
        );
      }
    }
    return (
      <g>
        <YAxis L={L} F={F} o={o} />
        {bars}
        {valueLabels}
        <XCategoryLabels L={L} F={F} labels={labels} slotW={slotW} o={o} />
      </g>
    );
  }

  /* horizontal bars */
  const scale = niceScale(Math.min(0, min), Math.max(0, max));
  const catW = Math.min(
    170,
    Math.max(...labels.map((l) => estimateWidth(l, L.fs(12.5)))) + 14,
  );
  const x0 = L.plot.x + catW;
  const iw = L.plot.w - catW;
  const ih = L.plot.h - L.fs(26) - (o.xLabel.trim() ? L.fs(20) : 0);
  const toX = (v: number) => x0 + ((v - scale.min) / (scale.max - scale.min || 1)) * iw;
  const slotH = ih / n;
  const groupPad = slotH * 0.18;
  const nBars = o.stacked ? 1 : series.length;
  const barH = Math.max(2, (slotH - groupPad * 2) / nBars - (nBars > 1 ? 3 : 0));
  const r = o.rounded ? Math.min(7, barH / 2.5) : 0;
  const zeroX = toX(0);

  const els: React.ReactElement[] = [];
  // grid + x tick labels
  scale.ticks.forEach((t, ti) => {
    if (o.showGrid)
      els.push(
        <line
          key={`g${ti}`}
          x1={toX(t)}
          x2={toX(t)}
          y1={L.plot.y}
          y2={L.plot.y + ih}
          stroke={t === 0 ? L.theme.axis : L.theme.grid}
          strokeWidth={t === 0 ? 1.4 : 1}
        />,
      );
    els.push(
      <text
        key={`gt${ti}`}
        x={toX(t)}
        y={L.plot.y + ih + L.fs(18)}
        fontSize={L.fs(12.5)}
        fill={L.theme.subtext}
        textAnchor="middle"
      >
        {formatNumber(t, true)}
      </text>,
    );
  });
  labels.forEach((l, i) => {
    els.push(
      <text
        key={`c${i}`}
        x={x0 - 10}
        y={L.plot.y + slotH * i + slotH / 2 + L.fs(4)}
        fontSize={L.fs(12.5)}
        fill={L.theme.subtext}
        textAnchor="end"
      >
        {l}
      </text>,
    );
    let posAcc = 0,
      negAcc = 0;
    series.forEach((s, si) => {
      const v = s.values[i];
      if (v == null || !isFinite(v)) return;
      const color = L.colors[si % L.colors.length];
      let y: number, hgt: number, xL: number, w: number, isEnd = false;
      if (o.stacked) {
        y = L.plot.y + slotH * i + groupPad;
        hgt = slotH - groupPad * 2;
        if (v >= 0) {
          xL = toX(posAcc);
          w = toX(posAcc + v) - xL;
          posAcc += v;
        } else {
          xL = toX(negAcc + v);
          w = toX(negAcc) - xL;
          negAcc += v;
        }
        isEnd = v >= 0 && series.slice(si + 1).every((ss) => (ss.values[i] ?? 0) <= 0);
      } else {
        y = L.plot.y + slotH * i + groupPad + si * (barH + 3);
        hgt = barH;
        xL = v >= 0 ? zeroX : toX(v);
        w = Math.abs(toX(v) - zeroX);
      }
      if (w <= 0) return;
      const useRound = r > 0 && (!o.stacked || isEnd) && v >= 0;
      els.push(
        useRound ? (
          <path key={`b${si}-${i}`} d={roundedRightRect(xL, y, w, hgt, r)} fill={color} />
        ) : (
          <rect key={`b${si}-${i}`} x={xL} y={y} width={w} height={hgt} fill={color} />
        ),
      );
      if (o.showValues && !o.stacked)
        els.push(
          <text
            key={`v${si}-${i}`}
            x={v >= 0 ? xL + w + 7 : xL - 7}
            y={y + hgt / 2 + L.fs(4)}
            fontSize={L.fs(11.5)}
            fill={L.theme.subtext}
            textAnchor={v >= 0 ? "start" : "end"}
            fontWeight={600}
          >
            {formatNumber(v, true)}
          </text>,
        );
    });
  });
  if (o.xLabel.trim())
    els.push(
      <text
        key="xl"
        x={x0 + iw / 2}
        y={L.plot.y + ih + L.fs(40)}
        fontSize={L.fs(13)}
        fill={L.theme.subtext}
        textAnchor="middle"
        fontWeight={500}
      >
        {o.xLabel}
      </text>,
    );
  return <g>{els}</g>;
}

function LineAreaChart({ spec, L, area }: { spec: ChartSpec; L: Layout; area: boolean }) {
  const o = spec.options;
  const series = usedSeries(spec.data);
  const labels = spec.data.labels;
  const n = labels.length;
  if (n < 2 || !series.length) return <EmptyPlot L={L} />;
  const stacked = area && o.stacked;
  const { min, max } = seriesExtent(series, stacked, n);
  const xSpace = L.fs(28) + (o.xLabel.trim() ? L.fs(22) : 0);
  const F = buildAxisFrame(L, area ? Math.min(0, min) : min, area ? Math.max(0, max) : max, o, xSpace);
  const slotW = F.iw / n;
  const px = (i: number) => F.x0 + slotW * i + slotW / 2;

  const els: React.ReactElement[] = [];
  const defs: React.ReactElement[] = [];
  const acc = new Array(n).fill(0);

  series.forEach((s, si) => {
    const color = L.colors[si % L.colors.length];
    const pts: [number, number][] = [];
    const basePts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const raw = s.values[i];
      const v = raw == null || !isFinite(raw) ? 0 : raw;
      const y0v = stacked ? acc[i] : 0;
      const y1v = y0v + v;
      pts.push([px(i), F.toY(y1v)]);
      basePts.push([px(i), F.toY(y0v)]);
      if (stacked) acc[i] = y1v;
    }
    const lineD = o.smooth ? monotonePath(pts) : linearPath(pts);
    if (area) {
      const baseD = o.smooth
        ? monotonePath([...basePts].reverse())
        : linearPath([...basePts].reverse());
      const gid = `cmg${si}`;
      defs.push(
        <linearGradient key={gid} id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={stacked ? 0.85 : 0.42} />
          <stop offset="100%" stopColor={color} stopOpacity={stacked ? 0.65 : 0.06} />
        </linearGradient>,
      );
      els.push(
        <path
          key={`a${si}`}
          d={`${lineD}L${basePts[n - 1][0]},${basePts[n - 1][1]}${baseD.replace(/^M/, "L")}Z`}
          fill={`url(#${gid})`}
        />,
      );
    }
    els.push(
      <path
        key={`l${si}`}
        d={lineD}
        fill="none"
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />,
    );
    if (n <= 30 && !area) {
      pts.forEach(([x, y], i) =>
        els.push(
          <circle key={`d${si}-${i}`} cx={x} cy={y} r={3.4} fill={color} stroke={L.theme.fill === "none" ? "#fff" : L.theme.fill} strokeWidth={1.6} />,
        ),
      );
    }
    if (o.showValues && !stacked) {
      pts.forEach(([x, y], i) => {
        const v = s.values[i];
        if (v == null) return;
        els.push(
          <text
            key={`vl${si}-${i}`}
            x={x}
            y={y - L.fs(9)}
            fontSize={L.fs(11.5)}
            fill={L.theme.subtext}
            textAnchor="middle"
            fontWeight={600}
          >
            {formatNumber(v, true)}
          </text>,
        );
      });
    }
  });

  // thin x labels when crowded
  const step = Math.max(1, Math.ceil((n * L.fs(12.5) * 4.5) / F.iw));
  const shownLabels = labels.map((l, i) => (i % step === 0 ? l : ""));
  return (
    <g>
      <defs>{defs}</defs>
      <YAxis L={L} F={F} o={o} />
      {els}
      <XCategoryLabels L={L} F={F} labels={shownLabels} slotW={slotW} o={o} />
    </g>
  );
}

function ScatterChart({ spec, L }: { spec: ChartSpec; L: Layout }) {
  const o = spec.options;
  const series = usedSeries(spec.data);
  const labels = spec.data.labels;
  const n = labels.length;
  if (!n || !series.length) return <EmptyPlot L={L} />;
  const xsRaw = labels.map((l, i) => {
    const v = parseFloat(String(l).replace(/,/g, ""));
    return isFinite(v) ? v : i;
  });
  const xScale = niceScale(Math.min(...xsRaw), Math.max(...xsRaw));
  const { min, max } = seriesExtent(series, false, n);
  const xSpace = L.fs(28) + (o.xLabel.trim() ? L.fs(22) : 0);
  const F = buildAxisFrame(L, min, max, o, xSpace);
  const toX = (v: number) => F.x0 + ((v - xScale.min) / (xScale.max - xScale.min || 1)) * F.iw;

  const els: React.ReactElement[] = [];
  xScale.ticks.forEach((t, ti) => {
    if (o.showGrid)
      els.push(
        <line key={`gx${ti}`} x1={toX(t)} x2={toX(t)} y1={F.y0} y2={F.y0 + F.ih} stroke={L.theme.grid} strokeWidth={1} />,
      );
    els.push(
      <text
        key={`gxt${ti}`}
        x={toX(t)}
        y={F.y0 + F.ih + L.fs(20)}
        fontSize={L.fs(12.5)}
        fill={L.theme.subtext}
        textAnchor="middle"
      >
        {formatNumber(t, true)}
      </text>,
    );
  });
  series.forEach((s, si) => {
    const color = L.colors[si % L.colors.length];
    s.values.forEach((v, i) => {
      if (v == null || !isFinite(v)) return;
      els.push(
        <circle key={`p${si}-${i}`} cx={toX(xsRaw[i])} cy={F.toY(v)} r={L.fs(5.2)} fill={color} opacity={0.82} />,
      );
    });
  });
  if (o.xLabel.trim())
    els.push(
      <text
        key="xl"
        x={F.x0 + F.iw / 2}
        y={F.y0 + F.ih + L.fs(46)}
        fontSize={L.fs(13)}
        fill={L.theme.subtext}
        textAnchor="middle"
        fontWeight={500}
      >
        {o.xLabel}
      </text>,
    );
  return (
    <g>
      <YAxis L={L} F={F} o={o} />
      {els}
    </g>
  );
}

function PieChart({ spec, L, donut }: { spec: ChartSpec; L: Layout; donut: boolean }) {
  const o = spec.options;
  const labels = spec.data.labels;
  const values = labels.map((_, i) => spec.data.series[0]?.values[i] ?? null);
  let slices = labels
    .map((label, i) => ({ label, value: values[i] ?? 0, i }))
    .filter((s) => s.value > 0);
  if (!slices.length) return <EmptyPlot L={L} />;
  if (o.sortSlices) slices = [...slices].sort((a, b) => b.value - a.value);
  const total = slices.reduce((a, s) => a + s.value, 0);

  const cx = L.plot.x + L.plot.w / 2;
  const cy = L.plot.y + L.plot.h / 2;
  const R = Math.min(L.plot.w, L.plot.h) / 2 - L.fs(8);
  const r0 = donut ? R * 0.62 : 0;

  let angle = -Math.PI / 2;
  const els: React.ReactElement[] = [];
  slices.forEach((s, k) => {
    const frac = s.value / total;
    const a0 = angle;
    const a1 = angle + frac * Math.PI * 2;
    angle = a1;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)];
    const p1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)];
    const color = L.colors[s.i % L.colors.length];
    let d: string;
    if (donut) {
      const q0 = [cx + r0 * Math.cos(a1), cy + r0 * Math.sin(a1)];
      const q1 = [cx + r0 * Math.cos(a0), cy + r0 * Math.sin(a0)];
      d = `M${p0[0]},${p0[1]}A${R},${R} 0 ${large} 1 ${p1[0]},${p1[1]}L${q0[0]},${q0[1]}A${r0},${r0} 0 ${large} 0 ${q1[0]},${q1[1]}Z`;
    } else {
      d = `M${cx},${cy}L${p0[0]},${p0[1]}A${R},${R} 0 ${large} 1 ${p1[0]},${p1[1]}Z`;
    }
    els.push(
      <path
        key={k}
        d={d}
        fill={color}
        stroke={L.theme.sliceStroke === "none" ? "#ffffff" : L.theme.sliceStroke}
        strokeWidth={2}
        strokeLinejoin="round"
      />,
    );
    if (frac >= 0.05) {
      const mid = (a0 + a1) / 2;
      const lr = donut ? (R + r0) / 2 : R * 0.66;
      const lx = cx + lr * Math.cos(mid);
      const ly = cy + lr * Math.sin(mid);
      const txt = o.showPercent ? formatPercent(frac) : formatNumber(s.value, true);
      els.push(
        <text
          key={`t${k}`}
          x={lx}
          y={ly + L.fs(4.5)}
          fontSize={L.fs(13.5)}
          fontWeight={700}
          fill="#ffffff"
          textAnchor="middle"
          style={{ paintOrder: "stroke" }}
          stroke="rgba(0,0,0,0.18)"
          strokeWidth={2.5}
        >
          {txt}
        </text>,
      );
    }
  });
  if (donut) {
    els.push(
      <text key="dt" x={cx} y={cy - L.fs(4)} fontSize={L.fs(26)} fontWeight={700} fill={L.theme.text} textAnchor="middle" letterSpacing="-0.4">
        {formatNumber(total, true)}
      </text>,
      <text key="dl" x={cx} y={cy + L.fs(18)} fontSize={L.fs(12.5)} fill={L.theme.subtext} textAnchor="middle">
        Total
      </text>,
    );
  }
  return <g>{els}</g>;
}

function EmptyPlot({ L }: { L: Layout }) {
  return (
    <text
      x={L.plot.x + L.plot.w / 2}
      y={L.plot.y + L.plot.h / 2}
      fontSize={L.fs(15)}
      fill={L.theme.subtext}
      textAnchor="middle"
    >
      Add some data to see your chart
    </text>
  );
}

/* ---------- root ---------- */

export function Chart({ spec }: { spec: ChartSpec }) {
  const L = buildLayout(spec);
  const o = spec.options;
  let body: React.ReactElement;
  switch (spec.type) {
    case "bar":
      body = <BarChart spec={spec} L={L} horizontal={false} />;
      break;
    case "bar-horizontal":
      body = <BarChart spec={spec} L={L} horizontal={true} />;
      break;
    case "line":
      body = <LineAreaChart spec={spec} L={L} area={false} />;
      break;
    case "area":
      body = <LineAreaChart spec={spec} L={L} area={true} />;
      break;
    case "pie":
      body = <PieChart spec={spec} L={L} donut={false} />;
      break;
    case "donut":
      body = <PieChart spec={spec} L={L} donut={true} />;
      break;
    case "scatter":
      body = <ScatterChart spec={spec} L={L} />;
      break;
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${L.w} ${L.h}`}
      width={L.w}
      height={L.h}
      fontFamily={FONT_STACK}
      style={{ display: "block", width: "100%", height: "auto" }}
      role="img"
      aria-label={o.title || "Chart"}
    >
      {L.theme.fill !== "none" && <rect x={0} y={0} width={L.w} height={L.h} fill={L.theme.fill} rx={0} />}
      <Header spec={spec} L={L} />
      {o.legend === "top" && <Legend L={L} at="top" />}
      {body}
      {o.legend === "bottom" && <Legend L={L} at="bottom" />}
      {o.watermark && <Watermark L={L} />}
    </svg>
  );
}
