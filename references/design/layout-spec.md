# Heron AI Layout & Grid Specification

## 1. Core Architectural Grid Philosophy
Unlike standard SaaS landing pages with asymmetrical column containers (e.g., text left, generic UI card right), Heron AI's entire layout mimics an **architectural drawing sheet or BIM viewport**:
1. **The Invisible Coordinate Plane**: Thin vertical and horizontal reference lines run from screen edge to screen edge, establishing hairline partitions like drafting grids.
2. **One Focal Point per Section**: Every viewport scene isolates a single primary architectural subject (a floor plan, elevation, or inspector UI), preventing visual clutter.
3. **Viewport-Relative Height Framing**: Most primary scenes are designed to fit the viewport vertically (`calc(100dvh - 1.6rem)`), ensuring that the floor plan drawing, annotations, and controls remain in view simultaneously without accidental clipping.

---

## 2. Layout Dimensions & Sizing Hierarchy

| Component / Token | Measured Value (Desktop 1440) | CSS Value / Formula | Behavior & Status |
| :--- | :--- | :--- | :--- |
| **Header Height** | `56.3px` | Fixed bar with inner padding | Measured (`75.1px` at 1920, `49.6px` at 390) |
| **Global Container Max-Width** | `1440px` (or full bleed grid) | `max-width: 100%` with lateral gutters | Full screen bleed bounded by outer hair-lines |
| **Outer Border Inset Margin** | `8px` (`0.8rem`) | Margin around the outer viewport box | Creates framed drawing sheet border |
| **Section Height (Hero)** | `886.66px` (at 900vh) | `var(--size--max-screen-height)` = `calc(100dvh - 1.6rem)` | Adapts dynamically to `window.innerHeight` |
| **Section Padding (Hero Top)** | `53.33px` | `calc(4.4rem + 1rem*2)` (desktop) | Offsets header while anchoring title |
| **Section Padding (Tablet Hero Top)**| `37.9px` | `calc(3.2rem + 1rem*2)` | Measured on 1024 tablet |
| **Section Padding (Mobile Hero Top)**| `43.7px` | `calc(2.4rem + 1rem*2)` | Measured on 390 mobile |
| **Hairline Grid Rule Thickness** | `1px` | `var(--size--border)` = `max(1px, 0.1rem)` | Single-pixel crisp line with no antialiasing blur |
| **Hairline Grid Rule Color** | `#b3b3af` | `var(--content--border)` | Architectural lead pencil gray |
| **Pinned Scene: Home Map** | `6300px` | `700dvh` | GSAP ScrollTrigger pinned multi-stage sequence |
| **Pinned Scene: Dashboard Features**| `4409.6px` | `~500dvh` | Multi-card pinned sequence for 5 dashboard features |

---

## 3. The 122 Architectural Hairline Grid Rules

The page features **122 individual line elements** (`.line.line-vertical`, `.line.line-horizital`) that form drafting guideframes:
- **Outer Frame**: Left boundary rule (`left: 8px`), right boundary rule (`right: 8px`), top boundary rule (`top: 8px`), bottom boundary rule (`bottom: 8px`).
- **Header Separator**: Horizontal rule immediately below the 56.3px navigation header.
- **Center Dividing Axis**: Vertical rule splitting sections into drawing viewport vs annotation metadata column.
- **Crosshair Intersections**: Where horizontal and vertical rules cross, small drafting tick-marks or coordinate numbers (e.g., `LAT 39.7392° N`, `INDEX 001`) appear.

```
+---------------------------------------------------------------------------------+
|  [Logo]              [Product / Features]                       [Book Demo]     |
|---------------------------------------------------------------------------------|
|  LAT 39.7392° N                                                      INDEX 001  |
|                                                                                 |
|  An AI agent that works           |  +---------------------------------------+  |
|  inside your design tools         |  |                                       |  |
|                                   |  |       Architectural Drawing           |  |
|  Heron sees your model,           |  |       [Interactive Drag Box]          |  |
|  spots problems, and suggests     |  |       * Violation Marker              |  |
|  fixes as you design.             |  |                                       |  |
|                                   |  +---------------------------------------+  |
|---------------------------------------------------------------------------------|
|  REVISION 0.4                                                         SECTION A |
+---------------------------------------------------------------------------------+
```

---

## 4. Section Rhythm & Sequencing

### Homepage Vertical Flow:
1. **Preloader Veil**: Fixed overlay (`z-index: 2147483647`) with drafting ruler count-up animation (`0% -> 100%`).
2. **Hero (`.home-hero`)**: Height `calc(100dvh - 1.6rem)`. Left: Title + subtext + CTA button. Right: Full interactive floor plan drawing with pointer drag selection.
3. **Intro Philosophy (`.home-intro`)**: Height `722.5px`. Large bold uppercase statement highlighting the problem of repetitive modeling.
4. **Problem Presentation (`.home-problem`)**: Height `742.6px`. "Your design tools do what you tell them, nothing more".
5. **Interactive Model Map (`.home-map`)**: Height `6300px` (`700dvh`). Pinned 4-phase sequence:
   - **Phase 1: Observe** (Passive watching mode)
   - **Phase 2: Advise** (Violation detected with red outline & code reference)
   - **Phase 3: Act** (Proposed fix previewed on drawing)
   - **Phase 4: Learn** (Rule committed to firm standards)
6. **Platform Integrations (`.home-platform`)**: Height `710px`. Revit, Rhino, ArchiCAD, SketchUp toolcards.
7. **Why Heron (`.home-why`)**: Height `698.1px`. "Built to work the way you do" 3-card grid.
8. **Use Cases (`.home-usecase`)**: Height `886.7px`. "Made for the people in the model" with testimonial / persona cards.
9. **Final CTA (`.cta`)**: Height `698.2px`. Dark container (`#282828`) inviting demo booking.
10. **Footer (`.footer`)**: Height `710.7px`. Dark container (`#282828`) with interactive circular SVG pointer reveal lens.

---

## 5. Viewport-Height Responsiveness (1440 × 900 vs 1440 × 700)

As documented in the official case study, responsive design is not merely horizontal width breakpoints. Viewport height profoundly alters full-screen scenes:
- At **1440 × 900**: Hero height is `886.66px`. Drawing is rendered at `100%` aspect scale without overlap.
- At **1440 × 700**: Hero height is `686.66px`. ScrollTrigger recalculates all pin start/end distances from `window.innerHeight`.
- **Implementation Requirement for Astra**:
  Use `dvh` units (`100dvh`) rather than `100vh` to avoid mobile address-bar jump, and attach a `ScrollTrigger.refresh()` listener to window resize with a 150ms debounce.
