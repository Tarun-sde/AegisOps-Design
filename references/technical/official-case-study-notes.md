# Official Developer Case Study Notes (Codrops / Bearplus)

**Source**: Tympanus Codrops Case Study  
**URL**: [https://tympanus.net/codrops/2026/10/12/heron-ai/](https://tympanus.net/codrops/2026/10/12/heron-ai/)  
**Agency**: Bearplus  
**Design & Dev Team**: Designed by Kenny, Divo, Moka; Developed by Noah, Kelvin, Ray  
**Awards**: Awwwards Site of the Day (12 Oct), FWA Site of the Day (01 Oct), CSSDesignAwards Site of the Day (12 Sep)  

---

## 1. Project Objective & Strategic Pivot

- **The Problem**: Architects are rightly skeptical of generic "AI for everything" tech pitches with glowing neon orbs, chatbot bubbles, and purple gradients.
- **The Strategic Pivot**: Midway through design, the agency stopped trying to design an "AI website" and asked:  
  > *"If you stripped the word 'AI' out of the brief entirely, what would a tool that helps architects catch and fix problems actually look like?"*
- **The Visual Vocabulary**: Blueprints, floor plans, technical annotations, dimension lines, Revit-style status indicators, and redline markup.
- **Workflow Spine**: Rather than a static feature list, the homepage is structured around the architectural workflow:  
  $$\text{Observe} \longrightarrow \text{Advise} \longrightarrow \text{Act} \longrightarrow \text{Learn}$$

---

## 2. Visual System & Design Philosophy

- **Base Atmosphere**: Calm, precise, human, physical. Off-white (`#e0e0da`), near-black (`#282828`), architectural grid, brutalist paper forms.
- **Role of Accent Red (`#fa3600`)**: Not decorative. In architectural inspection workflows, red means something requires immediate attention. It is reserved almost exclusively for code violations and active alerts so that it carries undeniable weight when it appears.
- **Typography**: **BT Grotesk** chosen for editorial authority in headlines and neutral precision in technical metadata, paired with **Geist Mono** for coordinates and building code tags.
- **Grid Structure**: Follows an architectural drawing sheet, not a conventional landing page layout.

---

## 3. The Core Interactive Systems (With Disclosed Implementation Code)

### A. Hero Drag-to-Reveal Interaction
Instead of explaining what Heron sees, the user directly drags a selection box across an architectural drawing to reveal hidden code violations (guardrails, handrails, stair risers).
- **Pointer-to-reveal mapping**: Kept near 1:1 direct feel (minimal easing so it feels like a precision CAD tool, not a floaty toy).
- **Coordinate remapping**: The rendered drawing scales with `object-fit: contain`, so marker positions are recalculated dynamically relative to the rendered bounding box.
- **Official Code Disclosed**:
  ```javascript
  const MOVEMENT_THRESHOLD = 2;

  function updateSelection(startX, startY, currentX, currentY) {
    const dx = currentX - startX;
    const dy = currentY - startY;
    if (Math.hypot(dx, dy) < MOVEMENT_THRESHOLD) return;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(dx);
    const height = Math.abs(dy);

    const gradientDirection =
      dx >= 0 && dy >= 0 ? 'to bottom right' :
      dx < 0 && dy >= 0 ? 'to bottom left' :
      dx >= 0 && dy < 0 ? 'to top right' :
      'to top left';

    Object.assign(box.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      background: `linear-gradient(
        ${gradientDirection},
        rgba(255, 54, 0, .3),
        rgba(255, 54, 0, 0)
      )`
    });

    const boxRect = box.getBoundingClientRect();
    const overlaps = (boxRect, markerRect) => !(
      boxRect.right < markerRect.left ||
      boxRect.left > markerRect.right ||
      boxRect.bottom < markerRect.top ||
      boxRect.top > markerRect.bottom
    );

    issueMarkers.forEach(marker => {
      if (overlaps(boxRect, marker.getBoundingClientRect())) {
        marker.classList.add('active');
      }
    });
  }
  ```

---

### B. Scroll-Driven SVG Ink Transitions
Transitions between wireframe sketch and finished architectural render are driven by scroll progress through an SVG displacement filter, causing the reveal edge to bleed like wet drawing ink.
- **Official Filter Architecture Disclosed**:
  ```html
  <div class="ink-mask">
    <div class="ink-mask-img">
      <img src="{{img.sketch.url}}" class="img">
    </div>
    <div class="ink-mask-img ink-filter">
      <svg width="100%" preserveAspectRatio="none" class="layer" viewBox="0 0 1000 981.7671809256661">
        <defs>
          <mask id="inkMask" maskContentUnits="userSpaceOnUse">
            <path fill="white" style="filter: url(#sharedDisplacementFilter);" 
                  d="M 0 656.883885963271 Q 500 821.3487638316883 1000 656.883885963271 L 1000 0 L 0 0 Z" 
                  data-value-final="M 0 1000 Q 500 1250 1000 1000 L 1000 0 L 0 0 Z" class="mask"></path>
          </mask>
        </defs>
        <filter id="sharedDisplacementFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.045 0.055" numOctaves="4" seed="5" result="noise"></feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="100" xChannelSelector="R" yChannelSelector="G"></feDisplacementMap>
          <feGaussianBlur stdDeviation="1.8" result="blurred"></feGaussianBlur>
          <feComponentTransfer in="blurred" result="contrast">
            <feFuncA type="linear" slope="2.2" intercept="-0.6"></feFuncA>
          </feComponentTransfer>
        </filter>
        <image href="{{img.color.url}}" x="0" y="0" width="100%" height="100%" 
               mask="url(#inkCircleMask-0)" class="img-basic" style="mask-image: url(inkMask);">
        </image>
      </svg>
    </div>
  </div>
  ```

---

### C. Unified Clock for Scroll and Pointer (GSAP Ticker Architecture)
To eliminate micro-stutter and frame drift between Lenis smooth scroll and pointer-driven canvas animations, Bearplus linked all animation subsystems into a single master ticker:
- **Architecture**:
  ```
  GSAP Ticker (Master Loop)
  │
  ├── Lenis Smooth Scroll (time * 1000)
  ├── ScrollTrigger Updates
  ├── Custom Canvas 2D Cursor
  ├── SVG Ink Masks
  └── Pointer Effects
  ```
- **Disclosed Ticker Code**:
  ```javascript
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
    cursor.update(time);
    inkMask.update(time);
    pointerEffects.update(time);
  });
  ```

---

### D. Canvas 2D Custom Cursor
- Fixed HTML5 Canvas 2D layer active on fine-pointer devices.
- Draws a **9px square dot** with a velocity-sensitive trailing path.
- Interpolates smoothly towards mouse pointer (`lerp = 0.18`).
- Shifts color over dark vs light sections.
- Expands into an architectural targeting reticle when clicked.
- **Sleep/Wake Optimization**: Loop stops completely once values settle so 0% CPU is consumed when the pointer is stationary:
  ```javascript
  wake() {
    if (this.raf !== null) return;
    this.raf = requestAnimationFrame(this.render);
  }
  render() {
    this.raf = null;
    const prevX = this.current.x;
    const prevY = this.current.y;
    this.current.x += (this.target.x - this.current.x) * 0.18;
    this.current.y += (this.target.y - this.current.y) * 0.18;
    const movement = Math.hypot(this.current.x - prevX, this.current.y - prevY);
    this.speed += (movement - this.speed) * 0.2;
    if (movement > 0.05) {
      this.trail.push({ x: this.current.x, y: this.current.y });
    }
    const trailActive = this.speed > 1.5;
    this.draw(trailActive);
    if (movement > 0.05 || trailActive) {
      this.wake();
    }
  }
  ```

---

### E. Footer Circular SVG Pointer Lens
In the footer, hovering the mouse reveals the background logo through an expanding circular SVG mask like an architect's inspection magnifying loupe.
- Secondary pulse mask creates a softer, double-ring lens effect.
- Disclosed Enter/Leave logic:
  ```javascript
  handlePointerEnter(event) {
    this.isEntered = true;
    this.requestRender();
    gsap.killTweensOf(this.mask);
    gsap.to(this.mask, {
      attr: { r: this.radius },
      duration: this.reducedMotion ? 0 : 0.55,
      ease: 'linear',
      overwrite: true,
    });
    if (this.pulseMasks) {
      gsap.killTweensOf(this.pulseMasks);
      gsap.to(this.pulseMasks, {
        attr: { r: this.radius * 1.05 },
        opacity: 0.2,
        duration: this.reducedMotion ? 0 : 0.45,
        ease: 'linear',
        overwrite: true,
      });
    }
  }
  ```

---

### F. Page Transitions (Barba.js Synchronous Mode)
- Executes page swaps in **sync mode** so outgoing and incoming DOM containers coexist briefly.
- Uses CSS custom properties `--trans-percent`, `--mask-percent`, and `--size-line` to create a geometric wipe and line expansion across the viewport.
- Disclosed GSAP timeline:
  ```javascript
  enterAnim(data) {
    return gsap.timeline()
      .fromTo('html',
        { '--trans-percent': '50%', '--mask-percent': '50%' },
        { '--trans-percent': '100%', '--mask-percent': '0%', duration: 0.8, ease: 'power1.out' })
      .fromTo('html',
        { '--size-line': this.widthLineVertical },
        { '--size-line': 0, duration: 0.8, ease: 'power1.out' }, '<=0');
  }
  leaveAnim(data) {
    return gsap.timeline({
      onStart: () => this.updateBeforeTrans(data),
      onComplete: () => this.updateAfterTrans(data)
    })
      .fromTo('html',
        { '--trans-percent': '0%', '--mask-percent': '0%' },
        { '--trans-percent': '50%', '--mask-percent': '50%', duration: 0.8, ease: 'power1.in' })
      .fromTo('html',
        { '--size--line': '0' },
        { '--size--line': this.widthLineVertical, duration: 0.8, ease: 'power1.in' }, '<=0');
  }
  ```

---

## 4. Key Performance Optimizations Documented
1. **Lazy Animation Initialization**: Heavy sections initialise only when nearing the viewport.
2. **Cap DPR on Canvas**: Restricting device pixel ratio (`Math.min(window.devicePixelRatio, 2)`) avoids rendering massive canvas buffers on Retina screens.
3. **GPU Compositing**: Animations are strictly restricted to `transform`, `opacity`, and SVG `clip-path`.
4. **Mobile Suspension**: Desktop pointer and canvas RAF loops are completely unmounted on touch screens.
5. **Memory Teardown**: Event listeners, GSAP timelines, and Lenis instances are completely disposed during page navigation.
