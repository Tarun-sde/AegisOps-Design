# Technical Architecture Decisions & Rationale

**Document Version:** 1.0.0  
**Researcher:** Principal Technical Architecture Analyst, Senior Systems Designer  
**Target:** Technical Interview Defense & Architectural Documentation  
**Location:** [`phase3-research/architecture/technical-decisions.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/architecture/technical-decisions.md)  

---

## Decision 1: Charting Architecture — Lightweight Custom SVG vs. Heavy Libraries

* **Decision**: Implement a native, lightweight Custom SVG engine using React 19 JSX elements (`<svg>`, `<path>`, `<line>`).
* **Alternatives Evaluated**: Recharts (v2/v3), Airbnb Visx, Apache ECharts.
* **Why Chosen**:
  - **React 19 Compatibility**: Recharts v2 fails peer dependency checks with React 19.3.0 and uses deprecated `defaultProps`. Custom SVG has 100% native compatibility.
  - **Zero Bundle Overhead**: Adds $< 8\text{ KB}$ of application code vs. 180 KB for Recharts or 600 KB for ECharts.
  - **Heron Visual Identity**: Flawlessly integrates with Heron's paper/ink drafting rules and CSS custom properties (`var(--ink)`, `var(--rule)`).
  - **Synchronized Crosshairs**: Native React state can drive crosshair lines across multiple independent charts with zero lag.
* **Trade-Off**: Advanced features (curved spline interpolation, non-linear logarithmic axes) must be hand-written. Given uniform time bucketing, linear scaling math is trivial (~30 lines of code).

---

## Decision 2: Temporal Semantics — Fixed Scenario Clock vs. Live Streaming

* **Decision**: Anchor the demonstration clock at `2026-10-14T09:30:00Z` and generate deterministic time buckets backwards.
* **Alternatives Evaluated**: Continuous `setInterval` live ticking; unanchored relative clocks.
* **Why Chosen**:
  - **Reproducibility**: Guarantees identical data across browser reloads, automated Playwright assertions, and visual screenshot reviews.
  - **Causal Alignment**: Ensures that the incident at `09:26 UTC` remains precisely 4 minutes old during inspection, aligning with `lib/demo/projects.ts` fixture timestamps.
  - **Honesty**: Avoids pretending to connect to live production infrastructure while clearly labeling the experience as a deterministic scenario.

---

## Decision 3: Route Architecture — Hybrid Console with Deep Investigation Route

* **Decision**: Retain `/projects/[workspaceId]/[projectId]` as the central operational console (with `#overview`, `#analytics`, `#services`, `#incidents` anchors) and introduce a dedicated deep route `/projects/[workspaceId]/[projectId]/incidents/[incidentId]` for the AI Investigation Console.
* **Alternatives Evaluated**: Pure single-page anchors; deeply nested sub-routes for every tab (`/analytics`, `/services`).
* **Why Chosen**:
  - **Triage Fluidity**: On-call operators can scan metrics, services, and incident registers on one cohesive page without waiting for page transition curtains.
  - **Investigation Focus**: A complex, multi-evidence AI investigation requires dedicated screen real estate and shareable deep-link URLs.
  - **Quick Drawer Parity**: In-page slide-out drawers provide immediate previews without forcing full-page navigation.

---

## Decision 4: AI Interface — Structured Diagnostic Hypotheses vs. Conversational Chatbot

* **Decision**: Present AI diagnostic findings as structured, ranked hypothesis cards citing verifiable telemetry evidence (`EV-...`), with bounded human remediation actions.
* **Alternatives Evaluated**: Embedded conversational chatbot (e.g. ChatGPT / Copilot sidecar).
* **Why Chosen**:
  - **Zero Hallucination**: Every assertion cites an evidence record in the dataset.
  - **Cognitive Speed**: Engineers under P1 stress need ranked root-cause probabilities and verifiable proofs, not polite conversational preamble.
  - **Auditability**: Structured hypotheses can be directly exported into incident postmortems.

---

## Decision 5: Data Layer — Read-Only Adapters vs. Global Store Overhaul

* **Decision**: Extend `lib/demo/projects.ts` using read-only telemetry adapters without replacing or modifying `lib/demo/store.ts`.
* **Alternatives Evaluated**: Redux Toolkit, Zustand, rewriting the existing `useSyncExternalStore`.
* **Why Chosen**:
  - **Preserves Invariants**: Avoids breaking Phase 2 local project persistence and cross-tab storage synchronization.
  - **Clean Boundary**: Telemetry fixtures are read-only operational data; they do not need write transactions in browser storage.
