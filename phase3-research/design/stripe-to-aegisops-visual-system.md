# Visual Translation: Stripe Analytics Ergonomics in the Heron Design System

**Document Version:** 1.0.0  
**Researcher:** Senior Observability UX Designer, Design Systems Specialist  
**Design Sequence:** Heron AI (Visual Identity) → Vercel (Information Architecture) → Stripe (Data Density)  
**Location:** [`phase3-research/design/stripe-to-aegisops-visual-system.md`](file:///run/media/tarun/Tarun%20Files1/AegisOps/AegisOps%20Design/phase3-research/design/stripe-to-aegisops-visual-system.md)  

---

## 1. Visual Translation Manifesto

A common failure in dashboard design is copying an admired company's color palette (e.g. Stripe's royal blues and purple gradients) into an application with an established visual identity.

> [!CAUTION]
> **AegisOps is NOT Stripe**:
> - We adopt Stripe's **data density, mathematical clarity, crosshair tracking, dual-line comparison, and faceted filters**.
> - We strictly dress every pixel in **Heron's editorial architectural drafting language** (warm paper `#e0e0da`, solid charcoal ink `#282828`, hairline grid rules `#b3b3af`, and alert-restricted red `#fa3600`).

---

## 2. Color Token Translation Matrix

| Element / Context | Stripe Native Observed | AegisOps Heron Translation | Rationale & Token |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | Pure white `#ffffff` or dark slate `#1a1b25` | Warm Technical Parchment `#e0e0da` | `var(--paper)` |
| **Card / Surface Background** | Light gray `#f6f8fa` or container `#0a2156` | Elevated Soft Paper | `var(--ws-soft)`: `color-mix(in srgb, var(--paper), white 18%)` |
| **Primary Typography** | Deep charcoal `#30313d` | High-contrast Solid Charcoal `#282828` | `var(--ink)` |
| **Secondary Typography** | Muted slate `#687385` | Subdued Ink (72% opacity) | `var(--muted)`: `#282828b8` |
| **Grid Lines & Borders** | Soft border `#ebeef1` | Hairline Drafting Rule `#b3b3af` | `var(--rule)` (1px solid crisp hairline) |
| **Primary Chart Line** | Vibrant Purple `#635bff` or Blue `#0072e9` | Solid Charcoal Drafting Stroke | `#282828` (`stroke-width: 2px`) |
| **Comparison Baseline** | Faded lavender or gray dashed line | Muted Dashed Technical Hairline | `#8a8a84` (`stroke-width: 1px`, `stroke-dasharray: 4 4`) |
| **Operational Warning** | Amber `#e46602` | Technical Ochre `#9b6a24` | `var(--ws-ochre)` |
| **Operational Critical / Incident** | Scarlet `#df1b41` | Restricted Alert Red `#fa3600` | `var(--red)` (Strictly restricted to P1 incidents & alerts) |

---

## 3. Accessible Non-Color Series Differentiation

To ensure complete WCAG accessibility and immediate scannability on monochromatic technical surfaces, different data series must be distinguishable without relying exclusively on color:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SERIES STROKE & SYMBOL TAXONOMY                                                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Active Metric Series:       ────────────────────────────────  Solid stroke, 2px ink │
│ 2. Comparison Baseline Series: - - - - - - - - - - - - - - - - - Dashed hairline, 1px  │
│ 3. Median Latency (p50):       ································  Dotted hairline, 1px  │
│ 4. Tail Latency (p95):         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  Heavy solid, 2.5px    │
│ 5. Extreme Latency (p99):      - · - · - · - · - · - · - · - · - Dash-dot alert stroke│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Typography & Tabular Layout Hierarchy

1. **Headings & Metric Displays**:
   - `font-family: var(--font-sans)` ("Inter Variable").
   - `font-variant-numeric: tabular-nums` (all numbers maintain identical character widths, preventing jitter during hover scrubbing).
2. **Metadata, Status Labels & Identifiers**:
   - `font-family: var(--font-mono)` ("Geist Mono Variable").
   - Uppercase, letter-spacing: `0.02em`.
   - Used for timestamps, incident IDs (`INC-2026-1014-01`), evidence citations (`EV-LOG-401`), and units (`req/s`, `ms`, `%`).

---

## 5. Spacing & Density Rhythm

- **Grid Gap**: `12px` (dense metric cards), `16px` (panel separation).
- **Table Padding**: `10px 14px` per table cell.
- **Card Padding**: `16px 20px`.
- **Drawer Padding**: `20px 24px`.
- **Border Radius**: `0px` throughout (strict architectural drafting geometry; no bubbly rounded enterprise cards).
