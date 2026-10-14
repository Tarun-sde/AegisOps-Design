# AegisOps Responsive & Mobile Observability Specification

**Document Version:** 1.0.0  
**Researcher:** Senior Observability UX Designer, Responsive Layout Specialist  
**Target Viewports:** 1920×1080, 1440×900, 1440×700, 1024×768, 834×1112, 390×844, 375×812  
**Location:** [`phase3-research/design/responsive-analytics-spec.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/design/responsive-analytics-spec.md)  

---

## 1. Viewport Adaptation Matrix

| Viewport Dimension | Device Archetype | Metric Card Grid | Hero Chart Height | Supporting Breakdowns | Service Table Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1920 × 1080** | Large Workstation | 6 Columns | `340px` | 2 Columns (Side-by-side) | Full Table (all 7 columns visible) |
| **1440 × 900** | Standard Laptop | 6 Columns | `300px` | 2 Columns | Full Table |
| **1440 × 700** | Short Laptop Display | 6 Columns | `240px` (Compact) | 2 Columns | Compact Row Height (36px) |
| **1024 × 768** | iPad Landscape / Small Laptop | 3 Columns × 2 Rows | `260px` | 2 Columns | Full Table |
| **834 × 1112** | iPad Portrait | 3 Columns × 2 Rows | `240px` | 1 Column (Stacked) | Horizontal Scroll Container |
| **390 × 844** | iPhone 14 / Modern Smartphone | 2 Columns × 3 Rows | `200px` | 1 Column (Stacked) | Responsive Stacked Cards or Scroll Table |
| **375 × 812** | iPhone Mini / Compact Mobile | 1 Column × 6 Rows | `180px` | 1 Column (Stacked) | Compact Stacked Cards |

---

## 2. Component Reflow Strategies

### 2.1 Metric Summary Cards Grid
```css
.ws-metric-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(6, 1fr);
}

@media (max-width: 1280px) {
  .ws-metric-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .ws-metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 440px) {
  .ws-metric-grid {
    grid-template-columns: 1fr;
  }
}
```

### 2.2 Time-Range Toolbar
On mobile screens (`< 768px`):
- The horizontal toolbar wraps or becomes a horizontally scrollable chip list (`overflow-x: auto`, `-webkit-overflow-scrolling: touch`).
- The fixed scenario clock badge wraps to a secondary row below the controls.

### 2.3 Service Table on Mobile
- Table wrapper uses `overflow-x: auto`.
- The first column (`Service Name`) uses sticky left positioning (`position: sticky; left: 0; background: var(--paper); z-index: 2`) so service identity remains visible while scrolling horizontally through throughput and latency columns.

### 2.4 Slide-Out Drawers
- Desktop (`>= 768px`): Right-anchored side drawer (`width: 520px; right: 0; top: 0; height: 100vh`).
- Mobile (`< 768px`): Bottom sheet (`width: 100vw; bottom: 0; max-height: 85vh; border-top: 1px solid var(--rule)`).

---

## 3. Strict Responsive Invariants

1. **Zero Accidental Horizontal Body Overflow**: `html, body` must never produce horizontal scrollbars.
2. **Touch Target Size**: All buttons, dropdown triggers, and incident pins must maintain a minimum touch bounding box of `44 × 44px`.
3. **Legible Typography**: Minimum font size on mobile is `11px` (monospace labels) and `14px` (body text).
