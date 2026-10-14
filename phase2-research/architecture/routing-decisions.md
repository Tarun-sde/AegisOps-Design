# Routing Architecture & URL Decisions: Next.js App Router

**Document Version:** 1.0.0  
**Target:** Astra Frontend Implementation  
**Framework:** Next.js 16.4 App Router (`app/` directory)  
**Location:** [`phase2-research/architecture/routing-decisions.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/architecture/routing-decisions.md)  

---

## 1. Route Structure Comparison & Trade-Off Analysis

Astra must decide how to structure the URL space for the multi-project workspace. Two primary architectural patterns were evaluated:

### Pattern A: Flat Projects with Workspace Query Parameter
```
/projects                       (Overview, workspace inferred from localStorage or ?w=personal)
/projects/[projectId]          (Project Detail, e.g. /projects/payment-gateway)
```

### Pattern B: Explicit Hierarchical Workspace Segments (Vercel-Aligned)
```
/projects/[workspaceId]                     (Workspace Multi-Project Overview)
/projects/[workspaceId]/[projectId]        (Project Detail Shell)
```

### Detailed Evaluation Matrix:

| Evaluation Criterion | Pattern A: Flat Routes (`/projects/[projectId]`) | Pattern B: Scoped Segments (`/projects/[workspaceId]/[projectId]`) | Recommended Choice |
| :--- | :--- | :--- | :--- |
| **Stable Resource Identity** | Ambiguous if two workspaces share an application name (e.g. `api` in Personal and `api` in Northstar). | **Globally Unique**: Projects are strictly qualified by their workspace container (`/projects/personal/api` vs `/projects/northstar/api`). | **Pattern B** |
| **Direct Links & Bookmarks** | Direct link does not specify which workspace context to load without extra query strings. | **Deterministic**: Pasting `/projects/northstar/payment-gateway` loads the exact workspace and project without client ambiguity. | **Pattern B** |
| **Browser History & Back Button**| Browser back button between workspace switches is clumsy if driven only by client React state. | **Native History**: Back/forward buttons traverse workspace changes seamlessly. | **Pattern B** |
| **Refresh Persistence** | Requires checking `localStorage` on mount, causing potential hydration flash. | **Zero Hydration Mismatch**: Next.js parses `params.workspaceId` directly during initial render. | **Pattern B** |
| **Collision Prevention** | Risk of route collision between project slugs and potential reserved routes (`settings`, `new`). | **Isolated Namespace**: All projects sit safely nested under their respective workspace segment. | **Pattern B** |
| **Unknown Project Handling** | Harder to verify if a project belongs to an active workspace. | Simple lookup: `demoProjects.find(p => p.workspaceId === params.workspaceId && p.id === params.projectId)`. If not found, render clean 404. | **Pattern B** |

---

## 2. Final Routing Recommendation: Pattern B

### Canonical Route Tree for Astra:
```
app/
├── layout.tsx                              (Existing RootLayout + SiteShell)
├── page.tsx                                (Existing Homepage: "/")
├── heron-dashboard/
│   └── page.tsx                            (Existing Showcase: "/heron-dashboard")
│
└── projects/
    ├── page.tsx                            (Redirect helper: /projects -> /projects/personal)
    └── [workspaceId]/
        ├── page.tsx                        (Workspace Overview: Multi-Project Grid & List)
        └── [projectId]/
            └── page.tsx                    (Project Detail Shell: Overview, Services, Activity)
```

### Route Behavior Rules:
1. **`/projects` Root Entry**:
   - Acts as a redirect entry point.
   - Client or server redirects to `/projects/personal` (or the last visited workspace stored in `localStorage`).
2. **`/projects/[workspaceId]`**:
   - Renders the multi-project overview for the selected workspace.
   - Valid workspace IDs: `personal`, `northstar`, `sandbox`.
   - If an invalid workspace ID is supplied, redirects gracefully to `/projects/personal`.
3. **`/projects/[workspaceId]/[projectId]`**:
   - Renders the Project Detail Shell.
   - Validates that the project belongs to the targeted workspace. If not found, renders the technical 404 state.

---

## 3. Client vs. Server Component Boundaries

To guarantee high performance and zero Next.js hydration warnings:

1. **Page Entries (`page.tsx`)**:
   - Server or Client component receiving `{ params }: { params: Promise<{ workspaceId: string, projectId?: string }> }` (Next.js 16 standard).
2. **Interactive Workspace Shell (`components/workspace/workspace-shell.tsx`)**:
   - Declared as `'use client'`.
   - Binds to the external demo store (`useDemo()`) via `useSyncExternalStore`.
   - Manages sidebar collapse state, search query, filter facets, and modal open states.
3. **Pure Presentational Components**:
   - `<ProjectCard />`, `<ProjectRow />`, `<ServiceCard />`: Pure React client components with memoized callbacks to prevent unnecessary re-rendering during rapid search typing.
