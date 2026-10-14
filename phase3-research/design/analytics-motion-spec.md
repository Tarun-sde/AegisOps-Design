# AegisOps Analytics Motion & Choreography Specification

**Document Version:** 1.0.0  
**Researcher:** Senior Interaction & Motion Designer, GSAP Choreography Specialist  
**Alignment:** Phase 1.5 Motion Engine (`components/site-shell.tsx`), GSAP 3.15, Lenis Scroll  
**Location:** [`phase3-research/design/analytics-motion-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/design/analytics-motion-spec.md)  

---

## 1. Operational Motion Philosophy

In marketing websites, motion exists to create delight and drama. In mission-critical observability dashboards, motion exists solely to **clarify causal relationships, maintain spatial orientation, and confirm user intent**.

> [!CAUTION]
> **Anti-Patterns Strictly Prohibited**:
> 1. **No Idle Loops**: Never run continuous pulsing animations, rotating loading spinners, or marquee banners while the dashboard is idle.
> 2. **No Redraws from Zero**: When switching time ranges or toggling metrics, do **not** animate chart lines drawing upward from the zero baseline.
> 3. **No Stutter on Tab Navigation**: Anchored in-page navigation must never trigger the full-page transition curtain.

---

## 2. Motion Choreography Timing Matrix

| Interaction / Element | Duration | Easing Curve | Technology | Visual Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Initial Chart Mount** | `250ms` | `power2.out` | GSAP `fromTo` | Line reveals smoothly via SVG `strokeDashoffset` from left to right on initial page entry. |
| **Time-Range Switch** | `150ms` | `power1.inOut` | CSS Transition | Chart data points cross-fade opacity (`1.0` $\rightarrow$ `0.4` $\rightarrow$ `1.0`) as new bucket coordinates calculate. Zero layout jump. |
| **Metric Card Selection** | `120ms` | `ease-out` | CSS Transition | Border color transitions from `--rule` to `--ink`; subtle `-1px` vertical lift. |
| **Crosshair Scrubbing** | `0ms` (Instant) | Linear / Snapped | React State | Crosshair snaps magnetically to nearest temporal bucket without lag. |
| **Tooltip Card Float** | `50ms` | `power1.out` | CSS `transform` | Smooth floating repositioning tracking the crosshair x-coordinate. |
| **Incident Drawer Slide** | `200ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | CSS / GSAP | Drawer slides in from the right viewport boundary (`translateX(100%)` $\rightarrow$ `0`). Backdrop fades to 40% ink. |
| **Evidence Tab Switch** | `120ms` | `ease-out` | CSS Opacity | Active evidence panel fades in; cited line flashes brief 200ms highlight pulse. |
| **Hypothesis Accordion** | `180ms` | `power2.out` | GSAP / CSS | Expanded diagnostic details slide down cleanly. |

---

## 3. Reduced Motion Specification (`prefers-reduced-motion: reduce`)

When the user or operating system requests reduced motion:
1. All durations collapse to `0ms`.
2. SVG line draw (`strokeDashoffset`) is disabled; paths render instantly.
3. Slide-out drawers appear immediately with instant opacity toggle.
4. Tooltip card positions directly without motion interpolation.
5. Implemented via GSAP `matchMedia()`:
   ```typescript
   const mm = gsap.matchMedia();
   mm.add("(prefers-reduced-motion: reduce)", () => {
     // Instant visual states
   });
   ```
