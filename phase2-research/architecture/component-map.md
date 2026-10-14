# Component Architecture & Reuse Map: AegisOps Workspace

**Document Version:** 1.0.0  
**Target:** Astra Frontend Implementation  
**Location:** [`phase2-research/architecture/component-map.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/architecture/component-map.md)  

---

## 1. Component Hierarchy & Directory Organization

All Phase 2 workspace components should be encapsulated inside `components/workspace/` to prevent cluttering existing marketing components:

```
components/workspace/
├── workspace-shell.tsx         (Master operational container, sidebar + content layout)
├── sidebar.tsx                 (Collapsible vertical sidebar, 240px <-> 56px)
├── workspace-switcher.tsx      (Dropdown menu for switching Personal / Northstar / Sandbox)
├── action-bar.tsx              (Search input, health/env filters, sort, and view mode toggle)
├── project-collection.tsx      (Container orchestrating Favorites section, grid, and list views)
├── project-card.tsx            (Modular card component for Grid View)
├── project-row.tsx             (Tabular row component for List View)
├── project-detail-header.tsx   (Breadcrumbs, project filter pill, health badges, sub-tabs)
├── project-switcher.tsx        (Combobox dropdown in header to switch active project)
├── services-list.tsx           (Tabular display of monitored microservices and individual health)
├── activity-feed.tsx           (Timeline of telemetry signals, incidents, and setup logs)
├── create-project-modal.tsx    (Native <dialog> form for provisioning demo applications)
└── empty-state.tsx             (Architectural empty states for zero projects or no search results)
```

---

## 2. Reusable Foundation Mapping

Phase 2 components reuse established patterns from the approved Heron design system:

| Phase 2 Component | Existing Reused Component / Pattern | Exact File Reference |
| :--- | :--- | :--- |
| **Workspace Brand Mark** | `<Mark />` (Architectural SVG mark) | [`components/artwork.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/artwork.tsx#L3) |
| **Internal Link Navigation** | `<PageLink />` (Curtain transition wrapper) | [`components/site-shell.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/site-shell.tsx#L23) |
| **External & Sub-Links** | `<ArrowLink />` (Rolling hover micro-animation) | [`components/site-shell.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/site-shell.tsx#L49) |
| **Activity Feed Rows** | `.activity-row` pattern | [`components/product-preview.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/product-preview.tsx#L44-L63) |
| **Status Dots** | `.status-dot` styling | [`app/globals.css`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/app/globals.css) & [`components/product-preview.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/product-preview.tsx#L25) |
| **Metrics Summary Bar** | `.preview-stats` component pattern | [`components/product-preview.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/product-preview.tsx#L15-L30) |
| **Smooth Scrolling Clock** | Bound to `gsap.ticker` & Lenis | [`components/site-shell.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/site-shell.tsx#L77) |

---

## 3. Detailed Component Interfaces & Props

### 3.1 `<WorkspaceShell />`
```typescript
interface WorkspaceShellProps {
  workspaceId: string;
  projectId?: string;
  children: React.ReactNode;
}
```
- Manages layout: Left sidebar + Main Content area.
- Handles responsive drawer on mobile.
- Suppresses public marketing `<Header />` within the workspace segment.

### 3.2 `<ProjectCard />`
```typescript
interface ProjectCardProps {
  project: Project;
  isPinned: boolean;
  onTogglePin: (id: string) => void;
}
```
- Renders modular card in grid layout.
- Prevents navigation when clicking pin icon or context menu.

### 3.3 `<CreateProjectModal />`
```typescript
interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorkspaceId: string;
}
```
- Native `<dialog>` modal with focus trapping and backdrop dismissal.
- Form fields: Name, Description, Workspace, Environment, Technology, Service Template.
- Enforces duplicate name check against store.
