# AegisOps Time-Range, Granularity & Comparison Specification

**Document Version:** 1.0.0  
**Researcher:** Senior Observability UX Designer, Technical Architecture Analyst  
**Reference Alignment:** Stripe Date-Picker Mechanics (`stripe-date-picker.png`), Prometheus Rate Intervals  
**Location:** [`phase3-research/aegisops/time-range-and-filter-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/aegisops/time-range-and-filter-spec.md)  

---

## 1. The Core Temporal Problem in Frontend Demos

Many frontend prototypes simulate monitoring dashboards by pretending to stream random live data (`setInterval` generating random numbers every 2 seconds). This creates three severe failure modes:
1. **Mathematical Incoherence**: Telemetry spikes do not match incident records; an incident reported at 09:26 disappears or drifts as the clock ticks.
2. **Automated Test Brittleness**: Playwright assertions fail intermittently because numbers change between assertion steps.
3. **Loss of Baseline Contrast**: Changing a date picker from "1 Hour" to "24 Hours" simply relabels the x-axis without changing the data distribution.

AegisOps eliminates these flaws by establishing an **Explicit Fixed Scenario Clock** and **Deterministic Time Bucketing**.

---

## 2. The Fixed Scenario Clock

* **Scenario Anchor Timestamp**:  
  `T_SCENARIO_ANCHOR = "2026-10-14T09:30:00Z"` (October 14, 2026 at 09:30:00 UTC).
* **Rationale**:
  - In `lib/demo/projects.ts`, Northstar Payment Gateway's `lastSignalAt` is pre-seeded at `"2026-10-14T09:26:00Z"`.
  - Setting the fixed demo clock at `09:30:00Z` means the incident occurred **exactly 4 minutes ago**.
  - All time ranges are calculated backwards from this fixed anchor.
* **UI Labeling**:
  The header toolbar clearly states:
  ```
  [TIME: LAST 24 HOURS ∨]  [RESOLUTION: 15M (AUTO) ∨]  [COMPARE: VS PREVIOUS PERIOD ∨]
  (Clock Icon) FIXED DEMO CLOCK: 14 OCT 2026 · 09:30 UTC · REPRODUCIBLE SCENARIO
  ```

---

## 3. Supported Time Ranges & Granularity Matrix

| Preset Range | Window Start ($T_{\text{start}}$) | Window End ($T_{\text{end}}$) | Bucket Size ($\Delta t$) | Sample Points ($N$) | Comparison Window ($T_{\text{comp}}$) | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **15 Minutes** (`15m`) | `09:15:00Z` | `09:30:00Z` | **10 seconds** | 90 points | `09:00:00Z` – `09:15:00Z` | Micro-incident onset inspection |
| **1 Hour** (`1h`) | `08:30:00Z` | `09:30:00Z` | **1 minute** | 60 points | `07:30:00Z` – `08:30:00Z` | Immediate operational response |
| **6 Hours** (`6h`) | `03:30:00Z` | `09:30:00Z` | **5 minutes** | 72 points | `21:30:00Z (prev)` – `03:30:00Z` | Shift handover / morning triage |
| **24 Hours** (`24h`) *(Default)* | `13 Oct 09:30Z` | `14 Oct 09:30Z` | **15 minutes** | 96 points | `12 Oct 09:30Z` – `13 Oct 09:30Z` | Daily executive & operational overview |
| **7 Days** (`7d`) | `07 Oct 09:30Z` | `14 Oct 09:30Z` | **1 hour** | 168 points | `30 Sep 09:30Z` – `07 Oct 09:30Z` | Weekly reliability review & trends |
| **30 Days** (`30d`) | `14 Sep 09:30Z` | `14 Oct 09:30Z` | **6 hours** | 120 points | `15 Aug 09:30Z` – `14 Sep 09:30Z` | SLO & monthly error budget tracking |
| **Custom Range** | User Defined | User Defined | Dynamic | Bounded $\le 200$ | Equivalent duration prior | Deep retrospective analysis |

---

## 4. Automatic Rounding & Granularity Logic

Stripe’s interface automatically selects the most legible granularity for any selected range (`stripe-date-picker.png`). AegisOps implements this via a pure function:

```typescript
export function getRecommendedResolution(durationMinutes: number): {
  bucketSeconds: number;
  label: string;
} {
  if (durationMinutes <= 30) return { bucketSeconds: 10, label: "10 seconds" };
  if (durationMinutes <= 120) return { bucketSeconds: 60, label: "1 minute" };
  if (durationMinutes <= 720) return { bucketSeconds: 300, label: "5 minutes" };
  if (durationMinutes <= 2880) return { bucketSeconds: 900, label: "15 minutes" };
  if (durationMinutes <= 14400) return { bucketSeconds: 3600, label: "1 hour" };
  return { bucketSeconds: 21600, label: "6 hours" };
}
```

---

## 5. Temporal Reactivity: What Updates on Range Change?

When the user selects a different time range (e.g. toggles from `24h` to `1h`), every component on the page must update reactively without a full page reload:

1. **Chart Horizontal Domain**: Axis min/max adjusts to the new temporal interval.
2. **Plotted Data Points**: Re-samples the synthetic dataset to match the computed bucket resolution.
3. **Metric Summary Cards**:
   - Recomputes overall throughput: $\frac{\sum \text{Requests}}{\sum \Delta t}$.
   - Recomputes weighted error rate: $\frac{\sum \text{Errors}}{\sum \text{Requests}} \times 100\%$.
   - Recomputes p95/p99 latency for the active interval.
4. **Comparison Baseline Series**: Generates the matching previous-period series and recalculates the percentage delta badges.
5. **Incident Marker Pins**: Filters visible incident pins to only those whose active or resolved windows intersect the selected range.
6. **Service Breakdown Table**: Aggregates service-specific traffic and error counts strictly within the selected range.

> [!IMPORTANT]
> **Strict Anti-Flicker Rule**: Changing time ranges must transition smoothly in 150ms. Charts must **not** flash white or reset to zero height during state transitions.
