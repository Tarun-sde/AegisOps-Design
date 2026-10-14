# Phase 2 Implementation Brief — Vercel-Inspired Multi-Project Workspace

**Target Agent:** GPT Astra  
**Role:** Senior Frontend Implementation Specialist  
**Mission:** Build a Vercel-inspired multi-project workspace interface for AegisOps inside this Next.js repository, seamlessly integrating with the approved Heron architectural design system.  
**Package Status:** **COMPLETE & VERIFIED** (All research, official screenshots, contact sheets, component maps, and data contracts prepared).  
**Primary Reference Index:** [`phase2-research/evidence-index.md`](phase2-research/evidence-index.md)  

---

## 1. What Phase 2 Is Building

AegisOps is an AI-powered application monitoring and incident investigation platform. In this phase, you are constructing the **multi-project workspace management interface**.

Users organize applications into workspaces, scan project health, filter by technology or environment, toggle between high-level grid cards and dense list rows, and inspect individual project service topologies.

You are adapting **Vercel's multi-project dashboard patterns** (specifically the **February 2026 Navigation Redesign**) while clothing the entire interface in AegisOps's user-approved **Heron architectural drafting identity** (paper off-white `#e0e0da`, solid charcoal ink `#282828`, hairline grid rules `#b3b3af`, and alert-restricted red `#fa3600`).

---

## 2. Invariants: What Must Remain Untouched

> [!CAUTION]
> **Preservation Guarantee**: Do not break or refactor the approved marketing experience.
> - **Homepage (`/`)**: Preloader, elevation drag-to-reveal hero, pinned model map, and interactive footer.
> - **Showcase (`/heron-dashboard`)**: Pinned 5-feature card sequence, practice strips, and FAQ.
> - **Motion Engine**: Lenis + GSAP ticker integration in [`components/site-shell.tsx`](components/site-shell.tsx) and Canvas 2D custom cursor.
> - **Tests**: All 29 assertions in [`tests/experience.spec.ts`](tests/experience.spec.ts) must continue to pass without modification. Add your Phase 2 tests in a separate file (e.g. `tests/projects.spec.ts`).

---

## 3. Recommended Routes & Layout Integration

Implement the canonical hierarchical route structure:

```
app/
├── projects/
│   ├── page.tsx                    # Client redirect helper to /projects/personal
│   └── [workspaceId]/
│       ├── page.tsx                # Workspace Overview (Multi-project Grid & List)
│       └── [projectId]/
│           └── page.tsx            # Project Detail Shell (Overview, Services, Activity)
```

### Layout Shell Strategy:
In [`app/layout.tsx`](app/layout.tsx), `<SiteShell>` wraps all children. It provides the outer `.site-frame` drafting border, custom cursor, smooth scroll clock, and page transition curtain.
- In `components/site-shell.tsx`, detect when `pathname.startsWith("/projects")`:
  - When on `/projects/*`: Suppress the marketing `<Header />`, allowing the workspace's dedicated sidebar and breadcrumbs to fill the frame.
  - When on `/` or `/heron-dashboard`: Render the standard marketing `<Header />`.
  - Add a `"Workspace ↗"` link in the marketing header so users have an intuitive public entry point.
- *Detailed Architecture*: [`phase2-research/architecture/routing-decisions.md`](phase2-research/architecture/routing-decisions.md).

---

## 4. Key Vercel Patterns Adapted for AegisOps

Our research reverse-engineered Vercel's official dashboard and the February 26, 2026 navigation overhaul:

1. **Workspace Context (Team Switcher Adaptation)**:
   - Replaces Vercel's team switcher with an accessible combobox at the top of the sidebar.
   - Switches between `Personal Workspace` (`P / 01`), `Northstar Engineering` (`N / 02`), and `Sandbox` (`S / 03`).
   - *Spec*: [`phase2-research/aegisops/workspace-navigation-spec.md`](phase2-research/aegisops/workspace-navigation-spec.md).
2. **Collapsible Left Sidebar (2026 Redesign)**:
   - Resizable/collapsible sidebar (`width: 240px` <-> `56px` icon rail).
   - Contains: Workspace Switcher, Universal Search (`Find... [F]`), and primary navigation (`Projects`, `Signals`, `Incidents`, `Settings`).
   - Smooth `200ms` CSS transition; persists collapsed preference in `localStorage`.
   - *Spec*: [`phase2-research/aegisops/sidebar-spec.md`](phase2-research/aegisops/sidebar-spec.md).
3. **"Projects as Filters" Pattern (2026 Redesign)**:
   - Header retains an interactive Project Filter Pill (`(Mark) Payment Gateway ↕`).
   - Allows instant switching between whole-workspace observability and single-project telemetry in one click.
   - *Spec*: [`phase2-research/vercel/navigation-system.md`](phase2-research/vercel/navigation-system.md).
4. **Favorites Section**:
   - Collapsible `∨ Your Favorites` container at the top of the project overview for pinned critical apps.
   - Projects pinned via the three-dot context menu (`···`) or star button.
5. **Mobile Floating Action Bar**:
   - On screens `< 768px`, desktop sidebar hides and a bottom-fixed floating pill bar provides thumb-friendly navigation.

---

## 5. Main Project Overview & Action Bar

The multi-project overview combines high-speed search, faceted filtering, and layout toggling:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [🔍] Search projects, tech, or stack... [F]  [ALL HEALTH ∨]  [ALL ENVS ∨]  [SORT: ACTIVITY ∨]  [⊞] [☰] │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Search**: Instant client-side substring matching on name, description, technology, and environment. Pressing `F` focuses the field. Includes clear button `×`.
2. **Health Filter**: `All`, `Healthy`, `Degraded`, `Critical`, `Unknown`.
3. **Environment Filter**: `All`, `Production`, `Staging`, `Development`.
4. **Sort Order**: `Last Telemetry` (default), `Health Priority` (Critical first), `Name (A-Z)`.
5. **View Mode**:
   - **Grid Mode (`⊞`)**: Modular cards with telemetry signal boxes and service badges.
   - **List Mode (`☰`)**: High-density table rows grouped by Environment (`PRODUCTION`, `STAGING`, `DEVELOPMENT`).
   - Selected mode is saved in the local store.
- *Detailed Specification*: [`phase2-research/aegisops/project-interaction-spec.md`](phase2-research/aegisops/project-interaction-spec.md).

---

## 6. Project Card Anatomy

The project card adapts Vercel's deployment card into an operational monitoring container:

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

- **Health States**:
  - `Healthy`: Charcoal dot `●` (`#282828`).
  - `Degraded`: Ochre dot `●` (`#c98a2c`).
  - `Critical`: Urgent red dot `●` (`#fa3600`) + incident count pill.
  - `Disconnected`: Hollow outline circle `○` (`#b3b3af`).
  - `Pending`: Pulsing dot `◎` (`#6c6c64`).
- **Telemetry Recency**: Display deterministic ISO timestamp (`14 Oct · 09:26 UTC`). Never tick simulated seconds.
- **Context Menu (`···`)**: Progressive disclosure for `Pin to Favorites`, `Inspect Services`, `View Activity`, `Project Settings`. Click events must stop propagation so they don't trigger card navigation.
- *Detailed Specification*: [`phase2-research/aegisops/project-card-spec.md`](phase2-research/aegisops/project-card-spec.md).

---

## 7. Project Detail Shell

Located at `/projects/[workspaceId]/[projectId]`:
- **Header**:
  - Breadcrumb: `← ALL PROJECTS / [WORKSPACE NAME] / [PROJECT NAME] ↕`.
  - Project Title, Description, Technology, Environment, Connection, and Health badges.
  - Sub-navigation tabs: `Overview`, `Services (N)`, `Incidents & Activity (N)`, `Settings`.
- **Reactivity**: Switching projects via the header combobox updates all metrics and service lists without a page reload.
- **Scope Limit**: Focus on clear structural organization and service inventory. Do **not** build complex canvas time-series analytics charts.
- *Detailed Specification*: [`phase2-research/aegisops/project-detail-shell.md`](phase2-research/aegisops/project-detail-shell.md).

---

## 8. "Create Demo Project" User Journey

Triggered via the `Add Project +` button:
- **Format**: Accessible native `<dialog>` modal with dark translucent backdrop, focus trapping, and `Escape` dismissal.
- **Fields**:
  - Project Name (Required, 1–80 chars, unique within targeted workspace).
  - Description (Optional, max 240 chars).
  - Target Workspace (Select: `personal` or `northstar`).
  - Environment (`production` | `staging` | `development`).
  - Technology Stack (e.g. `Node.js / PostgreSQL / Redis`).
  - Optional Service Template (`Empty`, `Microservice API`, `3-Tier Stack`).
- **Telemetry Integrity Rule**: Newly created demo projects must initialize with `monitoringStatus: "pending"`, `health: "unknown"`, `activeIncidentCount: 0`, and `lastSignalAt: null`. Never claim fake green health on unmonitored apps.
- **Persistence**: Saved to `localStorage` under `aegisops-demo-v1`; immediate insertion into store and navigation to the new project view.
- *Detailed Specification*: [`phase2-research/aegisops/create-project-spec.md`](phase2-research/aegisops/create-project-spec.md).

---

## 9. Data Contract & Hydration Architecture

In [`lib/demo/projects.ts`](lib/demo/projects.ts) and [`lib/demo/store.ts`](lib/demo/store.ts), a type-safe client store is ready for integration:

- **Entity Types**: `Workspace`, `Project`, `Service`, `Activity`, `Health`, `Environment`, `Monitoring`.
- **Pre-Seeded Fixtures**: 7 deterministic applications (3 in `personal`, 4 in `northstar`).
- **Hydration Safety**: Uses `useSyncExternalStore` with identical server/client initial snapshots to prevent React 19 hydration mismatches in Next.js.
- *Detailed Specification*: [`phase2-research/architecture/demo-data-contract.md`](phase2-research/architecture/demo-data-contract.md).

---

## 10. Motion Requirements: Operational Restraint

AegisOps dashboards require **high-performance responsiveness**, not cinematic marketing scrolls:

1. **Card Hover**: `150ms` border color transition (`--rule` to `--ink`) with subtle -2px lift.
2. **Sidebar Collapse**: `200ms` cubic-bezier width transition. Text labels cross-fade out.
3. **Dropdowns & Modals**: `100ms – 150ms` opacity and scale entrance (`0.98 -> 1`). No spring bounce.
4. **Scroll Isolation**: Sidebars and table containers must include `data-lenis-prevent` to isolate scrolling from Lenis smooth scroll inertia.
5. **Cursor Protection**: Form inputs (`<input>`, `<select>`, `<textarea>`) must retain standard text carets; suppress the custom reticle crosshair when hovering form fields.
6. **Reduced Motion**: Under `prefers-reduced-motion: reduce`, all animations set to `0s` duration; curtain transition skipped.
- *Detailed Specification*: [`phase2-research/aegisops/motion-spec.md`](phase2-research/aegisops/motion-spec.md).

---

## 11. Component Organization & Implementation Order

Build components inside `components/workspace/`:

```
Phase 2.1: Data Store & Route Shell
├── Connect lib/demo/projects.ts and lib/demo/store.ts
├── Set up app/projects/[workspaceId]/page.tsx & [projectId]/page.tsx
└── Adapt components/site-shell.tsx to suppress marketing header on /projects/*

Phase 2.2: Workspace Shell & Sidebar
├── Build components/workspace/workspace-shell.tsx
├── Build components/workspace/sidebar.tsx (with collapse toggle & F shortcut)
└── Build components/workspace/workspace-switcher.tsx

Phase 2.3: Multi-Project Overview & Controls
├── Build components/workspace/action-bar.tsx (Search, filters, sort, view toggle)
├── Build components/workspace/project-card.tsx (Grid card)
├── Build components/workspace/project-row.tsx (List row with environment grouping)
└── Build components/workspace/project-collection.tsx (Favorites + main collection)

Phase 2.4: Project Detail Shell
├── Build components/workspace/project-detail-header.tsx (Breadcrumbs & project switcher pill)
├── Build components/workspace/services-list.tsx
└── Build components/workspace/activity-feed.tsx

Phase 2.5: Creation Modal & Polish
├── Build components/workspace/create-project-modal.tsx
├── Add empty states (components/workspace/empty-state.tsx)
└── Verify accessibility against phase2-research/UX_ACCEPTANCE_CHECKLIST.md
```

---

## 12. Primary Visual Evidence Index

Inspect these captured assets in [`phase2-research/screenshots/`](phase2-research/screenshots/) to guide your layout:

1. **Master Contact Sheets**:
   - [`contact-sheet-dashboard-evolution.png`](phase2-research/screenshots/contact-sheets/contact-sheet-dashboard-evolution.png) — 2026 Navigation Redesign in dark/light mode alongside multi-project list views.
   - [`contact-sheet-cards-and-actions.png`](phase2-research/screenshots/contact-sheets/contact-sheet-cards-and-actions.png) — Favorites section, context menus, grid cards, and Add New action buttons.
2. **High-Resolution Key References**:
   - `dash-dark.png` & `dash-light.png`: Sidebar structure, team switcher, and project filter pill.
   - `listview-dark.png`: Search bar, grid/list toggle, and repository grouping rows.
   - `favorites-overview-1.jpg`: Pinned favorites section and three-dot popup menu.
   - `add-new-project-dark.png`: Grid project cards with framework badges and domain URLs.

---

## 13. Quality Acceptance Criteria

Before declaring Phase 2 complete, verify:
- [ ] `/projects/personal` and `/projects/northstar` load distinct projects.
- [ ] Switching workspaces updates visible projects and URL route cleanly.
- [ ] Sidebar collapses smoothly between `240px` and `56px` and persists preference.
- [ ] Search input filters projects in real time; pressing `F` focuses search.
- [ ] Grid and List toggle switches layout cleanly.
- [ ] Project cards display health, connection, service count, and last signal.
- [ ] Creating a demo project validates unique names, initializes with pending/unknown status, and navigates to the new project view.
- [ ] Native `<dialog>` modal traps focus and closes on `Escape`.
- [ ] All 29 existing Playwright tests in `tests/experience.spec.ts` continue to pass.
- [ ] Zero horizontal overflow across viewports (`1440×900`, `1920×1080`, `1024×768`, `390×844`).
- [ ] Complete checklist verified in [`phase2-research/UX_ACCEPTANCE_CHECKLIST.md`](phase2-research/UX_ACCEPTANCE_CHECKLIST.md).
