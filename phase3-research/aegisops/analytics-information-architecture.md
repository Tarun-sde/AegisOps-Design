# AegisOps Analytics Information Architecture: 5-Level Operational Intelligence Hierarchy

**Document Version:** 1.0.0  
**Researcher:** Principal Product Research Engineer, Senior Observability UX Designer  
**Repository State:** Verified Phase 2 codebase (`app/projects/[workspaceId]/[projectId]`)  
**Location:** [`phase3-research/aegisops/analytics-information-architecture.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/aegisops/analytics-information-architecture.md)  

---

## 1. The Core Observability Journey

Unlike generic business intelligence tools or financial dashboards, an incident intelligence platform must optimize for **cognitive speed under operational stress**. When a service degrades or an alert fires, an engineer needs to traverse five unambiguous cognitive steps:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: PROJECT HEALTH OVERVIEW                                                      │
│ "Is my application healthy right now?"                                                 │
│ Quick visual scan of composite health, active incident badges, and top-line telemetry. │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Anomaly or Alert detected
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 2: PERFORMANCE & TIME-SERIES ANALYTICS                                          │
│ "What changed, by how much, and at what exact timestamp?"                             │
│ Time-range controls, hero multi-metric time series, comparison baseline, rate of change│
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Metric spike correlated with time window
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 3: SERVICE INVENTORY & TOPOLOGICAL BREAKDOWN                                    │
│ "Which specific subsystem or dependency is responsible?"                               │
│ Service-by-service latency, error contribution, queue backlog, and schematic diagram. │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Root-cause component isolated
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 4: INCIDENT REGISTER & CASUAL TIMELINE                                          │
│ "What specific operational incident was opened, and what is its blast radius?"         │
│ Severity (P1-P4), triggering condition, duration, affected services, alert history.   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Deep investigation needed
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 5: EVIDENCE-BACKED AI INVESTIGATION CONSOLE                                     │
│ "What evidence explains this, what remains uncertain, and what action is proposed?"    │
│ Hypotheses, log citations, distributed trace waterfall, bounded human-reviewed steps.  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Breakdown of the 5 Levels

### Level 1: Project Overview ("Is my application healthy?")
* **User Goal**: Establish situational awareness in less than 3 seconds.
* **Primary Questions Answered**:
  - Is the system operating within normal thresholds?
  - Are there any active P1 or P2 operational incidents?
  - What is the current request volume and error rate?
* **UI Elements**:
  - Project Title & Environment Pill (`PRODUCTION / US-EAST-1`).
  - Connection Indicator (`● Connected / Monitored via OpenTelemetry`).
  - Composite Health Badge (`● Degraded Health` or `● Healthy`).
  - Active Incident Alert Strip (if active incidents > 0).
  - High-level KPI summary cards (Throughput, Error Rate, p95 Latency, Availability).
* **Navigation Placement**: Anchored at `#overview` within `/projects/[workspaceId]/[projectId]`.

---

### Level 2: Performance Analytics ("What changed, how much, and when?")
* **User Goal**: Inspect temporal dynamics and compare current telemetry against expected baseline.
* **Primary Questions Answered**:
  - Did the error rate jump suddenly or creep up gradually?
  - Is the latency spike correlated with a surge in request throughput?
  - How does today's performance compare to the exact same hours yesterday?
* **UI Elements**:
  - **Time-Range Toolbar**: Presets (`15m`, `1h`, `6h`, `24h`, `7d`, `30d`), Custom Date Picker, Auto-resolution, Comparison selector (`vs Previous Period`).
  - **Hero Time-Series Chart**: High-resolution synchronized visualization with dual-series plotting (Current: solid `#282828`; Comparison: dashed `#8a8a84`).
  - **Crosshair Tooltip**: Vertical timeline ruler tracking mouse/touch across x-axis, displaying exact timestamp, active value, comparison value, and percentage delta.
  - **Incident Timeline Pins**: Visual markers along the time-axis showing precisely when incidents opened or closed.
* **Navigation Placement**: Anchored at `#analytics` or top of detail console.

---

### Level 3: Service Breakdown ("Which component is affected?")
* **User Goal**: Disaggregate the project-level metric down to constituent microservices and data stores.
* **Primary Questions Answered**:
  - Is the entire application slow, or is latency confined to a downstream queue worker?
  - Which service is emitting HTTP 500 errors?
  - Are databases or third-party gateways causing upstream thread starvation?
* **UI Elements**:
  - **Service Telemetry Table**: High-density operational table showing each service's health, throughput, error percentage, and p95 latency.
  - **Schematic Architecture Map**: Technical SVG diagram (`project-visuals.tsx`) enhanced with live status markers and highlighted incident boundaries.
  - **Service Filter Pills**: Clicking a service in the table or diagram isolates all charts to that specific component!
* **Navigation Placement**: Anchored at `#services`.

---

### Level 4: Incidents ("What problem was detected?")
* **User Goal**: Inspect the formal incident record, trigger conditions, and operational blast radius.
* **Primary Questions Answered**:
  - When did the alert trigger?
  - What threshold was breached (e.g., `Queue depth > 1,000 for 5m`)?
  - Who or what initiated the investigation?
* **UI Elements**:
  - **Incident Register**: Filterable table of active and resolved incidents with severity badges (`P1 - Critical`, `P2 - Degraded`, `P3 - Moderate`).
  - **Incident Quick-Inspection Drawer**: Slide-out panel providing immediate symptom summary, duration, and triggering telemetry snapshot.
  - **Investigation Trigger**: Prominent button `"Open AI Investigation Console [INV-8042] ↗"`.
* **Navigation Placement**: Anchored at `#incidents` or dedicated sub-route `/incidents`.

---

### Level 5: AI Investigation ("What evidence supports the diagnosis?")
* **User Goal**: Review an evidence-backed diagnostic analysis without dealing with a hallucinating chatbot.
* **Primary Questions Answered**:
  - What is the most probable root cause?
  - What verifiable evidence (logs, traces, metrics) supports this hypothesis?
  - What contradictory evidence or missing information exists?
  - What specific, human-reviewed remediation action is proposed?
* **UI Elements**:
  - **Investigation Header**: Investigation ID (`INV-8042`), incident reference, trigger time, duration, and analyzed signal coverage.
  - **Hypothesis Cards**: Structured diagnostic proposals with explicit confidence language ("High probability based on 3 correlated signals"), supporting citations, and identified unknowns.
  - **Evidence Explorer**: Interactive tabs for **Log Excerpts** (with matched timestamps), **Trace Waterfall** (span durations and errors), and **Metric Correlators**. Every citation links to a real synthetic record!
  - **Proposed Actions**: Bounded, human-in-the-loop recommendations (e.g. "Drain settlement queue worker replica 2", "Inspect database thread lock contention").
* **Navigation Placement**: Full-screen modal console or dedicated route `/incidents/[incidentId]`.

---

## 3. Screen Structure & Navigation Integration

To maintain 100% compatibility with Phase 2's URL routing and Vercel-inspired workspace shell, the 5 levels are mapped cleanly into the project detail interface:

```
app/projects/[workspaceId]/[projectId]/
├── page.tsx                     # Project Detail Shell (Levels 1, 2, 3)
└── incidents/
    ├── page.tsx                 # Project Incident Register (Level 4)
    └── [incidentId]/
        └── page.tsx             # AI Investigation Console (Level 5)
```

### Tab Strip Integration (`components/workspace/project-detail.tsx`)
The project detail navigation bar is extended from 3 items to 4 items:
```html
<nav class="ws-project-tabs" aria-label="Project sections">
  <Link href="#overview">Overview <span>01</span></Link>
  <Link href="#analytics">Analytics <span>02</span></Link>
  <Link href="#services">Services <span>03</span></Link>
  <Link href="#incidents">Incidents & Intelligence <span>01</span></Link>
</nav>
```

- When the user scrolls or clicks, the URL updates cleanly.
- Direct links to `/projects/northstar/payment-gateway#analytics` or `/projects/northstar/payment-gateway/incidents/inc-payment-gw-01` work seamlessly across browser history and bookmarks.
