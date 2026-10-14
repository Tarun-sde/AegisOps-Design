# Stripe Analytics Information Architecture: Reverse Engineering & Observability Adaptation

**Document Version:** 1.0.0  
**Researcher:** Principal Product Research Engineer, Senior Observability UX Designer  
**Verification Date:** October 2026 (Reflecting official Stripe Dashboard, Reports Hub, and Documentation assets)  
**Location:** [`phase3-research/stripe/analytics-information-architecture.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/stripe/analytics-information-architecture.md)  
**Primary Visual Evidence:** [`contact-sheet-stripe-analytics-overview.png`](../screenshots/contact-sheets/contact-sheet-stripe-analytics-overview.png), [`contact-sheet-stripe-reports-and-tables.png`](../screenshots/contact-sheets/contact-sheet-stripe-reports-and-tables.png)  

---

## 1. Executive Summary

Stripe’s dashboard is widely regarded as the gold standard of high-density enterprise data presentation. It manages billions of dollars in transaction flows across millions of merchants by transforming overwhelming numerical streams into clear, actionable summaries.

Our investigation of official Stripe documentation, support resources, and verified screenshots identified a core five-layer information hierarchy:
```
[1. Overview Summary Cards]  --> "How is the system performing right now?"
             ↓
[2. Primary Trend Charts]    --> "What changed over time, how much, and when?"
             ↓
[3. Categorical Breakdowns]  --> "Which specific components or dimensions contributed?"
             ↓
[4. Operational Data Tables] --> "What are the individual records associated with this period?"
             ↓
[5. Detail Drawers & Records]--> "What is the full lifecycle, metadata, and causal trail of this specific event?"
```

This document systematically analyzes each layer, records **what was directly observed in Stripe**, and provides the exact **adaptation recommended for AegisOps**.

---

## 2. The 5-Layer Analytics Hierarchy

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LAYER 1: OVERVIEW SUMMARY METRICS (Top KPIs with delta indicators)                     │
│ [ THROUGHPUT: 1,420 req/s ]  [ ERROR RATE: 2.41% ]  [ P95 LATENCY: 240 ms ]  [ P99 ]  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LAYER 2: PRIMARY TIME-SERIES VISUALIZATION (Synchronized Hero Chart)                   │
│ ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ── Current Period (Solid line)    - - - Comparison Period (Dashed hairline)        │ │
│ │                         [● Hover Crosshair Tooltip: 09:24 UTC | 2.41% vs 0.12%]    │ │
│ └────────────────────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LAYER 3: SUPPORTING BREAKDOWNS (Dimensional Analysis & Secondary Signals)              │
│ ┌───────────────────────────────┐ ┌──────────────────────────────┐ ┌─────────────────┐ │
│ │ Service Latency Contribution  │ │ HTTP Status Code Mix (5xx)   │ │ Incident Overlay│ │
│ └───────────────────────────────┘ └──────────────────────────────┘ └─────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LAYER 4: OPERATIONAL DATA TABLES (Faceted & Filterable Detailed Register)              │
│ [🔍 Filter by Service / Status / Severity]  [Custom Columns ∨]  [Export CSV ↗]          │
│ ┌───────────────┬────────────┬─────────────┬───────────┬──────────────┬──────────────┐ │
│ │ Service Name  │ Status     │ Throughput  │ Error %   │ p95 Latency  │ Active Incs  │ │
│ └───────────────┴────────────┴─────────────┴───────────┴──────────────┴──────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LAYER 5: DETAIL DRAWER & INVESTIGATION TRAIL (Deep Context & Causal Graph)             │
│ Slide-out contextual panel showing log excerpts, span waterfall, and AI hypotheses.   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Pattern Deconstruction

### Pattern 1: Overview Summary Cards (KPI Cards)

#### Observed in Stripe
- Located at the top of the dashboard homepage (`stripe-home-charts.png`).
- Displays primary business figures: **Gross Volume**, **Net Volume from Sales**, **New Customers**, **Top Customers**.
- Each card contains:
  1. Uppercase subdued label (`GROSS VOLUME`).
  2. Large numerical total in prominent bold typeface (`$124,892.00`).
  3. Percentage change vs selected prior period (`+14.2%` with a directional arrow indicator).
  4. Muted secondary label indicating the comparative baseline (`vs prior 7 days`).
  5. Compact inline sparkline showing the micro-trend across the selected range.
- Users can customize which cards appear via an **Edit / Add Widgets** toggle button in the header.

#### Recommended for AegisOps
- Render six standardized operational metric cards in a responsive grid above the hero chart:
  1. `REQUEST THROUGHPUT` (`req/s`)
  2. `ERROR RATE` (`%`)
  3. `P95 LATENCY` (`ms`)
  4. `P99 LATENCY` (`ms`)
  5. `AVAILABILITY / SLI` (`%`)
  6. `ACTIVE INCIDENTS` (`count`)
- Replace financial currency symbols with precise technical units.
- Include directional delta indicators:
  - For Error Rate and Latency, a decrease (`↓ -12%`) is positive (charcoal ink); an increase (`↑ +180%`) is critical (alert red `#fa3600`).
  - For Throughput and Availability, standard directional conventions apply.
- Cards act as **chart view selectors**: clicking a summary card switches the primary hero chart to plot that specific metric!

---

### Pattern 2: Primary Chart Placement & Supporting Charts

#### Observed in Stripe
- One dominant, full-width **Hero Chart** (Gross Volume) anchors the top analytics section.
- Below the hero chart, a 2-column or 3-column grid of smaller, secondary charts displays dimensional breakdowns:
  - *Payment Methods* (horizontal bar distribution).
  - *Dispute Rate* (threshold alert line).
  - *Success Rate by Card Brand* (stacked area / multi-line).
- Supporting charts share the exact same temporal boundary and comparison settings as the hero chart.

#### Recommended for AegisOps
- Maintain a single prominent **Hero Time-Series Chart** (height: 280–340px) focusing on the actively selected signal (e.g. *Request Latency & Error Rate Spikes*).
- Below the hero chart, provide two synchronized supporting breakdown charts (height: 180–200px):
  1. **Service Latency Breakdown**: Multi-line comparison of individual services (`Payment API`, `Queue Worker`, `Database`).
  2. **HTTP Response Code Distribution**: Stacked bar or multi-area breakdown (`2xx`, `4xx`, `5xx`).
- Avoid competing multi-chart noise; all supporting charts must share the active time domain and crosshair position.

---

### Pattern 3: Date Range, Granularity & Comparison Controls

#### Observed in Stripe
- Positioned in a clean horizontal toolbar in the top-right header (`stripe-date-picker.png`, `stripe-comparison-selector.png`).
- Employs **three coordinated dropdown selectors**:
  1. **Date Range Preset**:
     - Presets: *Today, Yesterday, Last 7 days, Last 4 weeks, Last 3 months, Last 12 months, Month to date, Year to date, Custom*.
     - Custom option opens a dual-month calendar picker with start and end date inputs.
  2. **Time Unit / Granularity Selector**:
     - Options: *Hourly, Daily, Weekly, Monthly*.
     - Employs **automatic rounding**: when selecting *Last 24 hours*, the unit defaults to Hourly; when selecting *Last 30 days*, it defaults to Daily. Users can manually override the unit if supported by data density.
  3. **Comparison Range Selector**:
     - Options: *Previous period* (exact duration immediately preceding the start date), *Previous year* (same calendar days in prior year), or *No comparison*.

#### Recommended for AegisOps
- Implement a streamlined operational toolbar with three dropdown triggers styled in Heron technical monospace:
  1. **Time Range**: `15m`, `1h`, `6h`, `24h` (default), `7d`, `30d`, `Custom`.
  2. **Resolution / Granularity**: Automatically computed based on the active range (e.g., `24h` -> `15m` buckets; `1h` -> `1m` buckets; `7d` -> `1h` buckets).
  3. **Comparison Baseline**: `Previous period` (default), `Previous week`, `Disabled`.
- **Fixed Scenario Clock**: Anchor the demonstration clock deterministically at `2026-10-14T09:30:00Z` to guarantee reproducibility across browser refreshes and automated Playwright test runs.

---

### Pattern 4: Chart Tooltip & Crosshair Mechanics

#### Observed in Stripe
- **Crosshair Interaction**: Moving the mouse over the chart canvas reveals a vertical dashed hairline ruler that snaps to the nearest temporal data interval along the x-axis.
- **Dual Series Plotting**:
  - The current period is drawn as a **bold solid line** with a subtle semi-transparent gradient fill.
  - The comparison period is drawn as a **muted dashed/dotted hairline** with zero fill.
- **Tooltip Card**:
  - Floats dynamically above or alongside the crosshair cursor.
  - Displays:
    - Interval timestamp (e.g. `14 Oct, 09:15 - 09:30 UTC`).
    - Current period value with solid bullet: `● $14,250.00`.
    - Comparison period value with dashed bullet: `╌ $11,800.00`.
    - Delta calculation: `+20.7%` in badge formatting.
- Tooltip dismisses instantly upon mouse-leave; keyboard navigation (`ArrowLeft` / `ArrowRight`) moves the crosshair across discrete buckets.

#### Recommended for AegisOps
- Exact reproduction of the vertical crosshair tracking ruler in charcoal ink (`#282828`).
- **Series Semantics**:
  - Active time window: Solid stroke (`stroke-width: 2px`, stroke: `#282828`).
  - Baseline comparison window: Dashed stroke (`stroke-width: 1px`, `stroke-dasharray: 4 4`, stroke: `#8a8a84`).
- **Incident Overlay Pins**: If an incident occurred at that timestamp, render an alert pin (`!`) on the x-axis. Hovering or clicking the pin reveals the incident title and a jump link to the investigation drawer!
- Tooltip uses Heron architectural paper card (`background: #ffffff`, `border: 1px solid #b3b3af`, monospace data rows).

---

### Pattern 5: Operational Data Tables & Faceted Filtering

#### Observed in Stripe
- Tables (`stripe-report-filters.png`, `stripe-filter-popover.png`) prioritize dense, legible scanning.
- **Header Action Bar**:
  - Left: Global table search input + `Filter` dropdown button.
  - Right: `Edit columns` button + `Export` button.
- **Filter Popover**:
  - Multi-condition builder: *Status is [Succeeded ∨]*, *Amount is greater than [$100]*, *Date is after [01/10/2026]*.
  - Applying filters adds removable filter chips (`Status: Succeeded ×`) directly below the toolbar.
- **Table Density Rules**:
  - Numerical values (amounts, counts) are strictly **right-aligned** using tabular numbers.
  - Status indicators use concise colored badges (`Succeeded`, `Failed`, `Refunded`).
  - Hovering a table row reveals a right-aligned action trigger (`···` or `Inspect ↗`).
  - Column boundaries use crisp 1px hairline rules without heavy box shadows.

#### Recommended for AegisOps
- Implement the **Service Telemetry & Incidents Register** using Stripe’s table ergonomics:
  - Columns: `Service Name`, `Health Status`, `Throughput (req/s)`, `Error Rate (%)`, `p95 Latency (ms)`, `Active Incidents`, `Actions`.
  - Right-align all numerical quantities with `font-variant-numeric: tabular-nums`.
  - Provide instant faceted filtering: `Filter by Health` (`Healthy`, `Degraded`, `Critical`), `Filter by Technology`, and text search.
  - Include an `Export Telemetry (CSV)` action that compiles the currently visible dataset.

---

### Pattern 6: Detail Drawer (Slide-Out Side Panel)

#### Observed in Stripe
- Clicking any transaction or record row in a table does not immediately cause a full-page route change.
- Instead, an accessible **Slide-Out Drawer** (width: 480–600px) animates in from the right edge of the viewport.
- Drawer contents:
  - Header: Record ID (`ch_3M4x9...`), status pill, timestamp, and close button (`×` / `Escape`).
  - Timeline view: Step-by-step audit log of the payment (Created → Authorized → Captured → Funds Available).
  - Risk & Fraud analysis: Radar score gauge, risk factors, rules evaluated.
  - Metadata table: Custom key-value pairs.
  - Related actions: "Refund payment", "View customer", "Download receipt".

#### Recommended for AegisOps
- Implement the **Incident & Investigation Quick-Inspector** as a slide-out drawer:
  - Triggered by clicking any incident badge on the chart, an incident row in the table, or a service row.
  - Drawer width: `540px` on desktop; full-width modal sheet on mobile (`< 768px`).
  - Contents:
    1. Incident identifier (`INC-2026-1014-01`) and severity badge (`P1 - DEGRADED`).
    2. Primary symptom: *"Settlement queue exceeded sample threshold (backlog: 1,420 msgs)"*.
    3. Trigger timestamp and active duration.
    4. Causal timeline (signal anomaly → alert fire → incident created → AI investigation started).
    5. Action button: `Open Full AI Investigation Console ↗` (navigating to the dedicated deep-dive view).

---

### Pattern 7: Export & Reporting Action Modals

#### Observed in Stripe
- Clicking `Export` on any analytics or report view opens a focused modal dialog (`stripe-custom-columns.png`).
- Users can:
  - Select the export time range and preferred timezone (`UTC` vs `Account default`).
  - Select column schema: `All columns` vs `Custom columns`.
  - Check/uncheck specific metadata dimensions to include in the CSV.
- Displays an estimate of file size and generation progress.

#### Recommended for AegisOps
- Provide an accessible **Export Telemetry Snapshot** dialog:
  - Exports the active project’s synthetic time-series and incident records as formatted CSV or JSON.
  - Lets users choose time bounds (`Active Range: Last 24 Hours`) and metric series (`Throughput, Latency Percentiles, Error Rate, Service Breakdown`).
  - Purely client-side generation using standard `Blob` and `URL.createObjectURL` (zero server calls, 100% frontend-safe!).

---

## 4. Observed vs. Recommended Matrix

| UI Pattern / Dimension | Observed in Stripe Dashboard | Recommended Adaptation for AegisOps |
| :--- | :--- | :--- |
| **Color System** | Vibrant purple/indigo brand accents (`#635bff`), royal blue links, cyan/emerald charts. | Strict Heron architectural palette: Warm paper `#e0e0da`, solid charcoal ink `#282828`, hairline borders `#b3b3af`, alert red `#fa3600`. |
| **Primary Metric Focus** | Gross Volume, Net Sales, Payouts, New Customers (Financial domain). | Request Throughput, Error Rate, p95/p99 Latency, Availability/SLI, Active Incidents (Observability domain). |
| **Top KPI Summary** | 4 customizable metric cards with inline sparklines and delta percentages. | 6 interactive metric cards; clicking a card switches the primary time-series hero chart. |
| **Hero Visualization** | Single dominant line chart with smooth Bézier curve and gradient area fill. | Crisp architectural line chart with hairline grid lines; solid stroke for active range, dashed for prior period. |
| **Date Selection** | 3 dropdowns: Range Preset, Time Unit (Auto-rounding), Comparison Period. | 3 coordinated selectors: Range (`15m`–`30d`), Resolution (`1m`–`6h`), Comparison (`Prior period`). |
| **Inspection Mechanism** | Crosshair vertical tracking line; dual-value tooltip with delta badge. | Crosshair ruler tracking nearest bucket; incident marker pins on x-axis; dual-value tooltip card. |
| **Record Drill-down** | Clicking table row opens right-side slide-out drawer with event lifecycle. | Clicking incident or service opens slide-out drawer with telemetry trail and AI investigation jump link. |
| **Table Formatting** | High-density tabular layout; right-aligned amounts; faceted filter popover. | Dense monospace table; right-aligned metric values; status pills; instant multi-filter bar. |
| **Data Generation** | Live streaming and asynchronous report worker jobs. | Deterministic synthetic dataset anchored at `2026-10-14T09:30:00Z` scenario clock. |

---

## 5. Visual Evidence References

All referenced captures have been downloaded and verified in [`phase3-research/screenshots/`](../screenshots/):
1. **`stripe-home-charts.png`**: Full dashboard home view showing Gross Volume hero chart and summary KPI widgets.
2. **`stripe-date-picker.png`**: Date picker dropdown with range presets and custom date calendar.
3. **`stripe-comparison-selector.png`**: Comparison range selector showing *Previous period* and *Previous year*.
4. **`stripe-report-filters.png`**: Payments report action bar with Filter and Export triggers.
5. **`stripe-filter-popover.png`**: Multi-condition faceted filter menu.
6. **`stripe-custom-columns.png`**: Report export modal with custom metadata column checkboxes.
7. **`contact-sheet-stripe-analytics-overview.png`**: Composite contact sheet for immediate agent visual reference.
8. **`contact-sheet-stripe-reports-and-tables.png`**: Composite contact sheet for table and export patterns.
