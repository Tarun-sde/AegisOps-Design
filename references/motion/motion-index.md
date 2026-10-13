# Heron AI Motion Recordings Index

This directory contains recordings captured directly from the live Heron AI web experience using Playwright's headless browser video recorder.

---

## 1. Master Recording Inventory

| File Name | Resolution | File Size | Interaction Captured | Duration | Trigger | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [`01-preloader-entrance.webm`](recordings/01-preloader-entrance.webm) | 1440 × 900 | 2.0 MB | Initial page load, ruler count-up 0% $\rightarrow$ 100%, and hero entrance | 7.68s | Page load | VERIFIED |
| [`02-hero-drag-interaction.webm`](recordings/02-hero-drag-interaction.webm) | 1440 × 900 | 4.3 MB | Pointer mousedown drag selection revealing hidden violation markers | 12.44s | Pointer drag | VERIFIED |
| [`03-observe-advise-act-learn.webm`](recordings/03-observe-advise-act-learn.webm) | 1440 × 900 | 4.6 MB | Pinned model map scroll scrub through Observe $\rightarrow$ Advise $\rightarrow$ Act $\rightarrow$ Learn | 16.44s | Scroll wheel | VERIFIED |
| [`04-footer-lens-reveal.webm`](recordings/04-footer-lens-reveal.webm) | 1440 × 900 | 5.7 MB | Circular SVG mask following cursor to reveal background Heron logo | 18.04s | Pointer hover | VERIFIED |
| [`05-dashboard-scroll-sequence.webm`](recordings/05-dashboard-scroll-sequence.webm) | 1440 × 900 | 3.3 MB | Dashboard showcase scroll scrub across One View, Approval Queue, History | 10.84s | Scroll wheel | VERIFIED |
| [`06-page-transition.webm`](recordings/06-page-transition.webm) | 1440 × 900 | 5.7 MB | Synchronous page swap from Homepage to Dashboard via coordinate sweep | 15.40s | Link click | VERIFIED |

---

## 2. Detailed Clip Analysis & Specifications

### Clip 01: Preloader & Hero Entrance (`01-preloader-entrance.webm`)
- **Starting State**: Solid dark charcoal background (`#282828`). Center contains a drafting scale ruler with tick marks and monospace counter at `00%`.
- **Ending State**: Counter hits `100%`. The veil sweeps vertically via `clip-path: inset(0 0 100% 0)`. The header, editorial headline ("An AI agent that works inside your design tools"), and architectural drawing draw in.
- **Affected Elements**: `.loading-wrap`, `.loading-main`, `.home-hero`, `.header`.
- **Duration**: ~2.2s preloader countdown + ~0.8s entrance sweep.
- **Easing**: `power2.out` for counter; `power1.out` for veil wipe.
- **Reversible**: No (one-shot session entrance).
- **Mobile Behavior**: Runs identically; tick count scaled to narrower width.
- **Reduced Motion**: Skips counter, renders post-preloader state immediately.

---

### Clip 02: Hero Drag-to-Reveal Interaction (`02-hero-drag-interaction.webm`)
- **Starting State**: Floor plan drawing in neutral state; violation pins dormant/invisible.
- **Action**: Pointer clicks and drags diagonally across the drawing.
- **Ending State**: A semi-transparent red bounding box (`linear-gradient(..., rgba(255, 54, 0, 0.3), rgba(255, 54, 0, 0))`) follows the cursor. Intersecting pins ignite into bright red circles (`#fa3600`) with violation code tags (`IBC 1015.3`).
- **Easing**: Direct 1:1 mapping (minimal lerp) to preserve CAD instrument feel.
- **Reversible**: Yes. Releasing the mouse clears or persists active pins based on threshold.
- **Technical Technique**: Axis-Aligned Bounding Box (AABB) intersection check on every frame.

---

### Clip 03: Observe $\rightarrow$ Advise $\rightarrow$ Act $\rightarrow$ Learn (`03-observe-advise-act-learn.webm`)
- **Starting State**: Section pins at the top of the viewport (`start: "top top"`).
- **Action**: User scrolls downward continuously.
- **Ending State**: The drawing stays stationary in the viewport while the narrative HUD layers scrub:
  1. *Observe*: CAD model wireframe sits in monitoring state.
  2. *Advise*: Red callout highlights guard opening non-compliance.
  3. *Act*: Automated adjustment modifies drawing geometry in real time.
  4. *Learn*: The rule commits to firm memory with a success state.
- **Duration**: `700dvh` (~6,300px total scroll distance).
- **Easing**: Scrubbed with 1s smoothing (`scrub: 1`).
- **Reversible**: Fully bi-directional. Scrolling upward reverses the states smoothly.

---

### Clip 04: Footer Circular Pointer Reveal Lens (`04-footer-lens-reveal.webm`)
- **Starting State**: Dark blank canvas in footer.
- **Action**: Mouse enters footer boundaries and moves across the surface.
- **Ending State**: An SVG circular mask (`r = 160px`) reveals the hidden architectural Heron emblem beneath. The lens lags slightly behind the mouse cursor with a secondary glowing pulse ring.
- **Easing**: `lerp(curr, target, 0.09)` for primary circle, `lerp(curr, target, 0.15)` for pulse ring.
- **Reversible**: Yes. Pointer exit tweens radius back to 0.

---

### Clip 05: Dashboard Showcase Scroll Sequence (`05-dashboard-scroll-sequence.webm`)
- **Starting State**: Dashboard hero section transitions into `.product-key`.
- **Action**: Continuous vertical scroll.
- **Ending State**: 5 full product feature cards slide into pinned position one after another (One View $\rightarrow$ Approval Queue $\rightarrow$ Full History $\rightarrow$ Team View $\rightarrow$ Firm Standards) with subtle card scaling.
- **Duration**: `~500dvh` (~4,400px).
- **Reversible**: Yes.

---

### Clip 06: Page Navigation Transition (`06-page-transition.webm`)
- **Starting State**: Active homepage with dark header.
- **Action**: User clicks "Dashboard" in the navigation dropdown.
- **Ending State**: CSS custom properties (`--trans-percent`, `--mask-percent`, `--size-line`) sweep a geometric wipe across the viewport. The old page unmounts seamlessly as the new page renders underneath.
- **Duration**: ~0.8s exit + ~0.8s entrance.
- **Easing**: `power1.in` on leave, `power1.out` on enter.
