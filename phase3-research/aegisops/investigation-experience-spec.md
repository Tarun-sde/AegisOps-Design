# AegisOps AI Investigation Experience Specification

**Document Version:** 1.0.0  
**Researcher:** Principal Product Research Engineer, Senior AI/UX Specialist  
**Design Principle:** Bounded, Auditable Incident Intelligence (Never an Unstructured Chatbot)  
**Location:** [`phase3-research/aegisops/investigation-experience-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/aegisops/investigation-experience-spec.md)  

---

## 1. Core Philosophy: Why AegisOps Rejects Embedded Chatbots

Most AI prototypes embed a generic conversational chatbot window into a dashboard. For high-stakes observability, this is an unacceptable anti-pattern:
1. **Hallucination Risk**: Unstructured text generators invent non-existent error codes, fabricate imaginary server hostnames, and hallucinate root causes.
2. **Cognitive Burden**: An on-call engineer during a P1 outage does not have time to brainstorm conversational prompts or parse rambling paragraphs.
3. **Auditability Failure**: Conversational outputs cannot be easily linked to verifiable underlying telemetry spans or exported to incident postmortems.

AegisOps provides a **Structured Diagnostic Console**:
$$\text{Incident Trigger} \longrightarrow \text{Automated Evidence Collection} \longrightarrow \text{Hypothesis Ranking} \longrightarrow \text{Human-Reviewed Actions}$$

Every assertion made by the AI engine must cite a **verifiable evidence identifier** (`EV-...`) that exists in the dataset.

---

## 2. Investigation Console Layout & Wireframe

Located at `/projects/[workspaceId]/[projectId]/incidents/[incidentId]` (or expanded modal console):

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ← INCIDENTS REGISTER / INC-2026-1014-01                                                                │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ AI INVESTIGATION CONSOLE · INV-8042                                                                    │
│ Target: Northstar / Payment Gateway / Queue Worker (RabbitMQ)                                          │
│ Trigger: settlement_queue_depth > 1,000 (breached @ 09:26:00 UTC)                                      │
│ Status: ● INVESTIGATION COMPLETE · 3 HYPOTHESES GENERATED · 4 EVIDENCE RECORDS LINKED                  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ PRIMARY DIAGNOSTIC HYPOTHESIS [HYP-01]                                            [HIGH CERTAINTY] │ │
│ │ Database write-lock contention on settlement_records is starving worker threads.                   │ │
│ │                                                                                                    │ │
│ │ • Supporting Evidence:                                                                             │ │
│ │   - [EV-LOG-401] Queue worker logs report write timeout on batch #42 (@ 09:25:48 UTC)             │ │
│ │   - [EV-TRC-882] Trace span db_reconcile_write duration spiked from 12ms to 640ms (@ 09:24:30 UTC)  │ │
│ │   - [EV-MET-104] settlement_queue_depth correlated with postgres_lock_wait_seconds (r = 0.94)     │ │
│ │                                                                                                    │ │
│ │ • Contradictory Evidence / Negative Proof:                                                         │ │
│ │   - [EV-MET-102] Network ingress latency to Payment API remained normal (42ms).                    │ │
│ │     Proves issue is strictly downstream of the API layer.                                          │ │
│ │                                                                                                    │ │
│ │ • Missing Information / Unknowns:                                                                  │ │
│ │   - PostgreSQL query lock table metrics not exported in current telemetry window.                 │ │
│ │                                                                                                    │ │
│ │ • Suggested Immediate Checks:                                                                      │ │
│ │   1. Inspect pg_stat_activity for blocked queries on table settlement_records.                     │ │
│ │   2. Verify replica worker pool sizing (currently at 16/16 capacity).                             │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                        │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ SECONDARY HYPOTHESIS [HYP-02]                                                   [LOWER CERTAINTY]  │ │
│ │ RabbitMQ prefetch count misconfiguration causing consumer unresponsiveness.                        │ │
│ │ • Supporting Evidence: [EV-MET-106] consumer_ack_latency elevated to 820ms.                         │ │
│ │ • Why Deprioritized: Fails to explain database write lock timeouts observed in EV-LOG-401.        │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                        │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ RECOMMENDED ACTIONS (HUMAN REVIEW REQUIRED)                                                        │ │
│ │ [Action 01] Inspect PostgreSQL Active Locks (Safe read-only query)                    [Review ↗]   │ │
│ │ [Action 02] Temporarily Scale Queue Worker Replicas (from 16 to 24 pods)              [Simulate ↗] │ │
│ │ [Action 03] Request Staging Rollback Approval (Build #142)                            [Disabled ⊘] │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Hypothesis Card Specifications

Each hypothesis card must strictly adhere to the following schema:
1. **Title & Statement**: Single-sentence assertion of the root-cause mechanism.
2. **Certainty Badge**:
   - `HIGH CERTAINTY`: Supported by multiple correlated signals (logs + traces + metrics).
   - `MODERATE CERTAINTY`: Supported by single signal; secondary indicators missing.
   - `LOW CERTAINTY / INCONCLUSIVE`: Plausible failure mode, but lacking direct telemetry proof.
   - *Note*: Never invent pseudo-scientific probabilities like "94.382% confidence". Use clear, qualitative language with explicit evidence counts.
3. **Evidence Citations**:
   - Interactive clickable pills (e.g. `[EV-LOG-401]`).
   - Clicking an evidence citation opens the **Evidence Explorer** drawer and immediately highlights the cited log line or trace span!
4. **Negative Proof (Contradictory Evidence)**:
   - What was tested and ruled *out* (e.g., verifying that network packet loss was 0%).
5. **Identified Unknowns**:
   - Explicitly states what information is unavailable in the telemetry stream, maintaining intellectual honesty.

---

## 4. Human-in-the-Loop Remediation Safeguards

AegisOps reinforces the core principle of **bounded, safe operations**:
1. **No Autonomic Execution**: The UI never performs unreviewed destructive changes.
2. **Demo Safeguards**:
   - Remediation action buttons are clearly labeled:
     - `Review Query ↗`: Opens a modal displaying the exact SQL/CLI command for an engineer to copy.
     - `Simulate Scaling ↗`: Executes a safe frontend-only state change demonstrating recovery.
     - `Production Rollback [Disabled ⊘]`: Rendered as disabled with tooltip: *"Production modifications require authorized backend connection"*.
3. **Full Auditability**: Every proposed action cites the hypothesis that justified it.
