# Phase 3 Audit: Existing Phase 2 Frontend Architecture

**Document Version:** 1.0.0  
**Researcher:** Principal Product Research Engineer, Senior Observability UX Designer  
**Repository State:** Verified Phase 2 at commit `68f37af` (Clean `main` branch, 58 passing tests, 87 screenshots)  
**Location:** [`phase3-research/existing-frontend-audit.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/existing-frontend-audit.md)  

---

## 1. Executive Summary

AegisOps Phase 2 established a multi-project workspace system blending the editorial, warm-monochromatic drafting identity of **Heron AI** with the organizational taxonomy and ergonomics of **Vercel's February 2026 Navigation Redesign**. 

Phase 3 is the final frontend development phase: **Stripe-Inspired Observability & Incident Intelligence**. It transforms the existing static project detail view into a high-density, interactive, time-series-driven operational console with evidence-backed AI incident investigations.

This audit establishes the baseline facts of the running codebase so that implementation agent **GPT Astra** does not guess, refactor working subsystems, or introduce duplicate stores or styles.

---

## 2. Inventory of Existing Routes & Behaviors

| Route Path | File Implementation | Current Phase 2 Behavior | Phase 3 Integration Requirement |
| :--- | :--- | :--- | :--- |
| `/` | `app/page.tsx`<br/>`components/site-shell.tsx` | Architectural showcase homepage with preloader, hero drag elevation reveal, pinned feature canvas, and footer lens reveal. | **STRICT INVARIANT: UNTOUCHED**. Do not modify or refactor. |
| `/heron-dashboard` | `app/heron-dashboard/page.tsx` | Marketing showcase page with 5-feature card sequence, practice strips, and FAQ. | **STRICT INVARIANT: UNTOUCHED**. |
| `/projects` | `app/projects/page.tsx` | Client redirect helper route. Consults `useDemo()` store and redirects to the remembered workspace (default: `/projects/personal`). | **UNTOUCHED**. Preserve workspace redirect logic. |
| `/projects/[workspaceId]` | `app/projects/[workspaceId]/page.tsx` | Multi-project overview grid/list view with search (`F`), faceted filters (health, environment), sort, and favorites section. | **UNTOUCHED**. Preserve multi-project overview. |
| `/projects/[workspaceId]/[projectId]` | `app/projects/[workspaceId]/[projectId]/page.tsx`<br/>`components/workspace/project-detail.tsx` | Project detail page containing: header metadata, environment badge, connection status, health indicator, section tabs (`#overview`, `#services`, `#activity`), service schematic SVG, facts list, service inventory, and activity log. | **EXTEND**: Host entry points for high-density observability analytics, time-range controls, and incident investigation pathways. |

---

## 3. Existing Visual & Token Architecture

The design system is defined across `app/globals.css` (global tokens) and `app/projects/workspace.css` (workspace-scoped tokens).

### 3.1 Global Architectural Tokens (`app/globals.css`)
```css
:root {
  --paper: #e0e0da;              /* Primary background: warm technical parchment */
  --ink: #282828;                /* Primary text & high-contrast borders: solid charcoal */
  --muted: #282828b8;            /* Secondary typography: charcoal at ~72% opacity */
  --rule: #b3b3af;               /* Hairline dividers, drafting grids: crisp neutral border */
  --red: #fa3600;                /* Urgent alert accent: restricted to incidents & critical health */
  --font-sans: "Inter Variable", Arial, sans-serif;
  --font-mono: "Geist Mono Variable", monospace;
  --gutter: clamp(20px, 2.05vw, 40px);
  --header-height: clamp(56px, 3.91vw, 75px);
}
```

### 3.2 Workspace Tokens (`app/projects/workspace.css`)
```css
.workspace {
  --ws-soft: color-mix(in srgb, var(--paper), white 18%); /* Elevated card backgrounds */
  --ws-ochre: #9b6a24;                                     /* Degraded status indicator */
  font-size: 13px;
  line-height: 1.45;
  letter-spacing: -0.015em;
}
```

### 3.3 Status Representation Rules
1. **Healthy**: Charcoal dot `●` (`#282828`), text: `"healthy"`.
2. **Degraded**: Ochre dot `●` (`#9b6a24`), text: `"degraded"`.
3. **Critical**: Alert red dot `●` (`#fa3600`), text: `"critical"`, optional red count badge.
4. **Unknown / Disconnected**: Hollow outline `○` (`#b3b3af`), text: `"unknown"` or `"disconnected"`.
5. **Pending**: Subtle dot `◎` (`#6c6c64`), text: `"pending"`.

> [!IMPORTANT]
> **Stripe Color Translation Rule**: Stripe’s native royal blue (`#635bff`), purple accents, and teal graphs must **never** be copied into AegisOps. Instead, Stripe’s **high-density data layouts, tooltip crosshairs, split comparison lines, and multi-facet filtering** must be rendered using Heron’s paper `#e0e0da`, solid charcoal ink `#282828`, hairline borders `#b3b3af`, and ochre/red operational accents.

---

## 4. Existing Workspace Component Hierarchy

All workspace UI components reside in `components/workspace/`:

```
components/workspace/
├── create-project.tsx      # Accessible native <dialog> for local demo project creation
├── dialog.ts               # Tab-wrapping focus trap helper for dialogs & sheets
├── project-card.tsx        # Project card (grid) and project row (list) presentation
├── project-collection.tsx  # Search bar, filter dropdowns, sort controls, favorites accordion
├── project-detail.tsx      # Detail shell with connection overview, facts, services, activity
├── project-visuals.tsx     # AegisMark drafting SVG, HealthStatus badge, ServiceDrawing schematic
├── selector.tsx            # Accessible combobox for workspace switcher & project switcher
└── workspace-shell.tsx     # Master layout: collapsible 240px/56px sidebar, breadcrumbs, drawer
```

### 4.1 How Context and Data Flow Works
1. `useWorkspaceData()` (in `components/workspace/workspace-shell.tsx`):
   - Reads `workspaceId` and `projectId` from Next.js `useParams()`.
   - Reads local state from `useDemo()` in `lib/demo/store.ts`.
   - Combines pre-seeded fixtures from `demoProjects` with user-created local projects.
   - Finds matching `workspace` and `project`.
2. Navigation state:
   - `Selector` component manages switching between workspaces (`Personal`, `Northstar Engineering`, `Sandbox`) and switching between projects within the active workspace.
   - Sidebar maintains an active navigation state with links to `All projects`, `#overview`, `#services`, and `#activity`.

---

## 5. Existing Data & Store Architecture

Located in `lib/demo/`:

### 5.1 Entities (`lib/demo/projects.ts`)
```typescript
export type Health = "healthy" | "degraded" | "critical" | "unknown";
export type Environment = "production" | "staging" | "development";
export type Monitoring = "connected" | "disconnected" | "pending";
export type Service = { id: string; name: string; technology: string; health: Health };
export type Activity = { id: string; at: string; message: string; kind: "signal" | "incident" | "setup" };
export type Project = {
  id: string; 
  workspaceId: string; 
  name: string; 
  description: string;
  technology: string; 
  environment: Environment; 
  monitoringStatus: Monitoring;
  health: Health; 
  services: Service[]; 
  activeIncidentCount: number;
  lastSignalAt: string | null; 
  activities: Activity[]; 
  local?: boolean;
};
```

### 5.2 Pre-Seeded Applications
- **Northstar Engineering (`northstar`)**:
  - `payment-gateway`: Java/PostgreSQL, production, **degraded**, 1 incident, last signal `2026-10-14T09:26:00Z`. Services: `Payment API` (healthy), `Queue Worker` (degraded), `Database` (healthy). **Primary Phase 3 demonstration candidate!**
  - `authentication`: Go/Redis, production, **critical**, 2 incidents, last signal `2026-10-14T09:27:00Z`. Services: `Identity API` (critical), `Session Store` (critical), `Worker` (healthy).
  - `customer-portal`: React/Node.js, production, **healthy**, 0 incidents.
  - `inventory`: Python/PostgreSQL, staging, **pending**, 0 incidents, `lastSignalAt: null`.
- **Personal (`personal`)**:
  - `ironlog`: Next.js/PostgreSQL, production, **healthy**, 0 incidents.
  - `rentsense`: Python/Redis, staging, **degraded**, 1 incident.
  - `portfolio-api`: Go/SQLite, development, **disconnected**, `lastSignalAt: null`.
- **Sandbox (`sandbox`)**:
  - Empty workspace for local demo project creation.

### 5.3 Store Implementation (`lib/demo/store.ts`)
- Implemented with React 19 `useSyncExternalStore`.
- Key: `aegisops-demo-v1` in `localStorage`.
- Stores: `projects` (user-created), `workspace` (last visited), `view` (`grid` | `list`), `pinned` (favorite IDs), `collapsed` (sidebar rail toggle).
- Hydration-safe: returns deterministic server snapshot before hydration, preventing SSR mismatch.

---

## 6. Motion & Shell Engine

- **Smooth Scrolling**: Lenis (`lenis: ^1.3.26`) synchronized to GSAP ticker in `components/site-shell.tsx`.
- **Custom Cursor**: Canvas 2D trailing dot; automatically suppressed over inputs, selects, dialogs, and code editors.
- **GSAP Animations**:
  - Short 180–220ms entrances with power2.out ease on page load.
  - `useGSAP` hook used with scope refs and cleanup.
  - Full `prefers-reduced-motion: reduce` support bypassing all tweening.

---

## 7. Recommended Integration Map for Astra

Astra must strictly follow this file classification:

```
AegisOps-Design/
├── app/
│   ├── globals.css                                     # [UNTOUCHED] Global design tokens
│   ├── page.tsx                                        # [UNTOUCHED] Marketing homepage
│   ├── heron-dashboard/page.tsx                        # [UNTOUCHED] Marketing showcase
│   └── projects/
│       ├── layout.tsx                                  # [UNTOUCHED] Shell wrapper
│       ├── page.tsx                                    # [UNTOUCHED] Redirect helper
│       ├── workspace.css                               # [EXTEND] Add Phase 3 analytics & drawer styles
│       └── [workspaceId]/
│           ├── page.tsx                                # [UNTOUCHED] Workspace overview
│           └── [projectId]/
│               ├── page.tsx                            # [EXTEND] Connect sub-views / tabs
│               ├── analytics/page.tsx                  # [NEW OPTIONAL or IN-PAGE SUBVIEW]
│               └── incidents/
│                   ├── page.tsx                        # [NEW] Project incidents register
│                   └── [incidentId]/page.tsx           # [NEW] Incident detail & AI investigation
├── components/
│   ├── site-shell.tsx                                  # [UNTOUCHED] Root frame, cursor, Lenis
│   └── workspace/
│       ├── workspace-shell.tsx                         # [EXTEND] Add Analytics & Incidents sidebar links
│       ├── selector.tsx                                # [UNTOUCHED] Combobox
│       ├── project-detail.tsx                          # [EXTEND] Host Analytics Overview & Tab Navigation
│       ├── project-card.tsx                            # [UNTOUCHED]
│       ├── project-collection.tsx                      # [UNTOUCHED]
│       ├── project-visuals.tsx                         # [EXTEND] Add incident marker badges to schematic
│       ├── create-project.tsx                          # [UNTOUCHED]
│       ├── dialog.ts                                   # [REUSE] Focus trap for detail drawers
│       └── analytics/                                  # [NEW DIRECTORY]
│           ├── analytics-dashboard.tsx                 # [NEW] Main project observability overview
│           ├── metric-card.tsx                         # [NEW] Stripe-style KPI summary cards
│           ├── time-series-chart.tsx                   # [NEW] Hero time-series with crosshair
│           ├── time-range-toolbar.tsx                  # [NEW] Date range & comparison picker
│           ├── service-breakdown-table.tsx             # [NEW] Dense service telemetry table
│           ├── incident-overlay-timeline.tsx           # [NEW] Visual incident pins on chart time axis
│           ├── incident-drawer.tsx                     # [NEW] Slide-out quick incident inspection
│           └── investigation/                          # [NEW DIRECTORY]
│               ├── investigation-console.tsx           # [NEW] Full AI investigation view
│               ├── hypothesis-card.tsx                 # [NEW] Evidence-backed hypothesis panel
│               ├── evidence-explorer.tsx               # [NEW] Filterable logs, metrics, trace spans
│               └── remediation-action-panel.tsx        # [NEW] Human-reviewed safe demo actions
├── lib/
│   └── demo/
│       ├── projects.ts                                 # [PRESERVE & EXTEND VIA ADAPTER]
│       ├── store.ts                                    # [PRESERVE] Keep aegisops-demo-v1
│       └── telemetry/                                  # [NEW DIRECTORY]
│           ├── telemetry-fixtures.ts                   # [NEW] Deterministic metrics time-series
│           ├── scenario-payment-gateway.ts             # [NEW] Coherent scenario incident & traces
│           └── telemetry-adapter.ts                    # [NEW] Query functions for time ranges
└── tests/
    ├── experience.spec.ts                              # [UNTOUCHED] Phase 1 regression suite
    ├── motion.spec.ts                                  # [UNTOUCHED] Motion validation suite
    ├── projects.spec.ts                                # [UNTOUCHED] Phase 2 workspace test suite
    └── analytics.spec.ts                               # [NEW] Phase 3 observability test suite
```

> [!CAUTION]
> **No Store Overwrite Guarantee**: Astra must **not** create a second conflicting store. Telemetry and incident queries must be read-only adapters keyed to the project's ID and active time range. Local demo projects without telemetry must render explicit, honest "Pending Monitoring" and "No Telemetry Received" empty states.
