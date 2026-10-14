# AegisOps Main Analytics Overview Specification

**Document Version:** 1.0.0  
**Researcher:** Principal Product Research Engineer, Senior Observability UX Designer  
**Repository State:** Verified Phase 2 codebase (`components/workspace/project-detail.tsx`)  
**Location:** [`phase3-research/aegisops/analytics-overview-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/aegisops/analytics-overview-spec.md)  

---

## 1. Overview Objective

The **Main Analytics Overview** is the operational core of AegisOps. It translates raw telemetry streams into an immediate, high-density situational display. 

Adapting Stripe’s proven dashboard hierarchy to technical observability, the overview avoids visual clutter by organizing information into:
1. **Context & Scoping Header**: Project identity, environment, connection health, and temporal controls.
2. **Interactive Metric Summary Row**: Six high-level KPI cards providing instant situational awareness and serving as active chart toggles.
3. **Hero Time-Series Visualization**: A dominant, synchronized time-series chart showing the selected metric against historical baseline, annotated with operational incident pins.
4. **Synchronized Supporting Breakdowns**: Two supporting secondary panels displaying dimensional distributions (Service Latency Breakdown and HTTP Status Code Mix).
5. **Operational Telemetry Register**: A tabular view correlating individual service metrics with incident thresholds.

---

## 2. Layout Wireframe & Visual Composition

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [← All Projects]   [Switch project: Payment Gateway ↕]                                                 │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ N / 02 / payment-gateway                                                  [··· Actions ∨]              │
│ PAYMENT GATEWAY                                                                                        │
│ Payment processing, settlement and reconciliation                                                      │
│ Java / PostgreSQL                                                                                      │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PRODUCTION]  [● connected]  [● degraded health]  [SAMPLE SNAPSHOT / 14 OCT 2026]                     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Overview 01]   [Analytics 02]   [Services 03]   [Incidents & Intelligence 01]                         │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ── SECTION: OPERATIONAL ANALYTICS (#analytics) ─────────────────────────────────────────────────────── │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ TIME WINDOW: [24 Hours ∨]   GRANULARITY: [15 Minutes (Auto) ∨]   COMPARE: [vs Previous Period ∨]   │ │
│ │ Scenario Clock: 14 Oct 2026, 09:30 UTC  [Fixed Demo Mode]                       [Export Snapshot ↗]│ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                        │
│ ┌───────────────────┬───────────────────┬───────────────────┬───────────────────┬────────────────────┐ │
│ │ THROUGHPUT        │ ERROR RATE [!]    │ P95 LATENCY [!]   │ AVAILABILITY (SLI)│ ACTIVE INCIDENTS   │ │
│ │ 1,280 req/s       │ 3.42 %            │ 482 ms            │ 99.18 %           │ 1 ACTIVE [P1]      │ │
│ │ ↑ +14.2% vs prev  │ ↑ +3.18% (ANOMALY)│ ↑ +340ms (SPIKE)  │ ↓ -0.72% vs SLO   │ Breach @ 09:26 UTC │ │
│ │ [~~sparkline~~]   │ [~~sparkline~~]   │ [~~sparkline~~]   │ [~~sparkline~~]   │ [~~alert strip~~]  │ │
│ │ (Active Metric)   │                   │                   │                   │                    │ │
│ └───────────────────┴───────────────────┴───────────────────┴───────────────────┴────────────────────┘ │
│                                                                                                        │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ HERO CHART: REQUEST LATENCY (p50 / p95 / p99) & INCIDENT CORRELATION                               │ │
│ │ 600ms ┤                                               ▲ Incident INC-01 Opened (09:26 UTC)         │ │
│ │       │                                               │                                            │ │
│ │ 400ms ┤                                          ╭────┴─────────────── p95 (482ms)                 │ │
│ │       │                                       ╭──╯                    ──────── p50 (48ms)          │ │
│ │ 200ms ┤                                    ╭──╯                       - - - - - Baseline (140ms)   │ │
│ │   0ms ┴────────────────────────────────────┴────────────────────────────────────────────────────── │ │
│ │       00:00        03:00        06:00        09:00     [09:24 crosshair]  12:00              09:30     │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                        │
│ ┌──────────────────────────────────────────────────┬─────────────────────────────────────────────────┐ │
│ │ SERVICE LATENCY BREAKDOWN (ms)                   │ HTTP STATUS CODE DISTRIBUTION (req/s)           │ │
│ │ ┌──────────────────────────────────────────────┐ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ ── Queue Worker (RabbitMQ): 420 ms [DEGRADED]│ │ │ ■ 2xx Success:  1,236 req/s (96.5%)         │ │ │
│ │ │ ── Payment API (Java):       48 ms [HEALTHY] │ │ │ ■ 4xx Client:      12 req/s  (0.9%)         │ │ │
│ │ │ ── Database (Postgres):      14 ms [HEALTHY] │ │ │ ■ 5xx Server [!]:  32 req/s  (2.6%) [CRIT]  │ │ │
│ │ └──────────────────────────────────────────────┘ │ └─────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────┴─────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The Six Primary Monitoring Signals

| Metric Signal | Primary Unit | Key Formula / Logic | Normal Threshold | Current Anomaly Condition |
| :--- | :--- | :--- | :--- | :--- |
| **1. Request Throughput** | `req/s` | `Total Requests / Interval Duration (s)` | 800 – 1,500 req/s | Normal volume (1,280 req/s). Throughput is stable; system slowdown is not caused by traffic flood. |
| **2. Error Rate** | `%` | `(5xx Requests / Total Requests) * 100` | `< 0.25%` | **Elevated: 3.42%** (Triggered downstream by settlement timeout errors). |
| **3. Request Latency** | `ms` | Percentiles: `p50`, `p95`, `p99` | p50 < 60ms, p95 < 150ms | **Critical Spike: p95 = 482ms, p99 = 1,120ms** (Settlement queue worker blocked). |
| **4. Availability / SLI** | `%` | `(Successful Requests / Eligible Requests) * 100` | Target: `99.90%` | **Degraded: 99.18%** (Consuming 30-day error budget at 14.4x burn rate). |
| **5. Active Incidents** | `count` | Open operational incidents in current project | `0` | **1 Active Incident** (`INC-2026-1014-01`: Settlement queue backlog). |
| **6. Composite Health** | `state` | Worst-of rule: `critical` if any P1/critical service, else `degraded` if any degraded service, else `healthy` | `healthy` | **Degraded** (Queue Worker is degraded, Payment API & DB healthy). |

---

## 4. UI Component Specifications

### 4.1 Metric Summary Cards (KPI Cards)
- **Position**: Horizontal grid spanning the container width.
- **Card States**:
  - `Default`: Subtle border `--rule` (`#b3b3af`), warm background `--ws-soft`.
  - `Active Selection`: Solid charcoal ink border `--ink` (`#282828`), subtle 1px elevation lift. Clicking the card plots this metric in the hero chart!
  - `Alert / Anomaly`: If metric breaches threshold, label displays an ochre or red indicator badge (`! ANOMALY`).
- **Typography & Formatting**:
  - Title: Monospace uppercase label (`font-size: 11px`, letter-spacing: `0.02em`, color: `--muted`).
  - Metric Value: High-contrast tabular numbers (`font-size: 26px`, `font-weight: 650`, color: `--ink`).
  - Delta / Comparison: Directional arrow + percentage change (`font-size: 11px`, color: red for adverse degradation, charcoal for expected performance).
  - Inline Sparkline: Lightweight SVG path (height: 28px) depicting the 24-hour profile.

### 4.2 Hero Time-Series Visualization
- **Canvas Height**: `300px` (desktop), `220px` (mobile).
- **Y-Axis**: Dynamic scale with 4–5 horizontal hairline grid lines (`#b3b3af` at 40% opacity) and right/left numerical tick labels (`0ms`, `150ms`, `300ms`, `450ms`, `600ms`).
- **X-Axis**: Time intervals (`00:00`, `03:00`, `06:00`, `09:00`, `09:30 UTC`).
- **Series Representation**:
  - **Active Time Window**: Solid technical line (`stroke-width: 2px`, stroke: `--ink`).
  - **Comparison Period**: Hairline dashed rule (`stroke-width: 1px`, `stroke-dasharray: 4 4`, stroke: `#8a8a84`).
- **Incident Pin Overlays**:
  - Placed directly at the timeline timestamp (`09:26 UTC`).
  - Icon: Inverted triangle / badge with exclamation mark `▼ [!]`.
  - Hovering reveals preview card: *"INC-01: Settlement queue backlog (P1)"*.
  - Clicking opens the **Incident Quick-Inspection Drawer**.

### 4.3 Supporting Breakdowns
- **Layout**: Two side-by-side equal-width panels below the hero chart (`grid-template-columns: 1fr 1fr`).
- **Panel A: Service Latency Comparison**:
  - Multi-line chart showing latency across `Payment API` (blue/ink), `Queue Worker` (ochre/red spike), and `Database` (subtle gray).
  - Isolates the source of the latency spike immediately to the `Queue Worker`.
- **Panel B: HTTP Status Code Breakdown**:
  - Horizontal stacked bar or stacked area showing ratio of `2xx` (success), `4xx` (client errors), and `5xx` (internal errors).
  - Monospace legend with exact counts and percentages.

---

## 5. Telemetry Integrity & Edge Cases

1. **Disconnected Projects (`portfolio-api`)**:
   - Do **not** render flat zero lines or fake baseline data.
   - Replace the chart canvas with an explicit architectural message:
     ```
     [○ DISCONNECTED] Sample collector disconnected.
     No telemetry samples recorded in this scenario window.
     ```
2. **Pending Monitoring Setup (`inventory`)**:
   - Render:
     ```
     [◎ PENDING SETUP] Telemetry ingestion pipeline initializing.
     Sample services configured; waiting for first synthetic heartbeat.
     ```
3. **Local Demo Projects Created by User**:
   - Initialized with `monitoringStatus: "pending"`, `health: "unknown"`, `activeIncidentCount: 0`.
   - Render an educational empty state:
     ```
     No telemetry stream connected.
     To test observability features, open pre-seeded projects:
     • Northstar / Payment Gateway (Degraded Scenario with Incident)
     • Northstar / Authentication Service (Critical Scenario with 2 Incidents)
     • Personal / IronLog (Healthy Scenario)
     ```
