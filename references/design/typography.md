# Heron AI Typography Specification

## 1. Overview & Visual Identity
Heron AI's typographic system bridges two distinct aesthetic worlds:
1. **Architectural Editorial Weight**: Display headlines possess confident, grounded proportions that avoid the cliché "futuristic/crypto AI" aesthetic.
2. **Technical Instrument Precision**: Micro-typography, coordinates, building code references, and metadata resemble architectural drawing sheets, blueprints, and BIM viewport heads-up displays.

---

## 2. Typeface Hierarchy

| Role | Font Family | Weights Observed | Case / Transform | Verified Source |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Display & Text** | **BT Grotesk** | `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold) + Italics | Standard title/sentence case | Bearplus / Webflow CDN (`BTGrotesk-*.woff2`) |
| **Monospace / Metadata** | **Geistmono** (Geist Mono) | `500` (Medium) | `uppercase` for tags, codes, indices | Vercel Geist Mono (`GeistMono-Medium.woff2`) |
| **System Fallback** | `Arial, sans-serif` / `monospace` | Browser defaults | Normal | Native fallback stack |

> [!IMPORTANT]
> **Licensing & Astra Implementation Rule**:
> `BT Grotesk` is a commercial proprietary font licensed to the original creators. Astra **must not** redistribute `BT Grotesk` commercial font files.
> **Recommended Open-Source Alternatives**:
> - **Space Grotesk** (Google Fonts) — Offers crisp geometric cuts matching architectural line drawings.
> - **Inter** (Google Fonts / Variable) — Extremely robust neutral grotesque with tabular figure support.
> - **Uncut Sans** — Editorial brutalist geometric grotesque.
> - **Geist Mono** (SIL Open Font License) — Already fully open source and can be used directly for metadata and building code annotations.

---

## 3. Measured Typographic Hierarchy (Desktop 1440 × 900 Viewport)

All measurements below were extracted directly from live computed styles using Playwright:

### H1 (Page Title / Hero Title)
- **Selector**: `h1`, `.home-hero-title`, `.product-hero-title`
- **Font Family**: `"BT Grotesk", Arial, sans-serif`
- **Font Size**: `46.6667px` (`~3.5rem` at desktop root rem scale)
- **Line Height**: `46.6667px` (`1.0` tight tracking)
- **Font Weight**: `700` (Bold)
- **Letter Spacing**: `-0.933333px` (`-0.02em` optical compression)
- **Color**: `#282828` (`rgb(40, 40, 40)`)
- **Key Headline Break**:
  - Home: `"An AI agent that works inside your design tools"`
  - Dashboard: `"See every change, flag, and approval in one place"`

### H2 (Section Headings & Editorial Statements)
- **Selector**: `h2`
- **Font Family**: `"BT Grotesk", Arial, sans-serif`
- **Font Size**: `33.3333px` to `40.0px`
- **Line Height**: `33.3333px` to `40.0px` (`1.0`)
- **Font Weight**: `600` (SemiBold)
- **Letter Spacing**: `-0.666667px` to `-0.8px` (`-0.02em`)
- **Color**: `#282828` or `#b4b4b0` (for secondary/muted headers)
- **Observed Section Headings**:
  - Intro: `"THE REPETITIVE PARTS OF MODELLING SHOULDN'T EAT YOUR DAY. HERON HANDLES THE FIDDLY, MANUAL WORK SO YOU CAN STAY FOCUSED ON THE DESIGN, NOT THE SOFTWARE."` (Uppercase editorial block)
  - Problem: `"Your design tools do what you tell them, nothing more"`
  - Map / Workflow: `"RUN AN AGENT NATIVELY IN YOUR MODEL"`
  - Features: `"BUILT TO WORK THE WAY YOU DO"`
  - Use Cases: `"MADE FOR THE PEOPLE IN THE MODEL"`
  - Final CTA: `"SEE WHAT HERON CAN DO IN YOUR MODEL"`

### H3 / Card Titles
- **Selector**: `h3`, `[class*="title-h3"]`
- **Font Size**: `20.0px` to `24.0px`
- **Line Height**: `24.0px` (`1.2`)
- **Font Weight**: `600`
- **Letter Spacing**: `-0.4px`
- **Color**: `#282828`

### Body Text (Paragraphs & Descriptions)
- **Selector**: `p`, `.txt-body`
- **Font Family**: `"BT Grotesk", Arial, sans-serif`
- **Font Size**: `13.3333px`
- **Line Height**: `17.3333px` (`1.3`)
- **Font Weight**: `500` (Medium)
- **Letter Spacing**: `-0.266667px` (`-0.02em`)
- **Color**: `rgba(40, 40, 40, 0.72)` (`--content--terriary`)

### Metadata, Coordinates, Code Tags, & Badges
- **Selector**: `.tag`, `.tag-txt`, `[class*="index"]`, `[class*="code"]`
- **Font Family**: `"Geistmono", "Geist Mono", monospace`
- **Font Size**: `10.0px` to `11.0px`
- **Line Height**: `12.0px` to `14.0px`
- **Font Weight**: `500` (Medium)
- **Letter Spacing**: `-0.1px` to `0px`
- **Text Transform**: `uppercase`
- **Color**: `#fa3600` (when alerting violation) or `#72726f` (neutral metadata)

---

## 4. Root Font Scaling & Fluid Typography

The site utilizes a dynamic root rem scaling mechanism in combination with Webflow standard rem units:

$$\text{Root Font Size} \approx \frac{\text{Viewport Width}}{172.8}$$

### Measured Root Font-Sizes Across Devices:
- **1920 × 1080 (Desktop Wide)**: `rootFontSize = 11.1111px` $\rightarrow$ H1 = `62.22px`
- **1440 × 900 (Desktop Standard)**: `rootFontSize = 8.33333px` $\rightarrow$ H1 = `46.67px`
- **1024 × 768 (Tablet Landscape)**: `rootFontSize = 5.92593px` $\rightarrow$ H1 = `33.19px`
- **834 × 1112 (Tablet Portrait)**: `rootFontSize = 10.0000px` $\rightarrow$ H1 = `40.00px` (resets to fixed base)
- **390 × 844 (Mobile Standard)**: `rootFontSize = 9.92366px` $\rightarrow$ H1 = `31.76px`
- **375 × 812 (Mobile Compact)**: `rootFontSize = 9.54198px` $\rightarrow$ H1 = `30.53px`

---

## 5. Astra Implementation Guidelines
1. Configure Tailwind CSS with the base tokens:
   ```ts
   fontFamily: {
     sans: ['var(--font-primary)', 'Arial', 'sans-serif'],
     mono: ['var(--font-mono)', 'monospace'],
   }
   ```
2. Enable fluid typography or clamp-based scaling in `globals.css`:
   ```css
   :root {
     --font-primary: 'Space Grotesk', -apple-system, sans-serif;
     --font-mono: 'Geist Mono', monospace;
   }
   h1 {
     font-size: clamp(2rem, 3.25vw, 3.88rem);
     line-height: 1.0;
     letter-spacing: -0.02em;
     font-weight: 700;
   }
   ```
