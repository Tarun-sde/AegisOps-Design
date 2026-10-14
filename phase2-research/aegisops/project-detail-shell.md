# AegisOps Project Detail Shell Specification

**Document Version:** 1.0.0  
**Target:** Astra Frontend Implementation  
**Visual Style:** Heron Monochromatic Drafting Identity  
**Scope:** Selected Project Workspace Shell & Context Switching  
**Location:** [`phase2-research/aegisops/project-detail-shell.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/aegisops/project-detail-shell.md)  

---

## 1. Project Detail Shell Header Architecture

When an engineer opens an AegisOps project (e.g. `Payment Gateway`), the main content area renders a high-clarity operational header:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ← ALL PROJECTS  /  NORTHSTAR ENGINEERING  /  PAYMENT GATEWAY ↕                                       │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [Mark] PAYMENT GATEWAY                       [PRODUCTION]  [● CONNECTED]  [● DEGRADED]               │
│         Payment processing, settlement and reconciliation · Java / PostgreSQL                          │
│                                                                                                        │
│  4 MONITORED SERVICES    ·    1 ACTIVE INCIDENT    ·    LAST SIGNAL: 14 OCT 09:26 UTC                  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [OVERVIEW]       [SERVICES (4)]       [INCIDENTS & ACTIVITY (1)]       [SETTINGS]                     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dynamic Field Mapping & Reactivity

When the user switches to a different project using the header project switcher combobox (`PAYMENT GATEWAY ↕`), the following fields must update instantaneously:

| Field | Source in `Project` Object | Display Treatment | Example (Payment Gateway) | Example (RentSense) |
| :--- | :--- | :--- | :--- | :--- |
| **Project Title** | `project.name` | Uppercase bold display font (`Inter`, 28px) | `PAYMENT GATEWAY` | `RENTSENSE` |
| **Description** | `project.description` | 13px muted body font | `Payment processing, settlement...` | `Fleet operations, rentals...` |
| **Technology** | `project.technology` | `.mono` subtitle | `Java / PostgreSQL` | `Python / Redis` |
| **Environment** | `project.environment` | Bordered `.mono` badge | `[PRODUCTION]` | `[STAGING]` |
| **Connection State** | `project.monitoringStatus` | Dot + `.mono` text | `● CONNECTED` | `● CONNECTED` |
| **Health State** | `project.health` | Colored status dot + text | `● DEGRADED` (Ochre `#c98a2c`) | `● DEGRADED` (Ochre) |
| **Service Count** | `project.services.length` | `.mono` metric | `4 MONITORED SERVICES` | `3 MONITORED SERVICES` |
| **Active Incidents** | `project.activeIncidentCount` | Red pill if > 0 | `! 1 ACTIVE INCIDENT` | `! 1 ACTIVE INCIDENT` |
| **Last Telemetry** | `project.lastSignalAt` | Formatted UTC timestamp | `14 OCT 09:26 UTC` | `14 OCT 09:23 UTC` |
| **Services List** | `project.services` | Monitored service cards | Payment API, Queue, DB, Worker | Fleet API, Worker, Redis |
| **Recent Activity** | `project.activities` | Event timeline rows | Settlement queue exceeded... | Location updates delayed... |

---

## 3. Sub-Navigation Tabs & View Boundaries

The project detail shell provides four sub-tabs:

1. **Overview Tab (`active` by default)**:
   - High-level project summary.
   - Quick status cards for Service Health, Active Signals, and Incident Alerts.
   - Reuses Heron `.preview-stats` styling from [`components/product-preview.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/product-preview.tsx).
2. **Services Tab**:
   - Clean tabular list or card grid of individual monitored services belonging to this project (e.g. `Payment API`, `Redis Queue`, `Database`, `Background Worker`).
   - Each service displays its name, technology, and health indicator (`Healthy`, `Degraded`, `Critical`).
3. **Incidents & Activity Tab**:
   - Chronological log of recent alerts, signals, and state changes.
   - Reuses Heron `.activity-row` component patterns.
4. **Settings Tab**:
   - Non-destructive demo configuration: Allows resetting project status or triggering a simulated telemetry ping.

> [!CAUTION]
> **No Advanced Analytics Requirement**:  
> In Phase 2, do NOT build real-time time-series time graphs, heavy canvas chart libraries, or APM flame graphs. Keep the interface fast, semantic, and focused on clean multi-project organizational structure.

---

## 4. Returning & Switching Mechanics

1. **Back to All Projects Button**:
   - Prominently placed at the top left of the header: `← ALL PROJECTS`.
   - Links directly back to `/projects/${project.workspaceId}`.
2. **Header Project Switcher Combobox**:
   - Clicking `[Project Name] ↕` opens a dropdown list of all projects within the active workspace.
   - Selecting a project calls `router.push(/projects/${workspaceId}/${nextProjectId})`.
   - Accessible via keyboard `ArrowDown`/`Enter`.
