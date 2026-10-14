# AegisOps Project Interaction & Filtering Specification

**Document Version:** 1.0.0  
**Target:** Astra Frontend Implementation  
**Scope:** Client-Side Search, Multi-Facet Filtering, Sorting, and View Modes  
**Location:** [`phase2-research/aegisops/project-interaction-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/aegisops/project-interaction-spec.md)  

---

## 1. Action Bar Controls & Layout

Located directly above the project cards/list in the workspace view:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [🔍] Search projects, tech, or stack... [F]  [ALL HEALTH ∨]  [ALL ENVS ∨]  [SORT: ACTIVITY ∨]  [⊞] [☰] │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Control Definitions
1. **Search Input**:
   - Matches: `name`, `description`, `technology`, and `environment` (case-insensitive substring match).
   - Global keyboard trigger: `F` key focuses the field.
   - Clear button: `×` icon appears when `search.length > 0`.
2. **Health Filter Dropdown**:
   - Options: `All Health States`, `Healthy (Charcoal)`, `Degraded (Ochre)`, `Critical (Red)`, `Unknown (Gray)`.
3. **Environment Filter Dropdown**:
   - Options: `All Environments`, `Production`, `Staging`, `Development`.
4. **Sort Order Dropdown**:
   - `Last Telemetry` (Most recent signal first — default).
   - `Health Priority` (Critical → Degraded → Unknown → Healthy).
   - `Project Name (A–Z)`.
5. **View Mode Toggle Group**:
   - `[⊞ Grid]` / `[☰ List]`.
   - Persisted in local store under `state.view`.

---

## 2. Query State Model & Filtering Logic

In [`lib/demo/projects.ts`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/lib/demo/projects.ts#L39-L45):

```typescript
export type ProjectQuery = {
  search: string;
  health: string;
  environment: string;
  sort: "activity" | "health" | "name";
};

export function selectProjects(projects: Project[], query: ProjectQuery): Project[] {
  const term = query.search.trim().toLowerCase();
  const ranks: Record<Health, number> = {
    critical: 0,
    degraded: 1,
    unknown: 2,
    healthy: 3,
  };

  const compareName = (a: Project, b: Project) =>
    a.name.localeCompare(b.name, "en") || a.id.localeCompare(b.id, "en");

  return projects
    .filter((p) => {
      // 1. Text search
      if (term) {
        const text = `${p.name} ${p.description} ${p.technology} ${p.environment}`.toLowerCase();
        if (!text.includes(term)) return false;
      }
      // 2. Health filter
      if (query.health && query.health !== "all" && p.health !== query.health) {
        return false;
      }
      // 3. Environment filter
      if (query.environment && query.environment !== "all" && p.environment !== query.environment) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (query.sort === "health") {
        return (ranks[a.health] - ranks[b.health]) || compareName(a, b);
      }
      if (query.sort === "activity") {
        return (b.lastSignalAt ?? "").localeCompare(a.lastSignalAt ?? "") || compareName(a, b);
      }
      return compareName(a, b);
    });
}
```

---

## 3. Multiple Filter Behaviors & Reset Sequence

1. **Active Filter Indicators**:
   - When any filter is non-default, the dropdown trigger highlights with a subtle indicator badge showing the selection.
   - Total matching project count is displayed in `.mono` above the collection: e.g. `SHOWING 2 OF 7 PROJECTS`.
2. **Empty Search / Filter State**:
   - If `selectedProjects.length === 0`:
     - Render clean empty state illustration (Heron architectural grid box with broken signal line).
     - Text: `No projects match your active search or filters.`
     - CTA Button: `Reset all filters`.
3. **Reset Behavior**:
   - Clicking `Reset all filters` sets:
     - `search = ""`
     - `health = "all"`
     - `environment = "all"`
     - `sort = "activity"`
   - Instantly reveals all projects within the active workspace. Focus is returned to the Search input.
