# Heron AI Responsive Specification

## 1. Responsive Breakpoints

| Breakpoint Name | Viewport Width | Device Target | Navigation Treatment | Layout Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Desktop Wide** | `≥ 1440px` (tested `1920×1080`) | 4K / Ultrawide / Desktop | Full desktop horizontal menu | Dynamic rem scaling (`11.11px` root font), side-by-side drawing and copy |
| **Desktop Standard** | `1200px – 1439px` (tested `1440×900`, `1440×700`) | Laptops & standard displays | Full desktop horizontal menu | Standard reference baseline (`8.33px` root font) |
| **Tablet Landscape** | `992px – 1199px` (tested `1024×768`) | iPad Pro / iPad landscape | Full menu with compressed padding | Scaled down root rem (`5.93px`), full-width layout intact |
| **Tablet Portrait** | `768px – 991px` (tested `834×1112`) | iPad vertical / small tablets | Hamburger button active (`.header-menu-btn`) | Vertical stacking of drawings below titles, `10px` root rem |
| **Mobile Standard** | `376px – 767px` (tested `390×844`) | iPhone 14/15/16, modern Android | Hamburger modal overlay | Full column stacking, reduced padding, touch tap selection |
| **Mobile Compact** | `≤ 375px` (tested `375×812`) | iPhone SE / compact mobile | Hamburger modal overlay | Tightest gutters, compact font scaling (`9.54px` root font) |

---

## 2. Navigation Collapse Behavior

### Desktop (Width ≥ 992px):
- Header displays brand logo on the left (`padding-left: 2.4rem`).
- Center navigation menu (`.header-menu-wrap`) displays links: "Product" (with dropdown submenu for Dashboard & Chat Widget), "About Us", "Pricing", "Resources".
- Right side features the primary CTA: "Book a demo" (dark pill button with animated text slide).
- Height: `56.3px` (at 1440px).

### Tablet & Mobile (Width < 992px):
- Standard menu collapses; the hamburger button (`.header-menu-btn`) appears on the right edge.
- When clicked, a full-viewport modal overlay slides open displaying large typographic navigation items, secondary utility links, and the direct "Book a Demo" CTA.
- Header height: `49.6px` (at 390px) / `47.7px` (at 375px).

---

## 3. Architectural Drawing Scaling & `object-fit` Remapping

A critical technical challenge highlighted in the official case study:
- The base architectural floor plan has a fixed aspect ratio and internal coordinate system for its violation pins.
- As the viewport resizes, CSS `object-fit: contain` scales and letterboxes the render.
- **The Solution**:
  The code must measure the image's rendered bounding client rect (`renderedWidth`, `renderedHeight`, `offsetLeft`, `offsetTop`) and remap each issue marker coordinate proportionally:

$$\text{markerX} = \text{rect.left} + \text{normalizedX} \times \text{renderedWidth}$$
$$\text{markerY} = \text{rect.top} + \text{normalizedY} \times \text{renderedHeight}$$

---

## 4. Touch Devices & Canvas Cursor Deactivation

- **Canvas 2D Cursor**:
  - Active **only** on fine-pointer devices (`@media (pointer: fine)`).
  - On touch devices (smartphones and tablets), the canvas cursor and pointer trail are completely destroyed / unmounted to eliminate background CPU and battery drain.
- **Hero Drag-to-Reveal Interaction on Touch**:
  - On desktop: Pointer `mousedown` $\rightarrow$ `mousemove` creates a dragging bounding box that activates overlapping violation pins.
  - On mobile: Touch drag triggers page scroll by default; therefore, the hero reveals violations through direct **tap / touch gestures** on highlighted drawing regions or through scroll proximity triggers.

---

## 5. Viewport-Height Analysis: 1440 × 900 vs 1440 × 700

| Property | 1440 × 900 (Standard Laptop) | 1440 × 700 (Short Laptop / Browser with Bars) | Difference & Impact |
| :--- | :--- | :--- | :--- |
| **Hero Section Height** | `886.66px` | `686.66px` | Exactly `-200px` shorter |
| **Hero Image Max-Height**| Full drawing fits comfortably | Drawing shrinks by ~22% to maintain aspect ratio | No vertical clipping or scrollbar leakage |
| **Header Separator** | Sits at `y = 56.3px` | Sits at `y = 56.3px` | Constant top bar |
| **ScrollTrigger Distances**| Map pinned over `6300px` (`7 × 900`) | Map pinned over `4900px` (`7 × 700`) | Pinned duration scales with `innerHeight` |
| **Scroll Interpolation** | Standard Lenis lerp `0.1` | Standard Lenis lerp `0.1` | Smoothness remains consistent |

---

## 6. Preloader & Page Transitions on Mobile

- The preloader ruler animation runs on mobile with identical timing (~2.2s) but adapts its ruler tick count to fit narrower screen widths (16 ticks on mobile vs 32 ticks on desktop).
- Mobile page transitions maintain the vertical coordinate sweeping mask without frame drops by ensuring heavy GSAP tweens target only `transform` and `opacity`.
