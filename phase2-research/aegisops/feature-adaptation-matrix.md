# Vercel to AegisOps Feature Adaptation Matrix

**Document Version:** 1.0.0  
**Target:** Product Architecture & Scope Definition  
**Location:** [`phase2-research/aegisops/feature-adaptation-matrix.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/aegisops/feature-adaptation-matrix.md)  

---

## 1. Feature Mapping & Scope Classification Matrix

Every Vercel capability investigated is mapped below into one of four strict engineering decisions:
- **KEEP**: Preserve the exact interaction pattern and visual semantics.
- **ADAPT**: Re-map the underlying concept into an application monitoring / incident investigation domain.
- **DEFER**: Out of scope for Phase 2 prototype; clearly specify placeholder or mock boundary.
- **EXCLUDE**: Not applicable to AegisOps product domain; actively omit to prevent feature bloat.

| Vercel Concept / Feature | AegisOps Equivalent | Decision | Strategic Product Rationale |
| :--- | :--- | :--- | :--- |
| **Team Scope / Switcher** | **Workspace Scope / Switcher** (`Personal Workspace` vs `Northstar Engineering`). | **ADAPT** | Application monitoring topology requires grouping projects by organization, team, or developer sandbox. |
| **Multi-Project Overview** | **Multi-Project Workspace Overview** (Monitored applications grid & list). | **ADAPT** | Central hub for incident responders to scan the operational health across all their applications in one place. |
| **Project Card** | **Application Monitoring Card** (Identity, health, services, signals, incidents). | **ADAPT** | Replaces deployment-centric metadata (Git commits) with telemetry recency, active incidents, and service counts. |
| **Collapsible Sidebar (Feb 2026)** | **Collapsible Left Sidebar** (`width: 240px` <-> `56px` icon rail). | **KEEP** | Essential for developer ergonomics; preserves screen width for wide telemetry tables and multi-service topology. |
| **Projects as Filters (Feb 2026)** | **Project Filter Pill** in top header (`(Mark) Payment Gateway ↕`). | **KEEP** | Allows one-click switching between team-wide incident view and project-specific telemetry without navigating away. |
| **Deployment Status** (`Ready`, `Building`, `Error`) | **Application Health Status** (`Healthy`, `Degraded`, `Critical`, `Unknown`). | **ADAPT** | Monitoring platforms track continuous system reliability, whereas Vercel tracks discrete deployment build states. |
| **Recent Deployment Commit** | **Last Telemetry Signal & Event Message**. | **ADAPT** | Incident responders care about runtime telemetry flow and recent error events, not Git commit SHAs. |
| **Git Repository Grouping (List View)** | **Environment Grouping** (`Production`, `Staging`, `Development`). | **ADAPT** | While Vercel groups monorepo projects by GitHub repo, monitoring platforms group services by operational runtime tier. |
| **Card / List View Toggle** | **Grid / List View Mode Toggle** (`⊞` / `☰`). | **KEEP** | Critical for density preference: grid for high-level monitoring, list for rapid scanning across 15+ services. |
| **Universal Search (`Find... [F]`)** | **Universal Search Input** with keyboard shortcut `F`. | **KEEP** | Industry-standard developer shortcut; matches project title, description, technology stack, and environment. |
| **Favorites Section (`∨ Your Favorites`)** | **Pinned Favorites Section** with star icon & context menu toggle. | **KEEP** | Allows engineers on-call to pin their critical applications to the top of their dashboard view. |
| **Add Project Flow (`/new`)** | **"Create Demo Project" Modal Dialog**. | **ADAPT** | Vercel connects live Git OAuth repositories; AegisOps simulates local application provisioning client-side. |
| **Context Menu (`···`)** | **Project Context Menu** (`Pin to Favorites`, `Inspect Services`, `View Activity`, `Settings`). | **KEEP** | Clean progressive disclosure for secondary actions without cluttering the primary card surface. |
| **Speed Insights Gauge** (`96`) | **Service Health Ratio Indicator** (e.g. `3/4 Services Healthy`). | **ADAPT** | Web vitals gauge adapted into an operational service health fraction. |
| **Deployment History / Rollbacks** | N/A (Deployment orchestration not in scope). | **EXCLUDE** | AegisOps is an incident investigation platform, not a hosting provider or build pipeline. |
| **Live Build Logs Terminal** | N/A (Build steps not in scope). | **EXCLUDE** | Build terminals are irrelevant; replaced by runtime event activity streams. |
| **Team Billing & Invoicing** | N/A (Billing mock out of scope). | **EXCLUDE** | Pure business administrative overhead; adds no value to the UI/UX monitoring workflow demonstration. |
| **Project Settings (Danger Zone: Delete)** | **Local Demo Project Deletion / Reset**. | **DEFER** | Local demo projects can be cleared via browser storage reset; advanced deletion flows deferred to Phase 3. |
| **Web Analytics & Traffic Graphs** | Advanced APM Charts & Metric Visualizations. | **DEFER** | Phase 2 focuses on information architecture, project navigation, and layout. Detailed telemetry charts deferred. |
| **Floating Mobile Bottom Bar** | **Mobile Operational Action Bar** (Bottom-fixed floating pill). | **KEEP** | Essential for thumb-driven mobile ergonomics as established in Vercel's February 2026 redesign. |
