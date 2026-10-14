# AegisOps Workspace Navigation & Scope Switcher Specification

**Document Version:** 1.0.0  
**Target:** Astra Frontend Implementation  
**Scope:** Client-Side Workspace Selector & Scope Management  
**Location:** [`phase2-research/aegisops/workspace-navigation-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/aegisops/workspace-navigation-spec.md)  

---

## 1. Architectural Concept: Workspaces in AegisOps

AegisOps organizes monitored applications into **Workspaces**. Each workspace represents an isolated operational boundary:

1. **Personal Workspace** (`id: "personal"`, code: `P / 01`):
   - Scope: Individual developer side-projects and micro-apps.
   - Initial Sample Projects:
     - `IronLog` (Next.js / PostgreSQL, Production, Healthy)
     - `RentSense` (Python / Redis, Staging, Degraded)
     - `Portfolio API` (Go / SQLite, Development, Disconnected)
2. **Northstar Engineering** (`id: "northstar"`, code: `N / 02`):
   - Scope: Enterprise organizational systems and distributed service mesh.
   - Initial Sample Projects:
     - `Customer Portal` (React / Node.js, Production, Healthy)
     - `Payment Gateway` (Java / PostgreSQL, Production, Degraded)
     - `Authentication Service` (Go / Redis, Production, Critical)
     - `Inventory Platform` (Python / PostgreSQL, Staging, Pending)
3. **Sandbox Workspace** (`id: "sandbox"`, code: `S / 03`):
   - Scope: Clean empty slate for testing local project creation without pre-populated clutter.

> [!IMPORTANT]
> **Client-Side Simulation vs. Authorization Boundary**:  
> In this frontend prototype, workspace switching is strictly an organizational view filter and fixture partition. It does NOT implement backend authentication, role-based access control, or tenancy security.

---

## 2. Workspace Switcher Component Anatomy

```
┌──────────────────────────────────────────────────────────────┐
│ [Mark SVG]  NORTHSTAR ENGINEERING                [N / 02] ↕  │
└──────────────────────────────────────────────────────────────┘
```

When clicked, reveals the dropdown popover:

```
┌──────────────────────────────────────────────────────────────┐
│  WORKSPACES                                                  │
│                                                              │
│  [○] PERSONAL                      Individual Dev    P / 01  │
│  [✓] NORTHSTAR ENGINEERING         Organization      N / 02  │
│  [ ] SANDBOX                       Clean Slate       S / 03  │
│                                                              │
│  ──────────────────────────────────────────────────────────  │
│  + Create Workspace (Demo disabled)                          │
└──────────────────────────────────────────────────────────────┘
```

### 2.1 Styling & Tokens
- **Container**: `background: var(--paper)` (or dark surface `#212121`), border `1px solid var(--rule)`.
- **Active Indicator**: High-contrast checkmark (`✓`) with bold title.
- **Scope Code**: Rendered in `.mono` with subtle border pill (`P / 01`, `N / 02`).
- **Dividers**: 1px rule `#b3b3af`.

---

## 3. URL Strategy & Context Preservation

To allow users to refresh the page, share links, or use browser Back/Forward navigation without losing their active workspace context, Astra should implement a robust URL-backed routing strategy.

### Recommended Routing Pattern:
```
/projects/[workspaceId]
```
- E.g.: `/projects/personal` and `/projects/northstar`.
- If a user navigates to `/projects` without a workspace specified, the route middleware or client page automatically redirects to the last stored workspace (or defaults to `/projects/personal`).

### Comparison with Query Parameter Strategy:
| Dimension | Route Parameter (`/projects/[workspaceId]`) | Query Parameter (`/projects?w=personal`) |
| :--- | :--- | :--- |
| **Shareable Direct Links** | **Optimal**: Clean, canonical, bookmarkable URL. | Good, but query strings are easily stripped or lost. |
| **Nested Project URLs** | **Clean**: `/projects/northstar/payment-gateway`. | Clunky: `/projects/payment-gateway?w=northstar`. |
| **Next.js App Router Cache** | Seamless page segments and layout nesting. | Re-executes page component on query param change. |
| **Recommendation** | **STRONGLY RECOMMENDED** | Fallback alternative |

---

## 4. State Synchronization & External Store Contract

In [`lib/demo/store.ts`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/lib/demo/store.ts), workspace selection is integrated with a lightweight client-side store:

```typescript
type State = {
  projects: Project[];
  workspace: string; // "personal" | "northstar" | "sandbox"
  view: "grid" | "list";
  pinned: string[];
  ready: boolean;
  warning: string;
};
```

### Switching Protocol:
1. When user clicks "Northstar Engineering":
   - Store updates `state.workspace = "northstar"`.
   - Next.js router navigates to `/projects/northstar` via `router.push()`.
   - `localStorage.setItem("aegisops-demo-v1", ...)` preserves choice across sessions.
2. The project overview component filters the rendered collection:
   ```typescript
   const visibleProjects = allProjects.filter(p => p.workspaceId === activeWorkspaceId);
   ```
3. If user opens a direct link to a workspace with created local demo projects, local storage items matching that `workspaceId` are hydrated seamlessly.
