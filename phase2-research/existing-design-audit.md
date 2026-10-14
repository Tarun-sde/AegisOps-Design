# Existing Design Audit: AegisOps-Design Repository

**Document Version:** 1.0.0  
**Target Audience:** GPT Astra, Senior Frontend Engineers  
**Scope:** Local Next.js Workspace Audit prior to Phase 2 Multi-Project Dashboard Integration  
**Authority:** Local working tree (`/run/media/tarun/Tarun Files1/AegisOps/AegisOps Design`)  

---

## 1. Executive Summary & Audit Mandate

The AegisOps-Design repository contains an approved, high-fidelity visual and motion reconstruction of the Heron architectural concept application (originally developed by Bearplus, documented on Tympanus Codrops, and approved in Phase 1 / Phase 1.5). 

The platform is evolving into **AegisOps**, an AI-powered application monitoring and incident investigation platform. Phase 2 introduces a Vercel-inspired multi-project workspace interface.

> [!IMPORTANT]
> **Strict Non-Destructive Invariant**:  
> The existing Heron visual identity, monochromatic architectural design tokens, and smooth motion architecture must **remain 100% intact**. Phase 2 must integrate seamlessly into this visual language rather than introducing generic SaaS styles or tearing down approved work.

---

## 2. What Must Remain Unchanged

The following core systems and files represent approved baseline functionality that must not be altered, corrupted, or replaced:

1. **`app/page.tsx` & `components/home-page.tsx`**:
   - The architectural preloader, elevation drag-to-reveal inspection hero, editorial intro, practice strip, 4 problem cards, pinned `Observe -> Advise -> Act -> Learn` model map, platform integration tabs, product previews, feature panels, and interactive footer.
2. **`app/heron-dashboard/page.tsx` & `components/dashboard-page.tsx`**:
   - Split product hero, pinned 5-feature card sequence (`One View`, `Approval Queue`, `Full History`, `Team View`, `Firm Standards`), 3-step oversight overview, and FAQ accordion.
3. **`components/artwork.tsx`**:
   - Semantic SVG components including `<Mark />`, `<Elevation />`, `<FloorPlan />`, `<Terrain />`, and procedural architectural trees.
4. **`components/footer.tsx`**:
   - Dark interactive inspection footer with pointer-driven SVG circular lens reveal.
5. **Existing Motion Framework**:
   - GSAP ScrollTrigger timelines, `@gsap/react` hooks, Lenis smooth scroll ticker binding, and Canvas 2D custom reticle cursor (`<Cursor />`).
6. **Existing Test Suite (`tests/experience.spec.ts`)**:
   - All 29 Playwright assertions verifying zero runtime errors, zero horizontal overflow across 4 viewports (1440×900, 1920×1080, 1440×700, 390×844), drag coordinate math, SVG geometry transformations, and cleanup on navigation.

---

## 3. Reusable Global Styles & Design Tokens

All styles are centralized in [`app/globals.css`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/app/globals.css) and configure Tailwind CSS v4 via `@theme inline`.

### 3.1 Color Tokens
| Token | CSS Variable | Hex / Value | Architectural Role | Phase 2 Dashboard Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Paper** | `var(--paper)` | `#e0e0da` | Off-white drafting paper base | Primary workspace canvas background |
| **Dark / Ink** | `var(--ink)` | `#282828` | Solid charcoal ink | Primary text, dark card surfaces, active pills, borders |
| **Muted** | `var(--muted)` | `#282828b8` | Subdued text | Secondary metadata, descriptions, timestamps |
| **Rule** | `var(--rule)` | `#b3b3af` | Hairline drafting grid rule | Subtle card borders, dividers, table row hairlines |
| **Alert Red** | `var(--red)` | `#fa3600` | Building violation indicator | **Operational alerts only**: Critical health, active incidents |
| **Subtle Dark** | N/A | `#212121` / `#1c1c1c` | Deep inverted surfaces | Sidebar backgrounds, dark card containers |

> [!CAUTION]
> **The Role of Red Rule**: Red (`#fa3600`) is **strictly non-decorative**. In Phase 2, red must only be used for critical service outages or unhandled incidents. Healthy statuses use muted slate/dark charcoal dots, while degraded statuses use architectural amber/ochre (`#c98a2c`).

### 3.2 Typography Tokens
- **Display & Interface Font**: `"Inter Variable", Arial, sans-serif` (`--font-sans`).
- **Technical & Metadata Font**: `"Geist Mono Variable", monospace` (`--font-mono`).
- **Class `.mono` / `.eyebrow`**: `font-family: var(--font-mono)`, `font-size: clamp(9px, 0.695vw, 13px)`, uppercase, tracked `-0.015em`.
- **Text Alignment**: Crisp left-aligned technical headers with uppercase titles (`h1`, `h2`, `h3`).

### 3.3 Layout & Spacing Tokens
- **Framed Margin**: `.site-frame` applies `margin: 7px; border: 1px solid var(--rule);`.
- **Header Height**: `--header-height: clamp(56px, 3.91vw, 75px)`.
- **Gutter**: `--gutter: clamp(20px, 2.05vw, 40px)`.

---

## 4. Reusable Component Inventory

The existing codebase contains several components that directly inform or can be reused within the Phase 2 multi-project workspace:

| Existing Component | Location | Reusable Pattern / Elements |
| :--- | :--- | :--- |
| `<Mark />` | [`components/artwork.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/artwork.tsx#L3) | Architectural geometric SVG mark for branding, workspace icons, and project badges. |
| `<ArrowLink />` | [`components/site-shell.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/site-shell.tsx#L49) | Rolling text micro-animation on hover with `↗` arrow indicator. |
| `<PageLink />` | [`components/site-shell.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/site-shell.tsx#L23) | Internal navigation wrapper triggering the GSAP curtain transition. |
| `<ActivityPanel />` | [`components/product-preview.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/product-preview.tsx#L12) | Metric counters, `.preview-stats`, and `.activity-row` layout with mono timestamps and status tags. |
| `<ApprovalCard />` | [`components/product-preview.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/product-preview.tsx#L66) | Interactive decision buttons with immediate local state feedback. |
| `<PendingPanel />` | [`components/product-preview.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/product-preview.tsx#L97) | Queued operational items with status badges and timestamps. |

---

## 5. Existing Motion Utilities & Lifecycle Architecture

### 5.1 The GSAP & Lenis Clock
In [`components/site-shell.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/site-shell.tsx#L77), `MotionClock` registers Lenis with GSAP:
```typescript
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true });
lenis.on("scroll", ScrollTrigger.update);
const tick = (time: number) => lenis.raf(time * 1000);
gsap.ticker.add(tick);
gsap.ticker.lagSmoothing(0);
```
- **Lifecycle Rule**: Never initialize separate `requestAnimationFrame` loops. All smooth motion, micro-interactions, and canvas rendering must bind to `gsap.ticker`.
- **Teardown Rule**: All component-level animations must execute within `@gsap/react`'s `useGSAP()` hook to guarantee automatic disposal when components unmount.

### 5.2 Page Transition Curtain
- Controlled via `SiteShell`'s `useGSAP` hook watching `path = usePathname()`.
- On link click, `<div className="route-curtain">` animates `scaleY` from bottom (`0 -> 1`), invokes `router.push(href)`, and upon new route render, scales out from top (`1 -> 0`).
- **Reduced-Motion Fallback**: Under `prefers-reduced-motion: reduce`, duration is set to `0s`, bypassing the transition overlay entirely.

### 5.3 Custom Reticle Cursor
- Fixed `<canvas className="custom-cursor">` renders a 9px square following pointer coordinates (`lerp = 0.18`).
- Mouse down triggers an architectural crosshair targeting reticle.
- Automatically suspends (`gsap.ticker.remove(tick)`) when idle or off-screen (0% CPU).
- Disabled on touch screens (`pointer: coarse`).

---

## 6. Current Routing & Layout Architecture

```
app/
├── globals.css
├── layout.tsx         (RootLayout wraps entire app in <SiteShell>)
├── page.tsx           (Homepage: "/")
└── heron-dashboard/
    └── page.tsx       (Showcase: "/heron-dashboard")
```

### Critical Integration Architecture Finding:
In [`app/layout.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/app/layout.tsx#L30):
```tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
```
Inside [`components/site-shell.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/site-shell.tsx#L499-L509):
```tsx
<div className="site-frame">
  <Header />
  {children}
</div>
<Cursor />
<Preloader />
<div className="route-curtain" ref={curtain} aria-hidden="true" />
```

### The Layout Challenge for Phase 2:
`SiteShell` renders the public marketing `<Header />` (`Product +`, `Pricing`, `Resources`, `About`, `Contact us ↗`) around all `children`.
For an operational multi-project workspace, a full marketing header at the top conflicts with Vercel's unified sidebar and team/project breadcrumb navigation.

### Recommended Architectural Solution for Astra:
1. **Preserve `<SiteShell>` at the Root**:
   Keep `<SiteShell>` wrapping the application to preserve the cursor canvas, global smooth scrolling clock, outer `.site-frame` drafting border, and route transition curtain.
2. **Path-Aware Header Strategy**:
   In `<Header>` (or within `SiteShell`), check if the current pathname starts with `/projects`.
   - When on `/` or `/heron-dashboard`: Render the standard marketing `<Header />`.
   - When on `/projects/*`: Suppress the marketing header, allowing the dedicated **Workspace Shell** (with its resizable sidebar and top breadcrumb bar) to occupy the viewport cleanly within `.site-frame`.
   - Alternatively, add a direct navigation link `"Workspace ↗"` to the marketing header to give users an immediate entry point.

---

## 7. Accessibility Patterns & Responsive Breakpoints

1. **Focus Rings**:
   - `button:focus-visible, a:focus-visible, [tabindex]:focus-visible { outline: 2px solid var(--ink); outline-offset: 5px; }`.
   - On dark surfaces (`[data-dark]`): `outline-color: var(--paper);`.
2. **Screen Reader Accessibility**:
   - `.sr-only` class is provided and tested.
   - `.skip-link` targets `#main`.
3. **Modal Dialogs**:
   - Native HTML `<dialog>` element with `data-lenis-prevent` to isolate scroll events.
   - Escape key listener, auto-focus restoration, and backdrop dismissal.
4. **Responsive Breakpoints**:
   - Mobile: `< 768px` (specifically tested at `390×844`).
   - Tablet: `768px – 991px` (tested at `1024×768` and `834×1194`).
   - Desktop: `>= 992px` (tested at `1440×900`, `1440×700`, and `1920×1080`).

---

## 8. Potential Integration Risks & Mitigation Strategies

| Risk | Description | Mitigation Strategy for Astra |
| :--- | :--- | :--- |
| **Scroll Contention** | Lenis smooth scrolling interfering with dense dashboard tables or scrollable sidebars. | Add `data-lenis-prevent` to the sidebar and any internal scrollable panels so wheel events scroll standard DOM without Lenis inertia. |
| **Cursor Reticle on Form Controls** | The custom 2D cursor obscuring text input focus or hover states in search fields. | Use standard cursor behavior when hovering `<input>`, `<select>`, `<textarea>`, and dialog buttons; ensure `custom-cursor` ignores form interaction. |
| **Over-Animation in Dashboard** | Translating large marketing scroll scrub animations into operational views. | **Enforce Dashboard Restraint**: Operational views must use instant or micro-animations (150–250ms), not 700dvh pinned ScrollTriggers. |
| **Hydration Mismatch on Stored State** | Reading `localStorage` during initial SSR causing Next.js React hydration mismatches. | Use `useSyncExternalStore` with deterministic server snapshots, or initialize in `useEffect` with clean placeholder skeletons. |
| **Breaking Existing Tests** | Modifications causing failures in `tests/experience.spec.ts`. | Add Phase 2 tests in a separate dedicated test file (e.g. `tests/projects.spec.ts`), keeping `tests/experience.spec.ts` intact. |

---

## 9. Recommended Entry Point for the Workspace

1. **URL Route**: `/projects` (or workspace-scoped `/projects/[workspaceId]`).
2. **Public Link Entry**: Add an explicit link in the existing `<Header>` component:
   - Inside `desktop-nav`: Add `<PageLink href="/projects">Workspace</PageLink>`.
   - Inside `product-menu`: Add `<PageLink href="/projects">Projects Overview ↗</PageLink>`.
   - Inside mobile drawer: Add `<PageLink href="/projects">Workspace ↗</PageLink>`.
3. **Showcase CTA**: In `components/dashboard-page.tsx`, update secondary action buttons to link to `/projects`.
