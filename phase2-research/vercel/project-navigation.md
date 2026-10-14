# Vercel Project Detail Navigation: Reverse Engineering Analysis

**Document Version:** 1.0.0  
**Research Target:** Vercel Selected Project Interface & Context Transitions  
**Evidence Source:** Official Documentation (`/docs/projects/*`), Screenshots (`dash-dark.png`, `dash-light.png`), Changelog Redesign Notes  
**Location:** [`phase2-research/vercel/project-navigation.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/vercel/project-navigation.md)  

---

## 1. Entering a Project: Context Shift & Identity

In Vercel's February 2026 navigation architecture, selecting an individual project from the multi-project overview does NOT navigate to an unrelated standalone page; instead, it refines the active scope:

1. **How the Selected Project is Identified**:
   - The top header renders a dedicated **Project Selector Pill**: `(Framework Icon) project-name ↕`.
   - The breadcrumb trail updates to include the project context: `Team / Projects / project-name`.
   - The browser URL updates cleanly from `/team` to `/team/project-name` (or `/[project-name]`).
2. **Persistent Navigation Controls**:
   - The left sidebar **persists** across the transition. The user does not lose access to the global team switcher or primary workflow items (`Overview`, `Deployments`, `Logs`, `Analytics`, `Settings`).
   - The primary search bar (`Find... [F]`) remains accessible.
3. **Sub-Tab Navigation**:
   - Under the project header, secondary sub-navigation tabs appear: `Deployment`, `Resources`, `Source`, `Open Graph`, `Bundle Sizes` (as seen in `dash-dark.png`).

---

## 2. Returning to All Projects & Switching Projects

1. **Returning to All Projects**:
   - Users can return to the team multi-project overview by:
     - Clicking `Projects` or `Overview` in the left sidebar.
     - Clicking the `Projects` link in the top breadcrumb trail (`Team / Projects`).
2. **Direct Project Switching**:
   - Clicking the project selector pill in the header (`(N) site ↕`) opens a combobox dropdown listing all other projects in the current team.
   - Choosing a different project switches the active project **without losing the current sub-view** (e.g. if you are viewing `Logs` for Project A, switching to Project B immediately renders `Logs` for Project B).

---

## 3. Direct Links & Mobile Adaptation

1. **Deep Linking**:
   - Direct URLs like `https://vercel.com/[team]/[project]` load the specific project view immediately.
   - If the project does not exist, Vercel renders a standard 404 Empty State with a button to "Return to Dashboard".
2. **Mobile Screen Adaptation**:
   - On mobile screens, the project title and back button dominate the top navigation bar.
   - The sub-tabs become a horizontal scrollable strip with subtle edge fades.
   - The floating bottom bar provides single-tap access back to the team overview.
