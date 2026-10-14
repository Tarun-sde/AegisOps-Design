# Motion Reference Catalog: Phase 3 Observability Choreography

**Document Version:** 1.0.0  
**Researcher:** Senior Interaction & Motion Designer, GSAP Choreography Specialist  
**Engine Alignment:** Lenis Smooth Scroll Clock, GSAP 3.15, `@gsap/react` 2.1  
**Location:** [`phase3-research/motion/motion-reference-catalog.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/motion/motion-reference-catalog.md)  

---

## 1. Existing Motion Subsystem Reuse

Phase 3 builds strictly upon the verified motion architecture established in Phase 1 and Phase 2:

1. **Root Animation Clock**: In `components/site-shell.tsx`, Lenis is synchronized to the GSAP global ticker (`gsap.ticker.add((time) => lenis.raf(time * 1000))`). No competing `requestAnimationFrame` loops may be introduced.
2. **Custom Canvas 2D Cursor**: In `components/site-shell.tsx`, a canvas trailing dot follows the pointer. It automatically clears over inputs, selects, dialogs, and SVG charts to ensure precise technical clicking.
3. **Automated Motion Capture Framework**: Established in `scripts/capture-motion.mjs` and `tests/motion.spec.ts` for recording WebP and WebM validation artifacts.

---

## 2. Phase 3 Motion Behaviors

### 2.1 Chart Mount Sequence (`SvgTimeSeries`)
```typescript
useGSAP(() => {
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    // Reveal technical line left-to-right via strokeDashoffset
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    gsap.fromTo(
      path,
      { strokeDasharray: length, strokeDashoffset: length },
      { strokeDashoffset: 0, duration: 0.25, ease: "power2.out" }
    );
  });
  return () => media.revert();
}, { scope: containerRef });
```

### 2.2 Time-Range Switch Transition
- When the user changes the temporal preset (e.g. `24h` $\rightarrow$ `1h`), avoid jarring redraws from zero.
- Use a high-speed 150ms opacity cross-fade:
  ```css
  .ws-chart-svg {
    transition: opacity 150ms ease-in-out;
  }
  .ws-chart-updating {
    opacity: 0.45;
  }
  ```

### 2.3 Slide-Out Drawer Entrance
- The incident and service quick-inspection drawers slide smoothly from the right:
  ```css
  .ws-drawer {
    transform: translateX(100%);
    transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ws-drawer[data-open="true"] {
    transform: translateX(0%);
  }
  ```

### 2.4 Evidence Highlight Pulse
- When the user clicks an evidence citation badge `[EV-LOG-401]` in a hypothesis card, the Evidence Explorer scrolls the cited log into view and triggers a brief 200ms highlight pulse:
  ```css
  @keyframes ev-pulse {
    0% { background-color: rgba(250, 54, 0, 0.16); }
    100% { background-color: transparent; }
  }
  .ws-evidence-highlight {
    animation: ev-pulse 250ms ease-out forwards;
  }
  ```

---

## 3. Reference Recordings Inventory

Existing verified reference recordings in `references/motion/recordings/`:
- `01-preloader-entrance.webm`
- `02-hero-drag-interaction.webm`
- `03-observe-advise-act-learn.webm`
- `04-footer-lens-reveal.webm`
- `05-dashboard-scroll-sequence.webm`
- `06-page-transition.webm`
