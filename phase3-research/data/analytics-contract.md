# TypeScript Presentation Data Contract: Observability & Analytics

**Document Version:** 1.0.0  
**Researcher:** Principal Technical Architecture Analyst, TypeScript Interface Specialist  
**Compatibility:** Extends `lib/demo/projects.ts` without modifying existing types  
**Location:** [`phase3-research/data/analytics-contract.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/data/analytics-contract.md)  

---

## 1. Type Definitions

```typescript
import { type Health, type Environment, type Monitoring } from "../projects";

/** Supported temporal window presets */
export type TimeRangePreset = "15m" | "1h" | "6h" | "24h" | "7d" | "30d" | "custom";

/** Comparison baseline selection */
export type ComparisonBaseline = "previous_period" | "previous_week" | "none";

/** Telemetry time-series query parameter contract */
export type TelemetryQuery = {
  projectId: string;
  range: TimeRangePreset;
  startIso: string;
  endIso: string;
  bucketSeconds: number;
  compareWith: ComparisonBaseline;
};

/** Discrete time-series sample point */
export type TimeSeriesPoint = {
  timestamp: number;          // Unix epoch in milliseconds
  isoTime: string;            // ISO 8601 string (e.g. "2026-10-14T09:15:00Z")
  requestRate: number;        // Requests per second (req/s)
  errorRate: number;          // Percentage (0.0 to 100.0)
  latencyP50: number;         // Median latency (ms)
  latencyP95: number;         // 95th percentile latency (ms)
  latencyP99: number;         // 99th percentile tail latency (ms)
  availability: number;       // Request success SLI percentage (0.0 to 100.0)
  queueDepth?: number;        // Optional component-specific metric (messages)
};

/** Summary card KPI payload */
export type MetricSummary = {
  key: "throughput" | "error_rate" | "latency_p95" | "latency_p99" | "availability" | "active_incidents";
  label: string;
  currentValue: number;
  formattedValue: string;
  unit: string;
  comparisonValue: number;
  formattedComparison: string;
  deltaPercent: number;       // e.g. +14.2 or -3.1
  isAnomaly: boolean;         // True if threshold breached
  sparkline: number[];        // Normalized micro-trend array (8 to 16 points)
};

/** Status code distribution point */
export type StatusCodePoint = {
  timestamp: number;
  status2xx: number;          // req/s
  status4xx: number;          // req/s
  status5xx: number;          // req/s
};

/** Service-specific telemetry breakdown record */
export type ServiceTelemetryRecord = {
  serviceId: string;
  serviceName: string;
  technology: string;
  health: Health;
  throughputReqSec: number;
  errorRatePercent: number;
  latencyP95Ms: number;
  activeIncidents: number;
  queueDepthMessages?: number;
  sparkline: number[];
};

/** Complete project observability payload returned by telemetry adapter */
export type ProjectAnalyticsPayload = {
  projectId: string;
  workspaceId: string;
  query: TelemetryQuery;
  scenarioAnchorIso: string;
  isScenarioDemo: boolean;
  monitoringStatus: Monitoring;
  compositeHealth: Health;
  summaryMetrics: {
    throughput: MetricSummary;
    errorRate: MetricSummary;
    latencyP95: MetricSummary;
    latencyP99: MetricSummary;
    availability: MetricSummary;
    activeIncidents: MetricSummary;
  };
  timeSeries: {
    active: TimeSeriesPoint[];
    comparison: TimeSeriesPoint[];
  };
  serviceBreakdown: ServiceTelemetryRecord[];
  statusCodes: StatusCodePoint[];
};
```

---

## 2. Telemetry Adapter Function Signatures

Astra should implement read-only query adapters in `lib/demo/telemetry/telemetry-adapter.ts`:

```typescript
/**
 * Query project analytics for a specific time range.
 * Deterministically returns fixture series or handles pending/disconnected states.
 */
export function getProjectAnalytics(
  projectId: string,
  range: TimeRangePreset = "24h",
  compareWith: ComparisonBaseline = "previous_period"
): ProjectAnalyticsPayload;

/**
 * Formats standard metric quantities according to AegisOps conventions.
 */
export function formatMetricQuantity(value: number, unit: string): string;
```
