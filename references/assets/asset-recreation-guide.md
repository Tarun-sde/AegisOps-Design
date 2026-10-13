# Asset Recreation Guide for Astra

## 1. Copyright Compliance & Ethical Reverse Engineering

> [!CAUTION]
> **Astra Mandate: Zero Proprietary Asset Copying**  
> All images, brand marks, and UI renders hosted on Bearplus and Heron AI CDNs are copyrighted commercial assets. Astra **must not** download and bundle these files into production code.  
> Instead, Astra will recreate original assets that preserve the exact compositional weight, aspect ratio, and interaction affordances of the reference.

---

## 2. Recreating the Hero Architectural Drawing

### A. Visual Anatomy
The hero image is not a generic stock illustration. It depicts an authentic architectural drafting sheet:
1. **Line Weights**:
   - Exterior perimeter walls: Thick solid strokes (`#282828`, `2.5px`).
   - Interior partitions: Medium strokes (`#414140`, `1.5px`).
   - Dimension lines & grid axes: Hairline dashed strokes (`#b3b3af`, `1px`, `stroke-dasharray: 4 4`).
   - Door swings: 90° circular arcs with radial door leafs.
2. **Metadata Callouts**:
   - Room labels: Monospace text (`Geist Mono`, `10px`, e.g., `CORE 01`, `EGRESS CORRIDOR`, `MECH ROOM 102`).
   - Elevation marks: Level indicators (`+14.50' FFE`).

### B. Interactive Issue Marker Map
When drafting the original vector SVG or HTML layout, attach normalized coordinate targets (`0.0` to `1.0` range) so the selection collision math functions seamlessly:
```typescript
export interface ViolationMarker {
  id: string;
  normalizedX: number; // 0.0 to 1.0 relative to drawing width
  normalizedY: number; // 0.0 to 1.0 relative to drawing height
  codeRef: string;     // e.g. "IBC 1015.3"
  title: string;       // e.g. "Guard Opening Limitation"
  detail: string;      // e.g. "Opening exceeds 4-inch sphere rule"
}

export const HERO_VIOLATIONS: ViolationMarker[] = [
  {
    id: 'viol-1',
    normalizedX: 0.385,
    normalizedY: 0.442,
    codeRef: 'IBC 1015.3',
    title: 'Guard Opening Limitation',
    detail: 'Required 42" guardrail height not met at stair opening.'
  },
  {
    id: 'viol-2',
    normalizedX: 0.624,
    normalizedY: 0.581,
    codeRef: 'IBC 1014.2',
    title: 'Handrail Height Discrepancy',
    detail: 'Handrail height below 34" minimum threshold.'
  },
  {
    id: 'viol-3',
    normalizedX: 0.781,
    normalizedY: 0.315,
    codeRef: 'ADA 404.2.4',
    title: 'Door Clearance Obstruction',
    detail: 'Maneuvering clearance on pull side is restricted by column.'
  }
];
```

---

## 3. Recreating the Dual Sketch & Render Assets (Ink Transition)

The scroll-driven ink transition depends on **two perfectly aligned companion images**:
1. **Base Layer (`workflow-observe-sketch.webp`)**:
   - Monochromatic architectural blueprint or pencil sketch.
   - White / paper background (`#e0e0da`) with charcoal wireframe drafting lines.
2. **Overlay Layer (`workflow-render-color.webp`)**:
   - Photorealistic or shaded architectural elevation / CAD model render.
   - Same camera perspective, focal length, and bounding crop.
3. **Alignment Rule**:
   - Both assets **must share identical aspect ratios (e.g. 3:2 or 16:9)** and pixel alignment. If the perspective shifts even 5 pixels, the ink transition will look like an accidental image swap rather than a drawing coming to life.

---

## 4. Recreating Dashboard Interface Previews (Pure HTML / SVG Strategy)

Rather than capturing bitmap graphics of the dashboard screens, Astra should implement them directly as **pure semantic React / Tailwind components**:
- **Why this is superior**:
  1. Zero bitmap blur on high-DPI / Retina monitors.
  2. Dynamic animations (e.g. status badge color transitions, checkmark pulses).
  3. No copyright risk whatsoever.
  4. Fully responsive without awkward letterboxing.
- **Components to Construct**:
  - `OneViewMatrixCard`: Table of active models (e.g., *Denver Tower*, *Hudson Pavilion*) with status chips: `INSPECTION ACTIVE`, `2 VIOLATIONS`, `APPROVED`.
  - `ApprovalQueueCard`: Diff preview box showing original geometry in dashed gray and suggested fix in bold red (`#fa3600`), flanked by `[Approve]` and `[Reject]` buttons.
  - `HistoryTimelineCard`: Chronological audit log with timestamps and rationale tags.
