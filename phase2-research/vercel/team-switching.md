# Vercel Team Switching: Reverse Engineering & Interaction Design

**Document Version:** 1.0.0  
**Research Target:** Vercel Team & Scope Switcher  
**Evidence Source:** Official Documentation (`/docs/accounts/*`), Contentful Changelog Imagery (`dash-dark.png`, `dash-light.png`, `listview-dark.png`), Vercel CLI (`vercel switch`)  
**Location:** [`phase2-research/vercel/team-switching.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/vercel/team-switching.md)  

---

## 1. Where the Switcher is Located

In Vercel's interface evolution:
1. **Pre-2026 Navigation**: Located at the top left of the global horizontal navigation bar, immediately adjacent to the Vercel triangle logo: `▲ / [Team Avatar] Team Name ↕`.
2. **2026 Navigation Redesign**: Relocated to the very top of the **left vertical sidebar**:
   ```
   ┌────────────────────────────────────────────────────────┐
   │ [Team Avatar]  Acme  [Pro]                          ↕  │
   ├────────────────────────────────────────────────────────┤
   │ [Search Icon]  Find...                            [F]  │
   └────────────────────────────────────────────────────────┘
   ```
   This gives the team context constant visual dominance at the top of the entire operational navigation hierarchy.

---

## 2. Anatomy & States of the Team Switcher

### 2.1 Closed State (Default Display)
- **Visual Composition**:
  - **Avatar**: 20×20px circular image or monogram icon representing the team/user.
  - **Label**: Team Name (e.g. `Acme` or `Personal Account`), truncated with ellipsis if exceeding container width.
  - **Plan Badge**: Compact pill badge indicating tier (`Hobby`, `Pro`, `Enterprise`).
  - **Selector Caret**: Vertical double caret `↕` (up/down chevrons) indicating that this is a combobox / select trigger.
- **Styling**: Flush with sidebar background, subtle border, hover state applies subtle background fill (`rgba(255, 255, 255, 0.08)` in dark mode).

### 2.2 Open State (The Dropdown Menu)
When activated by pointer click or keyboard (`Space`/`Enter`):
- **Container**: Elevated popover menu (`z-index: 1000`, rounded corners `8px`, border `1px solid var(--accents-2)`, box-shadow `0 8px 30px rgba(0, 0, 0, 0.24)`).
- **Search Field**: On accounts with multiple teams, a top text input `Find team...` allows quick alphanumeric filtering.
- **Scope Segmentation**:
  - **Personal Account**: Grouped at top or designated with personal avatar.
  - **Teams (Organizations)**: Listed with team avatars, names, and plan badges.
- **Active Team Indicator**: A checkmark icon (`✓`) sits on the far right of the currently active team.
- **Footer Actions**:
  - Divider rule.
  - `Create Team +`: Direct link to create/provision a new organizational team.
  - `Team Settings`: Direct link to manage the team's membership and billing.

### 2.3 Selection & Switching Behavior
1. **Trigger**: User clicks a different team from the list.
2. **Context Shift**:
   - The dropdown closes immediately.
   - The application route updates to the new team's scope (e.g. `/acme-team` or updates team query param).
   - In Next.js client-side routing, the project list updates instantly to show only projects belonging to that team.
3. **Context Preservation**:
   - As documented in Vercel's changelog ("Improved experience for moving between your teams and projects"): switching teams while on a secondary page (like `Usage` or `Integrations`) preserves the view, loading the equivalent usage data for the newly selected team rather than dumping the user back to the home overview.

---

## 3. Keyboard & Accessibility Implementation

- **ARIA Semantics**:
  - Switcher button has `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded="false|true"`, and `aria-label="Select team"`.
  - Dropdown container has `role="listbox"` with `aria-label="Teams"`.
  - Each item has `role="option"` with `aria-selected="true|false"`.
- **Keyboard Navigation**:
  - `ArrowDown` / `ArrowUp`: Moves focus sequentially through team options.
  - `Enter`: Selects the focused team and closes the menu.
  - `Escape`: Closes the menu and restores focus to the trigger button.
- **Touch & Mobile View**:
  - On mobile screens, the team switcher acts as a bottom sheet drawer or full-width modal with touch-friendly 48px hit targets to prevent accidental mis-taps.
