# Frontend Demo Data Contract & Fixtures: AegisOps

**Document Version:** 1.0.0  
**Target:** Astra Frontend Implementation  
**Type Safety:** Strict TypeScript (Zero `any`)  
**Storage Architecture:** Safe `useSyncExternalStore` + `localStorage` Hydration  
**Location:** [`phase2-research/architecture/demo-data-contract.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/architecture/demo-data-contract.md)  

---

## 1. Domain Entities & Type Definitions

The frontend data model is organized into four distinct entities:

```typescript
export type Health = "healthy" | "degraded" | "critical" | "unknown";
export type Environment = "production" | "staging" | "development";
export type Monitoring = "connected" | "disconnected" | "pending";

/**
 * An individual monitored microservice or infrastructure component
 * within a project.
 */
export type Service = {
  id: string;
  name: string;
  technology: string;
  health: Health;
};

/**
 * Chronological telemetry signal, incident alert, or configuration log event.
 */
export type Activity = {
  id: string;
  at: string; // ISO 8601 UTC timestamp
  message: string;
  kind: "signal" | "incident" | "setup";
};

/**
 * A monitored software application belonging to a workspace.
 */
export type Project = {
  id: string;                   // Stable unique identifier (e.g. "payment-gateway" or "local-billing-123")
  workspaceId: string;          // Parent workspace (e.g. "northstar", "personal", "sandbox")
  name: string;                 // Display title (e.g. "Payment Gateway")
  description: string;          // Operational summary
  technology: string;           // Framework and primary datastore (e.g. "Java / PostgreSQL")
  environment: Environment;     // Runtime tier
  monitoringStatus: Monitoring; // Connection state of telemetry agent
  health: Health;               // Aggregate operational reliability state
  services: Service[];          // Monitored microservices
  activeIncidentCount: number;  // Number of active unacknowledged incidents
  lastSignalAt: string | null;  // ISO timestamp of last received telemetry trace, or null if none
  activities: Activity[];       // Project-scoped audit events
  local?: boolean;              // True if created during current browser session in localStorage
};

/**
 * An organizational boundary containing projects.
 */
export type Workspace = {
  id: string;
  name: string;
  owner: string;
  code: string; // Compact scope tag (e.g. "P / 01", "N / 02")
};
```

---

## 2. Key Data Integrity Rules & Invariants

1. **Service Health vs. Project Health**:
   - An individual service may be `degraded` while the project overall remains functional, or vice versa.
   - Aggregate project health is derived deterministically:
     - If any service is `critical` → Project is `critical`.
     - Else if any service is `degraded` → Project is `degraded`.
     - Else if all services are `healthy` → Project is `healthy`.
     - If no telemetry is connected → Project is `unknown`.
2. **Monitoring Connection State vs. Health**:
   - `connected`: Telemetry agent is actively emitting signals.
   - `pending`: Application provisioned, waiting for first ping. Health is strictly `unknown`.
   - `disconnected`: Agent unreachable or intentionally paused. Health is `unknown`.
3. **Telemetry Receipt Integrity**:
   - `lastSignalAt` is a static, deterministic ISO timestamp (e.g. `2026-10-14T09:26:00Z`).
   - It is formatted as `14 Oct · 09:26 UTC` via `signalLabel()`. It does NOT tick forward in real-time like a fake stop-watch.

---

## 3. Seed Fixture Data Inventory

The application is pre-seeded with 7 deterministic projects distributed across 2 active workspaces:

### Personal Workspace (`personal`):
1. **`ironlog`**: `IronLog`  
   - Description: "A stronger everyday. Fitness tracking and training plans."  
   - Tech: `Next.js / PostgreSQL` | Env: `production` | Monitoring: `connected` | Health: `healthy`  
   - Services (3): API (Node.js), Frontend (Next.js), Database (PostgreSQL).  
   - Last Signal: `2026-10-14T09:28:00Z` | Incidents: `0`
2. **`rentsense`**: `RentSense`  
   - Description: "Fleet operations, rentals and every mile in between."  
   - Tech: `Python / Redis` | Env: `staging` | Monitoring: `connected` | Health: `degraded`  
   - Services (3): Fleet API (FastAPI, healthy), Location Worker (Python, degraded), Cache (Redis, healthy).  
   - Last Signal: `2026-10-14T09:23:00Z` | Incidents: `1` ("Location updates delayed in sample fleet")
3. **`portfolio-api`**: `Portfolio API`  
   - Description: "A small backend for selected work and new ideas."  
   - Tech: `Go / SQLite` | Env: `development` | Monitoring: `disconnected` | Health: `unknown`  
   - Services (2): Content API (Go, unknown), Store (SQLite, unknown).  
   - Last Signal: `null` | Incidents: `0`

### Northstar Engineering Workspace (`northstar`):
4. **`customer-portal`**: `Customer Portal`  
   - Description: "A single point of access for Northstar customers."  
   - Tech: `React / Node.js` | Env: `production` | Monitoring: `connected` | Health: `healthy`  
   - Services (2): Web Portal (React), Customer API (Node.js).  
   - Last Signal: `2026-10-14T09:29:00Z` | Incidents: `0`
5. **`payment-gateway`**: `Payment Gateway`  
   - Description: "Payment processing, settlement and reconciliation."  
   - Tech: `Java / PostgreSQL` | Env: `production` | Monitoring: `connected` | Health: `degraded`  
   - Services (3): Payment API (Java, healthy), Queue Worker (RabbitMQ, degraded), Database (PostgreSQL, healthy).  
   - Last Signal: `2026-10-14T09:26:00Z` | Incidents: `1` ("Settlement queue exceeded sample threshold")
6. **`authentication`**: `Authentication Service`  
   - Description: "Identity, access and secure sessions across the platform."  
   - Tech: `Go / Redis` | Env: `production` | Monitoring: `connected` | Health: `critical`  
   - Services (3): Identity API (Go, critical), Session Store (Redis, critical), Worker (Go, healthy).  
   - Last Signal: `2026-10-14T09:27:00Z` | Incidents: `2` ("Identity failures and session-store timeouts detected")
7. **`inventory`**: `Inventory Platform`  
   - Description: "Stock movement and fulfillment, kept in step."  
   - Tech: `Python / PostgreSQL` | Env: `staging` | Monitoring: `pending` | Health: `unknown`  
   - Services (3): Inventory API, Stock Worker, Warehouse DB (all unknown).  
   - Last Signal: `null` | Incidents: `0` ("Sample service inventory prepared; connection pending")

---

## 4. Safe Browser Hydration (`useSyncExternalStore`)

To prevent React 19 hydration mismatches in Next.js App Router when reading `localStorage`:

```typescript
// Initial snapshot is identical between server SSR and client first render
const initial: State = {
  projects: [],
  workspace: "personal",
  view: "grid",
  pinned: [],
  ready: false,
  warning: "",
};

// State is read cleanly via useSyncExternalStore
export const useDemo = () =>
  useSyncExternalStore(subscribe, () => state, () => initial);
```

- When hydration finishes, `read()` parses `localStorage.getItem("aegisops-demo-v1")`.
- If data is valid, `state.projects` updates smoothly without crashing initial server HTML.
- If storage is corrupted or in a private browsing sandbox, it safely falls back to default fixtures without breaking the UI.
