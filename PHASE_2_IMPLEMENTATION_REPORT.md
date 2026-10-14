# Phase 2 — AegisOps project workspace

A complete frontend demonstration of multi-project navigation, built inside the existing Heron-inspired application. It uses fictional monitoring records and browser-local projects. No backend, authentication, infrastructure connection, analytics pipeline, deployment, commit or push was introduced.

## Routes and navigation

| Route | Behavior |
| --- | --- |
| `/projects` | Opens the remembered workspace, defaulting to Personal. |
| `/projects/personal` | IronLog, RentSense, Portfolio API and Personal local projects. |
| `/projects/northstar` | Customer Portal, Payment Gateway, Authentication Service, Inventory Platform and Northstar local projects. |
| `/projects/sandbox` | An empty workspace, ready for local creation. |
| `/projects/[workspaceId]/[projectId]` | Project-specific identity, connection overview, services and activity. |

The URL controls workspace and project identity. Refresh, direct links, browser history and project switching use those scoped IDs. The entry route alone consults the remembered workspace. Unknown workspaces and projects have explicit recovery screens; a project cannot be displayed under an unrelated workspace URL. A browser-local project link works only in a browser holding that project's local data. Unknown local resources render a client not-found screen; their route may return HTTP 200 because the server cannot inspect browser storage.

Overview, Services and Activity are real anchor destinations (`#overview`, `#services`, `#activity`) within a readable detail page. The context menu and sidebar link directly to these sections. This keeps service and activity information visible without adding empty tabs or query-state routing. The project selector also offers All Projects.

## Design and components

The global paper, ink, muted, rule and alert tokens are preserved. Workspace styles live in `app/projects/workspace.css`; they do not override the marketing page compositions. The new original AegisOps mark is a drafting-style SVG. Fixture service diagrams derive their nodes, labels and health markers from each project's actual service inventory. They are schematic inventories, not measured network topology or analytics charts.

Components in `components/workspace/`:

- `workspace-shell.tsx`: URL-derived context, sidebar, breadcrumbs, mobile actions and drawer, creation entry point, short GSAP entrances and not-found screens.
- `selector.tsx`: keyboard-operated workspace/project selectors and project action menus, with arrow keys, Home/End, Escape, outside dismissal and focus restoration.
- `project-collection.tsx`: heading, summary, search, composed filters, sorting, favorites, grid/list modes and empty states.
- `project-card.tsx`: cards, responsive list rows, pin buttons and supported context actions.
- `project-detail.tsx`: connection overview, facts, service inventory and project-scoped activity.
- `project-visuals.tsx`: original AegisOps identity, textual health indicators and service schematic.
- `create-project.tsx`: accessible native dialog, validation and local creation.
- `dialog.ts`: shared Tab wrapping for the creation dialog and mobile navigation sheet.

Existing `PageLink` and the SiteShell navigation context provide route transitions. Existing GSAP registration, Lenis clock, cursor and outer frame are reused. Workspace routes suppress only the marketing header and cinematic preloader. The homepage/showcase retain both; a Workspace link was added to the desktop and mobile marketing navigation. The desktop navigation grid gains one column to accommodate that entry. All original marketing links remain.

## Data and local persistence

`lib/demo/projects.ts` remains the single fixture/type/selector source. Its seven sample projects and three workspaces were reused, including the actual three-service Payment Gateway inventory. No duplicate data model or global store was created.

The existing `lib/demo/store.ts` still uses `useSyncExternalStore`, a stable server snapshot and post-subscription hydration. The `aegisops-demo-v1` record stores created projects, favorite IDs, view preference, remembered workspace and the added sidebar collapsed preference. It now shares one storage-event listener among subscribers, removing it after the last consumer leaves. Cross-tab updates refresh the view without causing each tab to overwrite the other tab's workspace: the current URL remains authoritative, and remembered scope is written when that route changes.

Persisted projects are validated before use: ID shape, valid workspace/environment, bounded text, unique IDs and honest initial telemetry fields. Malformed stored data is left untouched; a visible message explains that subsequent changes stay in memory. Quota or write failures likewise preserve the current tab's working project and explain that it will not survive refresh. No automatic destructive storage reset is exposed.

Creation trims and validates the name (1–80 characters), checks case-insensitive uniqueness against both fixtures and local projects within the selected workspace, enforces description/technology limits and validates workspace/environment. IDs use `local-` plus `crypto.randomUUID()`. A new project starts with pending monitoring, unknown health, no services, no incidents, no telemetry and no fabricated activity. Submission closes the dialog and opens the new project's route. Creation supports Sandbox as well as Personal and Northstar.

This is local organizational separation, not authorization. The localStorage snapshot is suitable for a demo; simultaneous writes in separate tabs are not transactional.

## Functional controls

- Case-insensitive search across name, description, technology and environment. Clear returns focus to search; Escape clears it.
- `F` focuses project search. It ignores typing fields, editable elements, modified shortcuts, selectors, open menus and dialogs. From a detail page it returns to the scoped overview and focuses search.
- Health and environment filters compose with search. Result counts and filter counts update immediately; reset restores defaults.
- Deterministic last-telemetry, health-priority and name sorting, without mutating fixtures. Name and ID break ties. List mode groups environments and preserves the chosen order within each group.
- Grid/list preference survives reload and does not reset active filters during a view switch.
- Favorites persist locally, appear in a collapsible overview section and the sidebar, and are scoped to the current workspace. Active search/filters also apply to the overview favorites section.
- Context actions implement Add/Remove Favorite, Open Project, View Services and View Activity. Secondary controls sit above the card's accessible link surface and cannot accidentally open the card.
- Connection status and health remain separate. Disconnected/pending records explain the lack of telemetry. Every fixture timestamp is a dated sample, not a ticking or allegedly live signal.

## Motion and accessibility

Route navigation uses the existing curtain and cleanup. Same-page anchor navigation bypasses the curtain so it cannot become stuck waiting for a pathname change. Workspace page headings and collections get a short 180–220 ms GSAP sequence with a small stagger; filtering does not replay the page entrance. Card borders, identifiers, arrows and technical grid layers respond to hover or keyboard focus. View switching has a brief opacity settle. Sidebar collapse is 200 ms; selectors and dialogs enter in 100–150 ms. There are no new idle loops, pinned operational sections or animation-driven React updates.

Reduced motion disables workspace animations/transitions and uses the existing instant route behavior. The custom cursor remains active elsewhere but clears over workspace inputs, selects, textareas and dialogs, including pointer release. Forms retain native carets and focus outlines.

Native modal dialogs make the background inert and lock body scrolling. Explicit Tab wrapping keeps keyboard focus within the dialog rather than moving to browser chrome after the last control. Escape dismisses and native focus restoration returns to the trigger. The creation dialog initially focuses the project name. Status meaning is provided in text as well as dots; red is confined to incidents/critical attention and form validation. No claim of a formal accessibility audit or screen-reader certification is made.

## Responsive behavior and visual review

Desktop uses a 240 px sidebar, collapsible to a 56 px rail with accessible control labels. Three project columns become two at intermediate widths. Below 768 px, the sidebar is replaced by a thumb-accessible fixed action bar and modal navigation sheet. Project rows become stacked records; the detail page and form reflow into a single column. Every mobile surface identifies the experience as a demo.

Actual Chromium screenshots cover 1920×1080, 1440×900, 1440×700, 1024×768, 390×844 and 375×812. Review includes grid, list, selectors, collapsed sidebar, hover/focus, favorites, context actions, combined filters, no results, project detail, empty workspace, mobile navigation, creation and validation. Desktop, tablet and mobile captures were visually inspected against the existing Heron implementation and the supplied Vercel contact sheets. Refinements included continuous service connectors before hover, more compact card headings, explicit form names, and visible mobile demo labeling.

Evidence: [interactive screenshot gallery](artifacts/phase-2/index.html), [browser findings](artifacts/phase-2/browser-findings.json), and `artifacts/phase-2/screenshots/`. Existing artifacts and research references are preserved. Capture reproduction:

```sh
npm run build
npm run start -- --port 3011
TEST_BASE_URL=http://localhost:3011 node scripts/capture-projects.mjs
```

## Validation

Final production verification passed:

| Check | Result | Evidence |
| --- | --- | --- |
| `npm run typecheck` | Passed | `artifacts/phase-2/typecheck.log` |
| `npm run lint` | Passed | `artifacts/phase-2/lint.log` |
| `npm run build` | Passed; both marketing routes and all three project route patterns built | `artifacts/phase-2/build.log` |
| `TEST_BASE_URL=http://localhost:3011 npm test` | **58 passed (1.0 minute)**: 29 existing regressions and 29 new workspace tests | `artifacts/phase-2/playwright.log` |
| Browser capture | **87 screenshots**; zero page errors, console warnings or horizontal overflow | `artifacts/phase-2/capture.log` and `browser-findings.json` |
| `git diff --check` | Passed | Final working-tree check |

Tests are in `tests/projects.spec.ts`; the original `tests/experience.spec.ts` and `tests/motion.spec.ts` were not modified. A final React checklist review covered stable hydration snapshots, external-store subscriptions, listener and GSAP teardown, URL-derived state, focus management and dependency use.

New coverage exercises fixture invariants, immutable/composed selectors, corrupt persisted data, workspace boundaries, all seven project routes, search/filter/sort behavior, list grouping, favorites, context actions, direct links, history, creation validation and reload persistence, empty/unknown states, keyboard focus, reduced motion, six viewport sizes, storage failure, cross-tab behavior and repeated route cleanup.

The first workspace run passed 25 of 27 tests; an ambiguous desktop/mobile test locator and implicit select accessible names were corrected. The first full run passed 57 of 58 and exposed focus moving to browser chrome at the end of a native dialog; explicit Tab wrapping fixes that behavior. Passing interaction tests are kept separate from the screenshot review evidence.

## Research adaptations and deferred scope

Implementation follows [PHASE_2_ASTRA_START_HERE.md](PHASE_2_ASTRA_START_HERE.md), the [research evidence index](phase2-research/evidence-index.md), and the detailed AegisOps/architecture specifications. The actual fixtures and user scope take precedence over contradictory example counts or placeholder controls.

- Kept only implemented destinations; Settings, Signals and investigations remain deferred.
- Used anchored detail sections instead of hiding content behind tabs.
- Used a reliable collapsible sidebar instead of dragging/resizing it; its preference lives in the existing store rather than a second storage key.
- Included Sandbox in the creation form, making the documented empty workspace useful.
- Omitted optional service templates and generated setup events to retain the existing store's empty-service/empty-activity validation contract.
- Used a static pending indicator rather than an idle pulse, and complete schematic connectors rather than disconnected decorative fragments.
- Used fixed sample timestamps; the checklist's relative-time example does not imply live telemetry.
- Kept dropdown Tab behavior conventional (Tab leaves the popup); only modal dialogs trap focus.

No new application dependency was installed. The existing cached Prettier executable was used for formatting; package manifests and the lockfile are unchanged.

## Future integration and limits

Replace fixture/local-store reads behind `useWorkspaceData` with a real project API while retaining the presentation types and stable workspace/project IDs. Move creation, membership checks, ownership, uniqueness validation, connection status and telemetry timestamps to authenticated server operations. Treat incoming API payloads as untrusted and validate them. Add a pending/error mutation state and server-backed pagination when those operations exist. Replace the fixed fixture date formatter before using arbitrary live timestamps. The present client filters and localStorage store are deliberately not a production data layer.

No backend, authentication, monitoring, incident investigation, advanced charts, deployment or external integrations were built. Chromium and touch emulation were checked; Safari, Firefox, physical devices, screen readers, large-dataset load tests and sustained frame-rate measurements remain unverified. Locally created project links do not transfer data to another browser.
