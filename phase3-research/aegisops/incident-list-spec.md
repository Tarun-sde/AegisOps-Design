# AegisOps Incident Management: Incident Register & List Specification

**Document Version:** 1.0.0  
**Researcher:** Senior Observability UX Designer, Incident Intelligence Specialist  
**Reference Alignment:** Stripe Transaction Registers, Google SRE Incident Management  
**Location:** [`phase3-research/aegisops/incident-list-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/aegisops/incident-list-spec.md)  

---

## 1. Executive Purpose

AegisOps is fundamentally an **Incident Intelligence** product, not merely a passive KPI dashboard. The analytics interface must directly bridge metric anomalies to active operational incidents.

The **Incident Register** provides a comprehensive, filterable list of all operational incidents detected within the scoped project and time window, formatted with the density and precision observed in Stripe's payment transaction tables.

---

## 2. Incident Register Layout & Wireframe

Located at `/projects/[workspaceId]/[projectId]/incidents` or as the active tab `#incidents` within the project detail shell:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ INCIDENT REGISTER · PAYMENT GATEWAY                                                                    │
│ [🔍 Search incidents...]  [SEVERITY: ALL ∨]  [STATUS: ACTIVE & RECENT ∨]                  [Export CSV ↗]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ SEV │ INCIDENT ID         │ TITLE & TRIGGER CONDITION            │ SERVICE       │ STARTED    │ STATE  │
├─────┼─────────────────────┼──────────────────────────────────────┼───────────────┼────────────┼────────┤
│ P1  │ INC-2026-1014-01    │ Settlement queue backlog breach      │ Queue Worker  │ 09:26 UTC  │ INVEST │
│     │                     │ Condition: queue_depth > 1000 for 5m │ (RabbitMQ)    │ (4m ago)   │ READY  │
├─────┼─────────────────────┼──────────────────────────────────────┼───────────────┼────────────┼────────┤
│ P3  │ INC-2026-1012-04    │ Periodic reconciliation lock delay   │ Database      │ 12 Oct     │ RESOLV │
│     │                     │ Condition: lock_wait_time > 500ms    │ (PostgreSQL)  │ (2d ago)   │ CLOSED │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Column Data Specifications

1. **Severity Badge (`SEV`)**:
   - `P1`: High-contrast alert red badge (`background: #fa3600`, `color: #ffffff`, text: `P1`). Indicates severe service degradation or user-facing failure.
   - `P2`: Ochre badge (`background: #9b6a24`, `color: #ffffff`, text: `P2`). High operational risk.
   - `P3`: Subtle charcoal outline (`border: 1px solid #282828`, text: `P3`). Moderate elevation.
   - `P4`: Muted gray outline (`border: 1px solid #b3b3af`, text: `P4`). Informational / low severity.
2. **Incident ID**:
   - Monospace identifier (`INC-2026-1014-01`). Clicking copies ID or navigates to detail view.
3. **Title & Trigger Condition**:
   - Title: Bold description (`Settlement queue backlog breach`).
   - Trigger Condition: Secondary monospace code (`settlement_queue_depth > 1000 for 5m`).
4. **Affected Service**:
   - Service name badge (`Queue Worker · RabbitMQ`).
5. **Started & Duration**:
   - Timestamp (`14 Oct · 09:26:00 UTC`) + elapsed duration (`4m active`).
6. **AI Investigation State**:
   - `INVESTIGATION READY`: Green/charcoal badge indicating the AI investigation engine has assembled correlated hypotheses and evidence.
   - `INVESTIGATING`: Subtle pulsing badge indicating ongoing synthetic evidence aggregation.
   - `RESOLVED`: Muted neutral tag.
7. **Action Trigger**:
   - Button: `Inspect AI Findings [INV-8042] ↗`.

---

## 4. Interaction Behaviors

1. **Row Click**:
   - Clicking an incident row opens the **Incident Detail View** or slides out the quick-inspection drawer.
2. **Filter Composition**:
   - Filtering by Severity (`P1`, `P2`, `P3`, `P4`) or Status (`Active`, `Investigating`, `Resolved`) updates row counts immediately.
3. **Chart Cross-Correlation**:
   - Selecting an incident in the list highlights its time span on the main hero chart and centers the time window around the incident onset!
