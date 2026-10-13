# Tech Stack Recommendations for Astra

## 1. Target Technology Stack

| Layer | Recommended Technology | Justification | Verified in Live Reference? | Licensing Status |
| :--- | :--- | :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | Modern React server components, static generation, file-based routing | N/A (Original was Webflow) | MIT |
| **Language** | **TypeScript 5.x** | Strict typing for coordinate math, bounding rects, and animation state | N/A | Apache 2.0 |
| **Styling** | **Tailwind CSS 3.4+** | High utility speed, custom design token mapping, hairline border utilities | Webflow CSS was used | MIT |
| **Animation Engine** | **GSAP 3.12+ & ScrollTrigger** | Exact match for Heron's scrubbed timelines, ticker loop, and coordinate math | **VERIFIED** (gsap@3.12.5 in live site) | Standard GreenSock License |
| **React GSAP Wrapper**| **`@gsap/react`** | Guarantees automatic component teardown and avoids memory leaks | Recommended for React | Standard GreenSock License |
| **Smooth Scroll** | **`lenis` (v1.1+)** | High performance smooth scrolling with ticker integration | **VERIFIED** (lenis@1.1.5 in live site) | MIT |
| **Canvas Graphics** | **HTML5 Canvas 2D** | 9px square dot, reticle, velocity-sensitive trailing cursor | **VERIFIED** (Canvas 2D in case study) | Native Web API |
| **Vector Graphics** | **Inline SVG & Filter Primitives**| Ink bleed displacement, circular lens masks, blueprint grid lines | **VERIFIED** (SVG in live site) | Native Web API |
| **Carousel / Sliders** | **Swiper 11** | Used for Why Heron feature card pagination and testimonials | **VERIFIED** (swiper@11 in live site) | MIT |

---

## 2. Technologies Explicitly NOT Recommended

### 1. Three.js / WebGL Shaders
- **Analysis**: The case study explicitly confirmed that Bearplus considered WebGL shaders for the drag reveal, but chose **plain DOM and coordinate math** because a 2D drawing visual language was lighter, more responsive, and easier to maintain.
- **Rule for Astra**: **Do NOT install Three.js, React Three Fiber, or Babylon.js.** There are zero 3D scenes on the website.

### 2. Barba.js
- **Analysis**: Barba.js was used in Webflow for multi-page static transitions. In Next.js App Router, Barba will conflict with Next.js client-side navigation.
- **Rule for Astra**: **Do NOT install Barba.js.** Use Next.js layout transitions or GSAP overlay curtains instead.

### 3. Heavy UI Component Libraries (MUI, Ant Design, Chakra UI)
- **Analysis**: Heron AI's aesthetic is strictly custom architectural drafting rules and typography. Generic UI libraries add unnecessary CSS bloat and clash with the bespoke design tokens.

---

## 3. Package Manifest Recommendation for Astra

When Astra initializes the package:
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "gsap": "^3.12.5",
    "@gsap/react": "^2.1.1",
    "lenis": "^1.1.5",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.3",
    "postcss": "^8.4.38",
    "autoprefixer": "^10.4.19"
  }
}
```
