# Synthetic Mock Data Generation Guidance for Astra

**Document Version:** 1.0.0  
**Researcher:** Principal Technical Architecture Analyst, Senior Performance Engineer  
**Target:** Implementation Blueprint for Deterministic Telemetry Generation  
**Location:** [`phase3-research/data/mock-data-generation-guidance.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/data/mock-data-generation-guidance.md)  

---

## 1. Principles of Deterministic Generation

1. **Pure Functional Math**: Data must be generated using deterministic trigonometric and polynomial functions keyed to Unix timestamps.
2. **Never Call `Math.random()` in Render**: Every point must be calculated from a seeded pseudo-random number generator or mathematical baseline.
3. **Reproducibility Guarantee**: Given identical query parameters (`projectId="payment-gateway"`, `range="24h"`, `compareWith="previous_period"`), the generator must return bit-for-bit identical JSON arrays.

---

## 2. Generation Algorithm Implementation

Astra should implement this generator in `lib/demo/telemetry/telemetry-fixtures.ts`:

```typescript
import { TimeSeriesPoint, TimeRangePreset } from "./analytics-contract";

export const SCENARIO_ANCHOR_MS = Date.parse("2026-10-14T09:30:00Z");

/** Simple seedable linear congruential generator (LCG) */
function pseudoNoise(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates an array of TimeSeriesPoints for Payment Gateway.
 * Injects the exact degraded incident spike starting at 09:18 UTC and peaking at 09:26 UTC.
 */
export function generatePaymentGatewaySeries(
  startMs: number,
  endMs: number,
  bucketSeconds: number,
  isComparison: boolean = false
): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const shift = isComparison ? (endMs - startMs) : 0;
  const numBuckets = Math.floor((endMs - startMs) / (bucketSeconds * 1000));

  for (let i = 0; i <= numBuckets; i++) {
    const t = startMs + i * bucketSeconds * 1000;
    const isoTime = new Date(t).toISOString();
    const noise = pseudoNoise(Math.floor((t - shift) / 1000));

    // Base diurnal traffic curve (1,150 - 1,280 req/s)
    const hourFraction = (t % 86400000) / 86400000;
    const baseThroughput = 1200 + 100 * Math.sin(hourFraction * 2 * Math.PI) + noise * 40;

    let errorRate = 0.08 + noise * 0.04;
    let latencyP50 = 22 + noise * 4;
    let latencyP95 = 45 + noise * 10;
    let latencyP99 = 82 + noise * 18;
    let queueDepth = 60 + Math.floor(noise * 30);

    // If NOT comparison period, inject the incident spike starting at 09:18 UTC (14 Oct 2026)
    const spikeOnsetMs = Date.parse("2026-10-14T09:18:00Z");
    const incidentFireMs = Date.parse("2026-10-14T09:26:00Z");

    if (!isComparison && t >= spikeOnsetMs && t <= endMs) {
      // Linear / exponential ramp factor from 0.0 to 1.0
      const ramp = Math.min(1.0, (t - spikeOnsetMs) / (incidentFireMs - spikeOnsetMs));
      
      // Queue depth swells to 1,420 msgs
      queueDepth = Math.round(60 + ramp * 1360 + noise * 20);
      
      // Latency p95 spikes to 482 ms; p99 to 1,120 ms
      latencyP50 = Math.round(22 + ramp * 26 + noise * 4);
      latencyP95 = Math.round(45 + ramp * 437 + noise * 15);
      latencyP99 = Math.round(82 + ramp * 1038 + noise * 25);
      
      // Error rate climbs to 3.42%
      errorRate = Number((0.08 + ramp * 3.34 + noise * 0.1).toFixed(2));
    }

    const availability = Number((100 - errorRate).toFixed(2));

    points.push({
      timestamp: t,
      isoTime,
      requestRate: Math.round(baseThroughput),
      errorRate,
      latencyP50,
      latencyP95,
      latencyP99,
      availability,
      queueDepth,
    });
  }

  return points;
}
```

---

## 3. Empty & Disconnected Project Generation Rules

1. **`portfolio-api` (Disconnected)**:
   - Return empty array `[]` for time-series.
   - Return all summary metrics with `currentValue: 0`, `formattedValue: "—"`, `deltaPercent: 0`, `isAnomaly: false`.
2. **`inventory` (Pending)**:
   - Return empty array `[]` for time-series.
   - Return summary metrics with `formattedValue: "PENDING"`.
3. **User-Created Projects (`local-...`)**:
   - Return empty array `[]`.
   - Never generate telemetry.
