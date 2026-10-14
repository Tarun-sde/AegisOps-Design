# Complete UX State Inventory: AegisOps Multi-Project Workspace

**Document Version:** 1.0.0  
**Target:** Astra Frontend Implementation & Automated Test Verification  
**Coverage:** 22 Exhaustive Operational UI States  
**Location:** [`phase2-research/aegisops/state-inventory.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/aegisops/state-inventory.md)  

---

## 1. Workspace Level States

### State 01: Workspace With Projects (Default Loaded State)
- **Condition**: Active workspace has 1+ projects (e.g. `northstar` has 4, `personal` has 3).
- **Presentation**: Top action bar visible; project cards rendered in 3-column grid (or list mode); Favorites section displayed if any projects are pinned.
- **Interactions**: All cards clickable; filters responsive; search active.

### State 02: Workspace Without Projects (Empty Workspace)
- **Condition**: Active workspace has 0 projects (e.g. `sandbox` workspace initially, or all projects deleted).
- **Presentation**: Main grid replaced by architectural empty container:
  - SVG broken drafting square illustration.
  - Headline: `NO PROJECTS CONFIGURED IN THIS WORKSPACE`.
  - Body: `Connect your first monitored application to begin receiving telemetry signals.`
  - Primary CTA: `+ CREATE DEMO PROJECT` button.

### State 03: Workspace Switcher Open
- **Condition**: User clicks the workspace trigger button in the sidebar or header.
- **Presentation**: Switcher button receives `:focus-visible` or active border; dropdown menu renders downward (`scale: 0.98 -> 1`, `opacity: 0 -> 1` over 100ms); options listed with code badges (`P / 01`, `N / 02`, `S / 03`); active item displays checkmark `✓`.
- **Keyboard**: Focus trapped within dropdown; `Escape` closes menu; `ArrowDown`/`ArrowUp` cycles options; `Enter` selects.

### State 04: Sidebar Expanded (Default Desktop)
- **Condition**: Viewport `>= 768px` and `sidebarCollapsed === false`.
- **Presentation**: Width `240px`; renders workspace switcher, search input (`Find... [F]`), navigation links with icons and text labels, item counts (`(7)`, `(3)`), and bottom `[ < ] COLLAPSE` toggle.

### State 05: Sidebar Collapsed (Icon Rail Mode)
- **Condition**: Viewport `>= 768px` and user clicks `[ < ]` toggle.
- **Presentation**: Width interpolates to `56px` over 200ms; labels hidden (`opacity: 0`, `display: none`); icons centered; toggle displays `[ > ]`; hovering an icon displays tooltip with label.

### State 06: Mobile Navigation Open
- **Condition**: Viewport `< 768px` and user taps `Menu` on the floating bottom action bar.
- **Presentation**: Native drawer or bottom sheet slides upward; background dimmed; displays full workspace switcher and navigation options; tap backdrop or `×` dismisses.

---

## 2. Project Health & Operational States

### State 07: Healthy Project
- **Data**: `health: "healthy"`, `monitoringStatus: "connected"`, `activeIncidentCount: 0`.
- **Presentation**: Dark charcoal status dot (`#282828`); badge `HEALTHY`; incident count displays `0 INCIDENTS` in muted mono; all individual services green/healthy.

### State 08: Degraded Project
- **Data**: `health: "degraded"`, `monitoringStatus: "connected"`, `activeIncidentCount: 1`.
- **Presentation**: Ochre status dot (`#c98a2c`); badge `DEGRADED`; incident indicator displays `! 1 ACTIVE INCIDENT`; at least one service highlighted in ochre.

### State 09: Critical Project
- **Data**: `health: "critical"`, `monitoringStatus: "connected"`, `activeIncidentCount: >= 2`.
- **Presentation**: Urgent red status dot (`#fa3600`); badge `CRITICAL` with subtle red hairline border; incident badge displays `! 2 ACTIVE INCIDENTS` in red; latest telemetry message highlights outage cause.

### State 10: Disconnected Project
- **Data**: `monitoringStatus: "disconnected"`, `health: "unknown"`, `lastSignalAt: null`.
- **Presentation**: Hollow outline circle `○` (`#b3b3af`); badge `DISCONNECTED`; telemetry field displays `No telemetry received`; service health dots gray.

### State 11: Unknown Health (Pending Setup)
- **Data**: `monitoringStatus: "pending"`, `health: "unknown"`, `lastSignalAt: null`.
- **Presentation**: Pulsing dot `◎` (`#6c6c64`); badge `PENDING CONNECTION`; banner displays `Sample service inventory prepared; connection pending`.

---

## 3. Search, Filter & Layout States

### State 12: Grid View Mode
- **Condition**: `state.view === "grid"`.
- **Presentation**: Multi-column modular cards (3 cols on desktop 1440+, 2 cols on tablet, 1 col on mobile); rich card padding, hover lift.

### State 13: List View Mode
- **Condition**: `state.view === "list"`.
- **Presentation**: High-density horizontal table rows grouped by environment (`PRODUCTION`, `STAGING`, `DEVELOPMENT`); 64px row height.

### State 14: Multiple Active Filters
- **Condition**: Both health filter and environment filter selected (e.g. `Health: Degraded` + `Env: Production`).
- **Presentation**: Filter dropdown triggers display active badge counters; count text updates: `SHOWING 1 OF 7 PROJECTS`; cards smoothly reflow.

### State 15: No Search Results (Empty Query State)
- **Condition**: Search query or filter combination matches 0 projects.
- **Presentation**: Project cards hidden; displays empty state: `No projects match "${query}" in this workspace.`; button `Reset all filters` rendered prominently.

---

## 4. Project Detail & Transition States

### State 16: Project Detail Selected
- **Condition**: User navigates to `/projects/[workspaceId]/[projectId]` (e.g. `/projects/northstar/payment-gateway`).
- **Presentation**: Project Detail Shell renders with header breadcrumb `← ALL PROJECTS`, project title, environment, health dot, service count, and 4 sub-tabs (`Overview`, `Services`, `Incidents`, `Settings`).

### State 17: In-Header Project Switching
- **Condition**: User clicks the project selector pill `(Mark) PAYMENT GATEWAY ↕` in the detail header.
- **Presentation**: Combobox dropdown opens showing all projects in active workspace; selecting another project (e.g. `Customer Portal`) updates URL and switches header content without reloading the page.

### State 18: Invalid Project URL (404 Fallback)
- **Condition**: User visits `/projects/northstar/non-existent-project`.
- **Presentation**: Renders technical error boundary inside workspace frame:
  - Code: `ERR_PROJECT_NOT_FOUND`
  - Message: `The project "non-existent-project" does not exist in workspace "Northstar Engineering".`
  - Action: Button `← Return to Workspace Projects`.

---

## 5. "Create Demo Project" Dialog States

### State 19: Create Project Dialog Open
- **Condition**: User clicks `+ New Project`.
- **Presentation**: Native `<dialog>` opens with dark backdrop; focus automatically set to `Project Name` input; body scroll locked.

### State 20: Validation Error State
- **Condition**: User enters an existing project name (e.g. `Payment Gateway` in `northstar`) or empty name and clicks submit.
- **Presentation**: Name input gains red outline border (`1px solid var(--red)`); error message renders below input: `A project with this name already exists in Northstar Engineering.`; submission blocked; focus remains on input.

### State 21: Successful Local Project Creation
- **Condition**: Valid form submitted.
- **Presentation**: Modal closes instantly; project saved to `localStorage`; router navigates to the new project detail view; initial health correctly shows `PENDING / UNKNOWN` (zero telemetry).

---

## 6. Accessibility & System States

### State 22: Reduced-Motion Mode Active
- **Condition**: User has `prefers-reduced-motion: reduce` enabled in system OS.
- **Presentation**:
  - Curtain route transition skipped completely (`duration: 0s`).
  - Sidebar collapse/expansion occurs instantaneously (`duration: 0s`).
  - Canvas 2D cursor trails disabled.
  - Card hover transforms disabled (only border color changes).
  - All functional transitions instantaneous.
