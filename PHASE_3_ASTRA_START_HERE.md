# Phase 3 Implementation Brief — Stripe-Inspired Observability & Incident Intelligence

**Target Agent:** GPT Astra  
**Role:** Senior Frontend Implementation Specialist & Data Visualization Engineer  
**Mission:** Build the final operational observability console and AI incident investigation interface for AegisOps, integrating Stripe-inspired analytics ergonomics into the approved Heron architectural design system.  
**Package Status:** **COMPLETE & VERIFIED** (All research, official screenshots, contact sheets, component maps, and data contracts prepared).  
**Primary Reference Index:** [`phase3-research/evidence-index.md`](phase3-research/evidence-index.md)  
**Acceptance Criteria:** [`phase3-research/UX_ACCEPTANCE_CHECKLIST.md`](phase3-research/UX_ACCEPTANCE_CHECKLIST.md)  

---

## 1. What Phase 3 Is Building

In Phase 2, you built the multi-project workspace shell. In this final phase, you will transform the static project detail page (`/projects/[workspaceId]/[projectId]`) into a **high-density, interactive operational observability console** with an **evidence-backed AI incident investigation experience**.

You are adapting **Stripe's high-density dashboard analytics, dual-series comparisons, crosshairs, and slide-out detail drawers**, while clothing the entire interface in AegisOps's user-approved **Heron architectural drafting identity** (warm paper `#e0e0da`, solid charcoal ink `#282828`, hairline grid rules `#b3b3af`, and alert-restricted red `#fa3600`).

---

## 2. Invariants: What Must Remain Untouched

> [!CAUTION]
> **Preservation Guarantee**: Do not break or refactor the approved marketing and workspace subsystems:
> - **Marketing Pages**: Homepage (`/`) and Showcase (`/heron-dashboard`) must remain 100% untouched.
> - **Root Engine**: Lenis smooth scroll ticker and canvas cursor in [`components/site-shell.tsx`](components/site-shell.tsx) must be reused without competing animation loops.
> - **Project Store**: Do **not** create a second store or modify [`lib/demo/store.ts`](lib/demo/store.ts). Telemetry queries must use read-only adapters keyed to project IDs.
> - **Automated Tests**: All 58 existing tests in `tests/experience.spec.ts`, `tests/motion.spec.ts`, and `tests/projects.spec.ts` must continue to pass without modification. Add Phase 3 tests in `tests/analytics.spec.ts`.

---

## 3. Recommended Routes & Layout Integration

Implement the **hybrid console with deep investigation route** ([spec](phase3-research/architecture/routing-and-navigation.md)):

```
app/projects/[workspaceId]/[projectId]/
├── page.tsx                           # Main Observability Console (#overview, #analytics, #services, #incidents)
└── incidents/
    └── [incidentId]/
        └── page.tsx                   # Dedicated Deep-Dive AI Investigation Console
```

### Tab Strip Extension ([`components/workspace/project-detail.tsx`](components/workspace/project-detail.tsx)):
Extend the project section navigation tabs to 4 items:
```html
<nav class="ws-project-tabs" aria-label="Project sections">
  <Link href="#overview">Overview <span>01</span></Link>
  <Link href="#analytics">Analytics <span>02</span></Link>
  <Link href="#services">Services <span>03</span></Link>
  <Link href="#incidents">Incidents & Intelligence <span>01</span></Link>
</nav>
```
Anchor clicks scroll smoothly via Lenis without triggering the full-page transition curtain.

---

## 4. Key Stripe Patterns Adapted for AegisOps

Our reverse-engineering of official Stripe dashboard and reports assets ([research report](phase3-research/stripe/analytics-information-architecture.md), [contact sheet](phase3-research/screenshots/contact-sheets/contact-sheet-stripe-analytics-overview.png)) identified core patterns for adaptation:

1. **Top KPI Summary Cards**:
   - 6 cards: *Throughput (`req/s`)*, *Error Rate (`%`)*, *p95 Latency (`ms`)*, *p99 Latency (`ms`)*, *Availability / SLI (`%`)*, *Active Incidents (`count`)*.
   - Each card displays current value, prior-period delta (`+14.2%`), inline sparkline, and anomaly alert pills.
   - **Interactive Selection**: Clicking a card switches the hero chart to plot that specific metric!
2. **Hero Time-Series Visualization**:
   - Prominent synchronized line chart plotting the active window against historical baseline.
   - **Active Window**: Solid stroke (`2px` ink `#282828`).
   - **Comparison Baseline**: Dashed hairline (`1px` `#8a8a84`, `stroke-dasharray: 4 4`).
3. **Crosshair & Tooltip Mechanics**:
   - Vertical crosshair ruler snaps magnetically to the nearest time bucket along the x-axis.
   - Synchronized cursor tracks across hero chart and secondary breakdown charts simultaneously.
   - Tooltip card displays exact timestamp, active value, baseline value, and percentage delta.
4. **Time-Range Toolbar**:
   - 3 coordinated selectors: **Range Preset** (`15m`, `1h`, `6h`, `24h` default, `7d`, `30d`), **Granularity** (auto-rounded 10s to 6h), and **Comparison** (`vs Previous Period`).
   - Clearly labeled fixed scenario clock: `FIXED DEMO CLOCK: 14 OCT 2026 · 09:30 UTC`.
5. **Slide-Out Detail Drawers**:
   - Clicking a service or incident opens an accessible slide-out drawer (`width: 520px` desktop, full sheet mobile) for quick inspection without losing workspace context.
6. **Operational Data Tables**:
   - Monospace tabular layout with right-aligned quantities, faceted filters, and CSV export.

---

## 5. Chart Library Decision: Lightweight Custom SVG

> [!IMPORTANT]
> **Primary Decision**: Build charts using **Native React 19 Custom SVG** ([evaluation](phase3-research/technical/chart-library-decision.md)).
> - **Zero Dependencies**: Avoids installing Recharts (which has severe React 19 peer-dependency warnings) or ECharts (600KB canvas overhead).
> - **Heron Drafting Aesthetics**: Uses SVG `<path>` and `<line>` elements styled directly via CSS custom properties (`var(--ink)`, `var(--rule)`).
> - **Bundle Impact**: $< 8\text{ KB}$ of clean TypeScript code.
> - **Mathematical Projection**: Use the pure linear projection formula specified in [`phase3-research/technical/chart-library-decision.md`](phase3-research/technical/chart-library-decision.md#41-coordinate-normalization-logic).

---

## 6. Telemetry Semantics & Invariants

Astra must strictly follow the mathematical definitions in [`phase3-research/observability/metric-definitions.md`](phase3-research/observability/metric-definitions.md):

1. **Throughput**: Unit is strictly `req/s` ($\Delta \text{Requests} / \Delta t$).
2. **Error Rate**: Unit is `%`. Weighted sum required: $\frac{\sum \text{Errors}}{\sum \text{Requests}} \times 100\%$. Never average interval percentages directly!
3. **Latency Percentiles**: Measured in `ms`. **Never average p95 series to obtain an overall p95!** Percentiles are non-linear order statistics.
4. **Availability**: Defined as **Request-Based Success SLI** (`%`), not claimed as probe uptime.
5. **Health Aggregation**: Project health equals the worst-of rule: `critical` if any P1 incident, else `degraded` if any degraded service or P2 incident, else `healthy`.
6. **Data Invariants**: Adhere to the Seven Golden Invariants in [`phase3-research/data/data-consistency-rules.md`](phase3-research/data/data-consistency-rules.md).

---

## 7. The Demonstration Scenario: Payment Gateway

The centerpiece demonstration uses **Northstar Engineering / Payment Gateway** (`northstar/payment-gateway`) ([detailed scenario spec](phase3-research/data/demo-scenario-spec.md)):

* **Scenario Anchor**: `2026-10-14T09:30:00Z` (Incident active for 4 minutes).
* **Incident**: `INC-2026-1014-01` (Severity: `P1 - DEGRADED`).
* **Title**: *Settlement queue backlog and worker thread starvation*.
* **Causal Trail**:
  - `08:00 - 09:12 UTC`: Normal baseline (`p95: 45ms`, `err: 0.08%`, `queue: 65 msgs`).
  - `09:12 UTC`: Deployment `EV-CHG-012` (Release v2.14.0 enables batching size 50).
  - `09:18 - 09:24 UTC`: Write-lock contention on `settlement_records` table starves worker threads; queue depth swells.
  - `09:26 UTC`: Alert triggers (`queue_depth > 1000 for 5m`); Incident `INC-01` opens; p95 latency spikes to `482ms`; Queue Worker p95 hits `680ms`; error rate climbs to `3.42%`.
  - `09:26:30 UTC`: AI Investigation `INV-8042` dispatches and gathers 4 evidence records.
  - `09:30 UTC`: Scenario pauses for user triage.

---

## 8. AI Investigation Experience (Not a Chatbot!)

AegisOps rejects generic conversational chat sidecars in favor of a **structured, evidence-backed diagnostic console** ([spec](phase3-research/aegisops/investigation-experience-spec.md)):

1. **Hypothesis Cards**:
   - Primary: *Database write-lock contention starving worker threads* ([HYP-01], High Certainty).
   - Secondary: *RabbitMQ prefetch misconfiguration* ([HYP-02], Low Certainty / Deprioritized).
   - Includes: Supporting citations, negative proof / contradictory signals, and identified unknowns.
2. **Evidence Explorer** ([spec](phase3-research/aegisops/evidence-presentation-spec.md)):
   - 4 Tabs: **Logs** (`EV-LOG-401`), **Traces** (`EV-TRC-882`), **Metrics** (`EV-MET-104`), **Changes** (`EV-CHG-012`).
   - **Bidirectional Linking**: Clicking `[EV-LOG-401]` in a hypothesis switches to the Logs tab and highlights the cited log row with a 200ms pulse.
3. **Safe Human-in-the-Loop Actions**:
   - `Review Active Locks Query ↗`: Opens SQL modal.
   - `Simulate Worker Pod Scaling ↗`: Safe frontend state simulation.
   - `Production Rollback [Disabled ⊘]`: Disabled button with safety tooltip.

---

## 9. Edge-Case States to Implement

Ensure honest handling across the 18 states specified in [`phase3-research/aegisops/ux-state-inventory.md`](phase3-research/aegisops/ux-state-inventory.md):
- **`portfolio-api`**: Disconnected collector notice; zero mock lines.
- **`inventory`**: Ingestion pending blueprint notice.
- **User-Created Projects (`local-...`)**: Educational empty state: *"Local demo project. No live connection. Open Northstar Payment Gateway for scenario."*

---

## 10. Motion & Responsive Requirements

* **Motion** ([spec](phase3-research/design/analytics-motion-spec.md)):
  - Initial chart mount: `250ms` GSAP `strokeDashoffset` reveal.
  - Time-range switch: `150ms` opacity cross-fade (never redraw from zero baseline).
  - Slide-out drawers: `200ms` cubic-bezier slide from right.
  - `prefers-reduced-motion`: All durations collapse to `0ms`.
  - **Zero Idle Loops**: Never run continuous ticker animations while idle.
* **Responsive** ([spec](phase3-research/design/responsive-analytics-spec.md)):
  - Must remain pixel-perfect across all 7 required viewports (1920×1080 to 375×812).
  - Metric cards reflow from 6 columns $\rightarrow$ 3 columns $\rightarrow$ 2 columns $\rightarrow$ 1 column.
  - Service table on mobile: horizontal scroll with sticky first column (`Service Name`).
  - Zero accidental horizontal body scroll.

---

## 11. Step-by-Step Implementation Sequence

Execute implementation in three disciplined tiers:

### **Tier P0 — Essential Observability Console (Complete First)**
1. Create `lib/demo/telemetry/` with data contracts (`analytics-contract.ts`, `telemetry-fixtures.ts`, `telemetry-adapter.ts`).
2. Build custom SVG components in `components/workspace/analytics/charts/` (`svg-time-series.tsx`, `chart-tooltip.tsx`, `use-chart-cursor.ts`).
3. Build `time-range-toolbar.tsx` with presets, auto-rounding, and comparison toggles.
4. Build `metric-cards-grid.tsx` with 6 interactive KPI cards.
5. Build `service-telemetry-table.tsx` with 7 columns and status pills.
6. Connect `AnalyticsDashboard` into `components/workspace/project-detail.tsx` under `#analytics`.
7. Verify responsive reflow and zero regression on existing tests.

### **Tier P1 — Incident Register & AI Investigation Console**
1. Create `lib/demo/telemetry/investigation-contract.ts` and `investigation-adapter.ts` with scenario fixtures.
2. Build `incident-register.tsx` and slide-out `incident-drawer.tsx`.
3. Create dedicated deep route `app/projects/[workspaceId]/[projectId]/incidents/[incidentId]/page.tsx`.
4. Build `investigation-console.tsx`, `hypothesis-card.tsx`, and `evidence-explorer.tsx` (Logs, Trace Waterfall, Metrics, Deployments).
5. Wire bidirectional citation clicking (`[EV-LOG-401]` $\rightarrow$ Evidence tab pulse).
6. Implement human-in-the-loop action modals (SQL query review, pod scaling simulation).

### **Tier P2 — Polish & Automated Playwright QA**
1. Add interactive incident pins on the hero chart time-axis.
2. Build `tests/analytics.spec.ts` covering metric switching, range reactivity, crosshairs, incident drawers, and evidence jumping.
3. Verify all 7 viewports and reduced-motion mode.
4. Run full suite: `npm run typecheck`, `npm run lint`, `npm run build`, and `npm test`.

---

## 12. Direct Reference Links

- **Audit & Invariants**: [`phase3-research/existing-frontend-audit.md`](phase3-research/existing-frontend-audit.md)
- **Stripe Architecture**: [`phase3-research/stripe/analytics-information-architecture.md`](phase3-research/stripe/analytics-information-architecture.md)
- **AegisOps 5-Level IA**: [`phase3-research/aegisops/analytics-information-architecture.md`](phase3-research/aegisops/analytics-information-architecture.md)
- **Main Overview Spec**: [`phase3-research/aegisops/analytics-overview-spec.md`](phase3-research/aegisops/analytics-overview-spec.md)
- **Metric Formulas**: [`phase3-research/observability/metric-definitions.md`](phase3-research/observability/metric-definitions.md)
- **Temporal Controls**: [`phase3-research/aegisops/time-range-and-filter-spec.md`](phase3-research/aegisops/time-range-and-filter-spec.md)
- **Chart Tech Decision**: [`phase3-research/technical/chart-library-decision.md`](phase3-research/technical/chart-library-decision.md)
- **Chart Interactions**: [`phase3-research/aegisops/chart-interaction-spec.md`](phase3-research/aegisops/chart-interaction-spec.md)
- **Service Telemetry**: [`phase3-research/aegisops/service-analytics-spec.md`](phase3-research/aegisops/service-analytics-spec.md)
- **Incident Specs**: [`phase3-research/aegisops/incident-list-spec.md`](phase3-research/aegisops/incident-list-spec.md) & [`incident-detail-spec.md`](phase3-research/aegisops/incident-detail-spec.md)
- **AI Investigation**: [`phase3-research/aegisops/investigation-experience-spec.md`](phase3-research/aegisops/investigation-experience-spec.md) & [`evidence-presentation-spec.md`](phase3-research/aegisops/evidence-presentation-spec.md)
- **Scenario & Invariants**: [`phase3-research/data/demo-scenario-spec.md`](phase3-research/data/demo-scenario-spec.md) & [`data-consistency-rules.md`](phase3-research/data/data-consistency-rules.md)
- **Data Contracts**: [`phase3-research/data/analytics-contract.md`](phase3-research/data/analytics-contract.md) & [`investigation-contract.md`](phase3-research/data/investigation-contract.md)
- **Mock Algorithms**: [`phase3-research/data/mock-data-generation-guidance.md`](phase3-research/data/mock-data-generation-guidance.md)
- **Routing & Components**: [`phase3-research/architecture/routing-and-navigation.md`](phase3-research/architecture/routing-and-navigation.md) & [`component-map.md`](phase3-research/architecture/component-map.md)
- **Design & Motion**: [`phase3-research/design/stripe-to-aegisops-visual-system.md`](phase3-research/design/stripe-to-aegisops-visual-system.md), [`analytics-motion-spec.md`](phase3-research/design/analytics-motion-spec.md), [`responsive-analytics-spec.md`](phase3-research/design/responsive-analytics-spec.md)
- **UX States**: [`phase3-research/aegisops/ux-state-inventory.md`](phase3-research/aegisops/ux-state-inventory.md)
- **Visual Evidence Index**: [`phase3-research/evidence-index.md`](phase3-research/evidence-index.md)
- **Contact Sheets**: [`contact-sheet-stripe-analytics-overview.png`](phase3-research/screenshots/contact-sheets/contact-sheet-stripe-analytics-overview.png), [`contact-sheet-stripe-reports-and-tables.png`](phase3-research/screenshots/contact-sheets/contact-sheet-stripe-reports-and-tables.png)
- **QA Checklist**: [`phase3-research/UX_ACCEPTANCE_CHECKLIST.md`](phase3-research/UX_ACCEPTANCE_CHECKLIST.md)
