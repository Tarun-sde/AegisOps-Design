"use client";
import { keepDialogFocus } from "./dialog";
import { useRef, useState, type RefObject } from "react";
import {
  demoProjects,
  environments,
  projectHref,
  workspaces,
  type Project,
  type Environment,
} from "@/lib/demo/projects";
import { updateDemo, useDemo } from "@/lib/demo/store";
import { useSiteNavigate } from "@/components/site-shell";
export function CreateProject({
  dialog,
  workspaceId,
}: {
  dialog: RefObject<HTMLDialogElement | null>;
  workspaceId: string;
}) {
  const state = useDemo(),
    navigate = useSiteNavigate();
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  return (
    <dialog
      ref={dialog}
      onKeyDown={keepDialogFocus}
      className="ws-modal"
      aria-labelledby="create-title"
      data-lenis-prevent
      onClose={() => setError("")}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            e.currentTarget.close();
        }
      }}
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const name = String(form.get("name") ?? "").trim(),
            description = String(form.get("description") ?? "").trim(),
            technology = String(form.get("technology") ?? "").trim();
          const workspace = String(form.get("workspace")),
            environment = String(form.get("environment")) as Environment;
          let problem = "";
          if (!name || name.length > 80)
            problem = "Enter a project name between 1 and 80 characters.";
          else if (
            [...demoProjects, ...state.projects].some(
              (p) =>
                p.workspaceId === workspace &&
                p.name.toLowerCase() === name.toLowerCase(),
            )
          )
            problem =
              "A project with this name already exists in this workspace.";
          else if (
            description.length > 240 ||
            technology.length > 80 ||
            !workspaces.some((w) => w.id === workspace) ||
            !environments.includes(environment)
          )
            problem =
              "Check the field lengths and select a valid workspace and environment.";
          if (problem) {
            setError(problem);
            nameRef.current?.focus();
            return;
          }
          const project: Project = {
            id: `local-${crypto.randomUUID()}`,
            workspaceId: workspace,
            name,
            description,
            technology,
            environment,
            monitoringStatus: "pending",
            health: "unknown",
            services: [],
            activeIncidentCount: 0,
            lastSignalAt: null,
            activities: [],
            local: true,
          };
          updateDemo({ projects: [...state.projects, project], workspace });
          dialog.current?.close();
          e.currentTarget.reset();
          navigate(projectHref(project));
        }}
      >
        <div className="ws-modal-top mono">
          <span>AEGISOPS / LOCAL SETUP</span>
          <button
            type="button"
            aria-label="Close create project"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <h2 id="create-title">Create demo project</h2>
        <p>Give your next application a place of its own.</p>
        <div className="ws-form-fields">
          <label>
            Project name <span aria-hidden="true">*</span>
            <input
              ref={nameRef}
              name="name"
              required
              maxLength={80}
              autoFocus
              placeholder="e.g. Billing Dispatcher"
              aria-invalid={!!error}
              aria-describedby={error ? "create-error" : undefined}
              onInput={() => setError("")}
            />
          </label>
          <label>
            Description{" "}
            <textarea
              name="description"
              rows={2}
              maxLength={240}
              placeholder="What does this application do?"
            />
          </label>
          <div className="ws-form-pair">
            <label>
              Workspace
              <select
                aria-label="Workspace"
                name="workspace"
                defaultValue={workspaceId}
              >
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Environment
              <select
                aria-label="Environment"
                name="environment"
                defaultValue="development"
              >
                {environments.map((env) => (
                  <option key={env}>{env}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Technology <span className="ws-optional">Optional</span>
            <input
              name="technology"
              maxLength={80}
              placeholder="e.g. Node.js / PostgreSQL"
            />
          </label>
        </div>
        {error && (
          <p id="create-error" className="ws-form-error" role="alert">
            {error}
          </p>
        )}
        <div className="ws-demo-note">
          <span aria-hidden="true">⊡</span>
          <p>
            Saved in this browser only. Starts with pending monitoring and
            unknown health. No services or telemetry are connected.
          </p>
        </div>
        <div className="ws-modal-actions">
          <button
            className="ws-button"
            type="button"
            onClick={() => dialog.current?.close()}
          >
            Cancel
          </button>
          <button className="ws-button ws-primary" type="submit">
            Create demo project <span aria-hidden="true">↗</span>
          </button>
        </div>
      </form>
    </dialog>
  );
}
