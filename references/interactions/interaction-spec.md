# Heron AI Interaction Specification

## 1. Master Interaction Matrix

| Component | Trigger | Response | Visual State Change | Position Dependent? | Reversible? | Scroll Driven? | Pointer Driven? | Mobile Support | Reduced Motion Behavior | Reproduction Technique for Astra |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Preloader** | Page initial load | Fullscreen veil with drafting ruler | Number counter 0% $\rightarrow$ 100%, ruler ticks slide, veil wipes up | No | No (one-shot) | No | No | Yes (shortened ruler) | Instant skip to 100% in 0.1s | GSAP timeline with `Counter` state tween and CSS clip-path wipe |
| **Hero Drag Reveal** | Pointer drag on drawing | Dynamic bounding box expands | Orange-red selection box shows; intersecting violation pins turn active red with code tags | Yes | Yes (releases on mouse up or next drag) | No | Yes | Touch fallback (tap regions) | Static violation pins visible by default | Math bounding box collision (`overlaps(boxRect, markerRect)`) |
| **Canvas Cursor** | Mouse move | 9px square dot + velocity trail | Square follows mouse with `0.18` lerp; trail dots fade behind; expands to reticle on press | Yes | Continuous | No | Yes | Disabled on touch screens | Hide trail, standard system cursor | HTML5 Canvas 2D overlay running on GSAP ticker |
| **Map Workflow** | Vertical page scroll | Pinned drawing scrubs through 4 states | State 1: Passive $\rightarrow$ State 2: Red violation box $\rightarrow$ State 3: Fix edit morphs $\rightarrow$ State 4: Standard learned | Yes | Yes (bi-directional scrub) | Yes (700dvh) | No | Yes (stacked timeline) | Linear step opacity changes without motion | GSAP ScrollTrigger `pin: true`, `scrub: 1` over 4 sequence steps |
| **SVG Ink Wipe** | Scroll progress | Sketch becomes render | Edge bleeds like wet ink using noise displacement | Yes | Yes | Yes | No | Yes | Standard crossfade opacity | SVG `<mask id="inkMask">` with `<feDisplacementMap>` + `<feTurbulence>` |
| **Button Hover** | Pointer enter `.btn-fill` | Dual label slides vertically | Top text rolls up while bottom clone rolls into view; dark background fills button | No | Yes | No | Yes | Tap trigger | Immediate color swap without slide | CSS / GSAP translateY(`-100%`) on inner label wrappers |
| **Platform Tabs** | Click platform pill | Active tool highlighted | Revit / Rhino / ArchiCAD / SketchUp badges switch active CAD viewport preview | No | Yes | No | Yes | Yes | Instant switch | React useState active tab index with crossfade |
| **Dashboard Pinned Cards**| Vertical scroll on `.product-key` | 5 feature cards stack / pin | Cards (One View, Approval Queue, Full History, Team View, Firm Standards) slide up and lock | Yes | Yes | Yes (500dvh) | No | Yes | Instant stacked layout | GSAP ScrollTrigger pinning with card translate-Y progression |
| **Dashboard FAQ** | Click question item | Accordion toggle | Answer drawer expands downward; plus icon rotates 45° to 'x' | No | Yes | No | Yes | Yes | Instant show/hide | GSAP `to(drawer, { height: 'auto', duration: 0.35 })` |
| **Footer Lens Reveal**| Mouse enter & move over footer | Logo revealed via circular lens | SVG circular mask follows pointer with `0.09` lerp; secondary pulse ring glows at `1.05r` | Yes | Yes | No | Yes | Static visible logo | Full logo visible without mask | SVG `<mask id="footerMask"><circle cx="..." cy="..." r="160" /></mask>` |
| **Mobile Navigation** | Click `.header-menu-btn` | Fullscreen modal slides in | 3-bar hamburger morphs to 'X'; large nav links stagger in | No | Yes | No | Yes | Touch primary | Instant opacity fade | CSS transform / GSAP stagger timeline on nav links |

---

## 2. Deep Dive: Button Micro-Animation (`.btn-fill`)

Heron AI uses a distinctive **rolling split-label button interaction**:
1. **DOM Structure**:
   ```html
   <button class="btn-fill">
     <span class="btn-fill-bg"></span>
     <span class="btn-fill-label">
       <span class="label-inner label-top">Book a demo</span>
       <span class="label-inner label-bot">Book a demo</span>
     </span>
   </button>
   ```
2. **Animation Mechanics**:
   - Both `.label-top` and `.label-bot` are positioned inside an `overflow: hidden` container.
   - On `:hover`:
     - `.label-top` translates from `translateY(0%)` to `translateY(-100%)`.
     - `.label-bot` translates from `translateY(100%)` to `translateY(0%)`.
     - `.btn-fill-bg` scales from `scaleY(0)` to `scaleY(1)` with origin bottom.
   - On `:leave`:
     - Animation cleanly reverses.

---

## 3. Deep Dive: Preloader Ruler Sequence

1. **Phase 1 (0ms – 1800ms)**:
   - Fixed screen veil in dark charcoal (`#282828`).
   - Center displays an architectural drafting ruler with tick marks and counter text.
   - Counter numbers tick up smoothly: `01% ... 48% ... 92% ... 100%`.
   - Small status metadata reads: `INITIALIZING MODEL INSPECTION ENGINE`.
2. **Phase 2 (1800ms – 2400ms)**:
   - Counter reaches `100%`.
   - Veil expands a vertical slit or sweeps upward via `clip-path: inset(0 0 100% 0)`.
   - Behind the veil, the Hero title, navigation, and floor plan draw in synchronously.
