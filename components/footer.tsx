"use client";
import { useId, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ElevationDrawing, Mark } from "./artwork";
import { ArrowLink, PageLink } from "./site-shell";

export function FinalCTA() {
  const ref = useRef<HTMLElement>(null),
    id = useId().replaceAll(":", "");
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".ink-edge",
          {
            attr: {
              d: "M-150 -180 Q500 -100 1150 -180 L1150 -200 L-150 -200Z",
            },
          },
          {
            attr: { d: "M-150 820 Q500 680 1150 820 L1150 -200 L-150 -200Z" },
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 45%",
              end: "bottom 55%",
              scrub: 1,
            },
          },
        );
      });
      return () => media.revert();
    },
    { scope: ref },
  );
  return (
    <section className="final-cta technical-corners" ref={ref} id="contact">
      <div className="section-number mono">
        <span>[06.00]</span>
        <span>HERON AI / NEXT STEPS</span>
      </div>
      <div className="cta-copy">
        <span className="eyebrow">YOUR NEXT PROJECT, WITH HERON</span>
        <h2>
          See what Heron can
          <br />
          do in your model
        </h2>
        <p>See how an agent can become part of your design process.</p>
        <ArrowLink href="https://heronaiapp.com/contact-us" external>
          Book a demo
        </ArrowLink>
      </div>
      <svg
        className="ink-art"
        viewBox="0 0 1000 620"
        role="img"
        aria-label="Architectural sketch revealing its rendered facade as you scroll"
      >
        <defs>
          <filter
            id={`bleed-${id}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency=".045 .055"
              numOctaves="3"
              seed="5"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="75"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation="1.4" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="2.2" intercept="-.6" />
            </feComponentTransfer>
          </filter>
          <mask
            id={`ink-${id}`}
            maskUnits="userSpaceOnUse"
            x="-150"
            y="-200"
            width="1300"
            height="1100"
          >
            <path
              className="ink-edge"
              d="M-150 820 Q500 680 1150 820 L1150 -200 L-150 -200Z"
              fill="white"
              filter={`url(#bleed-${id})`}
            />
          </mask>
        </defs>
        <ElevationDrawing shaded={false} />
        <g mask={`url(#ink-${id})`}>
          <ElevationDrawing />
        </g>
      </svg>
      <div className="section-number mono">
        <span>FROM FIRST SKETCH TO FINAL DETAIL</span>
        <span>DRAWN TOGETHER ↗</span>
      </div>
    </section>
  );
}
export function Footer() {
  const ref = useRef<HTMLElement>(null),
    svg = useRef<SVGSVGElement>(null),
    lens = useRef<SVGCircleElement>(null),
    ring = useRef<SVGCircleElement>(null),
    id = useId().replaceAll(":", "");
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        "(pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const element = svg.current!;
          gsap.set(lens.current, { attr: { r: 0 } });
          let x = 700,
            y = 130,
            tx = 700,
            ty = 130,
            rx = 700,
            ry = 130,
            running = false;
          const tick = () => {
            x += (tx - x) * 0.09;
            y += (ty - y) * 0.09;
            rx += (tx - rx) * 0.15;
            ry += (ty - ry) * 0.15;
            lens.current?.setAttribute("cx", String(x));
            lens.current?.setAttribute("cy", String(y));
            ring.current?.setAttribute("cx", String(rx));
            ring.current?.setAttribute("cy", String(ry));
            if (Math.hypot(tx - x, ty - y) < 0.05) {
              gsap.ticker.remove(tick);
              running = false;
            }
          };
          const move = (e: PointerEvent) => {
            const box = element.getBoundingClientRect();
            tx = ((e.clientX - box.left) / box.width) * 1400;
            ty = ((e.clientY - box.top) / box.height) * 260;
            if (!running) {
              running = true;
              gsap.ticker.add(tick);
            }
          };
          const enter = () => {
            const r = (160 / element.getBoundingClientRect().width) * 1400;
            gsap.to(lens.current, {
              attr: { r },
              duration: 0.55,
              overwrite: true,
            });
            gsap.to(ring.current, {
              attr: { r: r * 1.05 },
              opacity: 0.3,
              duration: 0.55,
              overwrite: true,
            });
          };
          const leave = () => {
            gsap.to(lens.current, {
              attr: { r: 0 },
              duration: 0.8,
              overwrite: true,
            });
            gsap.to(ring.current, {
              opacity: 0,
              duration: 0.5,
              overwrite: true,
            });
          };
          element.addEventListener("pointermove", move);
          element.addEventListener("pointerenter", enter);
          element.addEventListener("pointerleave", leave);
          return () => {
            gsap.ticker.remove(tick);
            element.removeEventListener("pointermove", move);
            element.removeEventListener("pointerenter", enter);
            element.removeEventListener("pointerleave", leave);
            gsap.killTweensOf([lens.current, ring.current]);
          };
        },
      );
      return () => media.revert();
    },
    { scope: ref },
  );
  return (
    <footer className="footer" data-dark ref={ref}>
      <div className="footer-grid">
        <div className="footer-statement">
          <h3>
            An AI agent that
            <br />
            works inside your
            <br />
            design tools
          </h3>
          <p>
            Less busywork.
            <br />
            More room for design.
          </p>
        </div>
        <div>
          <span className="eyebrow">COMPANY</span>
          <PageLink href="/">Home</PageLink>
          <Link href="/#about">About us</Link>
          <a
            href="https://heronaiapp.com/contact-us"
            target="_blank"
            rel="noreferrer"
          >
            Contact us ↗
          </a>
        </div>
        <div>
          <span className="eyebrow">PRODUCT</span>
          <Link href="/#platforms">Inside your model</Link>
          <PageLink href="/heron-dashboard">Heron Dashboard</PageLink>
          <a
            href="https://heronaiapp.com/pricing"
            target="_blank"
            rel="noreferrer"
          >
            Pricing ↗
          </a>
        </div>
        <div>
          <span className="eyebrow">RESOURCES</span>
          <Link href="/heron-dashboard#faq">Questions & answers</Link>
          <Link href="/#workflow">How Heron works</Link>
          <Link href="/#use-cases">Made for your practice</Link>
        </div>
        <div className="footer-symbol">
          <Mark />
        </div>
      </div>
      <div className="footer-details">
        <span className="mono">YOUR MODEL. YOUR TOOLS. CONNECTED.</span>
        <span>Architecture, with intelligence.</span>
        <span className="mono">EST. 2026 / REV. 01</span>
      </div>
      <svg
        ref={svg}
        className="footer-wordmark"
        viewBox="0 0 1400 260"
        aria-label="Heron AI"
        role="img"
      >
        <defs>
          <mask id={`footer-${id}`}>
            <rect width="1400" height="260" fill="black" />
            <circle ref={lens} cx="700" cy="130" r="1400" fill="white" />
          </mask>
        </defs>
        <g fill="none" stroke="#9a9a92" strokeWidth=".6">
          <path d="M20 30h1360M20 230h1360" strokeDasharray="2 5" />
          {Array.from({ length: 15 }, (_, i) => (
            <path key={i} d={`M${25 + i * 97} 18v224`} strokeDasharray="2 5" />
          ))}
          <text
            x="24"
            y="216"
            fontSize="227"
            fontWeight="650"
            letterSpacing="-10"
            textLength="1344"
            lengthAdjust="spacingAndGlyphs"
          >
            HERON AI
          </text>
        </g>
        <g mask={`url(#footer-${id})`}>
          <text
            x="24"
            y="216"
            fontSize="227"
            fontWeight="650"
            letterSpacing="-10"
            textLength="1344"
            lengthAdjust="spacingAndGlyphs"
            fill="#e0e0da"
          >
            HERON AI
          </text>
          <path d="M27 90h1345M27 180h1345" stroke="#282828" strokeWidth=".6" />
        </g>
        <circle
          ref={ring}
          cx="700"
          cy="130"
          r="160"
          fill="none"
          stroke="#e0e0da"
          opacity="0"
          strokeWidth=".6"
        />
      </svg>
      <div className="footer-legal mono">
        <span>© 2026 HERON AI · CONCEPT RECREATION</span>
        <span>
          ORIGINAL CONCEPT BY{" "}
          <a href="https://www.bear.plus/" target="_blank" rel="noreferrer">
            BEARPLUS ↗
          </a>
        </span>
        <a href="#main">BACK TO TOP ↑</a>
      </div>
    </footer>
  );
}
