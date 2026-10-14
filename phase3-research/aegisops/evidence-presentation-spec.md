# AegisOps Evidence Presentation & Trace Explorer Specification

**Document Version:** 1.0.0  
**Researcher:** Senior Observability UX Designer, Distributed Tracing & Telemetry Analyst  
**Reference Alignment:** OpenTelemetry Semantic Conventions for Logs and Traces  
**Location:** [`phase3-research/aegisops/evidence-presentation-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/aegisops/evidence-presentation-spec.md)  

---

## 1. Executive Purpose

In AegisOps, an AI hypothesis is only as trustworthy as the evidence it cites. The **Evidence Explorer** provides an interactive, auditable deep-dive into the raw telemetry records that the investigation engine analyzed to reach its diagnostic conclusions.

Every citation code (`EV-LOG-401`, `EV-TRC-882`, `EV-MET-104`, `EV-CHG-012`) maps to a real synthetic fixture in the demonstration scenario.

---

## 2. Evidence Explorer Layout & Wireframe

Embedded directly below the hypotheses in the AI Investigation Console or as an inspectable side drawer:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ EVIDENCE EXPLORER · 4 RECORDS ANALYZED                                                                 │
│ [LOGS (1)]    [TRACES (1)]    [METRICS (1)]    [CHANGES (1)]                       [Export Evidence ↗] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB 1: LOG EXCERPTS (Selected: EV-LOG-401)                                                             │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 09:25:48.120 UTC | [ERROR] | service=queue-worker | pod=worker-7f9b8-2                             │ │
│ │ ConnectionTimeoutException: Failed to acquire write lock on table 'settlement_records'              │ │
│ │   at com.northstar.settlement.DatabaseWriter.executeBatch(DatabaseWriter.java:184)                 │ │
│ │   at com.northstar.settlement.QueueConsumer.processBatch(QueueConsumer.java:92)                     │ │
│ │   Duration: 5002ms (timeout breached) | batch_id="batch_settle_89214" | worker_thread="pool-4"   │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB 2: DISTRIBUTED TRACE WATERFALL (Selected: EV-TRC-882)                                              │
│ Trace ID: trc-8820f1a4e · Total Duration: 642ms (Spike vs 22ms baseline) · Spans: 3 · Status: ERROR   │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ POST /v1/settlements/batch [Payment API]                     |██████████████████████| 642 ms       │ │
│ │   ↳ queue_publish [RabbitMQ]                                 |██                    |  18 ms       │ │
│ │       ↳ worker_settlement_consume [Queue Worker]             |  ████████████████████| 624 ms [ERR] │ │
│ │           ↳ db_tx_settlement_write [PostgreSQL]              |    ██████████████████| 612 ms [ERR] │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB 3: CORRELATED METRIC SIGNALS (Selected: EV-MET-104)                                                │
│ Cross-Signal Pearson Correlation: r = 0.94 (Strong Positive Correlation)                              │
│ ┌──────────────────────────────────────────────────┬─────────────────────────────────────────────────┐ │
│ │ SIGNAL A: settlement_queue_depth (msgs)          │ SIGNAL B: postgres_lock_wait_seconds (ms)       │ │
│ │ 1500 ┤              ╭────────── [1,420 msgs]     │  800ms ┤              ╭────────── [680 ms]      │ │
│ │ 1000 ┤           ╭──╯                            │  400ms ┤           ╭──╯                         │ │
│ │    0 ┴───────────┴────────────────────────────── │    0ms ┴───────────┴─────────────────────────── │ │
│ │      09:00     09:15     09:24     09:30 UTC     │        09:00     09:15     09:24     09:30 UTC  │ │
│ └──────────────────────────────────────────────────┴─────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB 4: CHANGE EVENTS & DEPLOYMENTS (Selected: EV-CHG-012)                                              │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 09:12:00 UTC · DEPLOYMENT: Release v2.14.0 (Commit 4a9f1bc) · Northstar / Payment Gateway           │ │
│ │ Author: engineering-team | Changelog: "Enable multi-item settlement batching (batch_size=50)"        │ │
│ │ Causal Link: Increased batch transaction size triggered table lock contention under load!           │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Bidirectional Citation Mechanics

1. **Hypothesis to Evidence**:
   - In any hypothesis card, clicking citation badge `[EV-LOG-401]` automatically switches the Evidence Explorer to **Tab 1: Logs** and applies a brief `200ms` highlight pulse (`background: rgba(250, 54, 0, 0.08)`) to the target log row.
2. **Evidence to Hypothesis**:
   - Hovering over an evidence row in the explorer displays a tooltip:
     `Cited by: Primary Hypothesis [HYP-01] (Database write lock contention)`.
3. **Copy Citation**:
   - Hovering over an evidence header displays a `Copy ID` button, copying `EV-LOG-401` to the clipboard.

---

## 4. Evidence Integrity Rules

Astra must enforce these data consistency rules:
- **No Orphan Citations**: Every `[EV-...]` token referenced in a hypothesis must resolve to an entry in the project's evidence fixture array.
- **Timestamp Synchrony**: The timestamps in the log excerpt (`09:25:48 UTC`) and the trace waterfall (`09:25:48 UTC`) must fall strictly within the incident window (`09:26:00 UTC`).
- **No Fake Network Topology**: Trace spans represent application call chains, not fabricated physical routing switches.
