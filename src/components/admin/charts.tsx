"use client";

import Link from "next/link";
import { useState } from "react";

// Dashboard charts. One series each, so no legend: the card title names it.
// Mark colour validated against the white card (dataviz validator: lightness,
// chroma and 3:1 contrast pass). Text stays in ink/graphite, never the mark colour.
const MARK = "#b07a3c";

type DayValue = { day: string; value: number };

const fmtDay = (day: string, opts: Intl.DateTimeFormatOptions) => new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });

/** Round the axis top up to a clean number. */
function niceMax(v: number) {
  if (v <= 4) return Math.max(1, v);
  const pow = 10 ** Math.floor(Math.log10(v));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => v <= s * 4) ?? pow * 10;
  return Math.ceil(v / step) * step;
}

/** Last-30-days column chart with a hover tooltip per day. */
export function DailyBars({ title, data, unit }: { title: string; data: DayValue[]; unit: [string, string] }) {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((n, d) => n + d.value, 0);
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const peak = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const noun = (n: number) => (n === 1 ? unit[0] : unit[1]);

  return (
    <section className="rounded-lg border border-black/5 bg-white p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-medium">{title}</h2>
        <p className="text-sm text-graphite">
          <span className="text-lg font-semibold tabular-nums text-ink">{total.toLocaleString("en-GB")}</span> in 30 days
        </p>
      </div>

      <div className="relative mt-6 flex gap-3" aria-hidden="true">
        {/* Y axis: 0, half, top */}
        <div className="flex h-36 flex-col justify-between text-right text-[0.65rem] tabular-nums text-graphite">
          <span>{max.toLocaleString("en-GB")}</span>
          <span>{max / 2 >= 1 ? (max / 2).toLocaleString("en-GB") : ""}</span>
          <span>0</span>
        </div>
        <div className="relative h-36 flex-1">
          {[0, 50, 100].map((p) => (
            <div key={p} className="absolute inset-x-0 h-px bg-black/[0.07]" style={{ bottom: `${p}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {data.map((d, i) => (
              <div
                key={d.day}
                className="relative flex h-full flex-1 cursor-default items-end justify-center"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <div
                  className="w-full max-w-6 rounded-t-[4px] transition-opacity"
                  style={{ height: `${(d.value / max) * 100}%`, background: MARK, opacity: hover === null || hover === i ? 1 : 0.45 }}
                />
                {/* The one direct label: the busiest day. */}
                {i === peak && d.value > 0 && hover === null && (
                  <span className="absolute text-[0.65rem] tabular-nums text-ink" style={{ bottom: `calc(${(d.value / max) * 100}% + 4px)` }}>
                    {d.value}
                  </span>
                )}
              </div>
            ))}
          </div>
          {hover !== null && (
            <div
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-black/10 bg-white px-2.5 py-1.5 text-xs shadow-md"
              style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}
            >
              <p className="text-graphite">{fmtDay(data[hover].day, { weekday: "short", day: "numeric", month: "short" })}</p>
              <p className="font-medium tabular-nums">
                {data[hover].value} {noun(data[hover].value)}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="ml-8 mt-2 flex justify-between text-[0.65rem] text-graphite" aria-hidden="true">
        <span>{fmtDay(data[0].day, { day: "numeric", month: "short" })}</span>
        <span>{fmtDay(data[Math.floor(data.length / 2)].day, { day: "numeric", month: "short" })}</span>
        <span>Today</span>
      </div>

      <table className="sr-only">
        <caption>{title}, last 30 days</caption>
        <thead>
          <tr><th>Day</th><th>{unit[1]}</th></tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}><td>{d.day}</td><td>{d.value}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/** Most viewed projects: horizontal bars, value at the tip. */
export function TopList({ title, rows, empty }: { title: string; rows: { title: string; href: string; views: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.views));
  return (
    <section className="rounded-lg border border-black/5 bg-white p-5">
      <h2 className="font-medium">{title}</h2>
      {rows.length ? (
        <ol className="mt-4 space-y-3">
          {rows.map((r) => (
            <li key={r.href} className="text-sm">
              <Link href={r.href} className="hover:underline">{r.title}</Link>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2.5 rounded-r-[4px]" style={{ width: `${(r.views / max) * 85}%`, background: MARK }} />
                <span className="text-xs tabular-nums text-graphite">{r.views.toLocaleString("en-GB")}</span>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-graphite">{empty}</p>
      )}
    </section>
  );
}
