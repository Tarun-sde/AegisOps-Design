# AegisOps Project Card & List Row Specification

**Document Version:** 1.0.0  
**Target:** Astra Frontend Implementation  
**Visual Authority:** Heron Architectural Design System (`globals.css`, `design-tokens.json`)  
**Behavioral Authority:** Vercel Card & List View Reverse Engineering  
**Location:** [`phase2-research/aegisops/project-card-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/aegisops/project-card-spec.md)  

---

## 1. Vercel Original vs. AegisOps Adapted Anatomy

| Field / Dimension | Original Vercel Concept (Verified) | AegisOps Operational Adaptation (Recommended) | Design Token / Aesthetic Treatment |
| :--- | :--- | :--- | :--- |
| **Title / Identity** | Project Name (e.g. `docs`, `site`, `payment-gateway`). | **Project Name** (e.g. `Customer Portal`, `Payment Gateway`). | `font-sans`, bold/semibold, uppercase or title case, color `var(--ink)`. |
| **Subtitle / Path** | Deployment Domain (e.g. `acme-docs.vercel.app`). | **Project Description & Tech Stack** (e.g. `Payment processing & settlement · Java / PostgreSQL`). | `font-sans`, 12px–13px, color `var(--muted)`. |
| **Scope Tag** | Git Branch (e.g. `⑂ main`). | **Environment Badge** (`PRODUCTION`, `STAGING`, `DEVELOPMENT`). | `.mono`, uppercase tag with 1px border `var(--rule)`, background `rgba(40,40,40,0.04)`. |
| **Primary Status** | Deployment State (`Ready`, `Building`, `Error`). | **Health Status** (`HEALTHY`, `DEGRADED`, `CRITICAL`, `UNKNOWN`). | Status dot + text label. Only `CRITICAL` uses `var(--red)` (`#fa3600`). `DEGRADED` uses ochre (`#c98a2c`). `HEALTHY` uses dark slate (`#282828`). |
| **Secondary Status**| Git Provider / Commit hash. | **Monitoring Connection State** (`Connected`, `Pending`, `Disconnected`). | Muted status dot or text indicator (pulse icon when connected). |
| **Topology Metric** | N/A (single monolithic/serverless app). | **Monitored Services Count** (e.g. `4 Monitored Services`). | `.mono`, e.g. `4 SVCS`, clean badge or pill. |
| **Urgency Metric** | Speed Insights Circle (`96`). | **Active Incident Count** (e.g. `0 Incidents` or `2 Active Incidents`). | When `> 0`, high-visibility pill with `var(--red)` border and text. When `0`, subdued muted indicator. |
| **Recency / Activity**| Git commit message & commit time (`10m ago`). | **Last Telemetry Signal & Event Message** (e.g. `Settlement queue spike · 10m ago · 09:26 UTC`). | Technical log-line treatment in `.mono`, truncated gracefully. |
| **Quick Actions** | Context Menu `···` (`Add Favorite`, `View Logs`, `Settings`). | **Context Menu `···`** (`Pin to Favorites`, `Inspect Services`, `View Activity`, `Project Settings`). | 32×32px button, dropdown popover styled with Heron hairline borders. |

---

## 2. Card View (Grid Mode) Component Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Mark Icon]  PAYMENT GATEWAY                     [PROD]   [··· Menu]   │
│              Payment processing, settlement and reconciliation         │
│              Java / PostgreSQL                                         │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ LAST SIGNAL: Settlement queue exceeded sample threshold            │ │
│ │ 14 Oct · 09:26 UTC                                                 │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ [● Connected]   [● Degraded Health]   [4 Services]   [! 1 Incident]    │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 CSS Layout & Style Tokens
```css
.project-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  background: var(--paper); /* Or dark surface #282828 in dark mode */
  border: 1px solid var(--rule);
  transition: border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
  min-height: 220px;
}

.project-card:hover {
  border-color: var(--ink);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(40, 40, 40, 0.06);
}

.project-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.project-card-title {
  font-family: var(--font-sans);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--ink);
  text-transform: uppercase;
}

.project-card-desc {
  font-size: 13px;
  line-height: 1.4;
  color: var(--muted);
  margin-top: 4px;
}

.project-card-telemetry {
  margin: 16px 0;
  padding: 10px 14px;
  background: rgba(40, 40, 40, 0.03);
  border: 1px solid rgba(179, 179, 175, 0.5);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.4;
  color: var(--ink);
}

.project-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--rule);
  font-family: var(--font-mono);
  font-size: 11px;
}
```

---

## 3. List Row (Table / List Mode) Component Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Mark] PAYMENT GATEWAY  ·  PROD      Settlement queue exceeded...    4 SVCS   ● DEGRADED   1 INC   ··· │
│        Java / PostgreSQL             14 Oct · 09:26 UTC                                                │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 List Row Structure
- **Height**: 64px on desktop, padding `12px 20px`.
- **Row Columns**:
  1. **Identity (30%)**: Geometric mark, project name, environment tag, technology subtitle.
  2. **Telemetry Signal (35%)**: Latest event log message and relative time in `.mono`.
  3. **Service Count (10%)**: Number of monitored services badge (`4 SVCS`).
  4. **Health Status (15%)**: Status dot with capitalized textual state (`● DEGRADED`).
  5. **Incidents & Actions (10%)**: Incident pill (`! 1`) and three-dot trigger (`···`).
- **Grouping**: When List View is active, projects are grouped by **Environment** (`PRODUCTION (4)`, `STAGING (2)`, `DEVELOPMENT (1)`), echoing Vercel's Git repository grouping headers.

---

## 4. Operational Health & Connection States

```typescript
export type Health = "healthy" | "degraded" | "critical" | "unknown";
export type Monitoring = "connected" | "disconnected" | "pending";
```

### 4.1 Visual Representation Rules
| State Combination | Visual Marker | Text Badge | Meaning for Incident Responder |
| :--- | :--- | :--- | :--- |
| **Connected + Healthy** | Solid charcoal dot `●` (`#282828`) | `HEALTHY` | All services operating within latency/error SLOs. |
| **Connected + Degraded** | Ochre dot `●` (`#c98a2c`) | `DEGRADED` | At least one worker or queue exceeding warning threshold. |
| **Connected + Critical** | Urgent red dot `●` (`#fa3600`) | `CRITICAL` | Service failure, active incident, urgent investigation needed. |
| **Disconnected + Unknown** | Hollow circle `○` (`#b3b3af`) | `DISCONNECTED` | No telemetry agent actively sending traces. |
| **Pending + Unknown** | Pulsing dot `◎` (`#6c6c64`) | `PENDING` | Newly provisioned demo project awaiting first telemetry ping. |

---

## 5. Interaction States & Event Handling

1. **Card Navigation**:
   - The card wraps a primary `<PageLink href={`/projects/${project.workspaceId}/${project.id}`}>`.
   - Pressing `Enter` or clicking opens the Project Detail Shell.
2. **Context Menu Event Isolation**:
   - The three-dot button and any direct service links inside the card must call `event.stopPropagation()` and `event.preventDefault()` so clicking actions does not trigger whole-card navigation.
3. **Pinning / Favorite Toggle**:
   - Clicking "Pin to Favorites" in the menu immediately moves the project into the top `Your Favorites` container with a smooth 150ms layout transition.
