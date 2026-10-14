# AegisOps Interactive Chart Interaction Specification

**Document Version:** 1.0.0  
**Researcher:** Senior Observability UX Designer, Motion & Interaction Specialist  
**Reference Alignment:** Stripe Chart Hover Dynamics (`stripe-home-charts.png`), Heron Drafting Interactions  
**Location:** [`phase3-research/aegisops/chart-interaction-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/aegisops/chart-interaction-spec.md)  

---

## 1. Interaction Principles

1. **Deterministic Snapping**: Freeform floating cursors create cognitive fatigue. The crosshair must snap magnetically to the nearest discrete temporal bucket ($t_i$).
2. **Synchronized Multi-Chart Tracking**: Hovering over any point on the hero chart simultaneously positions vertical tracking rules on the Service Breakdown and Status Code charts.
3. **Enterprise Restraint**: No springy bounce or rubber-banding. All hover transitions use crisp, high-speed transitions ($\le 50\text{ms}$).
4. **Touch & Keyboard Parity**: Touch scrub and keyboard arrow keys offer full inspection fidelity without requiring a physical mouse.

---

## 2. Desktop Mouse & Cursor Interaction

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ HERO TIME-SERIES INTERACTION WIREFRAME                                             │
│                                                                                   │
│ 500ms ┤                                               ▲ [!] Incident Pin          │
│       │                                               │                           │
│       │                                ┌────────────────────────────────┐         │
│ 300ms ┤                                │ 14 OCT 2026 · 09:24 UTC        │         │
│       │                                │ ● CURRENT:     482 ms [SPIKE]  │         │
│       │                                │ ╌ BASELINE:    142 ms          │         │
│ 100ms ┤                                │ Δ DELTA:       +239.4% [CRIT]  │         │
│       │                                └────────────────────────────────┘         │
│   0ms ┴───────────────────────────────────────│───────────────────────────────    │
│       08:30                 09:00             │ (Crosshair) 09:30 UTC             │
└───────────────────────────────────────────────┼───────────────────────────────────┘
                                                │ (Synchronized line tracks down)
┌───────────────────────────────────────────────┼───────────────────────────────────┐
│ SERVICE BREAKDOWN CHART                       │                                   │
│ ── Queue Worker: 420 ms                       │                                   │
│ ── Payment API:   48 ms                       │                                   │
│ ── Database:      14 ms                       │                                   │
└───────────────────────────────────────────────┴───────────────────────────────────┘
```

### 2.1 Crosshair Mechanics
- **Visual Presentation**: Vertical hairline rule (`stroke: #282828`, `stroke-width: 1px`, `opacity: 0.85`).
- **Snapping**: On mousemove, calculate normalized ratio $x / W$. Find index $k = \text{round}\left( \frac{x - \text{padLeft}}{\text{innerW}} \times (N - 1) \right)$. Snap crosshair x-coordinate exactly to bucket $k$.
- **Intersection Dot**: Render a small circular marker (`r: 4px`, `fill: #ffffff`, `stroke: #282828`, `stroke-width: 2px`) at the exact $(x, y)$ coordinate of the active series.

### 2.2 Tooltip Card Anatomy
- **Container**: White paper card (`background: #ffffff`, `border: 1px solid #b3b3af`, `padding: 10px 14px`, `border-radius: 0px` technical drafting box).
- **Positioning**:
  - Positioned 12px to the right of the crosshair.
  - If crosshair $x > 75\%$ of chart width, flip tooltip to render on the **left** of the crosshair to prevent overflow.
- **Content Hierarchy**:
  1. `Timestamp`: Monospace uppercase label (`14 OCT 2026 · 09:24:00 UTC`).
  2. `Active Value`: Solid charcoal bullet + metric quantity (`● 482 ms`).
  3. `Baseline Value`: Dashed bullet + comparative quantity (`╌ 142 ms`).
  4. `Delta Badge`: High-contrast pill showing directional change (`+239.4% ANOMALY` in `#fa3600` alert red).

### 2.3 Incident Overlay Pins
- Positioned on the horizontal timeline axis at the exact incident start timestamp (`09:26 UTC`).
- **Visual Form**: Drafting triangle pin (`▼`) with exclamation badge `!`.
- **Hover Behavior**: Tooltip expands with secondary section:
  ```
  [!] OPERATIONAL INCIDENT TRIGGERED
  ID: INC-2026-1014-01 | Severity: P1 (Degraded)
  Symptom: Settlement queue backlog exceeded threshold
  [Click pin to open incident quick-drawer]
  ```
- **Click Behavior**: Opens the slide-out **Incident Quick-Inspection Drawer**.

---

## 3. Mobile Touch & Responsive Scrubbing

On touch viewports (`< 768px`):
1. **Touch-Drag Scrubbing**: Touching and dragging along the chart scrubs the vertical crosshair continuously across buckets.
2. **Persistent Tooltip**: Releasing touch pins the tooltip in place. A dedicated `×` button or tapping outside dismisses the pinned tooltip.
3. **Chart Height Optimization**: Chart height reduces from `300px` to `220px` to preserve vertical viewport space for summary metrics.

---

## 4. Keyboard Accessibility (a11y)

1. The chart container is keyboard-focusable with `tabIndex={0}` and semantic attributes:
   ```html
   <div 
     role="region" 
     aria-label="Request Latency Time Series Chart. Use Left and Right arrow keys to inspect intervals."
     tabindex="0"
   >
   ```
2. **Key Bindings**:
   - `ArrowRight`: Advances crosshair to the next bucket ($t_{i+1}$).
   - `ArrowLeft`: Steps crosshair to the previous bucket ($t_{i-1}$).
   - `Home`: Jumps to the beginning of the active window ($t_0$).
   - `End`: Jumps to the latest scenario bucket ($t_{\text{latest}}$).
   - `Enter` / `Space`: If an incident pin is present at the active bucket, opens the incident drawer.
