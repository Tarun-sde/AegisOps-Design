# ASTRA START HERE — Heron AI Frontend Reconstruction Brief

**Target Agent**: GPT Astra  
**Role**: Frontend Implementation Specialist  
**Mission**: Reconstruct the Heron AI web experience in a clean, modern Next.js frontend repository with pixel-perfect visual and motion fidelity.  
**Package Status**: **COMPLETE & VERIFIED** (All research, measurements, screenshots, recordings, and tokens have been extracted locally).

---

## 1. Project Objective & Primary References

Heron AI is a concept website for an AI agent that operates natively inside architectural BIM software (Revit, Rhino, ArchiCAD, SketchUp) to detect building code violations as architects model. The site was designed and built by Bearplus and received Awwwards Site of the Day, FWA Site of the Day, and CSSDesignAwards Site of the Day.

### Primary References:
1. **Live Homepage**: [https://heronaiapp.com/](https://heronaiapp.com/)
2. **Live Dashboard Showcase**: [https://heronaiapp.com/heron-dashboard](https://heronaiapp.com/heron-dashboard)
3. **Official Developer Case Study**: [https://tympanus.net/codrops/2026/10/12/heron-ai/](https://tympanus.net/codrops/2026/10/12/heron-ai/)

### Scope of Reconstruction:
You must reconstruct two primary pages:
1. **The Homepage (`/`)**: Preloader, interactive drag-selection hero, intro statement, problem presentation, pinned model map (`Observe -> Advise -> Act -> Learn`), platform integrations, feature cards, use case cards, final CTA, and footer with pointer reveal.
2. **The Dashboard Showcase (`/heron-dashboard`)**: Product hero, pinned 5-feature card sequence (`One View`, `Approval Queue`, `Full History`, `Team View`, `Firm Standards`), 3-step oversight overview, FAQ accordion, CTA, and footer.

---

## 2. Core Design Identity

- **The Philosophy**: *"Technical architecture meets active intelligence."*
- **What to Avoid**: Cliché AI visuals (no purple/blue glowing gradients, no floating orbs, no robotic chatbot chat bubbles).
- **What to Embrace**: Architectural drafting paper (`#e0e0da`), solid charcoal ink (`#282828`), floor plans, dimension lines, and drafting grids.
- **The Role of Red (`#fa3600`)**: Red is **never decorative**. It is used strictly for building code violations, active warning pins, and status alerts. The calmer the base palette, the more urgency a warning conveys when it ignites.

---

## 3. Essential Design Tokens

### Colors:
- **Canvas Background (Paper Off-White)**: `#e0e0da` (`rgb(224, 224, 218)`)
- **Dark Surface / Inverted Background**: `#282828` (`rgb(40, 40, 40)`)
- **Primary Text**: `#282828`
- **Muted Text / Paragraphs**: `rgba(40, 40, 40, 0.72)` (`--content--terriary`)
- **Accent Brand Red (Violations / Alerts)**: `#fa3600` (`rgb(250, 54, 0)`)
- **Architectural Grid Borders**: `#b3b3af` (`rgb(179, 179, 175)`)
- *Full Token File*: [`references/design/design-tokens.json`](references/design/design-tokens.json)

### Typography:
- **Primary Display & Text**: `BT Grotesk` (Weights: `400`, `500`, `600`, `700`).  
  *Astra Open-Source Fallback*: Use **Space Grotesk** or **Inter** via `next/font/google`.
- **Metadata / Coordinates / Code Tags**: **Geist Mono** (Weight: `500`, `uppercase`).  
  Available via Vercel's open-source `geist` package.
- **H1 Scale (Desktop 1440)**: `46.7px` (`font-bold`, leading `1.0`, letter-spacing `-0.02em`).
- **Body Scale (Desktop 1440)**: `13.3px` (`font-medium`, leading `1.3`, letter-spacing `-0.02em`).
- *Full Typographic Spec*: [`references/design/typography.md`](references/design/typography.md)

### Layout Rules:
- **Framed Blueprint Border**: An outer margin of `8px` (`0.8rem`) bounds the viewport with crisp 1px borders.
- **Hairline Grid Rules**: 122 fine 1px line elements (`#b3b3af`) partition sections like architectural drafting paper.
- **Hero Height**: `calc(100dvh - 1.6rem)` (`886.7px` on 900vh, `686.7px` on 700vh).
- **Header Height**: `56.3px` (Desktop 1440), `49.6px` (Mobile 390).
- *Full Layout Spec*: [`references/design/layout-spec.md`](references/design/layout-spec.md)

---

## 4. The 5 Core Interactions You Must Implement

1. **Hero Drag-to-Reveal Selection**:  
   Clicking and dragging on the hero drawing expands a red gradient bounding box (`linear-gradient(..., rgba(255, 54, 0, 0.3), rgba(255, 54, 0, 0))`). Overlapping violation pins ignite into red indicators revealing building code citations (e.g., `IBC 1015.3 Guard Opening Limitations`).
2. **Canvas 2D Custom Cursor & Velocity Trail**:  
   A fixed Canvas 2D layer renders a 9px square dot following the cursor (`lerp = 0.18`). High-velocity movement generates an ephemeral trailing line. On mouse down, the square expands into an architectural targeting reticle. Suspends execution on idle (0% CPU).
3. **Pinned Model Map Sequence (`Observe -> Advise -> Act -> Learn`)**:  
   A pinned `700dvh` scroll scene where the central floor plan remains stationary while 4 narrative inspection phases scrub sequentially via GSAP ScrollTrigger.
4. **SVG Displacement Ink Reveal**:  
   Between wireframe sketch and color render, scroll progress drives an SVG `<feDisplacementMap>` + `<feTurbulence>` filter mask that makes the transition bleed like wet India ink.
5. **Footer Pointer Circular Lens Reveal**:  
   In the dark footer, moving the pointer expands an SVG circular mask (`r = 160px`, `lerp = 0.09`) revealing the background Heron emblem like an architect's inspection loupe.
- *Full Interaction Matrix*: [`references/interactions/interaction-spec.md`](references/interactions/interaction-spec.md)

---

## 5. Recommended Frontend Technology Stack

| Role | Technology | Notes for Astra |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | Client components for animated views (`'use client'`) |
| **Styling** | **Tailwind CSS** | Map custom colors (`brand`, `paper`, `dark`) and hairline borders |
| **Animation Engine** | **GSAP 3.12+ & ScrollTrigger** | Master animation timelines |
| **React GSAP Hook** | **`@gsap/react`** | Use `useGSAP()` to ensure clean automatic teardown |
| **Smooth Scrolling** | **`lenis` (v1.1+)** | Drive via `gsap.ticker.add((time) => lenis.raf(time * 1000))` |
| **Canvas** | **HTML5 Canvas 2D** | Dedicated `<canvas>` component for cursor and reticle |
| **Vector Filters** | **Inline SVG & Filter Primitives**| For ink bleed masks and drafting tick marks |

> [!CAUTION]
> **Strict Stack Prohibitions**:
> - **Do NOT use Three.js or WebGL**: The entire site is 2D architectural drawings and plain DOM.
> - **Do NOT use Barba.js**: The original Webflow site used Barba, but in Next.js App Router, Barba conflicts with client-side navigation. Use Next.js page overlay transitions instead.
- *Technical Architecture*: [`references/technical/animation-architecture.md`](references/technical/animation-architecture.md)
- *Next.js Implementation Guide*: [`references/technical/implementation-recommendations.md`](references/technical/implementation-recommendations.md)
- *Full Stack Analysis*: [`references/technical/stack-recommendations.md`](references/technical/stack-recommendations.md)

---

## 6. Local Reference Material Index

### Visual Contact Sheets:
- 🖼️ **Home Desktop Contact Sheet (15 panels)**: [`references/screenshots/contact-sheets/contact-sheet-home-desktop.png`](references/screenshots/contact-sheets/contact-sheet-home-desktop.png)
- 🖼️ **Dashboard Contact Sheet (9 panels)**: [`references/screenshots/contact-sheets/contact-sheet-dashboard-desktop.png`](references/screenshots/contact-sheets/contact-sheet-dashboard-desktop.png)
- 🖼️ **Responsive Comparison Sheet (9 devices)**: [`references/screenshots/contact-sheets/contact-sheet-responsive-comparison.png`](references/screenshots/contact-sheets/contact-sheet-responsive-comparison.png)

### Key Screenshots by Directory:
- 🖥️ **Desktop 1440 × 900**: [`references/screenshots/home/desktop-1440/`](references/screenshots/home/desktop-1440/) (Preloader, Hero, Problem, Map phases, Platforms, Why, Use cases, Footer).
- 🖥️ **Desktop 1440 × 700 (Height comparison)**: [`references/screenshots/home/desktop-1440/16-hero-1440x700.png`](references/screenshots/home/desktop-1440/16-hero-1440x700.png)
- 🖥️ **Desktop 1920 × 1080**: [`references/screenshots/home/desktop-1920/`](references/screenshots/home/desktop-1920/)
- 📱 **Tablet (1024 & 834)**: [`references/screenshots/home/tablet/`](references/screenshots/home/tablet/)
- 📱 **Mobile (390 & 375)**: [`references/screenshots/home/mobile/`](references/screenshots/home/mobile/) (Including open mobile nav menu: `02-nav-menu-open-390.png`).
- 📊 **Dashboard Desktop & Mobile**: [`references/screenshots/dashboard/`](references/screenshots/dashboard/)

### High-Definition Motion Recordings (WebM):
- 🎬 [`01-preloader-entrance.webm`](references/motion/recordings/01-preloader-entrance.webm) — Initial page load, ruler countdown, and hero entrance (7.68s)
- 🎬 [`02-hero-drag-interaction.webm`](references/motion/recordings/02-hero-drag-interaction.webm) — Drag selection revealing hidden violation pins (12.44s)
- 🎬 [`03-observe-advise-act-learn.webm`](references/motion/recordings/03-observe-advise-act-learn.webm) — Scroll scrub through 4-phase model map (16.44s)
- 🎬 [`04-footer-lens-reveal.webm`](references/motion/recordings/04-footer-lens-reveal.webm) — Cursor circular lens revealing footer logo (18.04s)
- 🎬 [`05-dashboard-scroll-sequence.webm`](references/motion/recordings/05-dashboard-scroll-sequence.webm) — Dashboard pinned feature card sequence (10.84s)
- 🎬 [`06-page-transition.webm`](references/motion/recordings/06-page-transition.webm) — Page transition from Home to Dashboard (15.40s)
- *Full Motion Documentation*: [`references/motion/motion-index.md`](references/motion/motion-index.md)

---

## 7. Asset Licensing & Recreation Instructions

- **Proprietary Notice**: All imagery hosted on the original live site is copyrighted by Bearplus and Heron AI.
- **Rule for Astra**: **Do NOT download proprietary media into implementation folders.**
- **Recreation Strategy**:
  1. **Hero Floor Plan**: Create an original clean vector SVG or high-resolution architectural layout featuring walls, door swings, and room labels. Attach normalized coordinates for 3 violation targets (`guardrail`, `handrail`, `door clearance`).
  2. **Dashboard UI Cards**: Build them as **pure semantic React / Tailwind components** (`OneViewCard`, `ApprovalQueueCard`) rather than static screenshots. This ensures crisp typography on Retina displays and zero copyright infringement.
- *Detailed Recreation Guide*: [`references/assets/asset-recreation-guide.md`](references/assets/asset-recreation-guide.md)  
- *Asset Inventory*: [`references/assets/asset-manifest.csv`](references/assets/asset-manifest.csv)

---

## 8. Recommended Implementation Order

1. **Phase 1: Project Setup & Design System**
   - Initialize Next.js 14+ App Router with TypeScript and Tailwind CSS.
   - Configure colors (`#e0e0da`, `#282828`, `#fa3600`, `#b3b3af`) and fonts (`Space Grotesk` + `Geist Mono`).
   - Create layout frame wrapper with the outer 8px drafting margin and global hairline grid lines.
2. **Phase 2: Master Animation Loop & Cursor Engine**
   - Implement `SmoothScrollProvider` unifying Lenis and GSAP ticker.
   - Implement `CustomCursorCanvas` (9px dot, trail physics, reticle state, sleep/wake optimization).
3. **Phase 3: Header, Preloader & Page Shell**
   - Build navigation header with rolling button micro-animation (`.btn-fill`).
   - Build preloader component with scale ruler countdown and clip-path wipe.
4. **Phase 4: Hero Drag-to-Reveal Interaction**
   - Create vector floor plan container with normalized issue markers.
   - Implement drag selection coordinate math and AABB intersection collision.
5. **Phase 5: Scroll Sequences & Homepage Sections**
   - Build pinned model map (`Observe -> Advise -> Act -> Learn`) with ScrollTrigger.
   - Build platform tab cards, feature grids, and use cases.
   - Build dark footer with interactive SVG pointer reveal lens.
6. **Phase 6: Dashboard Showcase & Page Transitions**
   - Construct `/heron-dashboard` page with pinned feature cards and FAQ accordion.
   - Add geometric coordinate wipe transition overlay between routes.
7. **Phase 7: Fidelity Verification**
   - Audit against [`references/FIDELITY_CHECKLIST.md`](references/FIDELITY_CHECKLIST.md).

---

## 9. Top Visual Fidelity Risks to Avoid

1. **Accidental Parallax Drift**: If Lenis and the custom cursor run on independent `requestAnimationFrame` loops, the cursor will jitter during deceleration. Always bind both to `gsap.ticker`.
2. **Subpixel Hairline Blur**: Grid lines must be precisely `1px` (`var(--size--border)`). Ensure lines do not land on fractional pixels (`0.5px`).
3. **Letterbox Marker Misalignment**: When resizing the window, the floor plan's rendered aspect ratio changes. Always recalculate issue marker positions relative to the measured rendered bounding box.
4. **Memory Leaks on Route Change**: Always wrap GSAP animations in `@gsap/react` `useGSAP` hooks so all ScrollTrigger pins and ticker callbacks are disposed when navigating between pages.

---

## 10. Research Status & Verification

All research is verified and marked **READY FOR IMPLEMENTATION**.  
Detailed references:
- Full Site Inventory: [`references/SITE_INVENTORY.md`](references/SITE_INVENTORY.md)
- Case Study Technical Breakdown: [`references/technical/official-case-study-notes.md`](references/technical/official-case-study-notes.md)
- Quality Assurance Rubric: [`references/FIDELITY_CHECKLIST.md`](references/FIDELITY_CHECKLIST.md)
- Research Audit Log: [`references/RESEARCH_STATUS.md`](references/RESEARCH_STATUS.md)
