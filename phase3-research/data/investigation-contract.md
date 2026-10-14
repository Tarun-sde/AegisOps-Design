# TypeScript Presentation Data Contract: Incident Intelligence & Investigation

**Document Version:** 1.0.0  
**Researcher:** Principal Technical Architecture Analyst, TypeScript Interface Specialist  
**Location:** [`phase3-research/data/investigation-contract.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/data/investigation-contract.md)  

---

## 1. Type Definitions

```typescript
export type IncidentSeverity = "P1" | "P2" | "P3" | "P4";
export type IncidentStatus = "active" | "investigating" | "mitigated" | "resolved";
export type InvestigationCertainty = "high" | "moderate" | "low";

/** Operational Incident Record */
export type IncidentRecord = {
  id: string;                         // e.g. "INC-2026-1014-01"
  projectId: string;                  // e.g. "payment-gateway"
  workspaceId: string;                // e.g. "northstar"
  title: string;                      // e.g. "Settlement queue backlog breach"
  severity: IncidentSeverity;         // "P1"
  status: IncidentStatus;             // "active"
  startedAt: string;                  // ISO 8601 string: "2026-10-14T09:26:00Z"
  resolvedAt: string | null;          // ISO 8601 or null if active
  durationMinutes: number;            // e.g. 4
  affectedServiceIds: string[];       // ["payment-gateway-svc-2"]
  triggeringCondition: string;        // "settlement_queue_depth > 1000 for 5m"
  investigationId: string | null;     // e.g. "INV-8042"
};

/** Discriminated union of evidence records */
export type LogEvidenceRecord = {
  id: string;                         // e.g. "EV-LOG-401"
  type: "log";
  serviceId: string;
  serviceName: string;
  timestamp: string;
  severity: "ERROR" | "WARN" | "INFO";
  message: string;
  attributes: Record<string, string | number | boolean>;
};

export type TraceSpan = {
  name: string;
  service: string;
  durationMs: number;
  error?: boolean;
};

export type TraceEvidenceRecord = {
  id: string;                         // e.g. "EV-TRC-882"
  type: "trace";
  serviceId: string;
  serviceName: string;
  timestamp: string;
  traceId: string;
  durationMs: number;
  baselineMs: number;
  status: "ERROR" | "OK";
  spans: TraceSpan[];
};

export type MetricEvidenceRecord = {
  id: string;                         // e.g. "EV-MET-104"
  type: "metric";
  serviceId: string;
  serviceName: string;
  timestamp: string;
  signalA: string;
  signalB: string;
  correlation: number;                // e.g. 0.94
  description: string;
};

export type ChangeEvidenceRecord = {
  id: string;                         // e.g. "EV-CHG-012"
  type: "change";
  serviceId: string;
  serviceName: string;
  timestamp: string;
  version: string;
  commit: string;
  author: string;
  message: string;
};

export type EvidenceRecord =
  | LogEvidenceRecord
  | TraceEvidenceRecord
  | MetricEvidenceRecord
  | ChangeEvidenceRecord;

/** Diagnostic Hypothesis */
export type HypothesisRecord = {
  id: string;                         // e.g. "HYP-01"
  rank: number;                       // 1 (primary), 2 (secondary)
  statement: string;                  // Diagnostic root-cause assertion
  certainty: InvestigationCertainty;  // "high" | "moderate" | "low"
  certaintyLabel: string;             // e.g. "High certainty (supported by 3 correlated telemetry signals)"
  supportingEvidenceIds: string[];    // ["EV-LOG-401", "EV-TRC-882", "EV-MET-104"]
  contradictoryEvidenceIds: string[]; // ["EV-MET-102"]
  negativeProofExplanation: string;   // Why certain potential causes were ruled out
  unknowns: string[];                 // Telemetry signals missing in this window
  suggestedChecks: string[];          // Concrete steps for human on-call engineer
};

/** Human-in-the-loop Remediation Action */
export type ProposedAction = {
  id: string;                         // e.g. "ACT-01"
  title: string;
  type: "query" | "simulation" | "approval";
  command?: string;
  description: string;
  status: "ready" | "simulated" | "disabled";
  disabledReason?: string;
};

/** Complete AI Investigation Session Record */
export type InvestigationRecord = {
  id: string;                         // e.g. "INV-8042"
  incidentId: string;                 // e.g. "INC-2026-1014-01"
  projectId: string;
  status: "complete" | "in_progress" | "inconclusive";
  startedAt: string;                  // "2026-10-14T09:26:30Z"
  completedAt: string;                // "2026-10-14T09:28:10Z"
  analyzedSignalsCoverage: string;    // "Logs (1), Traces (1), Metrics (2), Changes (1)"
  hypotheses: HypothesisRecord[];
  evidence: EvidenceRecord[];
  proposedActions: ProposedAction[];
};
```

---

## 2. Investigation Adapter Function Signatures

Astra should implement read-only query functions in `lib/demo/telemetry/investigation-adapter.ts`:

```typescript
/**
 * Query incidents for a given project within an active time window.
 */
export function getProjectIncidents(projectId: string): IncidentRecord[];

/**
 * Fetch full AI investigation record for a specific incident.
 */
export function getInvestigation(incidentId: string): InvestigationRecord | null;

/**
 * Resolves an individual evidence record by ID.
 */
export function getEvidenceById(evidenceId: string): EvidenceRecord | null;
```
