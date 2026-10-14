# Vercel Search, Filtering, Sorting & View Modes: Reverse Engineering

**Document Version:** 1.0.0  
**Research Focus:** Vercel Dashboard Action Bar, Search Mechanics & Layout Controls  
**Evidence Source:** Official Documentation, Contentful Changelog (`listview-dark.png`, `add-new-project-dark.png`, `dash-dark.png`)  
**Location:** [`phase2-research/vercel/search-filtering.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/vercel/search-filtering.md)  

---

## 1. Verified Search Interaction & Keyboard Shortcuts

1. **Placement**:
   - **Action Bar (Pre-2026)**: Full-width search bar above the project grid / list (`listview-dark.png`).
   - **Sidebar (Feb 2026 Redesign)**: Embedded at the top of the vertical navigation sidebar as `Find... [F]` (`dash-dark.png`).
2. **Keyboard Shortcut**:
   - Pressing `F` (or `Cmd+K` / `Ctrl+K`) anywhere on the dashboard immediately focuses the input field and selects existing text.
3. **Search Scope**:
   - Matches project name, custom domains, and Git repository names.
   - Filtering is instantaneous and client-side debounced (`150ms`).
4. **Clear Search Interaction**:
   - An inline `×` button appears inside the input whenever text is entered.
   - Clicking `×` or pressing `Escape` clears the query and restores full list visibility without losing focus.

---

## 2. Layout View Toggle & Persistence

Observed in `listview-dark.png` and `add-new-project-dark.png`:
- **Toggle Group**: Located directly to the right of the search bar.
  - Button 1: Four-square grid icon (`⊞`) for Card View.
  - Button 2: Horizontal lines icon (`☰`) for List View.
- **Visual State**: Active mode receives a high-contrast container/border; inactive mode is subdued.
- **Persistence**: Vercel saves the user's view preference in user profile/local storage so navigating between pages or reloading retains the chosen layout across sessions.

---

## 3. Filtering & Sorting Capabilities

1. **Verified Filters**:
   - **Git Repository Grouping**: In List View, projects are automatically grouped under their parent repository headers (`acme/front`, `No Git Connection`, `vercel/examples`).
   - **Branch / Status Filters**: On the Deployments page, filters for Branch, Environment (`Production`, `Preview`), and State (`Ready`, `Error`, `Building`).
2. **Empty Results State**:
   - When active search query returns zero matching projects, Vercel hides the project grid and displays an empty state:
     - Heading: "No projects found"
     - Subtitle: "Try adjusting your search query or clear the filter."
     - CTA Button: "Clear Search"
