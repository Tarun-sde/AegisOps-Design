# AegisOps Collapsible Sidebar & Navigation Specification

**Document Version:** 1.0.0  
**Target:** Astra Frontend Implementation  
**Visual Style:** Heron Monochromatic Drafting Identity (`globals.css`)  
**Behavioral Blueprint:** Vercel 2026 Navigation Redesign  
**Location:** [`phase2-research/aegisops/sidebar-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/aegisops/sidebar-spec.md)  

---

## 1. AegisOps Navigation Hierarchy

To avoid bloat and unnecessary placeholder screens, AegisOps implements a streamlined, two-tiered navigation hierarchy:

```
LEVEL 1: WORKSPACE LEVEL (When no project is selected)
├── Workspace Switcher (Personal vs Northstar vs Sandbox)
├── Universal Search / Find... [F]
├── Projects (Overview grid/list of applications)  [IMPLEMENT NOW]
├── Workspace Activity (Unified signal stream)      [DEFER / OPTIONAL TAB]
└── Settings (Workspace team config)                [DEFER / MOCK MODAL]

LEVEL 2: PROJECT LEVEL (When a project is selected)
├── Breadcrumbs / Project Filter Pill ((Mark) Payment Gateway ↕)
├── Project Overview (Telemetry signals, health, metrics)  [IMPLEMENT NOW]
├── Services (Breakdown of monitored services)             [IMPLEMENT NOW]
├── Incidents & Activity (Audit trail of events)           [IMPLEMENT NOW]
└── Project Settings (Alert thresholds, demo reset)        [DEFER / MOCK MODAL]
```

---

## 2. Sidebar Component Layout & Specifications

```
EXPANDED MODE (240px)
┌────────────────────────────────────────────────────────┐
│ [Mark] NORTHSTAR ENGINEERING                [N / 02] ↕ │
├────────────────────────────────────────────────────────┤
│ [🔍] Find project or signal...                     [F] │
├────────────────────────────────────────────────────────┤
│ NAVIGATION                                             │
│                                                        │
│ [⊞]  PROJECTS (Active Pill)                       (7)  │
│ [∿]  TELEMETRY SIGNALS                                 │
│ [!]  INCIDENTS                                    (3)  │
│ [⚙]  SETTINGS                                          │
├────────────────────────────────────────────────────────┤
│ [<]  COLLAPSE SIDEBAR                                  │
└────────────────────────────────────────────────────────┘
```

### 2.1 Visual Styles & Design Tokens
```css
.workspace-sidebar {
  width: 240px;
  min-height: calc(100dvh - 16px);
  background: var(--paper); /* Or dark charcoal #212121 */
  border-right: 1px solid var(--rule);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 12px;
  transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
}

.workspace-sidebar.collapsed {
  width: 56px;
  padding: 16px 8px;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 38px;
  padding: 0 10px;
  border-radius: 4px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  transition: background-color 120ms ease;
}

.sidebar-nav-item:hover {
  background: rgba(40, 40, 40, 0.05);
}

.sidebar-nav-item.active {
  background: var(--ink);
  color: var(--paper);
}

.sidebar-nav-item.active svg {
  stroke: var(--paper);
}
```

---

## 3. Sidebar Collapse & Expansion Interactions

1. **Trigger**: Toggle button at the bottom of the sidebar with an arrow icon `[ < ]` and label `COLLAPSE`.
2. **Collapsed State (56px)**:
   - Labels fade out and hide (`display: none` after transition).
   - Icons remain horizontally centered in the 56px column.
   - Hovering an icon reveals an accessible technical tooltip showing the destination.
   - Toggle button changes arrow to `[ > ]`.
3. **State Persistence**:
   - Stored in `localStorage.setItem("aegisops-sidebar-collapsed", "true")`.
   - On page refresh, reads initial state to prevent visual layout flicker.

---

## 4. Handling Edge Cases: Long Project Names & High Cardinality

1. **Long Project Names**:
   - Titles are constrained with `text-overflow: ellipsis`, `white-space: nowrap`, and `overflow: hidden`.
   - Full title is accessible via the standard HTML `title` attribute and in screen reader text.
2. **High Project Cardinality (20+ Projects)**:
   - Search input (`Find... [F]`) enables instant substring matching across name, description, and technology stack.
   - View mode toggle (`Grid` vs `List`) allows engineers to switch to high-density list rows.
3. **Scroll Isolation**:
   - The sidebar has `overflow-y: auto` and includes `data-lenis-prevent` so scrolling long lists within the sidebar never triggers page-level smooth scroll jitter.

---

## 5. Mobile & Small Screen Adaptation (<768px)

- On screens `< 768px`, the desktop sidebar is hidden (`display: none`).
- **Floating Operational Action Bar**:
  - Rendered fixed at the bottom of the screen (`bottom: 12px`, `left: 12px`, `right: 12px`).
  - Contains:
    - `[Mark] Workspace Switcher Pill`
    - `[🔍] Search Modal Trigger`
    - `[⊞] Projects View`
    - `[+] New Demo Project Trigger`
  - Allows 100% thumb-accessible navigation without reaching for the top corners.
