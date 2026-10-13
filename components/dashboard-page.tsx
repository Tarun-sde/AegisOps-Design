"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowLink, useSiteScroll } from "./site-shell";
import { PracticeStrip } from "./home-page";
import { ProductPreview, featureNames } from "./product-preview";
import { FinalCTA, Footer } from "./footer";
import { FloorPlan } from "./artwork";

const features = [
  [
    "Every project in<br/>one place",
    "See what Heron is doing across all your active projects without opening each one.",
  ],
  [
    "Approve or reject<br/>in a click",
    "Edits waiting on your say-so sit in one queue, so nothing gets missed or held up.",
  ],
  [
    "A record of<br/>every change",
    "See what Heron changed, when, and why, so you can trace any edit back to its reason.",
  ],
  [
    "Know who<br/>approved what",
    "Keep the whole team in the loop with a shared view of activity, decisions, and responsibility.",
  ],
  [
    "Set the rules once",
    "Tell Heron your firm’s standards and it applies them everywhere, learning as it goes.",
  ],
];
function FeatureSequence() {
  const scrollTo = useSiteScroll();
  const ref = useRef<HTMLElement>(null),
    trigger = useRef<ScrollTrigger | null>(null),
    last = useRef(0);
  const [active, setActive] = useState(0);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        "(min-width: 992px) and (prefers-reduced-motion: no-preference)",
        () => {
          const panels = gsap.utils.toArray<HTMLElement>(".feature-panel");
          gsap.set(panels.slice(1), { autoAlpha: 0, yPercent: 12 });
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: ref.current,
              start: () =>
                `top top+=${document.querySelector("header")!.offsetHeight + 8}`,
              end: () => `+=${innerHeight * 4}`,
              pin: true,
              pinSpacing: false,
              scrub: 0.8,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const next = Math.min(4, Math.floor(self.progress * 5));
                if (last.current !== next) {
                  last.current = next;
                  setActive(next);
                }
              },
            },
          });
          trigger.current = tl.scrollTrigger!;
          tl.to({}, { duration: 1 });
          for (let i = 1; i < 5; i++)
            tl.to(
              panels[i - 1],
              { autoAlpha: 0, yPercent: -12, duration: 0.18 },
              i,
            ).to(
              panels[i],
              { autoAlpha: 1, yPercent: 0, duration: 0.25 },
              i + 0.05,
            );
          tl.to({}, { duration: 0.75 });
          return () => {
            trigger.current = null;
          };
        },
      );
      return () => media.revert();
    },
    { scope: ref },
  );
  const select = (i: number) => {
    if (trigger.current)
      scrollTo(
        trigger.current.start +
          ((i + 0.5) / 5) * (trigger.current.end - trigger.current.start),
      );
    else
      ref.current
        ?.querySelectorAll(".feature-panel")
        [i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="feature-track">
      <section className="feature-sequence" id="features" ref={ref}>
        <div className="features-heading">
          <span className="eyebrow">KEY FEATURES</span>
          <h2>
            Full oversight, no
            <br />
            digging around
          </h2>
        </div>
        <nav className="feature-tabs" aria-label="Dashboard features">
          {featureNames.map((name, i) => (
            <button
              key={name}
              aria-pressed={active === i}
              onClick={() => select(i)}
            >
              <span className="mono">[0{i + 1}]</span>
              {name}
            </button>
          ))}
        </nav>
        <div className="feature-panels">
          {features.map(([title, body], i) => (
            <article className="feature-panel" key={title} id={`feature-${i}`}>
              <span className="feature-index mono">[0{i + 1}]</span>
              <div className="feature-copy">
                <span className="eyebrow">{featureNames[i]}</span>
                <h3>
                  {title.split("<br/>").map((line, n) => (
                    <span key={line}>
                      {n > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </h3>
                <p>{body}</p>
              </div>
              <div className="feature-visual drafting-grid technical-corners">
                <ProductPreview variant={i} />
              </div>
            </article>
          ))}
        </div>
        <div
          className="feature-progress"
          style={{ transform: `scaleX(${(active + 1) / 5})` }}
        />
      </section>
    </div>
  );
}
const faqs = [
  [
    "Can I see Heron’s activity across all projects at once?",
    "Yes. One View brings the activity from your connected models together, including outstanding issues, proposed changes, and recent approvals.",
  ],
  [
    "How do I approve or reject Heron’s suggestions?",
    "Open the Approval Queue to inspect the proposed change in its model context. You choose whether to approve or reject it; changes wait for your decision. Try the interactive approval preview above.",
  ],
  [
    "Can I track what Heron changed and why?",
    "Full History keeps a clear record of edits and their rationale, so your team can trace a decision back to the original issue.",
  ],
  [
    "Can my team share the same dashboard?",
    "Team View shows the people involved in a project and the decisions they have made, giving everyone a shared picture of model activity.",
  ],
  [
    "Can I set my firm’s own standards?",
    "Firm Standards is designed to keep project rules and naming conventions consistent across connected models. Define a standard once and carry it through your workflow.",
  ],
];
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="faq-section" id="faq">
      <div>
        <span className="eyebrow">A FEW THINGS TO KNOW</span>
        <h2>
          Got questions?
          <br />
          We’ve got answers.
        </h2>
      </div>
      <div className="faq-list">
        {faqs.map(([q, a], i) => (
          <article key={q}>
            <button
              id={`faq-q-${i}`}
              aria-expanded={open === i}
              aria-controls={`faq-a-${i}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              {q}
              <span>{open === i ? "−" : "+"}</span>
            </button>
            <div
              id={`faq-a-${i}`}
              role="region"
              aria-labelledby={`faq-q-${i}`}
              className="faq-answer"
              hidden={open !== i}
            >
              <p>{a}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
export function DashboardPage() {
  return (
    <main id="main" className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="eyebrow">YOUR VIEW OVER EVERYTHING HERON DOES</span>
          <h1>
            See every
            <br />
            change, flag,
            <br />
            and approval in
            <br />
            one place
          </h1>
          <div className="dashboard-hero-bottom">
            <p>
              Heron Dashboard shows you what the agent is doing across all your
              projects: the issues it’s flagged, the edits it’s made, and what’s
              waiting for your approval.
            </p>
            <a href="#features" className="arrow-link">
              <span>Discover more</span>
              <span>↘</span>
            </a>
          </div>
        </div>
        <div className="dashboard-hero-art technical-corners">
          <ProductPreview hero />
          <span className="mono drawing-index">
            HERON DASHBOARD / ALL PROJECTS
          </span>
        </div>
      </section>
      <PracticeStrip />
      <FeatureSequence />
      <section className="three-steps">
        <div className="split-heading">
          <h2>
            From activity to oversight.
            <br />
            In 3 steps.
          </h2>
          <div>
            <p>
              Keep track of every change Heron makes, keep your team aligned,
              and move forward with confidence.
            </p>
            <span className="mono">[SCROLL TO CONTINUE]</span>
          </div>
        </div>
        <div className="oversight-art drafting-grid">
          <FloorPlan />
          <div className="oversight-product">
            <ProductPreview hero />
          </div>
        </div>
        <div className="steps-grid">
          {[
            [
              "Connect<br/>your Revit model",
              "Seamless BIM workflow integration with your existing projects and templates.",
            ],
            [
              "Run real-time<br/>compliance checks",
              "Compare your design with the requirements that matter, in the context of the whole model.",
            ],
            [
              "Resolve<br/>with confidence",
              "Review a clear recommendation and approve the next step when you’re ready.",
            ],
          ].map(([title, body], i) => (
            <article key={title}>
              <div className="section-label mono">
                <span>STEP</span>
                <span>[0{i + 1}]</span>
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
      <FAQ />
      <FinalCTA />
      <Footer />
      <div className="sr-only">
        <ArrowLink />
      </div>
    </main>
  );
}
