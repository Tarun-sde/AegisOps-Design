"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  aggregate,
  formatValue,
  incident,
  metrics,
  timestamp,
  type Bucket,
  type Metric,
} from "@/lib/demo/telemetry/telemetry";
export function TimeSeries({
  buckets,
  previous,
  metric,
  comparison,
  serviceId,
  onIncident,
}: {
  buckets: Bucket[];
  previous: Bucket[];
  metric: Metric;
  comparison: boolean;
  serviceId: string;
  onIncident: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [cursor, setCursor] = useState<number | null>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(200, entry.contentRect.width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useGSAP(
    () => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        gsap.fromTo(
          ".an-series",
          { opacity: 0.35 },
          { opacity: 1, duration: 0.2 },
        );
    },
    { scope: root, dependencies: [metric, buckets], revertOnUpdate: true },
  );
  if (!buckets.length) return <p>No telemetry in this window.</p>;
  const values = buckets.map((b) => aggregate([b], serviceId)[metric]);
  const baselines = previous.map((b) => aggregate([b], serviceId)[metric]);
  const start = buckets[0].start,
    end = buckets.at(-1)!.end;
  const max =
    metric === "sli"
      ? 100
      : Math.max(1, ...values, ...(comparison ? baselines : [])) *
        (metric === "incidents" ? 1 : 1.12);
  const left = width < 420 ? 52 : 70,
    right = width - 18,
    top = 30,
    bottom = 245;
  const x = (time: number) =>
    left + ((time - start) / (end - start)) * (right - left);
  const y = (v: number) => bottom - (v / max) * (bottom - top);
  const path = (series: number[]) =>
    series
      .map((v, i) => `${i ? "L" : "M"}${x(buckets[i].end)},${y(v)}`)
      .join(" ");
  const index = Math.min(cursor ?? buckets.length - 1, buckets.length - 1);
  const active = buckets[index],
    value = values[index],
    baseline = baselines[index];
  const marker =
    incident.startedAt >= start &&
    incident.startedAt <= end &&
    (!serviceId || serviceId === incident.serviceId);
  const updatePointer = (clientX: number, element: SVGSVGElement) => {
    const rect = element.getBoundingClientRect();
    const fraction = Math.max(
      0,
      Math.min(
        1,
        (((clientX - rect.left) * width) / rect.width - left) / (right - left),
      ),
    );
    setCursor(
      Math.max(
        0,
        Math.min(buckets.length - 1, Math.round(fraction * buckets.length) - 1),
      ),
    );
  };
  return (
    <div
      ref={root}
      className="an-chart"
      style={{ "--series": metrics[metric].color } as React.CSSProperties}
    >
      <div className="an-chart-legend">
        <span>
          <i />
          Selected period · {metrics[metric].unit}
        </span>
        {comparison && (
          <span>
            <i className="an-dashed" />
            Previous period · aligned by elapsed time
          </span>
        )}
      </div>
      <svg
        className="an-chart-svg"
        viewBox={`0 0 ${width} 285`}
        role="img"
        aria-label={`${metrics[metric].label} over time. Use the data point slider below for exact values.`}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse" || e.buttons)
            updatePointer(e.clientX, e.currentTarget);
        }}
        onPointerDown={(e) => updatePointer(e.clientX, e.currentTarget)}
      >
        {(metric === "incidents" ? [0, 1] : [0, 0.5, 1]).map((f) => (
          <g key={f}>
            <line
              x1={left}
              x2={right}
              y1={y(max * f)}
              y2={y(max * f)}
              className="an-gridline"
            />
            <text x={left - 10} y={y(max * f) + 5} textAnchor="end">
              {formatValue(metric, max * f)}
            </text>
          </g>
        ))}
        {comparison && (
          <path className="an-series an-previous" d={path(baselines)} />
        )}
        <path className="an-series an-current" d={path(values)} />
        {marker && (
          <line
            x1={x(incident.startedAt)}
            x2={x(incident.startedAt)}
            y1={top}
            y2={bottom}
            className="an-marker-line"
          />
        )}
        <line
          data-testid="crosshair"
          x1={x(active.end)}
          x2={x(active.end)}
          y1={top}
          y2={bottom}
          className="an-crosshair"
        />
        <circle cx={x(active.end)} cy={y(value)} r="4" fill="var(--series)" />
        <text x={left} y="276">
          {end - start >= 86400000
            ? new Date(start).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                timeZone: "UTC",
              })
            : new Date(start).toISOString().slice(11, 16)}
        </text>
        <text x={right} y="276" textAnchor="end">
          {end - start >= 86400000 ? "14 Oct · 09:30" : "09:30 UTC"}
        </text>
      </svg>
      {marker && (
        <div className="an-pin-track">
          <button
            className="an-pin"
            onClick={onIncident}
            style={{
              left: `${Math.min(95, (x(incident.startedAt) / width) * 100)}%`,
            }}
            aria-label="Inspect incident at 09:26 UTC"
          >
            △ P2 <span>09:26</span>
          </button>
        </div>
      )}
      <label className="an-cursor-control">
        Inspect a data point{" "}
        <input
          type="range"
          aria-label="Chart data point"
          min="0"
          max={buckets.length - 1}
          value={index}
          aria-valuetext={`${timestamp(active.end)}: ${formatValue(metric, value)} ${metrics[metric].unit}`}
          onChange={(e) => setCursor(Number(e.target.value))}
        />
      </label>
      <div
        className="an-tooltip"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="chart-tooltip"
      >
        <div>
          <span>Bucket · UTC</span>
          <strong>
            {timestamp(active.start)} →{" "}
            {new Date(active.end).toISOString().slice(11, 19)}
          </strong>
        </div>
        <div>
          <span>Selected period</span>
          <strong>
            {formatValue(metric, value)} {metrics[metric].unit}
          </strong>
        </div>
        {comparison && (
          <div>
            <span>Previous: {timestamp(previous[index].end)}</span>
            <strong>
              {formatValue(metric, baseline)} {metrics[metric].unit}{" "}
              <small>
                (
                {baseline
                  ? `${(((value - baseline) / baseline) * 100).toFixed(1)}% change`
                  : "No relative baseline"}
                )
              </small>
            </strong>
          </div>
        )}
        <p>
          {active.requests.toLocaleString("en-US")} eligible requests ·{" "}
          {active.errors.toLocaleString("en-US")} failures ·{" "}
          {(active.end - active.start) / 1000}s bucket
        </p>
      </div>
      <details className="an-data-table">
        <summary>View chart data as a table</summary>
        <div
          className="an-table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Chart data"
        >
          <table>
            <thead>
              <tr>
                <th>Bucket ending (UTC)</th>
                <th>
                  {metrics[metric].label} ({metrics[metric].unit})
                </th>
                {comparison && (
                  <th>Previous period ({metrics[metric].unit})</th>
                )}
              </tr>
            </thead>
            <tbody>
              {buckets.map((b, i) => (
                <tr key={b.end}>
                  <th>{timestamp(b.end)}</th>
                  <td>{formatValue(metric, values[i])}</td>
                  {comparison && <td>{formatValue(metric, baselines[i])}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
