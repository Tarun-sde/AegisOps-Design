# AegisOps Comprehensive UX State Inventory

**Document Version:** 1.0.0  
**Researcher:** Senior Observability UX Designer, Edge-Case QA Analyst  
**Location:** [`phase3-research/aegisops/ux-state-inventory.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/aegisops/ux-state-inventory.md)  

---

## 1. Executive Purpose

A robust observability product is judged not only by how it looks when data is flowing perfectly, but by how transparently and gracefully it handles **system degradation, pending collectors, missing telemetry slices, and edge failures**.

This inventory specifies the exact visual presentation and system response across all 18 core UX states.

---

## 2. Complete State Matrix

| State Identifier | Trigger Condition | Visual Header / Badge | Content Area Presentation | Expected User Recovery Action |
| :--- | :--- | :--- | :--- | :--- |
| **STATE-01: Connected Healthy** | `status: "connected"`, `health: "healthy"`, 0 incidents (`ironlog`, `customer-portal`) | `[● CONNECTED]` `[● HEALTHY]` | Complete time-series charts plotted within normal bounds. Summary cards show positive/neutral deltas. Incident list displays empty checkmark banner: *"No active incidents. All SLOs healthy."* | Scan metrics; switch time ranges. |
| **STATE-02: Connected Degraded** | `status: "connected"`, `health: "degraded"`, 1 incident (`payment-gateway`) | `[● CONNECTED]` `[● DEGRADED HEALTH]` | Metric summary card for Latency / Error Rate shows `! ANOMALY` badge. Hero chart plots incident onset spike with alert pin at `09:26 UTC`. | Click `Inspect Incident [INC-01]` or open AI investigation. |
| **STATE-03: Critical Incident** | `status: "connected"`, `health: "critical"`, $\ge 1$ P1 incident (`authentication`) | `[● CONNECTED]` `[● CRITICAL HEALTH] [2 INCIDENTS]` | Hero chart shows severe threshold breach. Prominent red banner across top of console: *"CRITICAL ALERT: Identity failures and session-store timeouts detected"*. | Immediate jump to P1 incident investigation console. |
| **STATE-04: Disconnected Collector** | `status: "disconnected"` (`portfolio-api`) | `[○ DISCONNECTED]` `[○ UNKNOWN HEALTH]` | Chart area displays architectural notice: *"Sample collector disconnected. No telemetry received for this project."* Zero mock lines drawn. | Link to connection documentation. |
| **STATE-05: Pending Monitoring** | `status: "pending"` (`inventory`) | `[◎ PENDING SETUP]` `[○ UNKNOWN HEALTH]` | Architectural blueprint background with notice: *"Telemetry ingestion pending. Service inventory prepared; waiting for first synthetic heartbeat."* | Wait for synthetic connection or inspect service inventory. |
| **STATE-06: New Local Demo Project** | User-created project via dialog (`local-...`) | `[◎ PENDING / LOCAL DEMO]` `[○ UNKNOWN HEALTH]` | Educational empty state: *"This is a local demo project. Creating a demo project does not connect real infrastructure. To test live telemetry, open pre-seeded Northstar projects."* | Open Northstar Payment Gateway link. |
| **STATE-07: Empty Time Range** | Custom date range with no samples (e.g. future date) | `[Time Range: Custom]` | Empty grid notice: *"No telemetry samples recorded within the selected window (01 Nov 2026). Try adjusting time range."* | Click `Reset to Last 24 Hours`. |
| **STATE-08: Missing Service Data** | A specific service has no incoming metrics | Service row: `Latency: —`, `Error: —` | Table displays dash `—` with tooltip: *"Telemetry stream unavailable for this specific component"*. | Check service collector status. |
| **STATE-09: No Incidents (Empty Register)** | Project with 0 incidents (`ironlog`) | Monospace counter: `00 INCIDENTS` | High-density paper panel: *"All services operating normally. No alerts triggered in the active time window."* | Review SLO error budget status. |
| **STATE-10: Incident Without Investigation** | Incident detected, but automated investigation disabled | `[INCIDENT ACTIVE]` | Incident detail shows telemetry breach and button: *"Request AI Investigation ↗"*. | Click to trigger investigation. |
| **STATE-11: Investigation In Progress** | AI agent actively synthesizing evidence | `[INVESTIGATING...]` | Pulsing subtle drafting marker with live step progress: *"Analyzing 4,200 traces... Correlating log exceptions... (Step 2 of 3)"*. | Wait ~1.5s for synthesis completion. |
| **STATE-12: Inconclusive Investigation** | Telemetry does not point to single root cause | `[INVESTIGATION INCONCLUSIVE]` | Diagnostic banner: *"Telemetry signals are inconclusive. 2 weak hypotheses generated. Manual database inspection recommended."* | View suggested manual checks. |
| **STATE-13: Missing Evidence / Unknowns** | Telemetry slice lacks specific subsystem logs | Hypothesis card: `Unknowns` section | Explicit callout: *"PostgreSQL lock wait table metrics not exported in current telemetry window."* | Intellectual honesty preserved. |
| **STATE-14: No Remediation Action Available** | Incident requires external vendor or cloud provider fix | Remediation panel | Notice: *"No automated remediation action available for this incident. Escalate to upstream provider."* | Follow external runbook link. |
| **STATE-15: Invalid Project / Incident URL** | Typo in URL (`/projects/northstar/fake-app`) | `[ERR_PROJECT_NOT_FOUND]` | Architectural recovery screen with button: *"Back to Projects ↗"*. | Navigate to valid project. |
| **STATE-16: Storage Unavailable** | `localStorage` quota exceeded or private mode | Sticky warning banner | Text: *"Browser storage is unavailable. Your changes work in this tab but will not survive a refresh."* | Changes retained in tab memory. |
| **STATE-17: Reduced Motion Enabled** | `prefers-reduced-motion: reduce` | Standard badges | All charts and drawers mount instantly with 0ms transition. | Unhindered accessibility. |
| **STATE-18: Narrow Mobile Viewport** | Screen width $< 400\text{px}$ | Stacked mobile header | Metric cards reflow to 1 column. Service table scrolls with sticky service name column. Bottom drawer sheet. | Full operational parity on phone. |
