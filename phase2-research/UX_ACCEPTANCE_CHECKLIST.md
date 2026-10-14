# UX Acceptance & Accessibility Checklist

**Document Version:** 1.0.0  
**Target:** Astra Implementation Verification & QA Testing  
**Standards:** WCAG 2.1 AA, WAI-ARIA 1.2, Heron Design Integrity, Vercel Usability Benchmarks  
**Location:** [`phase2-research/UX_ACCEPTANCE_CHECKLIST.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/UX_ACCEPTANCE_CHECKLIST.md)  

---

## 1. Multi-Project Overview & Card Grid

- [ ] **Viewport Responsiveness**:
  - [ ] Desktop (1440×900 & 1920×1080): 3-column grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) with consistent gutters (`clamp(16px, 1.5vw, 24px)`).
  - [ ] Tablet (1024×768 & 834×1194): 2-column grid.
  - [ ] Mobile (390×844 & 375×667): 1-column stacked cards without horizontal overflow.
- [ ] **Project Card Anatomy**:
  - [ ] Project title rendered in uppercase bold typography (`Inter Variable`, 600 weight).
  - [ ] Environment badge (`Production`, `Staging`, `Development`) rendered in crisp `.mono` uppercase tag.
  - [ ] Monitoring connection state clearly distinct from Health (e.g. `Connected` vs `Disconnected`).
  - [ ] Health status dot accompanied by programmatic text label (`aria-label="Health: Degraded"`).
  - [ ] Monitored service count cleanly displayed (e.g. `3 Services`).
  - [ ] Relative timestamp for last telemetry receipt formatted unambiguously (e.g. `10m ago · 09:28 UTC`).
  - [ ] Entire card surface is clickable via accessible link or button with `:focus-visible` ring.
- [ ] **Favorites / Pinning**:
  - [ ] Collapsible "Your Favorites" section sits above the main project list.
  - [ ] Projects can be pinned/unpinned via context menu or star icon button.
  - [ ] Pinned state persists across browser page reloads in `localStorage`.

---

## 2. Workspace & Scope Navigation

- [ ] **Workspace Switcher**:
  - [ ] Displays active workspace name (e.g. `Personal Workspace` or `Northstar Engineering`) and scope code (`P / 01`, `N / 02`).
  - [ ] Trigger button uses `aria-haspopup="listbox"` and `aria-expanded="false|true"`.
  - [ ] Open menu provides full keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`).
  - [ ] Selection immediately updates visible project collection and updates URL query or route cleanly.
  - [ ] Displays checkmark icon next to the currently active workspace.
  - [ ] Workspace switching does not trigger unnecessary full-page refreshes.

---

## 3. Collapsible Sidebar & Navigation Hierarchy

- [ ] **Sidebar Structure (Feb 2026 Redesign)**:
  - [ ] Left vertical sidebar contains Workspace Switcher, Universal Search (`Find... [F]`), and primary navigation links (`Overview`, `Services`, `Activity`, `Settings`).
  - [ ] Collapse / Expand toggle button functions smoothly (`width: 240px` <-> `56px`).
  - [ ] Collapsed state (icon rail) hides text labels and keeps icons centered, with tooltips (`title` or custom accessible tooltip) explaining icon destinations.
  - [ ] Collapse preference is stored locally so it persists across navigation.
  - [ ] Sidebar markup uses `<nav aria-label="Workspace Navigation">` with active link denoted via `aria-current="page"`.
  - [ ] Sidebar includes `data-lenis-prevent` to prevent scroll chaining or interference with page smooth scrolling.
- [ ] **Breadcrumbs & Context Bar**:
  - [ ] Top breadcrumb trail links back: `Workspace / Projects / [Selected Project]`.
  - [ ] Includes "Project as Filter" dropdown pill in header to switch between whole-workspace view and single-project telemetry in one click.

---

## 4. Search, Filtering, Sorting & View Modes

- [ ] **Universal Search Input**:
  - [ ] Global shortcut `F` or `/` focuses search input immediately.
  - [ ] Clear button (`×`) appears when input has value; clicking resets search and restores focus.
  - [ ] Filters project names, descriptions, environments, and technologies in real time.
- [ ] **Filter Controls**:
  - [ ] Health filter dropdown (`All`, `Healthy`, `Degraded`, `Critical`, `Unknown`).
  - [ ] Environment filter dropdown (`All`, `Production`, `Staging`, `Development`).
  - [ ] Filter pill indicators show active count when filters are applied.
  - [ ] "Reset all filters" button appears when results are empty or filters are active.
- [ ] **Sorting**:
  - [ ] Sort options: `Name (A-Z)`, `Last Telemetry (Recent first)`, `Health Priority (Critical first)`.
- [ ] **View Mode Switcher**:
  - [ ] Toggle buttons for `Grid` and `List` view using `role="radiogroup"` or `aria-pressed`.
  - [ ] List view groups items cleanly with semantic table or list markup (`role="table"` or `<ul role="list">`).
  - [ ] Selected view mode persists across page reloads.

---

## 5. "Create Demo Project" User Journey

- [ ] **Modal Dialog Accessibility**:
  - [ ] Implemented using native `<dialog>` element or accessible modal container.
  - [ ] Focus traps within dialog when open; initial focus moves to first form input ("Project Name").
  - [ ] Pressing `Escape` closes the modal immediately without submitting.
  - [ ] Focus restores to the triggering `Add New...` button upon dismissal.
  - [ ] Background body scroll is locked while modal is open (`overflow: hidden`).
- [ ] **Form Validation & Data Integrity**:
  - [ ] Project Name is required (1–80 characters, trimmed).
  - [ ] Duplicate name detection within the active workspace warns the user with inline error message.
  - [ ] Auto-generates unique stable ID (`local-[slug]-[timestamp]`).
  - [ ] Initial state correctly assigns:
    - Monitoring: `Pending`
    - Health: `Unknown`
    - Incident Count: `0`
    - Last Signal: `null` ("No telemetry received")
    - Services: `[]` (or template selection)
  - [ ] Submitting immediately inserts the project into the client-side store and navigates to the new project view.

---

## 6. Accessibility & Contrast (WCAG 2.1 AA)

- [ ] **Color Contrast**:
  - [ ] Dark ink text (`#282828`) on paper background (`#e0e0da`) exceeds 8.5:1 contrast ratio (passing AAA).
  - [ ] Dark surface containers (`#282828`) with paper text (`#e0e0da`) exceed 8.5:1.
  - [ ] Alert red (`#fa3600`) used only with high-contrast text or backgrounds.
- [ ] **Keyboard Navigation**:
  - [ ] All interactive elements (`<button>`, `<a>`, `<input>`, `<select>`) have visible outline rings on `:focus-visible` (`2px solid var(--ink)` with `5px outline-offset`).
  - [ ] Logical tab order flows: Header -> Sidebar -> Search/Filter bar -> Project cards.
- [ ] **Screen Reader Support**:
  - [ ] Status indicators use aria-labels (e.g. `aria-label="Critical issue detected"`).
  - [ ] Decorative icons marked with `aria-hidden="true"`.
  - [ ] Dropdowns use `aria-haspopup="menu"` or `listbox` with appropriate `aria-expanded` states.

---

## 7. Motion & Reduced Motion Behavior

- [ ] **Operational Restraint**:
  - [ ] Card hover transitions complete within `150ms` (border color and subtle elevation).
  - [ ] Dropdowns open within `100ms – 120ms` without spring bounce.
  - [ ] Sidebar collapse takes `200ms` with smooth cubic-bezier easing.
  - [ ] No heavy pinned scroll scrubbing on operational workspace pages.
- [ ] **Reduced Motion Preference**:
  - [ ] Under `@media (prefers-reduced-motion: reduce)`:
    - Sidebar collapses instantaneously (`duration: 0s`).
    - Route curtain transition is skipped.
    - Custom canvas cursor trail is disabled.
    - Card hover transforms are disabled; only border colors change.
