# Heron AI Complete Site Inventory

## 1. Page Inventory Overview

| Page Name | Public URL | Primary Role | Layout Style | Verified Status |
| :--- | :--- | :--- | :--- | :--- |
| **Homepage** | `https://heronaiapp.com/` | Primary conversion page, product workflow narrative, interactive CAD hero | Architectural drawing sheet grid | VERIFIED |
| **Dashboard Showcase**| `https://heronaiapp.com/heron-dashboard` | Product feature deep-dive, multi-project oversight matrix, FAQ | Pinned card stack & feature inspection | VERIFIED |
| **Chat Widget Showcase**| `https://heronaiapp.com/heron-chat-widget` | In-model conversational assistant showcase | Card grid & HUD demonstration | VERIFIED |
| **About Us** | `https://heronaiapp.com/about-us` | Brand story, team, architectural philosophy | Editorial brutalist layout | VERIFIED |
| **Pricing** | `https://heronaiapp.com/pricing` | Tiered pricing comparison table | Tabular matrix with feature ticks | VERIFIED |
| **Contact Us** | `https://heronaiapp.com/contact-us` | Direct demo booking form | Minimal form layout | VERIFIED |

---

## 2. Homepage Section-by-Section Inventory

### Section 00: Preloader (`.loading-wrap`)
- **Order**: 0 (Entry overlay)
- **Position**: Fixed overlay (`z-index: 2147483647`)
- **Dimensions**: `100vw × 100vh`
- **Background**: Solid `#282828`
- **Typography**: Geist Mono `14px` counter (`00%` $\rightarrow$ `100%`)
- **Imagery**: SVG scale ruler icon with drafting graduation ticks
- **Animation**: Counter ticks up smoothly over 2.2s; curtain sweeps vertically on completion
- **Screenshots**: [`home/desktop-1440/01-preloader.png`](screenshots/home/desktop-1440/01-preloader.png)
- **Recording**: [`recordings/01-preloader-entrance.webm`](motion/recordings/01-preloader-entrance.webm)

### Section 01: Global Header (`header.header`)
- **Order**: 1 (Persistent Top Bar)
- **Position**: `top: 0`, sticky / fixed
- **Dimensions**: `1426.7px × 56.3px` (Desktop 1440), `49.6px` (Mobile 390)
- **Background**: Transparent / Blur over content (`#00000000`)
- **Typography**: BT Grotesk Medium `13.3px`, tracking `-0.27px`
- **Elements**: Brand logo, Navigation links (Product, About, Pricing, Resources), CTA "Book a demo" (`.btn-fill`)
- **Interactions**: Submenu dropdown on hover; split-label vertical text slide on CTA hover; hamburger toggle on mobile
- **Screenshots**: Included in hero screenshots

### Section 02: Hero Scene (`.home-hero`)
- **Order**: 2
- **Position**: `y = 0` to `y = 886.7px`
- **Dimensions**: `1426.7px × 886.7px` (`calc(100dvh - 1.6rem)`)
- **Background**: `#e0e0da` (Paper off-white)
- **Typography**: H1 (`46.7px`, weight 700, leading `46.7px`, tracking `-0.93px`): `"An AI agent that works inside your design tools"`
- **Imagery**: Vector / CAD architectural floor plan (`hero-architectural-floorplan.avif`)
- **Layout**: 2 columns. Left: H1, subtext paragraph, primary CTA. Right: Interactive floor plan drawing.
- **Interactions**: Pointer click-and-drag creates dynamic gradient box revealing hidden violation pins.
- **Screenshots**:
  - Initial: [`home/desktop-1440/02-hero-initial.png`](screenshots/home/desktop-1440/02-hero-initial.png)
  - Revealed: [`home/desktop-1440/03-hero-drag-selection.png`](screenshots/home/desktop-1440/03-hero-drag-selection.png)
- **Recording**: [`recordings/02-hero-drag-interaction.webm`](motion/recordings/02-hero-drag-interaction.webm)

### Section 03: Intro Philosophy (`.home-intro`)
- **Order**: 3
- **Position**: `y ≈ 887px`
- **Dimensions**: `1426.7px × 722.5px`
- **Background**: `#e0e0da`
- **Typography**: H2 uppercase statement (`33.3px`, weight 600, leading `33.3px`): `"THE REPETITIVE PARTS OF MODELLING SHOULDN'T EAT YOUR DAY..."`
- **Layout**: Centered editorial statement with architectural hairline framing rules.
- **Screenshots**: [`home/desktop-1440/04-intro-philosophy.png`](screenshots/home/desktop-1440/04-intro-philosophy.png)

### Section 04: Problem Presentation (`.home-problem`)
- **Order**: 4
- **Position**: `y ≈ 1610px`
- **Dimensions**: `1426.7px × 742.6px`
- **Background**: `#e0e0da`
- **Typography**: H2 `"Your design tools do what you tell them, nothing more"`
- **Layout**: Problem breakdown highlighting passive CAD software vs active intelligent agent.
- **Screenshots**: [`home/desktop-1440/05-problem-tools.png`](screenshots/home/desktop-1440/05-problem-tools.png)

### Section 05: Interactive Model Map (`.home-map`)
- **Order**: 5
- **Position**: `y ≈ 2352px` (Pinned scroll zone)
- **Dimensions**: `1426.7px × 6300px` (`700dvh`)
- **Background**: `#e0e0da`
- **Typography**: H2 `"RUN AN AGENT NATIVELY IN YOUR MODEL"`, Geist Mono status indicators
- **Layout**: Centered pinned drawing with 4 scrubbed phases:
  1. *Observe* (Passive HUD monitoring)
  2. *Advise* (Red violation callout + code tags)
  3. *Act* (CAD geometry adjustment)
  4. *Learn* (Firm rule addition)
- **Interactions**: Scroll wheel scrubs timeline bi-directionally.
- **Screenshots**:
  - Observe: [`home/desktop-1440/06-map-observe.png`](screenshots/home/desktop-1440/06-map-observe.png)
  - Advise: [`home/desktop-1440/07-map-advise.png`](screenshots/home/desktop-1440/07-map-advise.png)
  - Act: [`home/desktop-1440/08-map-act.png`](screenshots/home/desktop-1440/08-map-act.png)
  - Learn: [`home/desktop-1440/09-map-learn.png`](screenshots/home/desktop-1440/09-map-learn.png)
- **Recording**: [`recordings/03-observe-advise-act-learn.webm`](motion/recordings/03-observe-advise-act-learn.webm)

### Section 06: Platform Tool Integrations (`.home-platform`)
- **Order**: 6
- **Position**: `y ≈ 8652px`
- **Dimensions**: `1426.7px × 710.0px`
- **Background**: `#e0e0da`
- **Elements**: Revit, Rhino, ArchiCAD, SketchUp interactive tab cards.
- **Interactions**: Tab click toggles corresponding BIM viewport illustration.
- **Screenshots**: [`home/desktop-1440/10-platform-integrations.png`](screenshots/home/desktop-1440/10-platform-integrations.png)

### Section 07: Why Heron / Feature Grid (`.home-why`)
- **Order**: 7
- **Position**: `y ≈ 9362px`
- **Dimensions**: `1426.7px × 698.1px`
- **Typography**: H2 `"BUILT TO WORK THE WAY YOU DO"`
- **Elements**: 3 feature columns with numbered indices (`01`, `02`, `03`) and Swiper pagination.
- **Screenshots**: [`home/desktop-1440/11-why-built-the-way-you-do.png`](screenshots/home/desktop-1440/11-why-built-the-way-you-do.png)

### Section 08: Use Cases (`.home-usecase`)
- **Order**: 8
- **Position**: `y ≈ 10060px`
- **Dimensions**: `1426.7px × 886.7px`
- **Typography**: H2 `"MADE FOR THE PEOPLE IN THE MODEL"`
- **Elements**: Persona / workflow cards (Lead Architect, BIM Manager, Project Architect).
- **Screenshots**: [`home/desktop-1440/12-usecases-people-in-model.png`](screenshots/home/desktop-1440/12-usecases-people-in-model.png)

### Section 09: Final Call to Action (`.cta`)
- **Order**: 9
- **Position**: `y ≈ 10947px`
- **Dimensions**: `1426.7px × 698.2px`
- **Background**: Dark charcoal container (`#282828`)
- **Typography**: H2 white `"SEE WHAT HERON CAN DO IN YOUR MODEL"`
- **Elements**: Book Demo button, sketch-to-render ink transition preview.
- **Screenshots**: [`home/desktop-1440/13-cta-final.png`](screenshots/home/desktop-1440/13-cta-final.png)

### Section 10: Global Footer (`footer.footer`)
- **Order**: 10
- **Position**: `y ≈ 11645px`
- **Dimensions**: `1426.7px × 710.7px`
- **Background**: Dark charcoal (`#282828`)
- **Interactions**: Circular SVG pointer lens reveals background Heron logo on hover.
- **Screenshots**:
  - Initial: [`home/desktop-1440/14-footer-initial.png`](screenshots/home/desktop-1440/14-footer-initial.png)
  - Hover Lens: [`home/desktop-1440/15-footer-pointer-lens.png`](screenshots/home/desktop-1440/15-footer-pointer-lens.png)
- **Recording**: [`recordings/04-footer-lens-reveal.webm`](motion/recordings/04-footer-lens-reveal.webm)

---

## 3. Dashboard Showcase Section-by-Section Inventory

### Section 01: Hero Scene (`.product-hero`)
- **Dimensions**: `1426.7px × 886.7px`
- **Typography**: H1 `"See every change, flag, and approval in one place"`
- **Imagery**: Consolidated multi-project overview UI preview.
- **Screenshots**: [`dashboard/desktop-1440/01-dashboard-hero.png`](screenshots/dashboard/desktop-1440/01-dashboard-hero.png)

### Section 02: Pinned Product Key Features (`.product-key`)
- **Dimensions**: `1426.7px × 4409.6px` (Pinned multi-card scroll)
- **Features Captured**:
  1. `One View` (`02-dashboard-one-view.png`)
  2. `Approval Queue` (`03-dashboard-approval-queue.png`)
  3. `Full History` (`04-dashboard-full-history.png`)
  4. `Team View` (`05-dashboard-team-view.png`)
  5. `Firm Standards` (`06-dashboard-firm-standards.png`)
- **Recording**: [`recordings/05-dashboard-scroll-sequence.webm`](motion/recordings/05-dashboard-scroll-sequence.webm)

### Section 03: Three Steps to Oversight (`.product-how`)
- **Dimensions**: `1426.7px × 1800.0px`
- **Typography**: H2 `"From activity to oversight, in 3 steps"`
- **Screenshots**: [`dashboard/desktop-1440/07-dashboard-3steps-oversight.png`](screenshots/dashboard/desktop-1440/07-dashboard-3steps-oversight.png)

### Section 04: Product FAQ Accordion (`.product-faq`)
- **Dimensions**: `1426.7px × 500.0px`
- **Typography**: H2 `"Got questions? We've got answers"`
- **Screenshots**: [`dashboard/desktop-1440/08-dashboard-faq.png`](screenshots/dashboard/desktop-1440/08-dashboard-faq.png)

### Section 05: Dashboard CTA & Footer
- **Dimensions**: `1426.7px × 1408.8px`
- **Screenshots**: [`dashboard/desktop-1440/09-dashboard-cta-footer.png`](screenshots/dashboard/desktop-1440/09-dashboard-cta-footer.png)
