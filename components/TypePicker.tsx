"use client";

import React from "react";
import type { ChartType } from "@/lib/types";
import { CHART_TYPE_LABELS } from "@/lib/types";

const ICONS: Record<ChartType, React.ReactElement> = {
  bar: (
    <g>
      <rect x="3" y="10" width="4" height="8" rx="1" />
      <rect x="10" y="5" width="4" height="13" rx="1" />
      <rect x="17" y="8" width="4" height="10" rx="1" />
    </g>
  ),
  "bar-horizontal": (
    <g>
      <rect x="3" y="4" width="15" height="4" rx="1" />
      <rect x="3" y="10" width="10" height="4" rx="1" />
      <rect x="3" y="16" width="18" height="4" rx="1" />
    </g>
  ),
  line: (
    <path
      d="M3 17L8.5 10l4 3.5L21 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  area: (
    <path d="M3 18V13l5.5-5 4 3L21 6v12H3z" opacity="0.85" />
  ),
  pie: (
    <g>
      <path d="M12 3a9 9 0 1 1-8.6 11.6L12 12V3z" />
      <path d="M10.5 2.6A9 9 0 0 0 2 11.5l8.5 1V2.6z" opacity="0.45" />
    </g>
  ),
  donut: (
    <path
      fillRule="evenodd"
      d="M12 3a9 9 0 1 1-9 9h4a5 5 0 1 0 5-5V3z"
    />
  ),
  scatter: (
    <g>
      <circle cx="6" cy="16" r="2.2" />
      <circle cx="11" cy="9" r="2.2" />
      <circle cx="16" cy="13" r="2.2" />
      <circle cx="19" cy="5" r="2.2" />
    </g>
  ),
};

const ORDER: ChartType[] = ["bar", "bar-horizontal", "line", "area", "pie", "donut", "scatter"];

export function TypePicker({
  value,
  onChange,
}: {
  value: ChartType;
  onChange: (t: ChartType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Chart type">
      {ORDER.map((t) => {
        const active = t === value;
        return (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={active}
            title={CHART_TYPE_LABELS[t]}
            onClick={() => onChange(t)}
            className={`group flex h-9 items-center gap-1.5 rounded-ctrl border px-2.5 transition ${
              active
                ? "border-mint-500 bg-mint-50 text-mint-700"
                : "border-line bg-card text-ink-3 hover:border-line-2 hover:text-ink-2"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current">
              {ICONS[t]}
            </svg>
            <span className="hidden text-[12.5px] font-medium min-[900px]:inline">
              {CHART_TYPE_LABELS[t]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
