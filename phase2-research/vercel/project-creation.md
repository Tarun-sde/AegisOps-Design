# Vercel Project Creation Journey: Reverse Engineering Analysis

**Document Version:** 1.0.0  
**Research Focus:** Vercel "Add New Project" User Journey & Flow Mechanics  
**Evidence Source:** Official Documentation (`/docs/projects/managing-projects`), Documentation Captures (`add-new-project-dark.png`, `add-new-project-light.png`), REST API / CLI Specs  
**Location:** [`phase2-research/vercel/project-creation.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/vercel/project-creation.md)  

---

## 1. Entry Point & Trigger

As verified in `add-new-project-dark.png` and `add-new-project-light.png`:
- **Placement**: Top right of the dashboard action bar.
- **Trigger**: Primary split button `Add New... ∨`.
- **Options**:
  - `Project` (Primary entry point)
  - `Domain`
  - Horizontal separator rule
  - `Team Member` (Role-restricted)
- **Navigation Action**: Clicking `Project` navigates the browser to the full-page creation route: `/new` (scoped under current team: `/[team]/new`).

---

## 2. Full-Page Flow Structure (`/new`)

Vercel uses a **full-page guided wizard**, rather than a small modal, because project setup requires multiple high-context configuration steps:

1. **Step 1: Choose Import Source**:
   - Tab 1: **Import Git Repository** (GitHub, GitLab, Bitbucket) with repository search, branch selector, and monorepo folder picker.
   - Tab 2: **Clone Template** (Next.js Boilerplate, Commerce, AI Chatbot, Portfolio, etc.).
2. **Step 2: Project Configuration Form**:
   - **Project Name**: Auto-derived from repo slug, editable, validated for slug safety (`[a-z0-9-]`, max 100 chars).
   - **Framework Preset**: Auto-detected from `package.json` (Next.js, Vite, Remix, SvelteKit, etc.) with manual override dropdown.
   - **Root Directory**: Collapsible section for monorepo roots (`./apps/web`).
   - **Build & Output Settings**: Collapsible overrides for Build Command (`next build`), Output Directory (`.next`), Install Command (`npm install`).
   - **Environment Variables**: Key-Value matrix with multi-select checkboxes for target environments (`Production`, `Preview`, `Development`).
3. **Step 3: Submission & Deployment State**:
   - CTA Button: `Deploy` (solid high-contrast button).
   - Loading State: Page transitions to live deployment terminal view with real-time log output and progress checklist (`Building`, `Inspecting`, `Assigning Domains`).
4. **Step 4: Success & Celebration**:
   - Live screenshot preview of the generated web application.
   - Production domain link (`https://[project-name].vercel.app`).
   - Primary button: `Continue to Dashboard` navigates directly into the project's detail shell.

---

## 3. Validation & Error Handling

- **Duplicate Project Name**: If name is already taken in the active team, Vercel highlights the input in red with an inline error: `A project with this name already exists in this team.`
- **Invalid Characters**: Spaces, uppercase letters, and non-alphanumeric characters (except hyphens) are automatically converted or flagged.
