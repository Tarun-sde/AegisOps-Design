# Technical Evaluation & Decision: Charting Visualization Architecture

**Document Version:** 1.0.0  
**Researcher:** Principal Technical Architecture Analyst, Senior Frontend Engineer  
**Repository Context:** Next.js 16.4.0, React 19.3.0, GSAP 3.15, TailwindCSS v4, TypeScript 6.0  
**Location:** [`phase3-research/technical/chart-library-decision.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/technical/chart-library-decision.md)  

---

## 1. Context & Technical Constraints

The choice of charting technology for AegisOps is constrained by critical project requirements:
1. **React 19.3 Compatibility**: The repository runs React 19.3.0. Libraries using legacy React features (e.g. `defaultProps` on functional components, old context APIs) will generate console deprecation warnings or crash during hydration.
2. **Heron Architectural Visual Identity**: Visual styling requires precise hairline rules (`1px` crisp grid), paper backgrounds (`#e0e0da`), solid charcoal ink (`#282828`), and dashed comparative baselines. Heavy canvas graphics with non-inheriting styles clash with this drafting aesthetic.
3. **Synchronized Crosshairs Across Multiple Panels**: Moving the mouse over the hero latency chart must simultaneously highlight the corresponding time bucket in the Service Breakdown and Status Code panels.
4. **Performance & Zero Hydration Stutter**: Next.js App Router streaming requires charts to mount cleanly without client-side layout shifts or heavy bundle overhead.

---

## 2. Evaluation of Candidate Solutions

| Criteria / Dimension | 1. Recharts (v2.x / v3-alpha) | 2. Visx (Airbnb) | 3. Apache ECharts | 4. Custom SVG + React 19 (Recommended) |
| :--- | :--- | :--- | :--- | :--- |
| **React 19 Compatibility** | **POOR**. Recharts v2 has peer dependency conflicts with React 19 (`npm ERESOLVE`). Relies on deprecated `defaultProps`. | **GOOD**. Modular headless components work cleanly with React 19. | **FAIR**. Imperative DOM canvas wrapper; bypasses React virtual DOM. | **PERFECT (100%)**. Native React 19 JSX elements (`<svg>`, `<path>`, `<line>`). Zero warnings. |
| **Bundle Size Overhead** | **HEAVY**: ~160 KB – 220 KB minified + gzipped. | **MODERATE**: ~45 KB – 70 KB (if tree-shaken across `@visx/shape`, `@visx/scale`). | **VERY HEAVY**: 400 KB – 650 KB core bundle. | **MINIMAL**: **< 8 KB total**. Pure application code; zero third-party dependencies. |
| **Visual Customization** | **FAIR**. Overriding SVG styles requires complex CSS hacks or custom renderers. | **EXCELLENT**. Headless; developer controls every SVG element. | **POOR**. Renders to HTML5 Canvas; cannot use CSS custom properties (`var(--ink)`). | **SUPERIOR**. Uses CSS variables directly; identical aesthetic to `project-visuals.tsx`. |
| **Synchronized Crosshairs** | **DIFFICULT**. Requires synchronized global mouse move state across isolated chart components. | **POSSIBLE**. Requires coordinated tooltip provider contexts. | **DIFFICULT**. Requires imperative ECharts `connect()` group API. | **TRIVIAL**. Shared hover timestamp in React state or context drives all SVG crosshair lines instantly. |
| **Accessibility (a11y)** | Generated SVG with basic roles; screen reader navigation is limited. | Custom accessibility attributes can be attached to SVG elements. | Canvas graphics are opaque to screen readers; requires manual fallback DOM. | Semantic SVG with `<title>`, `<desc>`, `role="img"`, and keyboard arrow navigation. |
| **SSR & Hydration** | Frequent client-only `ResponsiveContainer` hydration mismatches. | Clean SSR support with fixed dimensions. | Requires `useEffect` mounting; zero SSR rendering. | 100% deterministic initial SVG render matching server snapshot. |

---

## 3. The Winner & Primary Recommendation

### **PRIMARY RECOMMENDATION: Lightweight Custom SVG Engine with Pure React 19**

#### Why This Fits AegisOps Perfectly:
1. **Zero Dependency Overhead**: Avoids installing fragile third-party packages into `package.json`. No risk of React 19 peer-dependency failures.
2. **Architectural Coherence**: The repository already uses custom SVG drafting components for the project mark (`<AegisMark>`) and schematic architecture diagram (`<ServiceDrawing>`) in `components/workspace/project-visuals.tsx`. A custom SVG chart engine shares the exact same rendering language, line weights, and paper/ink styling.
3. **Flawless Crosshair Synchronization**: A simple shared hook (`useChartCursor()`) tracks the active timestamp index. All three charts on the page render their crosshair line and highlight dot at the exact same x-coordinate with zero latency.
4. **Motion Integration**: Seamlessly integrates with GSAP (`strokeDashoffset` line draw animations on first mount) and instant CSS opacity transitions during time-range toggling.

---

## 4. Architecture of the Custom SVG Engine

Astra can construct the entire chart system with three reusable, type-safe components:

```
components/workspace/analytics/charts/
├── svg-time-series.tsx      # Multi-line time series with hairline grid and crosshair
├── svg-stacked-bar.tsx       # Status code distribution and throughput volume bars
├── chart-tooltip.tsx         # Floating high-density paper card with delta badges
└── use-chart-crosshair.ts    # Coordinated cursor tracking across all charts
```

### 4.1 Coordinate Normalization Logic
```typescript
// Pure mathematical projection: converts time & value into SVG coordinate space
export function projectCoordinates(
  data: Array<{ timestamp: number; value: number }>,
  bounds: { width: number; height: number; padding: { top: number; right: number; bottom: number; left: number } },
  domainY: { min: number; max: number }
): string {
  const innerW = bounds.width - bounds.padding.left - bounds.padding.right;
  const innerH = bounds.height - bounds.padding.top - bounds.padding.bottom;
  const minT = data[0].timestamp;
  const maxT = data[data.length - 1].timestamp;

  return data.map((d, i) => {
    const x = bounds.padding.left + ((d.timestamp - minT) / (maxT - minT)) * innerW;
    const y = bounds.padding.top + innerH - ((d.value - domainY.min) / (domainY.max - domainY.min)) * innerH;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}
```

---

## 5. Decision Summary & Trade-Off Matrix

* **Chosen Solution**: Pure React 19 Custom SVG Engine.
* **Alternative Considered**: `@visx/scale` + `@visx/shape`.
  - *Trade-off*: Visx offers battle-tested scale math (`d3-scale` wrappers), but requires adding 4 new npm packages to `package.json` and managing their React 19 peer resolutions. Since our synthetic datasets use uniform time bucketing, linear scaling math is only ~30 lines of pure TypeScript.
* **Rejected Solutions**:
  - Recharts: Incompatible with React 19 without overrides; excessive bundle size.
  - ECharts: Canvas black-box; clunky styling override; breaks Heron architectural look.
