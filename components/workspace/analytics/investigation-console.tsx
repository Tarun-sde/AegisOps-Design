"use client";
import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { PageLink } from "@/components/site-shell";
import { projectHref } from "@/lib/demo/projects";
import {
  evidence,
  hasTelemetry,
  hypotheses,
  incident,
  queueReadings,
  spans,
  timestamp,
} from "@/lib/demo/telemetry/telemetry";
import { MissingResource, useWorkspaceData } from "../workspace-shell";
import { DetailDialog } from "./detail-dialog";
const timeline = [
  [
    "09:12:00",
    "Release v2.14.0 deployed",
    "Batch size increased to 50. Temporal association only; causality remains unverified.",
  ],
  [
    "09:18:00",
    "Queue depth begins rising",
    "820 messages; lock waits increase while consumers fall behind.",
  ],
  [
    "09:21:00",
    "Queue crosses alert threshold",
    "1,100 messages. Queue stays above 1,000 for the following five minutes.",
  ],
  [
    "09:24:30",
    "Slow settlement trace captured",
    "642 ms total; a nested database write span accounts for 612 ms.",
  ],
  [
    "09:25:48",
    "Write-lock timeout logged",
    "Worker pool reports failure to acquire a settlement_records write lock.",
  ],
  [
    "09:26:00",
    "P2 incident opened",
    "Five-minute threshold breached; observed queue depth is 1,420.",
  ],
  [
    "09:26:30",
    "Investigation started",
    "Four synthetic evidence records collected and two hypotheses assembled.",
  ],
  [
    "09:28:10",
    "Analysis ready for review",
    "No confirmed root cause and no remediation executed.",
  ],
];
const query = `-- Review with the database owner before running in any real environment.
SELECT pid, wait_event_type, wait_event,
       pg_blocking_pids(pid) AS blocking_pids,
       clock_timestamp() - xact_start AS transaction_age
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0
ORDER BY xact_start;`;
export function InvestigationConsole() {
  const { project, state, workspace } = useWorkspaceData();
  const { incidentId } = useParams<{ incidentId: string }>();
  const [activeEvidence, setActiveEvidence] = useState<string>(evidence[0].id);
  const [action, setAction] = useState<string | null>(null),
    [review, setReview] = useState(""),
    [simulated, setSimulated] = useState(false);
  const explorer = useRef<HTMLElement>(null);
  if (!workspace) return <MissingResource />;
  if (!state.ready && !project)
    return <p role="status">Reading local project…</p>;
  if (!project) return <MissingResource project />;
  if (!hasTelemetry(project) || incidentId !== incident.id)
    return (
      <div className="an-empty">
        <h1 tabIndex={-1}>Incident not found</h1>
        <p>This incident is not part of the selected project.</p>
        <PageLink className="ws-button" href={projectHref(project)}>
          Back to project
        </PageLink>
      </div>
    );
  const current = evidence.find((e) => e.id === activeEvidence)!;
  const cite = (id: string) => {
    setActiveEvidence(id);
    explorer.current?.focus({ preventScroll: true });
    explorer.current?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  return (
    <div className="an-investigation">
      <div className="ws-project-context">
        <PageLink href={`${projectHref(project)}#incidents`}>
          ← Back to Payment Gateway console
        </PageLink>
        <span className="an-demo">Fixed demo · 14 Oct 2026, 09:30 UTC</span>
      </div>
      <nav className="an-breadcrumb" aria-label="Incident breadcrumb">
        <PageLink href={projectHref(project)}>Payment Gateway</PageLink>
        <span>/</span>
        <PageLink href={`${projectHref(project)}#incidents`}>
          Incidents
        </PageLink>
        <span>/</span>
        <span aria-current="page">{incident.reference}</span>
      </nav>
      <header className="an-investigation-header">
        <span className="an-eyebrow">
          Incident intelligence / {incident.investigation}
        </span>
        <h1 tabIndex={-1}>Follow the evidence.</h1>
        <p>{incident.title}</p>
        <div className="an-inline">
          <span className="an-badge">P2 · Degraded</span>
          <span className="an-status">Investigating</span>
          <span>Queue Worker · Production</span>
          <span>4 minutes active</span>
        </div>
      </header>
      <div className="an-review-note">
        <strong>Analysis ready · operator review required</strong>
        <p>
          Two hypotheses, four linked records. This is a prewritten synthetic
          investigation, not a live AI diagnosis. The incident remains open.
        </p>
      </div>
      <div className="an-investigation-grid">
        <section className="an-hypotheses" aria-labelledby="hypotheses-title">
          <div className="an-section-heading">
            <div>
              <span className="an-eyebrow">01 / Hypotheses</span>
              <h2 id="hypotheses-title">What may explain this?</h2>
            </div>
          </div>
          {hypotheses.map((h, index) => (
            <article
              className={`an-panel an-hypothesis ${index === 0 ? "an-leading" : ""}`}
              key={h.id}
              id={h.id}
            >
              <div className="an-inline">
                <span className="mono">{h.id}</span>
                <span className="an-certainty">{h.certainty}</span>
              </div>
              <h3>{h.title}</h3>
              <p>{h.explanation}</p>
              <h4>Supporting evidence</h4>
              <div className="an-citations">
                {h.supporting.map((id) => (
                  <button
                    key={id}
                    onClick={() => cite(id)}
                    aria-label={`Inspect ${id} for ${h.id}`}
                  >
                    {id} ↗
                  </button>
                ))}
              </div>
              <h4>Contradictory signals & caveats</h4>
              <p>{h.contradictory}</p>
              {index === 1 && (
                <button
                  className="an-text-button"
                  onClick={() => cite("EV-LOG-401")}
                >
                  Inspect contradictory record EV-LOG-401 ↗
                </button>
              )}
              <h4>Still unknown</h4>
              <p>{h.missing}</p>
            </article>
          ))}
        </section>
        <aside className="an-panel an-timeline" aria-label="Incident timeline">
          <span className="an-eyebrow">02 / Timeline · UTC</span>
          <h2>A change, then a backlog.</h2>
          <ol>
            {timeline.map(([at, title, description]) => (
              <li key={at}>
                <time dateTime={`2026-10-14T${at}Z`}>{at}</time>
                <details open={at === "09:26:00"}>
                  <summary>{title}</summary>
                  <p>{description}</p>
                </details>
              </li>
            ))}
          </ol>
          <p className="an-footnote">
            All events: 14 Oct 2026. Trigger: {incident.trigger}.
          </p>
        </aside>
      </div>
      <section
        ref={explorer}
        tabIndex={-1}
        className="an-panel an-evidence"
        id="evidence"
        aria-labelledby="evidence-title"
      >
        <div className="an-section-heading">
          <div>
            <span className="an-eyebrow">03 / Evidence explorer</span>
            <h2 id="evidence-title">Inspect the source records.</h2>
          </div>
          <span>4 synthetic records</span>
        </div>
        <div
          className="an-evidence-tabs"
          role="tablist"
          aria-label="Evidence types"
        >
          {evidence.map((item, index) => (
            <button
              key={item.id}
              role="tab"
              id={`tab-${item.id}`}
              aria-controls="evidence-record"
              aria-selected={item.id === activeEvidence}
              tabIndex={item.id === activeEvidence ? 0 : -1}
              onClick={() => setActiveEvidence(item.id)}
              onKeyDown={(event) => {
                const next =
                  event.key === "ArrowRight"
                    ? (index + 1) % evidence.length
                    : event.key === "ArrowLeft"
                      ? (index + evidence.length - 1) % evidence.length
                      : event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? evidence.length - 1
                          : -1;
                if (next < 0) return;
                event.preventDefault();
                setActiveEvidence(evidence[next].id);
                document.getElementById(`tab-${evidence[next].id}`)?.focus();
              }}
            >
              {item.type} <span>1</span>
            </button>
          ))}
        </div>
        <div
          className="an-evidence-record"
          role="tabpanel"
          id="evidence-record"
          aria-labelledby={`tab-${current.id}`}
          tabIndex={0}
          key={current.id}
        >
          <div className="an-inline">
            <strong className="mono">{current.id}</strong>
            <span>{current.service}</span>
            <time dateTime={current.at}>
              {timestamp(Date.parse(current.at))}
            </time>
          </div>
          <h3>{current.title}</h3>
          <p className={current.type === "Logs" ? "an-log" : ""}>
            {current.body}
          </p>
          {current.type === "Traces" && (
            <div className="an-waterfall" aria-label="Nested trace spans">
              {spans.map((span) => (
                <div key={span.name}>
                  <span>{span.name}</span>
                  <div>
                    <i
                      style={{
                        marginLeft: `${(span.offset / 642) * 100}%`,
                        width: `${(span.duration / 642) * 100}%`,
                      }}
                    />
                  </div>
                  <strong>{span.duration} ms</strong>
                </div>
              ))}
            </div>
          )}
          {current.type === "Metrics" && (
            <div className="an-table-scroll">
              <table>
                <caption>Correlated observations, 14 Oct 2026</caption>
                <thead>
                  <tr>
                    <th>UTC</th>
                    <th>Queue messages</th>
                    <th>Lock wait (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {queueReadings.map((r) => (
                    <tr key={r.at}>
                      <th>{r.at}</th>
                      <td>{r.depth.toLocaleString("en-US")}</td>
                      <td>{r.lockMs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="an-citations">
            <span>Used by:</span>
            {hypotheses
              .filter(
                (h) =>
                  h.supporting.includes(current.id) ||
                  (h.id === "HYP-02" && current.id === "EV-LOG-401"),
              )
              .map((h) => (
                <a key={h.id} href={`#${h.id}`}>
                  {h.id} ↑
                </a>
              ))}
          </div>
        </div>
      </section>
      <section className="an-panel an-actions" aria-labelledby="actions-title">
        <div className="an-section-heading">
          <div>
            <span className="an-eyebrow">04 / Recommended next action</span>
            <h2 id="actions-title">Identify the blocking transaction.</h2>
          </div>
          <span className="an-demo">Human review required</span>
        </div>
        <p>
          Start with a read-only lock inspection to test HYP-01. More workers
          may increase contention; do not assume scaling will resolve it.
        </p>
        <div className="an-action-grid">
          <article>
            <span>01 · Diagnose</span>
            <h3>Review active locks query</h3>
            <p>
              Inspect blocked processes, their blockers and transaction age with
              the database owner.
            </p>
            <button
              className="ws-button ws-primary"
              onClick={() => setAction("query")}
            >
              Review diagnostic SQL ↗
            </button>
          </article>
          <article>
            <span>02 · Explore</span>
            <h3>Model worker capacity</h3>
            <p>
              Compare a proposed change from 2 to 3 replicas, each with 16
              consumer threads.
            </p>
            <button
              className="ws-button"
              onClick={() => {
                setSimulated(false);
                setAction("scale");
              }}
            >
              Simulate worker scaling ↗
            </button>
          </article>
          <article>
            <span>03 · Plan</span>
            <h3>Review rollback readiness</h3>
            <p>
              Check batch compatibility and in-flight settlements before
              considering a rollback.
            </p>
            <button className="ws-button" onClick={() => setAction("rollback")}>
              View rollback checklist ↗
            </button>
          </article>
        </div>
        <div className="an-review-controls">
          <label>
            Local review status
            <select
              aria-label="Review decision"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            >
              <option value="">Awaiting review</option>
              <option value="more">More evidence needed</option>
              <option value="reviewed">
                Reviewed — diagnosis remains unconfirmed
              </option>
            </select>
          </label>
          <p role="status">
            {review
              ? "Review noted for this page session only. No incident state or production system was changed."
              : "No action has been approved or executed."}
          </p>
        </div>
      </section>
      <DetailDialog
        open={action !== null}
        title={
          action === "query"
            ? "Review diagnostic SQL"
            : action === "scale"
              ? "Worker scaling simulation"
              : "Rollback review checklist"
        }
        onClose={() => setAction(null)}
      >
        {action === "query" ? (
          <>
            <p>
              Read-only proposal for HYP-01. Review access and query impact with
              the database owner. This demo cannot connect to a database.
            </p>
            <pre>{query}</pre>
            <p>
              Next evidence needed: the blocking PID, transaction age and
              affected relation. Do not terminate sessions from this proposal.
            </p>
          </>
        ) : action === "scale" ? (
          <>
            <p>
              Frontend capacity calculation only: 2 replicas × 16 threads = 32
              consumer slots. Proposed: 3 × 16 = 48 slots (+50%). Consumer
              threads are not pods.
            </p>
            <button
              className="ws-button ws-primary"
              onClick={() => setSimulated(true)}
            >
              Calculate proposed capacity
            </button>
            {simulated && (
              <div role="status" className="an-review-note">
                <strong>48 theoretical consumer slots</strong>
                <p>
                  Throughput and recovery cannot be predicted without measuring
                  database contention. No workers were scaled. The incident
                  remains investigating.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <p>Operator approval is required before any real rollback.</p>
            <ol>
              <li>Confirm release v2.14.0 and the prior compatible build.</li>
              <li>
                Check in-flight settlement batches and idempotency guarantees.
              </li>
              <li>
                Review database schema compatibility and a staging rollback.
              </li>
              <li>Assign an owner, approval and a monitoring window.</li>
            </ol>
            <button
              className="ws-button"
              disabled
              title="Production modifications require an authorized backend connection"
            >
              Production rollback unavailable
            </button>
            <p>
              No backend connection exists. This checklist executes nothing.
            </p>
          </>
        )}
      </DetailDialog>
    </div>
  );
}
