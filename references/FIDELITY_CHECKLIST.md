# Heron AI Visual & Functional Fidelity Checklist

Use this checklist during Astra's implementation phase to verify that the reconstructed site meets the visual, typographic, interactive, and technical standards of the reference.

---

## 1. Composition & Layout Proportions

- [ ] **Viewport-Relative Framing**:
  - Hero height conforms to `calc(100dvh - 1.6rem)` (`~886px` on 900vh, `~686px` on 700vh) without unwanted vertical scroll leakage.
  - Reference: [`home/desktop-1440/02-hero-initial.png`](screenshots/home/desktop-1440/02-hero-initial.png), [`home/desktop-1440/16-hero-1440x700.png`](screenshots/home/desktop-1440/16-hero-1440x700.png)
- [ ] **Outer Blueprint Frame**:
  - 8px outer margin frames the viewport bounded by crisp 1px borders (`#b3b3af`).
  - Reference: [`design/layout-spec.md`](design/layout-spec.md)
- [ ] **Section Sequence Alignment**:
  - Section order matches exactly: Preloader $\rightarrow$ Hero $\rightarrow$ Intro $\rightarrow$ Problem $\rightarrow$ Map $\rightarrow$ Platforms $\rightarrow$ Why $\rightarrow$ Use Cases $\rightarrow$ CTA $\rightarrow$ Footer.
  - Reference: [`SITE_INVENTORY.md`](SITE_INVENTORY.md)
- [ ] **Hairline Grid Rules**:
  - Vertical dividing axes and horizontal section bounds render as crisp 1px strokes without subpixel blur.
  - Reference: [`design/design-tokens.json`](design/design-tokens.json) (`--size--border`)

---

## 2. Typography & Text Hierarchy

- [ ] **Font Family Separation**:
  - Editorial headings and body copy use Grotesk typeface (`BT Grotesk` or approved alternative `Space Grotesk` / `Inter`).
  - Technical metadata, tags, building codes, and coordinates use `Geist Mono` in uppercase.
  - Reference: [`design/typography.md`](design/typography.md)
- [ ] **H1 Proportions & Optical Tracking**:
  - Desktop 1440 H1 measures `46.7px` with tight optical letter-spacing (`-0.93px` / `-0.02em`) and `1.0` line height.
  - Line breaks match the reference: *"An AI agent that works inside your design tools"*.
- [ ] **Color Contrast**:
  - Headings render in primary near-black (`#282828`).
  - Body paragraphs render in tertiary muted gray (`rgba(40, 40, 40, 0.72)`).
  - Violation markers and alerts render in brand red (`#fa3600`).
  - Reference: [`design/design-tokens.json`](design/design-tokens.json)

---

## 3. Visual Assets & Vector Precision

- [ ] **Architectural Floor Plan Precision**:
  - Floor plan drawings feature crisp vector linework with authentic CAD door swings, wall fills, and room designations.
  - Reference: [`assets/asset-recreation-guide.md`](assets/asset-recreation-guide.md)
- [ ] **Normalized Coordinate Remapping**:
  - Violation pins align with architectural features regardless of window aspect ratio (`object-fit: contain` remapping).
  - Reference: [`design/responsive-spec.md`](design/responsive-spec.md)
- [ ] **Sketch-to-Render Alignment**:
  - The sketch layer and color render layer share identical camera perspectives and scale for the SVG ink transition.
  - Reference: [`assets/asset-recreation-guide.md`](assets/asset-recreation-guide.md)

---

## 4. Interactive & Motion Systems

- [ ] **Preloader Sequence**:
  - Drafting ruler counts from 0% to 100% over ~2.2s before veil sweeps open vertically.
  - Reference: [`motion/recordings/01-preloader-entrance.webm`](motion/recordings/01-preloader-entrance.webm)
- [ ] **Hero Drag-to-Reveal Interaction**:
  - Dragging creates a semi-transparent red gradient bounding box oriented away from the drag origin.
  - Overlapping pins highlight in bright red (`#fa3600`) and reveal IBC code reference tags.
  - Reference: [`motion/recordings/02-hero-drag-interaction.webm`](motion/recordings/02-hero-drag-interaction.webm)
- [ ] **Canvas 2D Custom Cursor**:
  - 9px square dot tracks pointer with `0.18` lerp and velocity-sensitive trailing line.
  - Cursor transitions color over dark sections and expands into a targeting reticle when clicked.
  - Shuts down RAF loop on idle (0% CPU).
  - Reference: [`technical/animation-architecture.md`](technical/animation-architecture.md)
- [ ] **Unified Master Clock**:
  - Lenis smooth scroll and GSAP animations share the single `gsap.ticker` clock with zero parallax jitter.
  - Reference: [`technical/official-case-study-notes.md`](technical/official-case-study-notes.md)
- [ ] **Pinned Model Map Sequence**:
  - Section pins over `700dvh` scrolling through Observe $\rightarrow$ Advise $\rightarrow$ Act $\rightarrow$ Learn bi-directionally.
  - Reference: [`motion/recordings/03-observe-advise-act-learn.webm`](motion/recordings/03-observe-advise-act-learn.webm)
- [ ] **Footer Circular Lens Reveal**:
  - Moving the mouse across the dark footer expands an SVG circular mask (`r = 160px`) revealing the background logo with soft pulse ring.
  - Reference: [`motion/recordings/04-footer-lens-reveal.webm`](motion/recordings/04-footer-lens-reveal.webm)
- [ ] **Rolling Button Micro-Animation**:
  - `.btn-fill` slides dual labels vertically (`translateY(-100%)`) on hover with smooth background fill.
  - Reference: [`interactions/interaction-spec.md`](interactions/interaction-spec.md)
- [ ] **Dashboard Feature Card Pinning**:
  - `.product-key` pins and stacks 5 feature cards over ~500dvh scroll distance.
  - Reference: [`motion/recordings/05-dashboard-scroll-sequence.webm`](motion/recordings/05-dashboard-scroll-sequence.webm)

---

## 5. Responsive & Accessibility Fidelity

- [ ] **Breakpoints**:
  - Desktop Wide (1920px), Desktop Standard (1440px), Tablet Landscape (1024px), Tablet Portrait (834px), Mobile (390px, 375px) all render proportionate layouts.
  - Reference: [`screenshots/contact-sheets/contact-sheet-responsive-comparison.png`](screenshots/contact-sheets/contact-sheet-responsive-comparison.png)
- [ ] **Mobile Navigation**:
  - Header collapses to hamburger button on screens `< 992px` and opens full-screen menu overlay.
  - Reference: [`screenshots/home/mobile/02-nav-menu-open-390.png`](screenshots/home/mobile/02-nav-menu-open-390.png)
- [ ] **Touch Device Deactivation**:
  - Canvas cursor and pointer trail are unmounted on `@media (pointer: coarse)` devices.
- [ ] **Reduced Motion**:
  - `prefers-reduced-motion` suppresses canvas trail, skips preloader counter, and replaces ink displacement with clean opacity fade.

---

## 6. Technical Quality & Clean Lifecycle

- [ ] **No Unintended Overflow**:
  - Horizontal scrollbar is completely absent at all viewport widths (`overflow-x: hidden`).
- [ ] **No Memory Leaks**:
  - Navigating between Home and Dashboard disposes GSAP timelines, ScrollTrigger pins, and Lenis instances cleanly.
- [ ] **High Frame Rate**:
  - Pinned animations maintain 60fps on standard desktop displays.
