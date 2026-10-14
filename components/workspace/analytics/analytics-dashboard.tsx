"use client";
import { useMemo, useState } from "react";
import { PageLink } from "@/components/site-shell";
import { type Project, projectHref } from "@/lib/demo/projects";
import {
  aggregate,
  DEMO_CLOCK,
  formatValue,
  hasTelemetry,
  incident,
  metrics,
  ranges,
  telemetry,
  timestamp,
  type Metric,
  type Range,
} from "@/lib/demo/telemetry/telemetry";
import { HealthStatus } from "../project-visuals";
import { DetailDialog } from "./detail-dialog";
import { TimeSeries } from "./time-series";
export function AnalyticsDashboard({ project }: { project: Project }) {
  const [range, setRange] = useState<Range>("24h"),
    [metric, setMetric] = useState<Metric>("p95");
  const [comparison, setComparison] = useState(true),
    [serviceId, setServiceId] = useState("");
  const [drawer, setDrawer] = useState<string | null>(null),
    [status, setStatus] = useState("all");
  const buckets = useMemo(
    () => telemetry(project, range, serviceId),
    [project, range, serviceId],
  );
  const previous = useMemo(
    () => telemetry(project, range, serviceId, true),
    [project, range, serviceId],
  );
  const summary = aggregate(buckets, serviceId),
    baseline = aggregate(previous, serviceId);
  const services = project.services.map((service) => ({
    ...service,
    metrics: aggregate(telemetry(project, range, service.id), service.id),
  }));
  const selected = services.find((s) => s.id === drawer);
  const visibleIncident =
    (!serviceId || serviceId === incident.serviceId) && status !== "resolved";
  if (!hasTelemetry(project))
    return (
      <section id="analytics" className="an-empty an-panel">
        <span className="an-eyebrow">Analytics · demo data</span>
        <h2>
          {project.local
            ? "Your project is ready for its first signal"
            : project.monitoringStatus === "disconnected"
              ? "Collector disconnected"
              : project.monitoringStatus === "pending"
                ? "Awaiting telemetry"
                : "Detailed telemetry is not included in this sample"}
        </h2>
        <p>
          {project.local
            ? "Local demo project. No live connection. Creating a project does not create traffic."
            : project.monitoringStatus !== "connected"
              ? "No telemetry has been received for this connection. Health is unknown; there is no traffic to plot."
              : "This project has a dated inventory snapshot. The complete analytics and investigation scenario is available in Payment Gateway."}
        </p>
        <p>
          To connect a real project later: configure a collector, verify service
          identity, then validate incoming signals. This frontend does not
          provision those connections.
        </p>
        <PageLink
          className="ws-button"
          href="/projects/northstar/payment-gateway#analytics"
        >
          Explore Payment Gateway →
        </PageLink>
      </section>
    );
  return (
    <div className="an-dashboard">
      <section id="analytics" aria-labelledby="analytics-title">
        <div className="an-section-heading">
          <div>
            <span className="an-eyebrow">01 / Operational analytics</span>
            <h2 id="analytics-title">Understand the signal.</h2>
          </div>
          <span className="an-demo">Synthetic telemetry</span>
        </div>
        <div className="an-alert">
          <span className="an-badge">P2 · Degraded</span>
          <div>
            <strong>Settlement workers need attention</strong>
            <p>
              Queue depth: 1,420 messages at 09:26. Review the incident and its
              supporting evidence.
            </p>
          </div>
          <button className="ws-button" onClick={() => setDrawer("incident")}>
            Inspect incident ↗
          </button>
        </div>
        <div className="an-toolbar">
          <label>
            Selected period
            <select
              aria-label="Time range"
              value={range}
              onChange={(e) => setRange(e.target.value as Range)}
            >
              {Object.entries(ranges).map(([key, r]) => (
                <option key={key} value={key}>
                  Last {r.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Service scope
            <select
              aria-label="Service scope"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              <option value="">Project ingress</option>
              {project.services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="an-check">
            <input
              type="checkbox"
              checked={comparison}
              onChange={(e) => setComparison(e.target.checked)}
            />
            Compare previous period
          </label>
          <span className="an-resolution">
            Auto resolution
            <br />
            <strong>
              {ranges[range].bucket < 60
                ? `${ranges[range].bucket} seconds`
                : `${ranges[range].bucket / 60} minutes`}
            </strong>
          </span>
        </div>
        <p className="an-clock">
          Fixed demo clock:{" "}
          <time dateTime={new Date(DEMO_CLOCK).toISOString()}>
            14 Oct 2026 · 09:30 UTC
          </time>
          <br />
          {timestamp(buckets[0].start)} — {timestamp(DEMO_CLOCK)} ·{" "}
          {serviceId ? "Service operations" : "Project ingress requests"}
        </p>
        <div className="an-metrics">
          {(Object.keys(metrics) as Metric[]).map((key) => {
            const delta = summary[key] - baseline[key];
            return (
              <button
                key={key}
                className="an-metric"
                aria-pressed={metric === key}
                onClick={() => setMetric(key)}
                style={
                  { "--series": metrics[key].color } as React.CSSProperties
                }
              >
                <span className="an-metric-label">
                  {metrics[key].label}
                  <span aria-hidden="true">{metric === key ? "●" : "↗"}</span>
                </span>
                <strong data-testid={`metric-${key}`}>
                  {formatValue(key, summary[key])}{" "}
                  <small>{metrics[key].unit}</small>
                </strong>
                <span className="an-delta">
                  {comparison
                    ? `${delta > 0 ? "↑ +" : delta < 0 ? "↓ " : "↔ "}${formatValue(key, delta)} ${key === "errorRate" || key === "sli" ? "pp" : metrics[key].unit} vs previous`
                    : "Selected period summary"}
                </span>
                <span className="an-metric-context">
                  {metrics[key].context}
                </span>
              </button>
            );
          })}
        </div>
        <section
          className="an-panel an-primary-chart"
          aria-labelledby="chart-title"
        >
          <div className="an-section-heading">
            <div>
              <span className="an-eyebrow">Selected metric</span>
              <h3 id="chart-title">{metrics[metric].label}</h3>
            </div>
            <span>
              {ranges[range].label} ·{" "}
              {serviceId
                ? project.services.find((s) => s.id === serviceId)?.name
                : "Project ingress"}
            </span>
          </div>
          <TimeSeries
            key={`${range}-${serviceId}`}
            buckets={buckets}
            previous={previous}
            metric={metric}
            comparison={comparison}
            serviceId={serviceId}
            onIncident={() => setDrawer("incident")}
          />
          <p className="an-footnote">
            Values summarize each bucket. Percentiles use merged latency
            distributions. A brief incident can be diluted in longer windows;
            select 15 minutes to inspect its onset.
          </p>
        </section>
      </section>
      <section
        className="an-panel"
        id="services"
        aria-labelledby="service-title"
      >
        <div className="an-section-heading">
          <div>
            <span className="an-eyebrow">02 / Service breakdown</span>
            <h2 id="service-title">Find the affected service.</h2>
          </div>
          {serviceId && (
            <button className="ws-button" onClick={() => setServiceId("")}>
              Clear service filter
            </button>
          )}
        </div>
        <p>
          Selected period: {ranges[range].label}. Service operations are
          separate populations; they do not sum to project ingress.
        </p>
        <div
          className="an-table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Service analytics"
        >
          <table className="an-service-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Health now</th>
                <th>Rate (ops/s)</th>
                <th>Error rate</th>
                <th>p95</th>
                <th>Last telemetry</th>
                <th>Incidents</th>
              </tr>
            </thead>
            <tbody>
              {services
                .filter((s) => !serviceId || s.id === serviceId)
                .map((s) => (
                  <tr key={s.id}>
                    <th>
                      <button
                        className="an-text-button"
                        onClick={() => setDrawer(s.id)}
                      >
                        {s.name} ↗
                      </button>
                      <small>{s.technology}</small>
                    </th>
                    <td>
                      <HealthStatus health={s.health} />
                    </td>
                    <td>{formatValue("throughput", s.metrics.throughput)}</td>
                    <td>{formatValue("errorRate", s.metrics.errorRate)}%</td>
                    <td>{s.metrics.p95} ms</td>
                    <td>14 Oct · 09:30 UTC</td>
                    <td>
                      {s.id === incident.serviceId ? (
                        <button
                          className="an-text-button"
                          onClick={() => setDrawer("incident")}
                        >
                          1 · P2
                        </button>
                      ) : (
                        "0"
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      <section
        id="incidents"
        className="an-panel"
        aria-labelledby="incidents-title"
      >
        <div className="an-section-heading">
          <div>
            <span className="an-eyebrow">03 / Incident register</span>
            <h2 id="incidents-title">From signal to investigation.</h2>
          </div>
          <label>
            Status
            <select
              aria-label="Incident status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </label>
        </div>
        {visibleIncident ? (
          <article className="an-incident-row">
            <div>
              <span className="an-badge">P2 · Degraded</span>
              <span className="an-status">Investigating</span>
              <h3>
                <button
                  className="an-text-button"
                  onClick={() => setDrawer("incident")}
                >
                  {incident.title} ↗
                </button>
              </h3>
              <p>
                Queue Worker · Started 14 Oct, 09:26 UTC · 4 minutes active at
                demo clock
              </p>
              <span className="mono">{incident.reference}</span>
            </div>
            <PageLink
              className="ws-button ws-primary"
              href={`${projectHref(project)}/incidents/${incident.id}`}
            >
              Open investigation →
            </PageLink>
          </article>
        ) : (
          <p role="status">
            No incidents match this service and status. Try Project ingress and
            All statuses.
          </p>
        )}
      </section>
      <DetailDialog
        drawer
        open={drawer !== null}
        title={selected ? selected.name : incident.reference}
        onClose={() => setDrawer(null)}
      >
        {selected ? (
          <>
            <p>
              {selected.technology} · {selected.id}
            </p>
            <HealthStatus health={selected.health} />
            <dl className="an-facts">
              <div>
                <dt>Request rate · {ranges[range].label}</dt>
                <dd>
                  {formatValue("throughput", selected.metrics.throughput)} ops/s
                </dd>
              </div>
              <div>
                <dt>Error rate</dt>
                <dd>{formatValue("errorRate", selected.metrics.errorRate)}%</dd>
              </div>
              <div>
                <dt>p95 latency</dt>
                <dd>{selected.metrics.p95} ms</dd>
              </div>
              <div>
                <dt>Last sample telemetry</dt>
                <dd>14 Oct 2026 · 09:30 UTC</dd>
              </div>
            </dl>
            <p>
              {selected.id === incident.serviceId
                ? "P2 incident: settlement queue backlog. Inspect database locks before considering capacity changes."
                : "No active incident is assigned to this service. This does not rule out an unobserved dependency issue."}
            </p>
            <button
              className="ws-button ws-primary"
              onClick={() => {
                setServiceId(selected.id);
                setDrawer(null);
              }}
            >
              Filter analytics to this service
            </button>
            {selected.id === incident.serviceId && (
              <PageLink
                className="ws-button"
                href={`${projectHref(project)}/incidents/${incident.id}`}
              >
                Open investigation →
              </PageLink>
            )}
          </>
        ) : (
          <>
            <span className="an-badge">P2 · Degraded · Investigating</span>
            <h3>{incident.title}</h3>
            <p>{incident.trigger}. Observed: 1,420 messages.</p>
            <dl className="an-facts">
              <div>
                <dt>Affected service</dt>
                <dd>Queue Worker</dd>
              </div>
              <div>
                <dt>Started</dt>
                <dd>14 Oct 2026 · 09:26 UTC</dd>
              </div>
              <div>
                <dt>Duration at demo clock</dt>
                <dd>4 minutes active</dd>
              </div>
              <div>
                <dt>Investigation</dt>
                <dd>{incident.investigation} · Awaiting operator review</dd>
              </div>
            </dl>
            <p>
              Leading hypothesis: database write-lock contention after release
              v2.14.0. Four evidence records support review; the blocking
              transaction remains unknown.
            </p>
            <PageLink
              className="ws-button ws-primary"
              href={`${projectHref(project)}/incidents/${incident.id}`}
            >
              Open investigation →
            </PageLink>
          </>
        )}
      </DetailDialog>
    </div>
  );
}
