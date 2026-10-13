# Implementation Recommendations for Astra (Next.js & React)

## 1. Next.js App Router vs Barba.js

The original Heron AI site was authored in Webflow and used **Barba.js** in synchronous mode to orchestrate page transitions across static multi-page documents.

> [!WARNING]
> **Critical Astra Architecture Rule**:
> **Do NOT install or attempt to use Barba.js in Next.js App Router.**  
> Next.js uses client-side route segment caching, React Server Components (RSC), and its own router (`useRouter`, `<Link>`). Barba.js assumes traditional static HTML fetches and will corrupt React DOM reconciliation.

### Recommended Next.js Transition Architecture:
Implement an architectural coordinate wipe transition using a global transition overlay component:
```tsx
// components/transitions/PageTransitionOverlay.tsx
'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function PageTransitionOverlay({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Coordinate wipe entrance on route change
    const tl = gsap.timeline();
    tl.fromTo('html', 
      { '--trans-percent': '50%', '--mask-percent': '50%' },
      { '--trans-percent': '100%', '--mask-percent': '0%', duration: 0.8, ease: 'power1.out' }
    );
  }, [pathname]);

  return (
    <>
      <div ref={overlayRef} className="page-transition-curtain" />
      {children}
    </>
  );
}
```

---

## 2. GSAP & ScrollTrigger Lifecycle with `@gsap/react`

To prevent memory leaks, phantom ScrollTrigger pins, and duplicated event listeners across Next.js page navigations:
1. Use the official `@gsap/react` hook (`useGSAP`):
   ```tsx
   import { useGSAP } from '@gsap/react';
   import gsap from 'gsap';
   import { ScrollTrigger } from 'gsap/ScrollTrigger';

   gsap.registerPlugin(ScrollTrigger);

   export function PinnedMapSection() {
     const container = useRef<HTMLDivElement>(null);

     useGSAP(() => {
       const tl = gsap.timeline({
         scrollTrigger: {
           trigger: container.current,
           start: 'top top',
           end: '+=6300', // 700dvh
           pin: true,
           scrub: 1,
         }
       });

       tl.to('.observe-layer', { opacity: 0 })
         .to('.advise-layer', { opacity: 1, color: '#fa3600' })
         .to('.act-layer', { opacity: 1 })
         .to('.learn-layer', { opacity: 1 });
     }, { scope: container });

     return <div ref={container} className="home-map">...</div>;
   }
   ```
2. **Auto-Revert**: `useGSAP` automatically calls `ctx.revert()` when the component unmounts, cleaning up all pins, inline styles, and event handlers.

---

## 3. Unified Clock Integration in React

Place the central Lenis + GSAP ticker synchronization in a root client provider:
```tsx
// providers/SmoothScrollProvider.tsx
'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0); // Ensures high accuracy without skipping frames

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

---

## 4. Cross-Browser Safeguards for SVG Filters

- **Safari / WebKit `feDisplacementMap` Bug**:  
  WebKit occasionally drops hardware acceleration on `<feDisplacementMap>` when rendered inside nested CSS transforms.
  - **Fix**: Apply `transform: translateZ(0)` and `will-change: transform` to the `<svg>` container.
- **`prefers-reduced-motion` Compliance**:
  Always check user preferences via `window.matchMedia('(prefers-reduced-motion: reduce)')`. When active:
  - Disable SVG distortion filter, replacing it with an instant linear opacity dissolve.
  - Disable the canvas pointer trail.
  - Collapse transition timeline durations to `0s`.
