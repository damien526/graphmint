"use client";

import React, { useRef } from "react";
import type { ChartData, ChartType } from "@/lib/types";
import { parseDelimited, toNumber } from "@/lib/data";

const MAX_ROWS = 200;
const MAX_SERIES = 8;

export function DataPanel({
  data,
  type,
  onChange,
}: {
  data: ChartData;
  type: ChartType;
  onChange: (d: ChartData) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const radial = type === "pie" || type === "donut";
  const shownSeries = radial ? data.series.slice(0, 1) : data.series;

  const setLabel = (i: number, v: string) => {
    const labels = [...data.labels];
    labels[i] = v;
    onChange({ ...data, labels });
  };

  const setCell = (si: number, i: number, v: string) => {
    const series = data.series.map((s, k) =>
      k === si ? { ...s, values: s.values.map((val, j) => (j === i ? (v.trim() === "" ? null : (toNumber(v) ?? val)) : val)) } : s,
    );
    onChange({ ...data, series });
  };

  const setSeriesName = (si: number, v: string) => {
    const series = data.series.map((s, k) => (k === si ? { ...s, name: v } : s));
    onChange({ ...data, series });
  };

  const addRow = () => {
    if (data.labels.length >= MAX_ROWS) return;
    onChange({
      labels: [...data.labels, ""],
      series: data.series.map((s) => ({ ...s, values: [...s.values, null] })),
    });
  };

  const removeRow = (i: number) => {
    onChange({
      labels: data.labels.filter((_, j) => j !== i),
      series: data.series.map((s) => ({ ...s, values: s.values.filter((_, j) => j !== i) })),
    });
  };

  const addSeries = () => {
    if (data.series.length >= MAX_SERIES) return;
    onChange({
      ...data,
      series: [
        ...data.series,
        { name: `Series ${data.series.length + 1}`, values: data.labels.map(() => null) },
      ],
    });
  };

  const removeSeries = (si: number) => {
    if (data.series.length <= 1) return;
    onChange({ ...data, series: data.series.filter((_, k) => k !== si) });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text/plain");
    if (text && (text.includes("\t") || text.includes("\n"))) {
      const parsed = parseDelimited(text);
      if (parsed) {
        e.preventDefault();
        onChange(parsed);
      }
    }
  };

  const handleFile = async (f: File | undefined) => {
    if (!f) return;
    const parsed = parseDelimited(await f.text());
    if (parsed) onChange(parsed);
  };

  return (
    <div className="flex h-full flex-col" onPaste={handlePaste}>
      <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="h-8 shrink-0 whitespace-nowrap rounded-ctrl border border-line-2 bg-card px-3 text-[12.5px] font-medium text-ink-2 transition hover:border-mint-500 hover:text-mint-700"
        >
          Import CSV
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.tsv,text/csv,text/tab-separated-values"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <p className="text-[11.5px] leading-tight text-ink-3">
          or paste cells straight from Excel / Google&nbsp;Sheets
        </p>
      </div>

      <div className="thin-scroll min-h-0 flex-1 overflow-auto px-2 pb-2">
        <table className="w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-card">
            <tr>
              <th className="w-7" />
              <th className="border-b border-line px-1 pb-1.5 text-left">
                <span className="px-2 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
                  {radial ? "Slice" : "Label"}
                </span>
              </th>
              {shownSeries.map((s, si) => (
                <th key={si} className="border-b border-line px-1 pb-1.5 text-left">
                  <div className="flex items-center gap-0.5">
                    <input
                      value={s.name}
                      onChange={(e) => setSeriesName(si, e.target.value)}
                      placeholder={`Series ${si + 1}`}
                      aria-label={`Series ${si + 1} name`}
                      className="cell-input min-w-0 !py-1 text-[12px] font-semibold"
                    />
                    {!radial && data.series.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSeries(si)}
                        aria-label={`Remove ${s.name || "series"}`}
                        className="mr-1 rounded p-0.5 text-ink-3 opacity-60 transition hover:bg-red-50 hover:text-red-500 hover:opacity-100"
                      >
                        <XIcon />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.labels.map((label, i) => (
              <tr key={i} className="group">
                <td className="w-7 pl-1 text-center">
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => removeRow(i)}
                    aria-label={`Remove row ${i + 1}`}
                    className="rounded p-0.5 text-ink-3 opacity-0 transition group-hover:opacity-60 hover:!opacity-100 hover:bg-red-50 hover:text-red-500"
                  >
                    <XIcon />
                  </button>
                </td>
                <td className="border-b border-line/60 px-1">
                  <input
                    value={label}
                    onChange={(e) => setLabel(i, e.target.value)}
                    placeholder="…"
                    aria-label={`Row ${i + 1} label`}
                    className="cell-input"
                  />
                </td>
                {shownSeries.map((s, si) => (
                  <td key={si} className="border-b border-line/60 px-1">
                    <NumberCell
                      value={s.values[i]}
                      onCommit={(v) => setCell(si, i, v)}
                      aria-label={`${s.name || `Series ${si + 1}`}, row ${i + 1}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-2 px-2 py-2.5">
          <button
            type="button"
            onClick={addRow}
            className="rounded-ctrl px-2 py-1 text-[12.5px] font-medium text-mint-700 transition hover:bg-mint-50"
          >
            + Row
          </button>
          {!radial && (
            <button
              type="button"
              onClick={addSeries}
              className="rounded-ctrl px-2 py-1 text-[12.5px] font-medium text-mint-700 transition hover:bg-mint-50"
            >
              + Series
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Numeric cell that keeps free text while typing and commits parsed numbers. */
function NumberCell({
  value,
  onCommit,
  ...rest
}: {
  value: number | null;
  onCommit: (raw: string) => void;
} & React.AriaAttributes) {
  const [draft, setDraft] = React.useState<string | null>(null);
  return (
    <input
      {...rest}
      inputMode="decimal"
      value={draft ?? (value == null ? "" : String(value))}
      onChange={(e) => {
        setDraft(e.target.value);
        onCommit(e.target.value);
      }}
      onBlur={() => setDraft(null)}
      placeholder="0"
      className="cell-input text-right tabular-nums"
    />
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}
