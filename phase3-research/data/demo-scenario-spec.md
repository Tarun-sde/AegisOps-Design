# AegisOps Coherent Demonstration Scenario Specification: Payment Gateway Degradation

**Document Version:** 1.0.0  
**Researcher:** Principal Product Research Engineer, Senior Observability UX Designer  
**Scenario Target:** Northstar Engineering / Payment Gateway (`northstar/payment-gateway`)  
**Scenario Anchor Clock:** `2026-10-14T09:30:00Z` (14 October 2026 at 09:30 UTC)  
**Location:** [`phase3-research/data/demo-scenario-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/data/demo-scenario-spec.md)  

---

## 1. Scenario Overview

To provide a convincing, interview-ready demonstration, AegisOps centers its observability and investigation features around **one mathematically and causally coherent incident scenario**:

* **Project**: `payment-gateway` (Northstar Engineering)
* **Technology**: Java 21 / RabbitMQ / PostgreSQL
* **Environment**: Production (`us-east-1`)
* **Incident Title**: **Settlement Queue Backlog & Worker Thread Starvation**
* **Incident Identifier**: `INC-2026-1014-01`
* **Investigation Identifier**: `INV-8042`
* **Trigger Condition**: `settlement_queue_depth > 1000 for 5m`

---

## 2. Chronological Causal Storyline

```
08:00 UTC ─────────────────── 09:12 UTC ──────── 09:18 UTC ─────── 09:22 UTC ──────── 09:26 UTC ──── 09:30 UTC
  Normal Baseline               Deployment        Traffic Surge     Thread Lock        Alert Fires    Demo Clock
  (p95: 42ms, err: 0.08%)      (Release v2.14)   (1,280 req/s)     (Queue > 1,000)    (Incident P1)  (4m active)
```

### Stage 1: Normal Baseline (`08:00:00Z` – `09:12:00Z`)
- The system operates well within all SLO thresholds.
- Throughput: steady at `1,180 – 1,220 req/s`.
- Overall Error Rate: `0.08%` (mostly occasional transient network retries).
- Latency Percentiles: `p50 = 22ms`, `p95 = 45ms`, `p99 = 82ms`.
- Settlement Queue Depth: `40 – 90 messages` (healthy draining).
- All 3 services (`Payment API`, `Queue Worker`, `Database`) report `healthy`.

### Stage 2: Configuration / Deployment Change (`09:12:00Z`)
- Event `EV-CHG-012`: Automated deployment of **Release v2.14.0** (Commit `4a9f1bc`).
- Author: `engineering-team`.
- Changelog: *"Enable multi-item settlement batching (batch_size=50) to optimize reconciliation throughput"*.
- Unintended Consequence: The larger batch size causes database transaction write locks to be held significantly longer during reconciliation commits.

### Stage 3: Onset of Degradation (`09:18:00Z` – `09:24:00Z`)
- Incoming checkout transactions surge slightly from 1,200 to `1,280 req/s`.
- Because each worker batch holds a row lock for up to 600ms on the `settlement_records` table, worker threads start waiting on locks.
- At `09:22:15Z`, all 16 worker consumer threads in replica pod 2 become saturated.
- Consumer ACK latency climbs from 15ms to `420ms`.
- Messages begin accumulating in RabbitMQ; queue depth jumps from 150 to `820 messages`.

### Stage 4: Alert Threshold Breach & Incident Trigger (`09:26:00Z`)
- At `09:26:00Z`, the monitoring rule triggers:
  `settlement_queue_depth > 1000 for 5m (Observed: 1,420 msgs)`.
- Incident `INC-2026-1014-01` is automatically opened with severity **P1 (Degraded)**.
- Telemetry Snapshot at `09:26:00Z`:
  - `settlement_queue_depth`: **1,420 msgs** (Critical)
  - `p95 latency (Queue Worker)`: **680 ms** (Spike vs 45ms baseline)
  - `p95 latency (Overall Project)`: **482 ms** (Spike vs 82ms baseline)
  - `p99 latency (Overall Project)`: **1,120 ms** (Extreme tail)
  - `error_rate`: **3.42 %** (Downstream timeouts on batch commits)
- Project Health transitions from `healthy` to `degraded`.

### Stage 5: Automated AI Investigation (`09:26:30Z` – `09:28:10Z`)
- Investigation `INV-8042` is dispatched automatically.
- Correlates telemetry signals across logs, traces, metrics, and deployments.
- Formulates two ranked diagnostic hypotheses:
  - **Primary [HYP-01] (High Certainty)**: Database write-lock contention starving worker consumer threads following Release v2.14.0.
  - **Secondary [HYP-02] (Lower Certainty)**: RabbitMQ prefetch misconfiguration (deprioritized due to database error logs).
- Suggests immediate human-in-the-loop checks.

### Stage 6: Current Scenario Anchor (`09:30:00Z`)
- The incident has been active for **4 minutes**.
- The scenario is paused at this exact moment so the user can inspect the live degraded state, trace the evidence, and test remediation proposals.

---

## 3. Coherent Metric Values at Anchor Clock (`09:30 UTC`)

| Metric | Baseline Value (08:00–09:00) | Current Incident Value (09:26–09:30) | Delta vs Baseline | Alert Severity |
| :--- | :--- | :--- | :--- | :--- |
| **Request Throughput** | 1,200 req/s | **1,280 req/s** | `+6.7%` | Normal |
| **Error Rate** | 0.08 % | **3.42 %** | `+3.34%` | **Critical [!]** |
| **Latency p50** | 22 ms | **48 ms** | `+26 ms` | Minor |
| **Latency p95** | 45 ms | **482 ms** | `+437 ms` | **Critical [!]** |
| **Latency p99** | 82 ms | **1,120 ms** | `+1,038 ms` | **Critical [!]** |
| **Queue Depth** | 65 msgs | **1,420 msgs** | `+2,084%` | **Critical [!]** |
| **Worker p95** | 40 ms | **680 ms** | `+640 ms` | **Critical [!]** |
| **Payment API p95** | 38 ms | **42 ms** | `+4 ms` | Healthy |
| **Database p95** | 6 ms | **14 ms** | `+8 ms` | Healthy |
| **SLI (24h Window)** | 99.94 % | **99.18 %** | `-0.76%` | Degraded |

---

## 4. Coherent Evidence Inventory

Every evidence item below must be directly resolvable in the synthetic scenario fixture:

```json
[
  {
    "id": "EV-LOG-401",
    "type": "log",
    "serviceId": "payment-gateway-svc-2",
    "serviceName": "Queue Worker",
    "timestamp": "2026-10-14T09:25:48.120Z",
    "severity": "ERROR",
    "message": "ConnectionTimeoutException: Failed to acquire write lock on table 'settlement_records'",
    "attributes": {
      "pool": "worker-pool-4",
      "timeoutMs": 5002,
      "batchId": "batch_settle_89214"
    }
  },
  {
    "id": "EV-TRC-882",
    "type": "trace",
    "serviceId": "payment-gateway-svc-2",
    "serviceName": "Queue Worker",
    "timestamp": "2026-10-14T09:24:30.000Z",
    "traceId": "trc-8820f1a4e",
    "durationMs": 642,
    "baselineMs": 22,
    "status": "ERROR",
    "spans": [
      { "name": "POST /v1/settlements/batch", "service": "Payment API", "durationMs": 642 },
      { "name": "queue_publish", "service": "RabbitMQ", "durationMs": 18 },
      { "name": "worker_settlement_consume", "service": "Queue Worker", "durationMs": 624, "error": true },
      { "name": "db_tx_settlement_write", "service": "PostgreSQL", "durationMs": 612, "error": true }
    ]
  },
  {
    "id": "EV-MET-104",
    "type": "metric",
    "serviceId": "payment-gateway-svc-2",
    "serviceName": "Queue Worker",
    "timestamp": "2026-10-14T09:26:00.000Z",
    "signalA": "settlement_queue_depth",
    "signalB": "postgres_lock_wait_seconds",
    "correlation": 0.94,
    "description": "Queue depth surges in direct 0.94 correlation with database transaction lock wait times."
  },
  {
    "id": "EV-CHG-012",
    "type": "change",
    "serviceId": "payment-gateway-svc-1",
    "serviceName": "Payment Gateway",
    "timestamp": "2026-10-14T09:12:00.000Z",
    "version": "v2.14.0",
    "commit": "4a9f1bc",
    "author": "engineering-team",
    "message": "Enable multi-item settlement batching (batch_size=50)"
  }
]
```
