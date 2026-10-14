"use client";
import { useRef, useState } from "react";
import { PageLink } from "@/components/site-shell";
import {
  environments,
  healthOptions,
  projectHref,
  selectProjects,
  type ProjectQuery,
} from "@/lib/demo/projects";
import { updateDemo } from "@/lib/demo/store";
import {
  MissingResource,
  useCreateProject,
  useWorkspaceData,
} from "./workspace-shell";
import { ProjectCard, ProjectRow } from "./project-card";
const defaults: ProjectQuery = {
  search: "",
  health: "",
  environment: "",
  sort: "activity",
};
export function ProjectCollection() {
  const { state, workspace, projects } = useWorkspaceData(),
    create = useCreateProject();
  const [query, setQuery] = useState(defaults);
  const search = useRef<HTMLInputElement>(null);
  if (!workspace) return <MissingResource />;
  const shown = selectProjects(projects, query);
  const favorites = shown.filter((p) => state.pinned.includes(p.id));
  const activeFilters = [
    query.search.trim(),
    query.health,
    query.environment,
  ].filter(Boolean).length;
  const reset = () => {
    setQuery(defaults);
    search.current?.focus();
  };
  return (
    <>
      <div className="ws-page-heading">
        <div>
          <span className="mono ws-eyebrow">
            {workspace.code} / APPLICATION OVERSIGHT
          </span>
          <h1 tabIndex={-1}>
            Your Projects
            <span className="ws-title-count">
              {projects.length.toString().padStart(2, "0")}
            </span>
          </h1>
          <p>One place to oversee every application.</p>
        </div>
        <button className="ws-button ws-primary" onClick={create}>
          Create demo project <span aria-hidden="true">＋</span>
        </button>
      </div>
      <div className="ws-summary">
        <div>
          <span className="mono">WORKSPACE</span>
          <strong>{workspace.name}</strong>
          <small>{workspace.owner}</small>
        </div>
        <div>
          <span className="mono">APPLICATIONS</span>
          <strong>{projects.length.toString().padStart(2, "0")}</strong>
          <small>
            {projects.filter((p) => p.monitoringStatus === "connected").length}{" "}
            sample connections
          </small>
        </div>
        <div>
          <span className="mono">ACTIVE INCIDENTS</span>
          <strong
            className={
              projects.some((p) => p.activeIncidentCount) ? "ws-incident" : ""
            }
          >
            {projects
              .reduce((n, p) => n + p.activeIncidentCount, 0)
              .toString()
              .padStart(2, "0")}
          </strong>
          <small>Illustrative incidents</small>
        </div>
        <div className="ws-summary-note">
          <span className="mono">SAMPLE SNAPSHOT / 14 OCT 2026</span>
          <p>
            A working view of fictional applications.
            <br />
            No live infrastructure is connected.
          </p>
        </div>
      </div>
      <div className="ws-controls">
        <div className="ws-search">
          <span aria-hidden="true">⌕</span>
          <input
            id="project-search"
            ref={search}
            type="search"
            aria-label="Search projects"
            placeholder="Search projects, tech, or environment…"
            value={query.search}
            onChange={(e) => setQuery({ ...query, search: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery({ ...query, search: "" });
            }}
          />
          {query.search ? (
            <button
              aria-label="Clear search"
              onClick={() => {
                setQuery({ ...query, search: "" });
                search.current?.focus();
              }}
            >
              ×
            </button>
          ) : (
            <kbd>F</kbd>
          )}
        </div>
        <label className={query.health ? "ws-filter-active" : ""}>
          <span>Health</span>
          <select
            aria-label="Filter by health"
            value={query.health}
            onChange={(e) => setQuery({ ...query, health: e.target.value })}
          >
            <option value="">All health</option>
            {healthOptions.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </label>
        <label className={query.environment ? "ws-filter-active" : ""}>
          <span>Environment</span>
          <select
            aria-label="Filter by environment"
            value={query.environment}
            onChange={(e) =>
              setQuery({ ...query, environment: e.target.value })
            }
          >
            <option value="">All environments</option>
            {environments.map((env) => (
              <option key={env}>{env}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select
            aria-label="Sort projects"
            value={query.sort}
            onChange={(e) => setQuery({ ...query, sort: e.target.value })}
          >
            <option value="activity">Last telemetry</option>
            <option value="health">Health priority</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </label>
        <div className="ws-view-toggle" aria-label="Project view">
          <button
            aria-label="Grid view"
            aria-pressed={state.view === "grid"}
            onClick={() => updateDemo({ view: "grid" })}
          >
            ⊞
          </button>
          <button
            aria-label="List view"
            aria-pressed={state.view === "list"}
            onClick={() => updateDemo({ view: "list" })}
          >
            ☰
          </button>
        </div>
      </div>
      <div className="ws-register-label">
        <span className="mono" role="status">
          SHOWING {shown.length} OF {projects.length} PROJECTS
          {activeFilters > 0 &&
            ` / ${activeFilters} ACTIVE FILTER${activeFilters > 1 ? "S" : ""}`}
        </span>
        {activeFilters > 0 ? (
          <button onClick={reset}>Reset all filters ↺</button>
        ) : (
          <span className="mono">
            {state.view === "grid"
              ? "01 / PROJECT INDEX"
              : "02 / ENVIRONMENT REGISTER"}
          </span>
        )}
      </div>
      {favorites.length > 0 && (
        <details className="ws-favorites" open>
          <summary>
            Your Favorites{" "}
            <span className="mono">
              {favorites.length.toString().padStart(2, "0")}
            </span>
          </summary>
          <div>
            {favorites.map((p) => (
              <PageLink key={p.id} href={projectHref(p)}>
                <span aria-hidden="true">★</span>
                {p.name}
                <span aria-hidden="true">↗</span>
              </PageLink>
            ))}
          </div>
        </details>
      )}
      {!shown.length ? (
        <div className="ws-empty">
          <svg viewBox="0 0 160 100" width="160" aria-hidden="true">
            <g fill="none" stroke="currentColor">
              <path
                d="M20 20h45m30 0h45v60H20V20m5 5h110v50H25z"
                opacity=".45"
              />
              <path d="M0 50h55m50 0h55M80 0v35m0 30v35M72 50h16m-8-8v16" />
            </g>
          </svg>
          <span className="mono">
            {projects.length
              ? "NO MATCHING APPLICATIONS"
              : `${workspace.code} / UNDEFINED SPACE`}
          </span>
          <h2>
            {projects.length ? "No projects found" : "Room for your next idea."}
          </h2>
          <p>
            {projects.length
              ? "No projects match your active search or filters."
              : `${workspace.name} has no projects yet. Create a local demo project to begin exploring.`}
          </p>
          <button
            className="ws-button ws-primary"
            onClick={projects.length ? reset : create}
          >
            {projects.length ? "Reset all filters" : "Create demo project"}
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      ) : (
        <div key={state.view} className="ws-collection" data-view={state.view}>
          {state.view === "grid" ? (
            <div className="ws-project-grid">
              {shown.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="ws-project-list">
              {environments
                .filter((env) => shown.some((p) => p.environment === env))
                .map((env) => (
                  <section key={env} aria-label={`${env} projects`}>
                    <h2 className="mono">
                      {env}
                      <span>
                        {shown
                          .filter((p) => p.environment === env)
                          .length.toString()
                          .padStart(2, "0")}
                      </span>
                    </h2>
                    <ul>
                      {shown
                        .filter((p) => p.environment === env)
                        .map((p) => (
                          <ProjectRow key={p.id} project={p} />
                        ))}
                    </ul>
                  </section>
                ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
