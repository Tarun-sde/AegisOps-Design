"use client";
import { useRef, useState, type PointerEvent } from "react";
import { ElevationDrawing } from "./artwork";
import { ArrowLink } from "./site-shell";
import {
  drawingPoint,
  issues,
  overlaps,
  selectionBox,
  type Point,
} from "@/lib/geometry";

export function Hero() {
  const svg = useRef<SVGSVGElement>(null),
    selection = useRef<SVGRectElement>(null),
    gradient = useRef<SVGLinearGradientElement>(null),
    coords = useRef<HTMLSpanElement>(null);
  const start = useRef<Point | null>(null),
    selected = useRef<number[]>([]);
  const [active, setActive] = useState<number[]>([]);
  const update = (next: number[]) => {
    if (selected.current.join() !== next.join()) {
      selected.current = next;
      setActive(next);
    }
  };
  const point = (event: PointerEvent<SVGSVGElement>) => {
    const rect = svg.current!.getBoundingClientRect();
    return drawingPoint(
      { x: event.clientX, y: event.clientY },
      { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    );
  };
  const move = (event: PointerEvent<SVGSVGElement>) => {
    const current = point(event);
    if (coords.current)
      coords.current.textContent = `X:${Math.round(current.x).toString().padStart(3, "0")} / Y:${Math.round(current.y).toString().padStart(3, "0")}`;
    if (!start.current) return;
    const box = selectionBox(start.current, current);
    for (const [key, value] of Object.entries(box))
      selection.current!.setAttribute(key, String(value));
    selection.current!.style.display = "block";
    gradient.current!.setAttribute(
      "x1",
      current.x >= start.current.x ? "0%" : "100%",
    );
    gradient.current!.setAttribute(
      "x2",
      current.x >= start.current.x ? "100%" : "0%",
    );
    gradient.current!.setAttribute(
      "y1",
      current.y >= start.current.y ? "0%" : "100%",
    );
    gradient.current!.setAttribute(
      "y2",
      current.y >= start.current.y ? "100%" : "0%",
    );
    update(
      issues.flatMap((issue, i) =>
        overlaps(box, {
          x: issue.x - 10,
          y: issue.y - 10,
          width: 20,
          height: 20,
        })
          ? [i]
          : [],
      ),
    );
  };
  const end = (event: PointerEvent<SVGSVGElement>) => {
    start.current = null;
    if (svg.current!.hasPointerCapture(event.pointerId))
      svg.current!.releasePointerCapture(event.pointerId);
    selection.current!.style.display = "none";
  };
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-drawing technical-corners">
        <div className="hero-metadata mono">
          <span>
            FOCUS / AI-POWERED BUILDING CODE COMPLIANCE
            <br />
            BIM & REVIT INTEGRATION
          </span>
          <span ref={coords}>X:000 / Y:000</span>
        </div>
        <svg
          ref={svg}
          className="interactive-elevation"
          viewBox="0 0 1000 620"
          aria-label="Interactive architectural elevation. Drag to inspect issues, or use the inspect all button."
          onPointerDown={(event) => {
            if (
              event.pointerType === "touch" ||
              (event.target as Element).closest('[role="button"]')
            )
              return;
            start.current = point(event);
            svg.current!.setPointerCapture(event.pointerId);
            update([]);
          }}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        >
          <defs>
            <linearGradient ref={gradient} id="hero-selection">
              <stop stopColor="#fa3600" stopOpacity=".32" />
              <stop offset="1" stopColor="#fa3600" stopOpacity=".03" />
            </linearGradient>
          </defs>
          <ElevationDrawing />
          <rect
            ref={selection}
            fill="url(#hero-selection)"
            stroke="#fa3600"
            strokeWidth=".8"
            style={{ display: "none" }}
            pointerEvents="none"
          />
          {issues.map((issue, i) => (
            <g
              key={issue.code}
              className={`issue-marker ${active.includes(i) ? "is-active" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`Inspect ${issue.title}`}
              aria-pressed={active.includes(i)}
              onClick={() =>
                update(
                  active.includes(i)
                    ? active.filter((n) => n !== i)
                    : [...active, i],
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  update(
                    active.includes(i)
                      ? active.filter((n) => n !== i)
                      : [...active, i],
                  );
                }
              }}
            >
              <rect
                className="marker-hit"
                x={issue.x - 20}
                y={issue.y - 20}
                width="40"
                height="40"
                fill="transparent"
              />
              <rect
                className="marker-pin"
                x={issue.x - 4}
                y={issue.y - 4}
                width="8"
                height="8"
              />
              <g className="issue-label" pointerEvents="none">
                <path
                  d={`M${issue.x} ${issue.y}v-24h35`}
                  fill="none"
                  stroke="#fa3600"
                />
                <rect
                  x={issue.x + 28}
                  y={issue.y - 59}
                  width="161"
                  height="37"
                  fill="#fa3600"
                />
                <text x={issue.x + 36} y={issue.y - 45}>
                  {issue.code}
                </text>
                <text x={issue.x + 36} y={issue.y - 31}>
                  {issue.short}
                </text>
              </g>
            </g>
          ))}
        </svg>
        <div className="drawing-toolbar mono">
          <span className="drag-instruction">
            ⌖ &nbsp; CLICK AND DRAG TO SEE VIOLATIONS
          </span>
          <button
            onClick={() =>
              update(active.length === issues.length ? [] : [0, 1, 2])
            }
          >
            {active.length === issues.length
              ? "Clear inspection"
              : "Inspect all issues"}{" "}
            <span>↗</span>
          </button>
          <span>DRAWING A–001 / SOUTH ELEVATION</span>
        </div>
      </div>
      <div className="hero-caption">
        <h1 id="hero-title">
          An AI agent that works <br />
          inside your design tools
        </h1>
        <div className="hero-description">
          <p>
            Heron reviews your model, identifies issues, and proposes solutions.
            Upon approval, it edits automatically. Less busywork. More room for
            design.
          </p>
          <div className="mono hero-benefits">
            <span>+ FASTER ITERATIONS</span>
            <span>+ FEWER MISTAKES</span>
            <span>+ LESS BUSYWORK</span>
          </div>
        </div>
        <ArrowLink />
      </div>
      <p className="sr-only" role="status">
        {active.length
          ? `${active.length} issues selected. ${active.map((i) => issues[i].title).join(". ")}`
          : "No issues selected."}
      </p>
    </section>
  );
}
