# AegisOps Incident Management: Incident Detail View Specification

**Document Version:** 1.0.0  
**Researcher:** Senior Observability UX Designer, Incident Intelligence Specialist  
**Location:** [`phase3-research/aegisops/incident-detail-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/aegisops/incident-detail-spec.md)  

---

## 1. Executive Purpose

The **Incident Detail View** is the bridge between a raw telemetry alert and an AI-assisted diagnostic investigation. It explains **what happened, when it started, what services are impacted, and what metrics changed**, while providing a seamless launchpad into the **AI Investigation Experience**.

---

## 2. Layout Structure & Wireframe

Located at `/projects/[workspaceId]/[projectId]/incidents/[incidentId]` or accessible via the expanded drawer in the project workspace:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ← BACK TO INCIDENTS REGISTER                                                                           │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [P1 - DEGRADED]   INC-2026-1014-01                                                                     │
│ SETTLEMENT QUEUE BACKLOG BREACH                                                                        │
│ Affected: Northstar / Payment Gateway / Queue Worker (RabbitMQ)                                        │
│ Started: 14 Oct 2026, 09:26:00 UTC (4 minutes active)                                                 │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ AI INVESTIGATION STATUS: EVIDENCE ASSEMBLED [INV-8042]                                             │ │
│ │ Root cause hypothesis identified with high probability. 3 evidence records cited.                  │ │
│ │ [Launch AI Investigation Experience ↗]                                                             │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                        │
│ ┌──────────────────────────────────────────────────┬─────────────────────────────────────────────────┐ │
│ │ INCIDENT SUMMARY & SYMPTOMS                      │ METRIC DEVIATION AT ONSET (09:26 UTC)           │ │
│ │ • Alert Rule: settlement_queue_depth > 1,000     │ ── Queue Depth:     1,420 msgs (Normal: < 150)  │ │
│ │ • Trigger Condition: Sustained for 5 minutes     │ ── Worker Latency:    680 ms   (Normal: 45 ms)  │ │
│ │ • Upstream Impact: Payment API settlement acks   │ ── Error Rate:       4.82 %    (Normal: 0.08%) │ │
│ │ • Downstream Component: Postgres Settlement DB   │ ── Active Workers:     16 / 16 (100% capacity)  │ │
│ └──────────────────────────────────────────────────┴─────────────────────────────────────────────────┘ │
│                                                                                                        │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ INCIDENT CHRONOLOGICAL TIMELINE                                                                    │ │
│ │ 09:18:00 UTC · Influx of settlement transaction batches from checkout services                       │ │
│ │ 09:22:15 UTC · Worker thread pool hits 95% utilization across all replica pods                       │ │
│ │ 09:24:30 UTC · Database transaction lock wait times exceed 250ms on settlement_records table         │ │
│ │ 09:26:00 UTC · [ALERT FIRED] queue_depth exceeds 1,000 messages (1,420 msgs); Incident opened        │ │
│ │ 09:26:30 UTC · Automated AI investigation dispatched (Investigation ID: INV-8042)                   │ │
│ │ 09:27:45 UTC · Correlated log excerpt, trace span, and queue telemetry captured into evidence cache  │ │
│ │ 09:28:10 UTC · Diagnostic hypothesis formulated: Lock contention starving worker consumer threads   │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Details & Behavior

### 3.1 Metric Deviation Panel
Displays side-by-side comparison of baseline performance vs the incident state:
- Baseline measured across `08:00–09:00 UTC`.
- Incident state captured at `09:26 UTC`.
- Clear delta badges highlighting percentage deviations.

### 3.2 Chronological Timeline
- Vertical or stepped line in technical hairline rule (`#b3b3af`).
- Event marks distinguish between:
  - Technical telemetry threshold breaches (solid dot `●`).
  - System alert triggers (alert icon `!`).
  - Automated investigation milestones (gear or drafting diamond `◇`).
- Each timeline event contains an exact ISO timestamp and concise explanation.

### 3.3 Seamless Transition to Level 5
- The prominent callout banner links directly to the **AI Investigation Console** (`[INV-8042]`).
- Clicking transitions smoothly without reloading workspace context.
