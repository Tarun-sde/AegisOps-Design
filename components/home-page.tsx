"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Hero } from "./hero";
import { Elevation, FloorPlan, Mark, Pavilion } from "./artwork";
import { ArrowLink, PageLink, useSiteScroll } from "./site-shell";
import { ProductPreview } from "./product-preview";
import { FinalCTA, Footer } from "./footer";

gsap.registerPlugin(ScrollTrigger, useGSAP);
export function SectionLabel({
  children,
  number,
}: {
  children: React.ReactNode;
  number: string;
}) {
  return (
    <div className="section-label mono">
      <span>{children}</span>
      <span>[{number}]</span>
    </div>
  );
}
export function PracticeStrip() {
  return (
    <div
      className="practice-strip"
      aria-label="Illustrative architecture practices"
    >
      {[
        "VANTAR",
        "NORTHLINE",
        "MERIDIAN",
        "ORIONIC",
        "FORMA STUDIO",
        "BLUEPRINT WORKS",
      ].map((name, i) => (
        <div key={name}>
          <span className={`practice-glyph glyph-${i}`} aria-hidden="true">
            {["⋈", "И", "Ⅿ", "⌘", "◬", "N"][i]}
          </span>
          <span>{name}</span>
        </div>
      ))}
    </div>
  );
}
const phases = [
  {
    name: "Observe",
    title: "A second pair of eyes.<br/>Always in your model.",
    body: "Heron watches your geometry as you design. It understands the model, so you can keep your attention on the bigger picture.",
    tag: "MODEL CONNECTED / MONITORING",
    code: "PROJECT A–01",
    detail: "32 elements inspected · All changes tracked",
  },
  {
    name: "Advise",
    title: "The right advice.<br/>Right where you need it.",
    body: "Issues surface in context, with a clear explanation and a proposed fix. No switching tools. No searching through a rulebook.",
    tag: "3 ISSUES REQUIRE ATTENTION",
    code: "IBC 1010.1.2.1",
    detail: "Door swing direction / Check egress clearance",
  },
  {
    name: "Act",
    title: "Your approval.<br/>Then the action.",
    body: "Review the proposed change before it happens. When you approve, Heron makes the edit directly inside your model.",
    tag: "PROPOSED EDIT / READY FOR REVIEW",
    code: "GEOMETRY UPDATE",
    detail: "Door swing adjusted · Clearance restored",
  },
  {
    name: "Learn",
    title: "Your standards.<br/>Built into every detail.",
    body: "Heron picks up the way your practice works. Every approved decision helps it understand your standards for the next project.",
    tag: "FIRM STANDARD / SAVED",
    code: "STANDARD 0042",
    detail: "Egress clearance · Applied to future reviews",
  },
];
function ModelWorkflow() {
  const scrollTo = useSiteScroll();
  const ref = useRef<HTMLElement>(null),
    trigger = useRef<ScrollTrigger | null>(null),
    lastPhase = useRef(0);
  const [active, setActive] = useState(0);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        "(min-width: 992px) and (prefers-reduced-motion: no-preference)",
        () => {
          const cards = gsap.utils.toArray<HTMLElement>(".workflow-copy");
          gsap.set(cards.slice(1), { autoAlpha: 0, y: 24 });
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: ref.current,
              start: () =>
                `top top+=${document.querySelector("header")!.offsetHeight + 8}`,
              end: () => `+=${innerHeight * 6}`,
              pin: true,
              pinSpacing: false,
              scrub: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const phase = Math.min(3, Math.floor(self.progress * 4));
                if (lastPhase.current !== phase) {
                  lastPhase.current = phase;
                  setActive(phase);
                }
              },
            },
          });
          trigger.current = tl.scrollTrigger!;
          tl.to(".scan-line", { y: 400, duration: 1, ease: "none" }, 0);
          for (let i = 1; i < 4; i++) {
            tl.to(cards[i - 1], { autoAlpha: 0, y: -24, duration: 0.15 }, i).to(
              cards[i],
              { autoAlpha: 1, y: 0, duration: 0.2 },
              i + 0.02,
            );
          }
          tl.fromTo(
            ".workflow-drawing .plan-issue-pins",
            { opacity: 0 },
            { opacity: 1, duration: 0.2 },
            1,
          )
            .to(
              ".workflow-drawing .plan-issue-pins",
              { opacity: 0, duration: 0.2 },
              2,
            )
            .to(
              ".editable-door",
              { attr: { d: "M423 191h54a54 54 0 0 1-54 54" }, duration: 0.65 },
              2,
            );
          tl.fromTo(
            ".workflow-alert",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.15 },
            1,
          )
            .to(".workflow-alert", { autoAlpha: 0, duration: 0.2 }, 2)
            .fromTo(
              ".geometry-fix",
              { scaleX: 0.1, autoAlpha: 0 },
              { scaleX: 1, autoAlpha: 1, duration: 0.65 },
              2,
            )
            .to(".geometry-fix", { autoAlpha: 0.25, duration: 0.2 }, 3)
            .fromTo(
              ".learned-standard",
              { autoAlpha: 0, y: 12 },
              { autoAlpha: 1, y: 0, duration: 0.2 },
              3,
            )
            .to({}, { duration: 0.8 });
          return () => {
            trigger.current = null;
          };
        },
      );
      return () => media.revert();
    },
    { scope: ref },
  );
  const goTo = (index: number) => {
    if (trigger.current) {
      scrollTo(
        trigger.current.start +
          ((index + 0.5) / 4) * (trigger.current.end - trigger.current.start),
      );
    } else {
      ref.current
        ?.querySelectorAll(".workflow-copy")
        [index]?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };
  return (
    <div className="workflow-track">
      <section
        ref={ref}
        className="model-workflow technical-corners"
        id="workflow"
      >
        <div className="workflow-heading">
          <SectionLabel number="03">
            RIGHT THERE WITH YOU / FOR THE WHOLE DESIGN
          </SectionLabel>
          <h2>
            Run an agent natively
            <br />
            in your model
          </h2>
        </div>
        <div className="workflow-body">
          <div className="workflow-drawing drafting-grid">
            <FloorPlan />
            <div className="scan-line" />
            <div className="workflow-alert mono">
              <b>01 / CODE VIOLATION</b>
              <span>
                IBC 1010.1.2.1
                <br />
                DOOR SWING DIRECTION
              </span>
            </div>
            <div className="geometry-fix mono">
              ✓ PROPOSED GEOMETRY / +120 MM
            </div>
            <div className="learned-standard mono">✓ FIRM STANDARD SAVED</div>
            <span className="drawing-index mono">
              LEVEL 01 / FLOOR PLAN / 1:100
            </span>
          </div>
          <div className="workflow-copy-stack">
            {phases.map((phase, i) => (
              <article
                className="workflow-copy"
                key={phase.name}
                aria-label={`${phase.name} phase`}
              >
                <span className="eyebrow">
                  [0{i + 1}] {phase.name}
                </span>
                <h3>
                  {phase.title.split("<br/>").map((text, n) => (
                    <span key={text}>
                      {n > 0 && <br />}
                      {text}
                    </span>
                  ))}
                </h3>
                <p>{phase.body}</p>
                <div className={`workflow-status ${i === 1 ? "warning" : ""}`}>
                  <span className="mono">{phase.tag}</span>
                  <strong>{phase.code}</strong>
                  <p>{phase.detail}</p>
                </div>
                <span className="mono scroll-hint">[SCROLL TO CONTINUE] ↓</span>
              </article>
            ))}
          </div>
        </div>
        <div className="phase-nav">
          {phases.map((phase, i) => (
            <button
              key={phase.name}
              onClick={() => goTo(i)}
              aria-pressed={active === i}
            >
              <span className="mono">[0{i + 1}]</span>
              {phase.name}
              <span>↗</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
function Platforms() {
  const [tool, setTool] = useState("Revit");
  return (
    <section id="platforms" className="platform-section">
      <div className="platform-main">
        <div
          className={`platform-plan tool-${tool.toLowerCase()} drafting-grid`}
          role="tabpanel"
          id="platform-panel"
          aria-labelledby={`tool-${tool}`}
        >
          <FloorPlan highlight={tool === "Revit" || tool === "ArchiCAD"} />
          <span className="viewport-badge mono">
            {tool.toUpperCase()} /{" "}
            {tool === "Rhino"
              ? "GEOMETRY & SURFACES"
              : tool === "SketchUp"
                ? "CONCEPT MODEL"
                : "LEVEL 01 · MODEL VIEW"}
          </span>
        </div>
        <div className="platform-copy">
          <span className="eyebrow">YOUR MODEL. YOUR TOOLS. CONNECTED.</span>
          <h2>
            Intelligence inside
            <br />
            the tools you know.
          </h2>
          <p>
            Heron runs inside your design software. It reads your model,
            understands your intent, and proposes changes with every action
            shown to you first.
          </p>
          <div
            className="platform-tabs"
            role="tablist"
            aria-label="Design platform"
          >
            {["Revit", "Rhino", "ArchiCAD", "SketchUp"].map((name, i) => (
              <button
                id={`tool-${name}`}
                key={name}
                role="tab"
                aria-selected={tool === name}
                aria-controls="platform-panel"
                tabIndex={tool === name ? 0 : -1}
                onClick={() => setTool(name)}
                onKeyDown={(e) => {
                  const names = ["Revit", "Rhino", "ArchiCAD", "SketchUp"];
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const next =
                      names[(i + (e.key === "ArrowRight" ? 1 : 3)) % 4];
                    setTool(next);
                    document.getElementById(`tool-${next}`)?.focus();
                  }
                }}
              >
                {name}
              </button>
            ))}
          </div>
          <ul className="capabilities">
            <li>
              Understands your geometry and intent.<span>⌖</span>
            </li>
            <li>
              Suggests fixes while you work.<span>✳</span>
            </li>
            <li>
              Edits only after your approval.<span>⊕</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="product-row">
        <div>
          <span className="eyebrow">[01]</span>
          <h3>Heron Chat Widget</h3>
        </div>
        <ProductPreview variant={1} />
        <div>
          <p>
            A conversation that stays inside your design tool. Ask about your
            model, review a suggestion, and approve the next step.
          </p>
          <ArrowLink href="https://heronaiapp.com/heron-chat-widget" external>
            Learn more
          </ArrowLink>
        </div>
      </div>
      <div className="product-row">
        <div>
          <span className="eyebrow">[02]</span>
          <h3>Heron Dashboard</h3>
        </div>
        <ProductPreview hero />
        <div>
          <p>
            Every project, flagged issue, and proposed change in one place. Keep
            an eye on the work without digging through it.
          </p>
          <ArrowLink>Learn more</ArrowLink>
        </div>
      </div>
    </section>
  );
}
function WhyHeron() {
  const [active, setActive] = useState(0);
  return (
    <section className="why-section" id="why">
      <div className="split-heading">
        <div>
          <span className="eyebrow">WHY US</span>
          <h2>
            Built to work
            <br />
            the way you do
          </h2>
        </div>
        <div>
          <p>
            Heron fits into your process instead of replacing it. It watches
            quietly, speaks up when something needs attention, and only acts
            when you say so.
          </p>
          <span className="mono">[YOU STAY IN CONTROL]</span>
        </div>
      </div>
      <div className="why-content">
        <div className="drafting-grid why-art">
          {active === 0 ? (
            <Elevation />
          ) : (
            <FloorPlan highlight={active === 1} />
          )}
          <span className="why-art-label mono">{phases[active].tag}</span>
        </div>
        <div className="why-steps">
          {phases.map((phase, i) => (
            <div className={active === i ? "active" : ""} key={phase.name}>
              <button
                aria-expanded={active === i}
                aria-controls={`why-${i}`}
                onClick={() => setActive(i)}
              >
                <span>0{i + 1}</span>
                {phase.name}
                <span>↗</span>
              </button>
              <div id={`why-${i}`} hidden={active !== i}>
                <p>{phase.body}</p>
                <span className="mono">{phase.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
const useCases = [
  [
    "Architects",
    "Hand the repetitive modelling to Heron and keep your focus on design.",
  ],
  [
    "Interior designers",
    "Explore layouts, fixtures, and clearances in the context of your model.",
  ],
  [
    "Landscape architects",
    "Develop grading, site elements, and connected outdoor spaces.",
  ],
  ["Engineers", "Surface coordination issues with discipline-specific checks."],
  [
    "BIM managers",
    "Keep models clean and consistent with your firm’s standards.",
  ],
  ["Drafters", "Spend less time on drawing cleanup and repetitive edits."],
  [
    "Design leads",
    "Maintain a shared approach to quality across the entire team.",
  ],
  ["Small firms", "Make room for more design without more repetitive work."],
];
function UseCases() {
  const [active, setActive] = useState<number | null>(0);
  return (
    <section className="use-cases" id="use-cases">
      <div className="use-case-art">
        <Pavilion />
      </div>
      <div className="use-case-copy">
        <span className="eyebrow">USE CASES</span>
        <h2>
          Made for
          <br />
          the people in
          <br />
          the model
        </h2>
        <div className="use-case-list">
          {useCases.map(([title, body], i) => (
            <div key={title}>
              <button
                aria-expanded={active === i}
                aria-controls={`persona-${i}`}
                onClick={() => setActive(active === i ? null : i)}
              >
                {title}
                <span>{active === i ? "−" : "+"}</span>
              </button>
              <p id={`persona-${i}`} hidden={active !== i}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function HomePage() {
  return (
    <main id="main">
      <Hero />
      <section className="intro" id="about">
        <SectionLabel number="01">MORE DESIGN. LESS REPETITION.</SectionLabel>
        <div className="intro-statement">
          <Mark />
          <h2>
            The repetitive parts of modelling shouldn’t eat your day.{" "}
            <span>
              Heron handles the fiddly, manual work so you can stay focused on
              the design, not the software.
            </span>
          </h2>
          <ArrowLink>Meet your new design partner</ArrowLink>
        </div>
        <div className="intro-baseline mono">
          <span>BUILT FOR THE PRACTICE OF ARCHITECTURE</span>
          <span>HUMAN INTENT / MACHINE PRECISION</span>
        </div>
      </section>
      <PracticeStrip />
      <section className="problem-section">
        <div className="split-heading">
          <div>
            <span className="eyebrow">PROBLEMS / [02]</span>
            <h2>
              Your design tools do
              <br />
              what you tell them,
              <br />
              nothing more
            </h2>
          </div>
          <p>
            Design software is powerful but passive. It waits for every
            instruction. The repeated edits, coordination checks, and cleanup
            all stay on you.
          </p>
        </div>
        <div className="problem-grid">
          {[
            [
              "Manual",
              "Every change<br/>is on you",
              "Every edit, one at a time. Even the ones you’ve made a hundred times before.",
            ],
            [
              "Disjointed",
              "AI help sits<br/>outside your model",
              "Copy, paste, and explain again. Generic tools don’t understand your project.",
            ],
            [
              "Blind",
              "Nothing watches<br/>for problems",
              "Issues sit quietly in the model until someone happens to notice.",
            ],
            [
              "Slow",
              "Small tasks pile<br/>up into lost days",
              "The repetitive work fills the time you should be spending on design.",
            ],
          ].map(([label, title, body], i) => (
            <article key={label}>
              <SectionLabel number={`0${i + 1}`}>{label}</SectionLabel>
              <div
                className={`problem-graphic graphic-${i}`}
                aria-hidden="true"
              >
                {i === 0 ? (
                  <FloorPlan />
                ) : i === 1 ? (
                  <>
                    <Mark />
                    <span>↔</span>
                    <Mark />
                  </>
                ) : i === 2 ? (
                  <div className="target-diagram">
                    <span>+</span>
                  </div>
                ) : (
                  <div className="clock-diagram">
                    <span />
                  </div>
                )}
              </div>
              <h3>
                {title.split("<br/>").map((line, n) => (
                  <span key={line}>
                    {n > 0 && <br />}
                    {line}
                  </span>
                ))}
              </h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <ModelWorkflow />
      <Platforms />
      <WhyHeron />
      <UseCases />
      <FinalCTA />
      <Footer />
      <PageLink href="/heron-dashboard" className="sr-only">
        Explore Heron Dashboard
      </PageLink>
    </main>
  );
}
