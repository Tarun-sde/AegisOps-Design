# AegisOps Synthetic Data Consistency Rules & Invariants

**Document Version:** 1.0.0  
**Researcher:** Principal Technical Architecture Analyst, Senior Quality Engineer  
**Target:** GPT Astra Implementation Guardrails  
**Location:** [`phase3-research/data/data-consistency-rules.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/data/data-consistency-rules.md)  

---

## 1. The Seven Golden Invariants

To maintain enterprise credibility and pass rigorous automated Playwright assertions, Astra must strictly enforce these seven data invariants:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. INCIDENT COUNT INVARIANT: List count == Project fact == Badge counter               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. COMPOSITE HEALTH INVARIANT: Project health == Worst-of(Service Health, Incidents)  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. TEMPORAL BOUNDARY INVARIANT: All plotted events <= T_SCENARIO_ANCHOR (09:30 UTC)   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. EVIDENCE CITATION INVARIANT: 100% of cited [EV-...] codes resolve to real fixtures │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. UNCONNECTED HONESTY INVARIANT: Local/Pending/Disconnected projects have NO fake data│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 6. DETERMINISTIC REPRODUCIBILITY: Math.random() is FORBIDDEN in render functions       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 7. PERCENTILE QUANTILE INVARIANT: Never average p95 series across time intervals       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Invariant Specifications

### Rule 1: Incident Count Invariant
- `project.activeIncidentCount` in `lib/demo/projects.ts` must exactly equal the number of active incidents returned by the incident query adapter.
- For `payment-gateway`: `activeIncidentCount === 1` $\rightarrow$ exactly 1 active incident (`INC-2026-1014-01`).
- For `authentication`: `activeIncidentCount === 2` $\rightarrow$ exactly 2 active incidents.
- For `customer-portal` and `ironlog`: `activeIncidentCount === 0` $\rightarrow$ exactly 0 incidents.

### Rule 2: Composite Health Invariant
- A project’s health badge must never contradict its constituent services.
- If any service is `critical` or any active incident is `P1`, project health is `critical`.
- Else if any service is `degraded` or any active incident is `P2`, project health is `degraded`.
- Else if monitoring is `pending` or `disconnected`, project health is `unknown`.
- Else project health is `healthy`.

### Rule 3: Temporal Boundary Invariant
- The scenario anchor clock is fixed at `2026-10-14T09:30:00Z`.
- No telemetry sample, log line, or trace may have a timestamp $> 09:30:00\text{Z}$.
- When changing time ranges (e.g. to `1h`), the query window is strictly `[08:30:00Z, 09:30:00Z]`. Samples outside this window must be excluded from charts and summary aggregations.

### Rule 4: Evidence Citation Invariant
- In the AI Investigation view, every citation pill (e.g. `[EV-LOG-401]`) must have a corresponding record in the scenario evidence collection.
- Clicking an evidence reference must successfully resolve and display the target log, trace, metric, or deployment change without throwing a null reference or displaying an empty card.

### Rule 5: Unconnected Project Honesty Invariant
- A newly created demo project in the Phase 2 UI (`local-...`) has `monitoringStatus: "pending"`.
- It must **never** display synthetic telemetry charts, mock error rates, or fabricated green health.
- It must render an explicit, honest state:
  *"No telemetry received. Creating a demo project does not connect live infrastructure."*

### Rule 6: Deterministic Reproducibility Invariant
- `Math.random()` must **never** be called during React rendering or state updates.
- All time-series data must be generated using deterministic PRNG seeds or fixed mathematical formulas (e.g. sine wave baseline + exponential spike).
- Refreshing the browser page 100 times must display the exact same numbers every time.

### Rule 7: Percentile Quantile Invariant
- The overall p95 latency displayed on the summary metric card must be calculated from the underlying histogram distribution or scenario constant, **never** by calculating `points.reduce((a, b) => a + b.p95, 0) / points.length`.
