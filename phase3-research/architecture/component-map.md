# Component Map & Architecture Blueprint for Phase 3

**Document Version:** 1.0.0  
**Researcher:** Principal Technical Architecture Analyst, Senior Component Architect  
**Location:** [`phase3-research/architecture/component-map.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/architecture/component-map.md)  

---

## 1. Full Component Hierarchy Tree

```
components/workspace/
├── [PRESERVED PHASE 2 COMPONENTS]
│   ├── workspace-shell.tsx         # Sidebar, breadcrumbs, context providers
│   ├── selector.tsx                # Workspace & project combobox
│   ├── project-collection.tsx      # Multi-project grid/list & search
│   ├── project-card.tsx            # Project cards & rows
│   ├── project-detail.tsx          # Extended to host AnalyticsDashboard
│   ├── project-visuals.tsx         # Enhanced with interactive incident badges
│   ├── create-project.tsx          # Native dialog for local demo projects
│   └── dialog.ts                   # Accessible focus-trapping helper
│
└── analytics/                      # [NEW PHASE 3 DIRECTORY]
    ├── analytics-dashboard.tsx     # Master observability container
    ├── time-range-toolbar.tsx      # Time window, auto-granularity & comparison controls
    ├── metric-cards-grid.tsx       # 6-card KPI grid with active selection state
    ├── metric-card.tsx             # Single KPI card with value, delta, and sparkline
    ├── service-telemetry-table.tsx # Dense operational service breakdown table
    ├── service-detail-drawer.tsx   # Slide-out drawer for service inspection
    ├── incident-register.tsx       # Incident list with severity badges & filters
    ├── incident-drawer.tsx         # Slide-out quick-inspection drawer for incidents
    │
    ├── charts/                     # [CUSTOM SVG CHART ENGINE]
    │   ├── svg-time-series.tsx     # Hero multi-line chart with hairline grid & pins
    │   ├── svg-breakdown-chart.tsx # Secondary service latency & status distribution
    │   ├── chart-tooltip.tsx       # Floating high-density paper tooltip card
    │   └── use-chart-cursor.ts     # Shared crosshair cursor synchronization hook
    │
    └── investigation/              # [AI INCIDENT INTELLIGENCE CONSOLE]
        ├── investigation-console.tsx# Master AI diagnostic screen
        ├── hypothesis-card.tsx     # Structured hypothesis panel with citations
        ├── evidence-explorer.tsx   # Tabbed viewer for logs, traces, and metrics
        ├── trace-waterfall.tsx     # OpenTelemetry-style span waterfall graphic
        └── remediation-actions.tsx # Human-in-the-loop action proposals & demo modals
```

---

## 2. Component Specifications & Prop Contracts

### 2.1 `AnalyticsDashboard`
* **File**: `components/workspace/analytics/analytics-dashboard.tsx`
* **Role**: Primary container orchestrating temporal state, fetching synthetic analytics, and managing active metric selection.
* **Props**:
  ```typescript
  export type AnalyticsDashboardProps = {
    project: Project;
  };
  ```
* **Internal State**:
  - `range`: `TimeRangePreset` (default: `"24h"`).
  - `comparison`: `ComparisonBaseline` (default: `"previous_period"`).
  - `activeMetricKey`: `"latency_p95"` | `"throughput"` | `"error_rate"` | `"availability"` (default: `"latency_p95"`).
  - `selectedServiceId`: string | null.
  - `activeIncidentId`: string | null (controls slide-out drawer).

### 2.2 `SvgTimeSeries`
* **File**: `components/workspace/analytics/charts/svg-time-series.tsx`
* **Role**: Renders the hero technical time series using native React 19 SVG elements.
* **Props**:
  ```typescript
  export type SvgTimeSeriesProps = {
    activeSeries: TimeSeriesPoint[];
    comparisonSeries: TimeSeriesPoint[];
    metricKey: keyof TimeSeriesPoint;
    metricLabel: string;
    unit: string;
    incidentPins?: Array<{ timestamp: number; incidentId: string; title: string }>;
    onSelectIncident?: (incidentId: string) => void;
  };
  ```

### 2.3 `InvestigationConsole`
* **File**: `components/workspace/analytics/investigation/investigation-console.tsx`
* **Role**: Full-screen diagnostic view displaying ranked hypotheses, interactive evidence explorer, and safe human remediation controls.
* **Props**:
  ```typescript
  export type InvestigationConsoleProps = {
    project: Project;
    incidentId: string;
  };
  ```
