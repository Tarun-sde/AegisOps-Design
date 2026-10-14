# Phase 3 UX & Technical Acceptance Checklist

**Document Version:** 1.0.0  
**Researcher:** Principal Quality Engineer, Senior Observability UX Designer  
**Target:** Final Verification Criteria for GPT Astra Implementation  
**Location:** [`phase3-research/UX_ACCEPTANCE_CHECKLIST.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/UX_ACCEPTANCE_CHECKLIST.md)  

---

## 1. Visual & Design System Invariants

- [ ] **Paper & Ink Tokens Preserved**:
  - Background is warm technical parchment `--paper` (`#e0e0da`).
  - Elevated surfaces use `--ws-soft` (`color-mix(in srgb, var(--paper), white 18%)`).
  - Headings and primary metrics use high-contrast solid charcoal `--ink` (`#282828`).
  - Grid dividers and borders use crisp hairline rule `--rule` (`#b3b3af`).
  - Alert red `--red` (`#fa3600`) is strictly restricted to P1 incidents, active anomalies, and form validation errors.
- [ ] **No Stripe Branding Leaks**: Zero copy of Stripe's royal blues, indigo gradients, or financial terminology.
- [ ] **Architectural Geometry**: All cards, inputs, buttons, and drawers maintain crisp `0px` border-radius drafting styling.
- [ ] **Typography**: Headings use `Inter Variable`; all metadata, timestamps, units, incident IDs, and tabular numbers use `Geist Mono Variable`.

---

## 2. Mathematical & Telemetry Integrity

- [ ] **Throughput Unit**: Displayed strictly in `req/s` (or `qps` for databases).
- [ ] **Error Rate Definition**: Numerator is 5xx + timeouts; denominator is all requests; weighted sum used across intervals.
- [ ] **Percentile Integrity**: Latency percentiles (`p50`, `p95`, `p99`) are **never** averaged arithmetically across buckets.
- [ ] **SLI / Availability Definition**: Expressed as request-based success SLI (`%`), not claimed as probe uptime.
- [ ] **Scenario Clock Anchor**: Demo clock anchored deterministically at `2026-10-14T09:30:00Z`.
- [ ] **Zero Live Ticking Simulation**: No `setInterval` generating fake live numbers.

---

## 3. Interactive Chart & Crosshair Controls

- [ ] **Dual-Series Plotting**:
  - Active time window plotted as solid stroke (`stroke-width: 2px`).
  - Comparison baseline plotted as dashed hairline (`stroke-width: 1px`, `stroke-dasharray: 4 4`).
- [ ] **Crosshair Snapping**: Vertical ruler snaps magnetically to nearest temporal bucket without lag.
- [ ] **Synchronized Tracking**: Hovering over the hero chart simultaneously positions tracking lines on supporting breakdown charts.
- [ ] **Tooltip Card**:
  - Displays exact timestamp, active value, baseline value, and percentage delta.
  - Flips to left if crosshair $x > 75\%$ of chart width.
- [ ] **Incident Pins**: Alert pins appear along the x-axis at incident onset (`09:26 UTC`). Clicking pin opens the incident drawer.

---

## 4. Time-Range & Granularity Toolbar

- [ ] **Supported Presets**: `15m`, `1h`, `6h`, `24h` (default), `7d`, `30d`.
- [ ] **Auto-Granularity**:
  - `15m` $\rightarrow$ 10s buckets
  - `1h` $\rightarrow$ 1m buckets
  - `6h` $\rightarrow$ 5m buckets
  - `24h` $\rightarrow$ 15m buckets
  - `7d` $\rightarrow$ 1h buckets
  - `30d` $\rightarrow$ 6h buckets
- [ ] **Temporal Reactivity**: Changing range recomputes chart domain, plotted points, KPI summaries, and comparison deltas smoothly in 150ms without page reload.

---

## 5. Service Analytics & Breakdown Table

- [ ] **Table Density**: 7 columns (`Service Name`, `Stack`, `Status`, `Throughput`, `Error Rate`, `p95 Latency`, `Incidents`).
- [ ] **Tabular Alignment**: All numbers right-aligned with `tabular-nums`.
- [ ] **Service Filter**: Search input and status dropdown filter rows instantly.
- [ ] **Service Drawer**: Clicking a row opens the slide-out Service Detail Drawer with telemetry snapshot and dependency connections.
- [ ] **Enhanced Schematic Map**: `<ServiceDrawing>` displays pulsing incident indicator around degraded services.

---

## 6. Incident Management & AI Investigation

- [ ] **Incident Register**: Filterable list of incidents with severity badges (`P1`, `P2`, `P3`, `P4`).
- [ ] **Incident Quick Drawer**: Slide-out panel showing symptom, breach time, active duration, and investigation link.
- [ ] **No Chatbot Window**: Investigation view is a structured, auditable diagnostic console.
- [ ] **Hypothesis Cards**:
  - Single-sentence root-cause assertion.
  - Qualitative certainty badge (`High`, `Moderate`, `Low`).
  - Clickable evidence citations `[EV-...]`.
  - Negative proof / Contradictory evidence.
  - Identified unknowns / Missing telemetry.
- [ ] **Evidence Explorer**:
  - 4 tabs: Logs, Traces, Metrics, Deployments.
  - Clicking `[EV-LOG-401]` in a hypothesis switches to Logs tab and pulses the cited row.
  - Trace waterfall shows span durations and error tags.
  - Metric correlation displays dual-signal graph.
- [ ] **Human-in-the-Loop Actions**:
  - Action 1: Review SQL query (modal code view).
  - Action 2: Simulate replica scaling (safe frontend state change).
  - Action 3: Staging rollback (clearly disabled demonstration button).

---

## 7. Edge Cases & UX States

- [ ] **Connected Healthy (`ironlog`)**: Full normal charts; empty incident banner.
- [ ] **Connected Degraded (`payment-gateway`)**: Latency spike; 1 active incident; full investigation scenario.
- [ ] **Critical Incident (`authentication`)**: Error threshold breach; 2 active incidents.
- [ ] **Disconnected Project (`portfolio-api`)**: Explicit collector disconnected banner; zero mock lines.
- [ ] **Pending Project (`inventory`)**: Ingestion pending banner; no fake charts.
- [ ] **Local Demo Projects (`local-...`)**: Honest empty state; no fabricated live telemetry.
- [ ] **Reduced Motion**: Disables SVG line draw and transitions; instant state changes.

---

## 8. Responsive & Technical Quality

- [ ] **Zero Horizontal Overflow**: Body width strictly constrained at all 7 viewport sizes (1920, 1440, 1024, 834, 390, 375).
- [ ] **Sticky Table Column on Mobile**: First column (`Service Name`) stays pinned during horizontal scroll.
- [ ] **Keyboard Accessibility**: Chart crosshair navigable with `ArrowLeft` / `ArrowRight`. Native dialogs trap focus.
- [ ] **Test Invariants**:
  - Phase 1 tests (`tests/experience.spec.ts`, `tests/motion.spec.ts`) continue to pass 100%.
  - Phase 2 tests (`tests/projects.spec.ts`) continue to pass 100%.
  - Phase 3 tests (`tests/analytics.spec.ts`) verify all 6 signals, time ranges, and evidence citations.
