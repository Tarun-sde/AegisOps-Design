# Architecture: Routing, Navigation & Workspace Integration

**Document Version:** 1.0.0  
**Researcher:** Principal Technical Architecture Analyst, Senior Route Architect  
**Repository State:** Verified Phase 2 codebase (`app/projects/[workspaceId]/[projectId]`)  
**Location:** [`phase3-research/architecture/routing-and-navigation.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/architecture/routing-and-navigation.md)  

---

## 1. Architectural Route Comparison

We evaluated three potential route architectures for Phase 3:

| Architectural Option | Route Structure | Pros | Cons | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **Option 1: Pure In-Page Anchors** | `/projects/[wId]/[pId]#overview`<br/>`...#analytics`<br/>`...#services`<br/>`...#incidents` | • Zero route transition latency<br/>• Simple state sharing<br/>• Preserves Phase 2 detail layout | • Long, cluttered single page<br/>• Complex AI investigation view feels cramped in an anchor section<br/>• Cannot deep-link to specific investigation | REJECTED (Too cramped for full AI investigation) |
| **Option 2: Deeply Nested Sub-routes** | `/projects/[wId]/[pId]/overview`<br/>`.../analytics`<br/>`.../services`<br/>`.../incidents`<br/>`.../incidents/[incId]` | • Highly isolated components<br/>• Clean URL per subview | • Fragmented user experience<br/>• Navigating between Analytics and Services triggers page transition curtain<br/>• High boilerplate | REJECTED (Unnecessary route fragmentation) |
| **Option 3: Hybrid Console + Dedicated Investigation Route (Recommended)** | **Main Console**: `/projects/[wId]/[pId]` (with `#overview`, `#analytics`, `#services`, `#incidents`)<br/>**Deep Investigation**: `/projects/[wId]/[pId]/incidents/[incidentId]` | • Fast, fluid in-page operational triage<br/>• Quick slide-out drawer for quick inspection<br/>• Dedicated, focused route for the deep-dive AI Investigation Console<br/>• Bookmarkable, shareable incident URLs | **WINNER (RECOMMENDED)** |

---

## 2. Recommended Route Map

```
app/projects/
├── page.tsx                               # [Existing] Client redirect to /projects/personal
├── layout.tsx                             # [Existing] WorkspaceShell wrapper
├── workspace.css                          # [Extend] Workspace & Phase 3 analytics styling
└── [workspaceId]/
    ├── page.tsx                           # [Existing] Workspace Overview (grid/list)
    └── [projectId]/
        ├── page.tsx                       # [Extend] Main Project Observability Console
        └── incidents/
            └── [incidentId]/
                └── page.tsx               # [NEW] Dedicated AI Investigation Console
```

---

## 3. Navigation & Breadcrumb Hierarchy

### On the Main Project Observability Console:
* **URL**: `/projects/northstar/payment-gateway`
* **Breadcrumbs**: `AegisOps / Northstar Engineering / Payment Gateway`
* **Tab Strip**:
  - `Overview` (`#overview`)
  - `Analytics` (`#analytics`)
  - `Services` (`#services`)
  - `Incidents (1)` (`#incidents`)
* **Behavior**: Clicking tabs scrolls smoothly to the target section using Lenis anchor handling, without triggering the full-page transition curtain.

### On the Dedicated AI Investigation View:
* **URL**: `/projects/northstar/payment-gateway/incidents/inc-payment-gw-01`
* **Breadcrumbs**: `AegisOps / Northstar / Payment Gateway / Incidents / INC-2026-1014-01`
* **Top Back Link**: `← Back to Payment Gateway Console`
* **Behavior**: Provides a focused, full-width diagnostic workspace with the Hypothesis Cards, Evidence Explorer, and Remediation Action panel.
