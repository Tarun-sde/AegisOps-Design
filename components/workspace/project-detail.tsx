"use client";
import Link from "next/link";
import { PageLink, useSiteNavigate } from "@/components/site-shell";
import { type Project, projectHref, signalLabel } from "@/lib/demo/projects";
import { MissingResource, useWorkspaceData } from "./workspace-shell";
import { Selector } from "./selector";
import { HealthStatus, ServiceDrawing } from "./project-visuals";
import { ProjectActions } from "./project-card";
export function ServicesList({ project }: { project: Project }) {
  return (
    <section id="services" className="ws-detail-panel">
      <div className="ws-panel-heading">
        <h2>Service inventory</h2>
        <span className="mono">
          {project.services.length.toString().padStart(2, "0")} COMPONENTS
        </span>
      </div>
      {project.services.length ? (
        <ul className="ws-service-list">
          {project.services.map((s, i) => (
            <li key={s.id}>
              <span className="mono">
                [{(i + 1).toString().padStart(2, "0")}]
              </span>
              <div>
                <strong>{s.name}</strong>
                <small>{s.technology}</small>
              </div>
              <HealthStatus health={s.health} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="ws-panel-empty">
          No services configured. This local project has no connected
          infrastructure.
        </p>
      )}
    </section>
  );
}
export function ActivityFeed({ project }: { project: Project }) {
  return (
    <section id="activity" className="ws-detail-panel">
      <div className="ws-panel-heading">
        <h2>Recent activity</h2>
        <span className="mono">
          {project.local ? "LOCAL DEMO" : "FICTIONAL EVENTS"}
        </span>
      </div>
      {project.activities.length ? (
        <ol className="ws-activity-list">
          {project.activities.map((event) => (
            <li key={event.id}>
              <span
                className={`ws-event-mark ${event.kind === "incident" ? "ws-event-incident" : ""}`}
                aria-hidden="true"
              />
              <div>
                <span className="mono">{event.kind} / SAMPLE EVENT</span>
                <p>{event.message}</p>
                <time dateTime={event.at}>{signalLabel(event.at)}</time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="ws-panel-empty">
          No activity yet. Creating a demo project does not generate telemetry.
        </p>
      )}
    </section>
  );
}
export function ProjectDetail() {
  const { state, workspace, projects, project } = useWorkspaceData(),
    navigate = useSiteNavigate();
  if (!workspace) return <MissingResource />;
  if (!state.ready && !project)
    return (
      <p className="ws-loading" role="status">
        Reading local project…
      </p>
    );
  if (!project) return <MissingResource project />;
  return (
    <>
      <div className="ws-project-context">
        <PageLink href={`/projects/${workspace.id}`}>← All Projects</PageLink>
        <Selector
          label="Switch project"
          value={project.name}
          options={[
            {
              id: "all",
              label: "All projects",
              description: workspace.name,
              action: () => navigate(`/projects/${workspace.id}`),
            },
            ...projects.map((p) => ({
              id: p.id,
              label: p.name,
              description: p.environment,
              selected: p.id === project.id,
              action: () => navigate(projectHref(p)),
            })),
          ]}
        />
      </div>
      <div id="overview" className="ws-page-heading ws-detail-heading">
        <div>
          <span className="mono ws-eyebrow">
            {workspace.code} /{" "}
            {project.local ? "LOCAL DEMO PROJECT" : project.id}
          </span>
          <h1 tabIndex={-1}>{project.name}</h1>
          <p>{project.description || "A new application, ready to define."}</p>
          <span className="mono ws-tech">
            {project.technology || "Technology not specified"}
          </span>
        </div>
        <ProjectActions project={project} />
      </div>
      <div className="ws-project-badges">
        <span className="ws-tag mono">{project.environment}</span>
        <span
          className={`ws-connection ws-connection-${project.monitoringStatus}`}
        >
          <i aria-hidden="true" />
          {project.monitoringStatus}
        </span>
        <HealthStatus health={project.health} />
        <span className="mono">
          {project.local
            ? "LOCAL / NO CONNECTION"
            : "SAMPLE SNAPSHOT / 14 OCT 2026"}
        </span>
      </div>
      <nav className="ws-project-tabs" aria-label="Project sections">
        <Link href="#overview">
          Overview <span>01</span>
        </Link>
        <Link href="#services">
          Services{" "}
          <span>{project.services.length.toString().padStart(2, "0")}</span>
        </Link>
        <Link href="#activity">
          Activity{" "}
          <span>{project.activities.length.toString().padStart(2, "0")}</span>
        </Link>
      </nav>
      <div className="ws-detail-overview">
        <section className="ws-connection-panel">
          <div className="ws-panel-heading">
            <h2>Connection overview</h2>
            <span className="mono">SAMPLE ARCHITECTURE</span>
          </div>
          <ServiceDrawing project={project} />
          <p>
            {project.monitoringStatus === "connected"
              ? "Connected in this fictional snapshot. The dated signals below are sample records, not live telemetry."
              : project.monitoringStatus === "disconnected"
                ? "This sample collector is disconnected. No current telemetry exists and health cannot be determined."
                : "Connection pending. No telemetry has been received. This demonstration does not connect real infrastructure."}
          </p>
        </section>
        <dl className="ws-project-facts">
          <div>
            <dt>Monitored services</dt>
            <dd>{project.services.length.toString().padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>Active sample incidents</dt>
            <dd className={project.activeIncidentCount ? "ws-incident" : ""}>
              {project.activeIncidentCount.toString().padStart(2, "0")}
            </dd>
          </div>
          <div>
            <dt>Last sample signal</dt>
            <dd className="ws-fact-text">
              {signalLabel(project.lastSignalAt)}
            </dd>
          </div>
          <div>
            <dt>Project identifier</dt>
            <dd className="ws-fact-id">{project.id}</dd>
          </div>
        </dl>
      </div>
      <div className="ws-detail-columns">
        <ServicesList project={project} />
        <ActivityFeed project={project} />
      </div>
    </>
  );
}
