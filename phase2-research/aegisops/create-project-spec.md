# AegisOps "Create Demo Project" Specification

**Document Version:** 1.0.0  
**Target:** Astra Frontend Implementation  
**Visual Style:** Heron Monochromatic Drafting Identity  
**Scope:** Client-Side Demo Project Provisioning Modal  
**Location:** [`phase2-research/aegisops/create-project-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/aegisops/create-project-spec.md)  

---

## 1. Interaction Model: Modal Dialog vs. Full Page

While Vercel uses a full-page `/new` wizard for external Git repository connections, AegisOps's prototype creates **mock operational applications** in the browser.

### Recommendation for Astra:
Implement a **Focused Modal Dialog** triggered by `Add Project +` in the action bar or sidebar:
- **Rationale**: Keeps the engineer anchored within their workspace context without heavy route switching.
- **Native `<dialog>` Architecture**: Utilizes HTML5 `<dialog open>` with `data-lenis-prevent` and native focus management.

---

## 2. Form Fields & Validation Rules

```
┌────────────────────────────────────────────────────────────────────────┐
│  CREATE DEMO PROJECT                                               [×] │
│  Define a new application for simulated telemetry inspection.          │
├────────────────────────────────────────────────────────────────────────┤
│  PROJECT NAME *                                                        │
│  [ e.g. Billing Dispatcher                                           ] │
│                                                                        │
│  DESCRIPTION                                                           │
│  [ Automated invoice scheduling and payment batch queue              ] │
│                                                                        │
│  TARGET WORKSPACE *                                                    │
│  [ Northstar Engineering (N / 02)                                  ∨ ] │
│                                                                        │
│  ENVIRONMENT *                                                         │
│  (●) Production       (○) Staging       (○) Development                │
│                                                                        │
│  TECHNOLOGY STACK *                                                    │
│  [ Node.js / PostgreSQL / Redis                                    ∨ ] │
│                                                                        │
│  SERVICE ARCHITECTURE TEMPLATE (OPTIONAL)                              │
│  [ 3-Tier Web App (API, Cache, DB)                                 ∨ ] │
├────────────────────────────────────────────────────────────────────────┤
│  [CANCEL]                                        [CREATE DEMO PROJECT] │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Form Field Specifications & Validation Rules:
1. **Project Name** (`name: string`):
   - Required. Trimmed length: `1` to `80` characters.
   - Validation: Must not duplicate an existing project name within the targeted workspace.
   - Slug generation: Lowercased, alphanumeric with hyphens (`Billing Dispatcher` → `billing-dispatcher`).
2. **Description** (`description: string`):
   - Optional. Max `240` characters.
3. **Workspace** (`workspaceId: string`):
   - Select dropdown defaulting to currently active workspace (`personal` or `northstar`).
4. **Environment** (`environment: Environment`):
   - Radio group or segmented pill: `"production"` | `"staging"` | `"development"`.
5. **Technology Stack** (`technology: string`):
   - Text input with autocomplete suggestions (e.g. `Next.js / PostgreSQL`, `Python / Redis`, `Go / SQLite`, `Java / PostgreSQL`). Max 80 chars.
6. **Service Template** (`optional`):
   - Dropdown options:
     - `Empty (0 Services)`: Starts completely unpopulated.
     - `Microservice API (2 Services)`: API Gateway + PostgreSQL DB.
     - `3-Tier Stack (3 Services)`: Web Frontend + Node.js API + Redis Cache.

---

## 3. Initial Project State Invariant (Integrity Guarantee)

> [!IMPORTANT]
> **Truth in Telemetry Guarantee**:  
> A newly created demo project must **NEVER** falsely claim real telemetry is active or display simulated green health. Doing so destroys operational credibility.

### Mandatory Initial Field Values:
```typescript
const newProject: Project = {
  id: `local-${slug}-${Date.now().toString(36)}`,
  workspaceId: formData.workspaceId,
  name: formData.name.trim(),
  description: formData.description.trim(),
  technology: formData.technology.trim(),
  environment: formData.environment,
  monitoringStatus: "pending",   // PENDING CONNECTION
  health: "unknown",              // UNKNOWN HEALTH
  services: templateServices,     // 0 or template services (all initialized to health: "unknown")
  activeIncidentCount: 0,         // ZERO ACTIVE INCIDENTS
  lastSignalAt: null,             // NO TELEMETRY RECEIVED
  activities: [
    {
      id: `local-evt-${Date.now()}`,
      at: new Date().toISOString(),
      message: `${formData.name.trim()} project created in demo workspace`,
      kind: "setup",
    },
  ],
  local: true,                    // FLAG FOR LOCALSTORAGE PERSISTENCE
};
```

---

## 4. Submission, Persistence & Navigation Flow

1. **Submission Trigger**: User clicks `[CREATE DEMO PROJECT]`.
2. **Client Validation**: Check name uniqueness against `store.projects`. If duplicate, highlight input and display message: `A project named "${name}" already exists in this workspace.`
3. **Store Insertion**: Call `updateDemo({ projects: [...state.projects, newProject] })`.
4. **Local Persistence**: Written to `localStorage.getItem("aegisops-demo-v1")`.
5. **Modal Close**: Animate modal dismissal (`100ms`).
6. **Navigation**: Call `router.push(`/projects/${newProject.workspaceId}/${newProject.id}`)` to bring the user directly to the new project detail shell.
