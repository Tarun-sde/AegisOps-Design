# Heron AI Animation Architecture Specification

## 1. Master Loop Architecture (Single Clock Coordination)

```
                           +----------------------+
                           |   GSAP Master Loop   |
                           |    (gsap.ticker)     |
                           +----------+-----------+
                                      |
         +-----------------+----------+----------+-----------------+
         |                 |                     |                 |
         v                 v                     v                 v
+-----------------+ +---------------+   +-----------------+ +---------------+
|  Lenis Scroll   | | ScrollTrigger |   | Canvas 2D Cursor| | SVG Ink Mask  |
|  (time * 1000)  | |  Scene Scrub  |   |  Trail & Reticle| | Displacement  |
+-----------------+ +---------------+   +-----------------+ +---------------+
```

### The Problem Solved
When smooth scroll libraries (like Lenis) run independently of pointer animations (via separate `requestAnimationFrame` loops), micro-drift occurs: while the page is still interpolating scroll position to a halt, mouse-driven elements update on an unaligned frame, creating visual jitter or parallax tears.

### The Unified Ticker Solution
All visual updates are driven synchronously through GSAP's central ticker:
```javascript
// Master animation engine lifecycle
export function initAnimationClock(lenis, cursor, inkMask) {
  gsap.ticker.add((time) => {
    // 1. Advance Lenis smooth scroll frame
    if (lenis) lenis.raf(time * 1000);
    // 2. Update cursor trail physics
    if (cursor) cursor.update(time);
    // 3. Update dynamic SVG ink displacement parameters
    if (inkMask) inkMask.update(time);
  });
}
```

---

## 2. Scroll-Scene Lifecycle & Pinned Scenes

### A. The Interactive Model Map (`.home-map`)
- **Total Scroll Distance**: `700dvh` (`6300px` at 900vh).
- **Behavior**: The architectural drawing remains pinned in the center of the viewport while 4 narrative states scrub sequentially:
  1. **Phase 1: Observe (0% – 25% scroll progress)**: Base architectural line drawing in neutral state; passive monitoring HUD overlays.
  2. **Phase 2: Advise (25% – 50% scroll progress)**: Violation bounding box appears in vibrant red (`#fa3600`); violation pin pulses; IBC code reference tags slide in (`"IBC 1015.3 Guard Opening Limitations"`).
  3. **Phase 3: Act (50% – 75% scroll progress)**: Drawing morphs or highlights automated CAD fix; cursor reticle illustrates autonomous drafting edit.
  4. **Phase 4: Learn (75% – 100% scroll progress)**: Rule commits to firm standards; success indicator checks off; background unpins and transitions to Platform Integrations.

### B. Dashboard Key Features (`.product-key`)
- **Total Scroll Distance**: `4409.6px` (`~500dvh`).
- **Behavior**: Cards slide and pin sequentially through 5 core product facets:
  1. `One View` (Consolidated project matrix)
  2. `Approval Queue` (Pending CAD edits requiring human sign-off)
  3. `Full History` (Audit trail with timestamps and rationale)
  4. `Team View` (Firmwide user permissions and status)
  5. `Firm Standards` (Ruleset governance)

---

## 3. Hero Drag Selection Math & Violation Collision

```
(startX, startY) ----------------------+
        |                              |
        |    Dynamic Gradient Fill     |
        |   rgba(255, 54, 0, 0.3) -> 0 |
        |                              |
        +----------------------- (currentX, currentY)
                 * [Issue Marker Rect]
```

### Mathematical Formulation:
1. **Distance Check**: Ignore drags with Euclidean displacement $< 2\text{px}$ to preserve regular link clicking.
   $$\Delta x = x_c - x_s, \quad \Delta y = y_c - y_s$$
   $$\text{threshold} = \sqrt{\Delta x^2 + \Delta y^2} \ge 2$$
2. **Bounding Box Coordinates**:
   $$\text{left} = \min(x_s, x_c), \quad \text{top} = \min(y_s, y_c)$$
   $$\text{width} = |\Delta x|, \quad \text{height} = |\Delta y|$$
3. **Dynamic Gradient Orientation**:
   The selection box visualizes an active radar sweep aimed away from the drag origin:
   - Dragging down-right $\rightarrow$ `to bottom right`
   - Dragging down-left $\rightarrow$ `to bottom left`
   - Dragging up-right $\rightarrow$ `to top right`
   - Dragging up-left $\rightarrow$ `to top left`
4. **Collision Overlap Detection (AABB Intersect)**:
   A violation pin is marked `.active` if and only if:
   $$\neg (R_{\text{box}} < L_{\text{pin}} \lor L_{\text{box}} > R_{\text{pin}} \lor B_{\text{box}} < T_{\text{pin}} \lor T_{\text{box}} > B_{\text{pin}})$$

---

## 4. SVG Displacement & Ink Edge Morphing

### Filter Graph Architecture:
1. `<feTurbulence>` generates a fractal noise texture:
   - `type="fractalNoise"`, `baseFrequency="0.045 0.055"`, `numOctaves="4"`, `seed="5"`.
2. `<feDisplacementMap>` uses Red and Green noise channels to distort the clipping mask boundary by `scale="100"`.
3. `<feGaussianBlur stdDeviation="1.8">` softens the displaced edge into wet liquid ink bleed.
4. `<feComponentTransfer>` with `<feFuncA type="linear" slope="2.2" intercept="-0.6">` steepens opacity contrast, preventing translucent fuzz and yielding crisp calligraphic edges.
5. The SVG `<path>` inside `<mask id="inkMask">` expands quadratically via quadratic Bezier control point interpolation:
   $$d = \text{M } 0 \ y \ \text{ Q } 500 \ (y + 165) \ 1000 \ y \ \text{ L } 1000 \ 0 \ \text{ L } 0 \ 0 \ \text{ Z}$$

---

## 5. Custom Canvas 2D Cursor Engine

- **Dot Size**: 9px square dot (`fillRect(x - 4.5, y - 4.5, 9, 9)`).
- **Interpolation Factor**: `0.18` (fast response, zero lag sensation).
- **Trail Buffer**: Stores coordinate history only when pointer velocity $> 0.05$.
- **Trail Render**: Fades trailing dots with decreasing alpha and scale when speed exceeds threshold (`speed > 1.5`).
- **Sleep Mode**: Cancels `requestAnimationFrame` once movement settles $< 0.05\text{px}$, consuming **0% CPU** on idle.
- **Contrast Detection**: Inspects DOM element under cursor coordinates using `document.elementFromPoint(x, y)`; inverts color from `#282828` to `#ffffff` over dark sections.

---

## 6. Footer Pointer Circular Lens Reveal

- Pointer coordinates are smoothed using two distinct lerp rates:
  - **Primary Mask Center**: `lerp(currX, targetX, 0.09)`
  - **Secondary Pulse Ring**: `lerp(pulseX, targetX, 0.15)`
- On `pointerenter`: Radius tweens from `0` to `radius` (`160px`) in `0.55s` via GSAP linear tween.
- On `pointerleave`: Radius smoothly collapses to `0` in `0.8s`.
- On `prefers-reduced-motion`: Durations drop to `0s` and reveal remains static.
