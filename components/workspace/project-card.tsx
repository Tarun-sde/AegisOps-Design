"use client";
import { PageLink, useSiteNavigate } from "@/components/site-shell";
import { type Project, projectHref, signalLabel } from "@/lib/demo/projects";
import { updateDemo, useDemo } from "@/lib/demo/store";
import { Selector } from "./selector";
import { HealthStatus, ServiceDrawing } from "./project-visuals";
export function ProjectActions({ project }: { project: Project }) {
  const state = useDemo(),
    navigate = useSiteNavigate();
  const pinned = state.pinned.includes(project.id);
  const toggle = () =>
    updateDemo({
      pinned: pinned
        ? state.pinned.filter((id) => id !== project.id)
        : [...state.pinned, project.id],
    });
  return (
    <div className="ws-project-actions">
      <button
        className="ws-pin"
        aria-label={`${pinned ? "Unpin" : "Pin"} ${project.name}`}
        aria-pressed={pinned}
        onClick={toggle}
        title={pinned ? "Remove favorite" : "Add favorite"}
      >
        <span aria-hidden="true">{pinned ? "★" : "☆"}</span>
      </button>
      <Selector
        compact
        menu
        label={`Actions for ${project.name}`}
        value="···"
        options={[
          {
            id: "pin",
            label: pinned ? "Remove favorite" : "Add favorite",
            action: toggle,
          },
          {
            id: "open",
            label: "Open project",
            action: () => navigate(projectHref(project)),
          },
          {
            id: "services",
            label: "View services",
            action: () => navigate(`${projectHref(project)}#services`),
          },
          {
            id: "activity",
            label: "View activity",
            action: () => navigate(`${projectHref(project)}#activity`),
          },
        ]}
      />
    </div>
  );
}
export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <article className="ws-project-card" data-project={project.id}>
      <div className="ws-card-top">
        <span className="ws-card-id mono">
          [{(index + 1).toString().padStart(2, "0")}] /{" "}
          {project.id.startsWith("local-") ? "LOCAL PROJECT" : project.id}
        </span>
        <ProjectActions project={project} />
      </div>
      <div className="ws-card-identity">
        <h2>
          <PageLink
            href={projectHref(project)}
            className="ws-card-link"
            label={`Open ${project.name}`}
          >
            {project.name}
          </PageLink>
        </h2>
        <p>{project.description || "A new application, ready to define."}</p>
        <span className="ws-tech mono">
          {project.technology || "Technology not specified"}
        </span>
      </div>
      <div className="ws-card-drawing">
        <div className="ws-drawing-heading mono">
          <span>SERVICE SCHEMATIC</span>
          <span>{project.environment}</span>
        </div>
        <ServiceDrawing project={project} />
      </div>
      <div className="ws-card-status">
        <span
          className={`ws-connection ws-connection-${project.monitoringStatus}`}
        >
          <i aria-hidden="true" />
          {project.monitoringStatus}
        </span>
        <HealthStatus health={project.health} />
      </div>
      <div className="ws-card-counts">
        <span>
          <b>{project.services.length.toString().padStart(2, "0")}</b> services
        </span>
        <span className={project.activeIncidentCount ? "ws-incident" : ""}>
          <b>{project.activeIncidentCount.toString().padStart(2, "0")}</b>{" "}
          incidents
        </span>
        <span className="ws-open-arrow" aria-hidden="true">
          ↗
        </span>
      </div>
      <div className="ws-card-signal">
        <span className="mono">
          {project.lastSignalAt ? "LAST SAMPLE SIGNAL" : "CONNECTION"}
        </span>
        <p>
          {project.lastSignalAt
            ? project.activities[0]?.message
            : project.monitoringStatus === "pending"
              ? "Pending setup. No telemetry connected."
              : "Disconnected. No current telemetry."}
        </p>
        <span className="mono">{signalLabel(project.lastSignalAt)}</span>
      </div>
    </article>
  );
}
export function ProjectRow({ project }: { project: Project }) {
  return (
    <li className="ws-project-row" data-project={project.id}>
      <div className="ws-row-identity">
        <PageLink
          className="ws-card-link"
          href={projectHref(project)}
          label={`Open ${project.name}`}
        >
          <strong>{project.name}</strong>
          <span aria-hidden="true">↗</span>
        </PageLink>
        <p>{project.description || "A new local project"}</p>
        <span className="mono">
          {project.technology || "Technology not specified"}
        </span>
      </div>
      <div>
        <small>Monitoring</small>
        <span
          className={`ws-connection ws-connection-${project.monitoringStatus}`}
        >
          <i aria-hidden="true" />
          {project.monitoringStatus}
        </span>
      </div>
      <div>
        <small>Health</small>
        <HealthStatus health={project.health} />
      </div>
      <div>
        <small>Services / incidents</small>
        <span className="mono">
          {project.services.length} /{" "}
          <span className={project.activeIncidentCount ? "ws-incident" : ""}>
            {project.activeIncidentCount}
          </span>
        </span>
      </div>
      <div>
        <small>Last sample signal</small>
        <span className="mono">{signalLabel(project.lastSignalAt)}</span>
      </div>
      <ProjectActions project={project} />
    </li>
  );
}
