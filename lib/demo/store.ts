"use client";
import { useSyncExternalStore } from "react";
import { type Project, workspaces, environments } from "./projects";
const KEY = "aegisops-demo-v1";
type State = {
  projects: Project[];
  workspace: string;
  view: "grid" | "list";
  pinned: string[];
  collapsed: boolean;
  ready: boolean;
  warning: string;
};
const initial: State = {
  projects: [],
  workspace: "personal",
  view: "grid",
  pinned: [],
  collapsed: false,
  ready: false,
  warning: "",
};
let state = initial;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());
export function validLocalProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") return false;
  const p = value as Project;
  return (
    typeof p.id === "string" &&
    /^local-[a-z0-9-]+$/.test(p.id) &&
    workspaces.some((w) => w.id === p.workspaceId) &&
    typeof p.name === "string" &&
    p.name.trim().length > 0 &&
    p.name.length <= 80 &&
    typeof p.description === "string" &&
    p.description.length <= 240 &&
    typeof p.technology === "string" &&
    p.technology.length <= 80 &&
    environments.includes(p.environment) &&
    p.monitoringStatus === "pending" &&
    p.health === "unknown" &&
    p.lastSignalAt === null &&
    p.activeIncidentCount === 0 &&
    Array.isArray(p.services) &&
    p.services.length === 0 &&
    Array.isArray(p.activities) &&
    p.activities.length === 0 &&
    p.local === true
  );
}
function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      state = { ...initial, ready: true };
      return;
    }
    const data = JSON.parse(raw);
    if (
      !data ||
      !Array.isArray(data.projects) ||
      !data.projects.every(validLocalProject) ||
      new Set(data.projects.map((p: Project) => p.id)).size !==
        data.projects.length
    )
      throw Error("Invalid demo data");
    state = {
      ...initial,
      ready: true,
      projects: data.projects,
      collapsed: data.collapsed === true,
      workspace: workspaces.some((w) => w.id === data.workspace)
        ? data.workspace
        : "personal",
      view: data.view === "list" ? "list" : "grid",
      pinned: Array.isArray(data.pinned)
        ? data.pinned.filter((id: unknown) => typeof id === "string")
        : [],
    };
  } catch {
    state = {
      ...state,
      ready: true,
      warning:
        "Saved demo data could not be read. Changes will stay in this tab until storage is available. Existing stored data has not been overwritten.",
    };
  }
}
function onStorage(event: StorageEvent) {
  if (event.key === KEY || event.key === null) {
    read();
    emit();
  }
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!state.ready) {
    read();
    emit();
  }
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}
export function updateDemo(
  change: Partial<
    Pick<State, "projects" | "workspace" | "view" | "pinned" | "collapsed">
  >,
) {
  state = { ...state, ...change };
  if (!state.warning) {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          projects: state.projects,
          workspace: state.workspace,
          view: state.view,
          pinned: state.pinned,
          collapsed: state.collapsed,
        }),
      );
    } catch {
      state = {
        ...state,
        warning:
          "Browser storage is unavailable. Your changes work in this tab but will not survive a refresh.",
      };
    }
  }
  emit();
}
export const useDemo = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
