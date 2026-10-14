# Vercel Project Overview: Reverse Engineering & Architectural Analysis

**Document Version:** 1.0.0  
**Research Target:** Vercel Multi-Project Team Dashboard Overview  
**Evidence Source:** Official Documentation, Contentful Changelog Imagery (`listview-dark.png`, `add-new-project-dark.png`, `favorites-overview-1.jpg`), Geist Design System  
**Location:** [`phase2-research/vercel/project-overview.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/vercel/project-overview.md)  

---

## 1. Overview & Information Architecture

The Vercel multi-project dashboard serves as the central command center for all deployments, microfrontends, and backend services belonging to a team or personal account.

In Vercel's information architecture:
```
[Team / Personal Scope] 
        └── [Projects Overview]
                ├── [Your Favorites (Pinned Cards / Rows)]
                ├── [Search & Filter Action Bar]
                └── [All Projects (Grid Cards or Repository-Grouped Rows)]
```

### Key Architectural Invariants:
1. **Team Scoping**: Projects are strictly partitioned by team scope. The active team determines which projects are fetched and displayed.
2. **Dual View Presentation**: The dashboard provides two view modes:
   - **Card View (Grid)**: Focuses on quick visual recognition, framework icons, production domains, and deployment state.
   - **List View (Grouped)**: Focuses on dense information scanning, grouping projects by their underlying Git repository (essential for monorepos).
3. **Favorites Surface**: A dedicated collapsible section (`∨ Your Favorites`) sits above the main list, allowing engineers to pin high-frequency projects regardless of active sort orders.

---

## 2. Comprehensive UI Element Inventory

The following table records every element observed on Vercel's multi-project overview:

| Element | Purpose | Placement & Layout | Visual Hierarchy | Displayed Content | Interaction & Resulting Behavior | Responsive Adaptation | Accessibility & Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Team Context & Wordmark** | Identifies organization/user scope | Top left of navigation header or sidebar | Level 1 Brand Anchor; bold white/ink text | Logo `▲`, Team Name (e.g. `ACME`), Plan Pill (`Pro` or `Enterprise`), Caret `↕` | Click opens Team Switcher dropdown; selection reloads project scope | On mobile, truncates long team names; remains in top header | `role="combobox"` / `aria-haspopup="listbox"`. Verified: `dash-dark.png` |
| **Search Input** | Instant keyword filtering across projects | Action Bar (left) or Sidebar (`Find... [F]`) | Level 3 Utility; subtle input border, placeholder text | Magnifying glass icon, text `Search...` or `Find...`, shortcut badge `[F]` | Typing triggers instant debounced filtering of visible cards | Collapses to icon or full width on small screens | `aria-label="Search projects"`, `type="search"`. Verified: `listview-dark.png` |
| **View Toggle Button Group** | Switches between Card (Grid) and List layouts | Action Bar, right-aligned next to Search | Level 3 Control; icon-only pill button group | `[⊞ Grid Icon]` and `[☰ List Icon]` | Click toggles view mode; updates DOM layout; saves choice to user preferences | Hidden on narrow mobile viewports (defaults to stacked cards) | `role="group"`, `aria-label="View mode"`, `aria-pressed="true|false"`. Verified: `listview-dark.png` |
| **`Add New... ∨` Button** | Primary creation entry point | Action Bar, far right | Level 2 Primary CTA; high-contrast solid button (white on dark) | Text `Add New...` with down caret `∨` | Click opens dropdown menu (`Project`, `Domain`, `Team Member`) | Stacks as full-width or compact `+` button on mobile | `aria-haspopup="menu"`, `aria-expanded="true|false"`. Verified: `add-new-project-dark.png` |
| **"Your Favorites" Section** | Surfaces pinned high-priority projects | Above main project list/grid | Level 2 Group Header; subtle collapsible header | Caret `∨` or `>`, text `Your Favorites` | Click collapses/expands the section; preference persisted | Stacks vertically on mobile | `<section aria-labelledby="favorites-heading">`. Verified: `favorites-overview-1.jpg` |
| **Project Card (Grid View)** | Modular container for single project | Main content grid (2–3 columns on desktop) | Level 2 Content Container; rounded border (`8px–12px`), dark surface | Title, domain link, framework icon, commit message, branch tag | Hover shifts border color; click anywhere opens Project Detail page | Reflows to single column on mobile (<768px) | `<article>` with accessible anchor link. Verified: `add-new-project-dark.png` |
| **Project Row (List View)** | Tabular high-density entry | Main content list, grouped by repo | Level 2 Tabular Row; 1px rule separators, 56px–64px height | Framework icon, Title, Domain, Commit message, Branch, Speed gauge, Context menu | Hover highlights row background; click navigates to Project Detail | Reflows to 2-line stacked row on mobile | `<li role="article">` or table row. Verified: `listview-dark.png` |
| **Framework Icon** | Visual brand recognition of tech stack | Top left of card; far left of list row | Level 3 Metadata; 24px–32px circular/rounded badge | Next.js (`▲`), Svelte (`S`), React, Vite, Python, etc. | Static identifier; tooltip on hover | Remains visible on all viewports | `aria-label="Framework: Next.js"`. Verified: `listview-dark.png` |
| **Production Domain Link** | Direct link to live production deployment | Directly beneath project title | Level 3 Metadata; muted gray text (`#888888`), hover underline | e.g. `acme.vercel.app` or custom domain | Click opens live application in new browser tab (`target="_blank"`) | Truncates with ellipsis if domain exceeds container width | Distinct link nested inside card or handled via event stopPropagation. Verified: `listview-dark.png` |
| **Deployment / Activity Message** | Details most recent deployment event | Middle of card / row | Level 3 Operational Status; 13px regular text | Git commit title (e.g. `Track error events on in Web Analytics (#22048)`) | Static operational feedback | Hidden or truncated on small mobile screens | Accessible text. Verified: `favorites-overview-1.jpg` |
| **Branch & Relative Time** | Shows code origin and recency | Underneath deployment message | Level 4 Metadata; muted text with Git branch icon | `10m ago on ⑂ main` | Static metadata | Muted text. Verified: `listview-dark.png` |
| **Speed Insights / Health Gauge** | Performance or operational metric | Far right of row / card | Level 3 Status Indicator; circular gauge with number | Green circular border, score (e.g. `96` or `90`) | Hover displays tooltip explaining metric breakdown | Hidden on very narrow mobile screens | `aria-label="Speed score: 96 out of 100"`. Verified: `listview-dark.png` |
| **Context Menu Trigger (`···`)** | Access to secondary project management actions | Far right edge of card / row | Level 3 Utility; three horizontal dots button | `···` icon button | Click opens contextual popup menu (`Add Favorite`, `View Logs`, `Settings`, etc.) | Always accessible on touch targets (minimum 44×44px) | `aria-haspopup="menu"`, `aria-label="Project actions"`. Verified: `favorites-overview-1.jpg` |

---

## 3. Project Card Anatomy (Detailed Breakdown)

In Vercel's public interface, the project card anatomy is composed of five clear structural zones:

```
┌────────────────────────────────────────────────────────────────────────┐
│  [Framework Icon]  [Project Name]                    [Context Menu ···]│
│                    [production-domain.vercel.app] ↗                    │
│                                                                        │
│  [Latest Deployment / Commit Message]                                 │
│  [Relative Timestamp] on [⑂ branch-name]                              │
│                                                                        │
│  ────────────────────────────────────────────────────────────────────  │
│  [Deployment Status Indicator]               [Speed Score Gauge (96)]  │
└────────────────────────────────────────────────────────────────────────┘
```

### Observed Card Behaviors:
1. **Primary Click Surface**: Clicking any part of the card (outside explicit secondary action buttons) triggers navigation to the project's detail overview (`/team/project` or `/[project]`).
2. **Hover States**:
   - Card border shifts from muted gray (`#333333` in dark mode) to high-contrast white/light gray (`#666666` or `#ffffff`).
   - Slight elevation or crisp border glow.
   - Cursor changes to pointer.
3. **Secondary Actions**: The domain link opens the live deployment in a new tab without opening the project dashboard. The three-dot context menu stops event propagation to prevent navigating to the project page.

---

## 4. Sorting, Filtering & Empty States

1. **Sorting Mechanics**:
   - Vercel sorts projects by **recency of activity** (last deployment timestamp) by default.
   - List view sorts projects by date while grouping under common Git repositories.
2. **Filtering Mechanics**:
   - Instant client-side search filtering matches project title, repository name, or domain.
3. **Empty States**:
   - **No Projects in Team**: Displays high-visibility onboarding card with "Import Git Repository" and "Start with a Template" action buttons.
   - **No Search Results**: Displays clean empty state illustration, text "No projects found matching '{query}'", and a button to "Clear search".
