# AegisOps Service Analytics & Topological Breakdown Specification

**Document Version:** 1.0.0  
**Researcher:** Senior Observability UX Designer, Systems Architecture Analyst  
**Repository State:** Verified Phase 2 codebase (`components/workspace/project-detail.tsx`, `components/workspace/project-visuals.tsx`)  
**Location:** [`phase3-research/aegisops/service-analytics-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/aegisops/service-analytics-spec.md)  

---

## 1. Executive Goal

In microservice architectures, aggregate project-level metrics can hide localized degradation. A project reporting an overall p95 latency of 480ms could have 95% of its services running at 20ms while a single queue worker is blocked at 1,500ms.

The Service Analytics interface enables operators to immediately answer:
1. **Which service has the highest latency?**
2. **Which service is generating errors?**
3. **Which service handles the majority of traffic?**
4. **Which services are directly affected by active incidents?**
5. **Which services have missing or stale telemetry?**

---

## 2. Service Telemetry Table Specification

Located under `#services` within the project detail console, replacing the simple static list from Phase 2 with an operational table styled after Stripe’s high-density reporting views (`stripe-report-filters.png`).

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SERVICE INVENTORY & TELEMETRY BREAKDOWN                                                                │
│ [🔍 Filter services...]  [All Statuses ∨]  [All Stacks ∨]                                [Export CSV ↗]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ SERVICE NAME         │ STACK       │ STATUS       │ THROUGHPUT    │ ERROR RATE │ P95 LATENCY │ INCIDENTS │
├──────────────────────┼─────────────┼──────────────┼───────────────┼────────────┼─────────────┼───────────┤
│ [01] Queue Worker    │ RabbitMQ    │ ● DEGRADED   │   420 req/s   │  4.82 % [!]│  680 ms [!] │ 1 ACTIVE  │
│ [02] Payment API     │ Java 21     │ ● HEALTHY    │ 1,280 req/s   │  0.08 %    │   42 ms     │ 0         │
│ [03] Database        │ PostgreSQL  │ ● HEALTHY    │ 3,450 qps     │  0.00 %    │    8 ms     │ 0         │
└──────────────────────┴─────────────┴──────────────┴───────────────┴────────────┴─────────────┴───────────┘
```

### 2.1 Table Columns & Data Alignment
1. **Service Name**: Monospace index `[01]` + bold display title (`Queue Worker`).
2. **Technology Stack**: Monospace label (`RabbitMQ / Java`).
3. **Operational Status**: Health dot + uppercase text (`● DEGRADED` in ochre `#9b6a24`, `● HEALTHY` in charcoal `#282828`, `● CRITICAL` in alert red `#fa3600`).
4. **Throughput**: Right-aligned tabular numbers (`420 req/s`).
5. **Error Rate**: Right-aligned percentage with alert pill if breaching warning threshold (`4.82 % [!]`).
6. **p95 Latency**: Right-aligned latency in milliseconds (`680 ms [!]`).
7. **Active Incidents**: Count badge; clicking links directly to the incident.
8. **Row Interaction**: Clicking any row opens the **Service Detail Drawer**.

---

## 3. Service Detail Drawer (Slide-Out Side Panel)

Adapting Stripe’s transaction details drawer pattern (`stripe-filter-popover.png` / details panel), clicking a service opens a slide-out drawer (`width: 520px` on desktop, full-width sheet on mobile):

```
┌────────────────────────────────────────────────────────┐
│ SERVICE INSPECTOR                                  [×] │
├────────────────────────────────────────────────────────┤
│ payment-gateway-svc-2 / NORTHSTAR                      │
│ QUEUE WORKER                                           │
│ Stack: RabbitMQ 3.12 / Python Worker Pool              │
│ Status: ● DEGRADED HEALTH                              │
├────────────────────────────────────────────────────────┤
│ ACTIVE INCIDENT: INC-2026-1014-01                      │
│ "Settlement queue backlog exceeded 1,000 threshold"    │
│ Duration: 4 minutes (Triggered at 09:26 UTC)           │
│ [View Full AI Investigation ↗]                         │
├────────────────────────────────────────────────────────┤
│ SERVICE TELEMETRY SNAPSHOT                             │
│ Throughput:       420 req/s (Settlement consumer rate) │
│ Error Rate:       4.82 % (Timeout errors on ack)       │
│ Queue Depth:      1,420 messages [BREACH]              │
│ Consumer Lag:     840 ms                               │
│ p95 Latency:      680 ms                               │
├────────────────────────────────────────────────────────┤
│ DEPENDENCY GRAPH CONNECTIONS                           │
│ ← Ingress from:  Payment API (Java)                    │
│ → Outgress to:   PostgreSQL Database (Reconciliation)  │
├────────────────────────────────────────────────────────┤
│ RECENT LOG EXCERPT (Matched @ 09:25:48 UTC)            │
│ [WARN] Worker thread pool exhausted (pool_size=16)     │
│ [ERR]  Connection timeout writing settlement batch #42 │
└────────────────────────────────────────────────────────┘
```

---

## 4. Enhanced Architectural Schematic Map

In Phase 2, `components/workspace/project-visuals.tsx` introduced `<ServiceDrawing>`, an SVG schematic showing node rectangles with connectors. 

In Phase 3, this schematic is elevated into an **interactive telemetry map**:
1. **Incident Pulsing Ring**: Any service with an active incident displays a subtle red drafting perimeter (`stroke: #fa3600`, `stroke-dasharray: 2 2`).
2. **Health Indicator Dots**: Node corners display real-time status dots (`●`).
3. **Interactive Selection**: Clicking a service node in the SVG selects that service, highlighting its row in the table and filtering the charts.
4. **Boundary Invariant**: As required by the architectural brief, the diagram remains a **schematic service inventory map**, not a fabricated live network sniffer. Connectors represent documented dependency flows, not synthetic live byte counts.
