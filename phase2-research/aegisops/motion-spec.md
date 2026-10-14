# AegisOps Motion & Micro-Interaction Specification

**Document Version:** 1.0.0  
**Target:** Astra Frontend Implementation  
**Motion Philosophy:** Heron Craftsmanship with Operational Dashboard Restraint  
**Tech Stack:** CSS Transitions & GSAP 3.12 (Bound to existing `gsap.ticker` & Lenis clock)  
**Location:** [`phase2-research/aegisops/motion-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase2-research/aegisops/motion-spec.md)  

---

## 1. The Core Principle: Dashboard Restraint

> [!IMPORTANT]
> **Marketing vs. Operational Context**:  
> The Heron homepage features immersive, multi-viewport scroll-scrubbed 2D SVG transformations and pinned 700dvh narrative stages.  
> An application monitoring and incident investigation workspace **MUST NOT** use heavy pinned scroll scrubbing or slow cinematic transitions. When an alert occurs, an engineer requires immediate information density, snappy filtering, and zero latency.  
> **The AegisOps Standard**: *Micro-interactions with architectural precision and sub-200ms snappy response.*

---

## 2. Motion Specifications by Interaction Target

| Effect / Surface | Trigger | Visual Response | Duration (Approx) | Easing | Animation Targets | Reduced-Motion Fallback | Performance Considerations |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Workspace Page Entrance** | Route transition into `/projects/*` | Coordinated subtle fade and upward settle | `180ms` (Estimated) | `cubic-bezier(0.16, 1, 0.3, 1)` (Power2.out) | `.workspace-shell`, `.project-card` stagger (0.02s) | Instant appearance (`duration: 0s`) | GPU-accelerated `opacity` and `transform: translateY(6px)` only; no layout recalculation. |
| **Project Card Hover** | Pointer enter on card | Border color sharpens from `--rule` to `--ink`; subtle -2px lift | `150ms` | `ease-out` | `.project-card` (border, transform, box-shadow) | Border color change only; no `translateY` | Bound to CSS transitions; zero React frame re-renders. |
| **Card Click / Selection** | Pointer click on card | Card displays brief pressed state (scale 0.995); route curtain wipe engages | `120ms` (click) + `420ms` (curtain) | `power3.inOut` | `.route-curtain` | Instant route navigation via `router.push()` | Curtain wipe handled by existing `SiteShell` transition tween. |
| **Sidebar Collapse / Expand** | Toggle button click | Sidebar width smoothly interpolates between `240px` and `56px`; text labels cross-fade | `200ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | `.workspace-sidebar` (width), `.nav-label` (opacity) | Instant width change (`0s`) | `overflow-x: hidden` prevents horizontal scrollbar flicker. |
| **Workspace Switcher Menu** | Trigger button click | Menu popover expands downward with crisp opacity and scale | `100ms` | `cubic-bezier(0, 0, 0.2, 1)` | `.workspace-dropdown` (`scale: 0.98 -> 1`, `opacity: 0 -> 1`) | Instant open/close | `transform-origin: top left`. |
| **Modal Dialog Opening** | "Add Project +" click | Dark translucent backdrop fades in; dialog scales up slightly from center | `150ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | `dialog::backdrop` (opacity `0 -> 0.4`), `dialog` (`scale: 0.96 -> 1`) | Instant modal display | Uses native `<dialog>` element; locks body scroll with `overflow: hidden`. |
| **List / Grid View Switch** | Toggle button click | Instant layout reflow with cross-fade opacity | `120ms` | `ease` | `.projects-container` (`opacity: 0.85 -> 1`) | Instant switch | Prevents disorienting layout morphs across disparate grid cells. |
| **New Project Insertion** | Modal form submission | Newly created card flashes with architectural border highlight, settles at top | `350ms` | `power2.out` | `.project-card:first-child` (`background: rgba(40,40,40,0.06) -> var(--paper)`) | Instant card render | Visual confirmation of successful local creation. |

---

## 3. Cursor & Reticle Behavior in Operational Views

The existing `<Cursor />` component in [`components/site-shell.tsx`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/components/site-shell.tsx#L100) renders a 9px square dot that expands into a crosshair targeting reticle on pointer press.

### Rule for Astra in the Workspace:
- When hovering over standard HTML interactive form controls (`<input>`, `<select>`, `<textarea>`, native scrollbars):
  - The custom canvas cursor must **not obscure text carets or input focus**.
  - Form controls should maintain standard CSS `cursor: text` or `cursor: pointer`.
  - On mouse down inside form inputs, suppress the heavy reticle crosshair by checking `event.target.closest('input, textarea, select')`.

---

## 4. Reduced-Motion Mode Invariants

Under `@media (prefers-reduced-motion: reduce)`:
1. All durations set to `0ms`.
2. Page curtain transition completely disabled.
3. Canvas cursor velocity trailing particles disabled.
4. Layout changes (sidebar collapse, view toggles) occur instantaneously.
5. All interactive feedback conveyed strictly through color contrast, borders, and textual states.
