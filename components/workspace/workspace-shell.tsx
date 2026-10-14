"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { PageLink, useSiteNavigate } from "@/components/site-shell";
import { demoProjects, projectHref, workspaces } from "@/lib/demo/projects";
import { hasTelemetry } from "@/lib/demo/telemetry/telemetry";
import { useDemo, updateDemo } from "@/lib/demo/store";
import { Selector } from "./selector";
import { AegisMark } from "./project-visuals";
import { keepDialogFocus } from "./dialog";
import { CreateProject } from "./create-project";
const Create = createContext<() => void>(() => {});
export const useCreateProject = () => useContext(Create);
export function useWorkspaceData() {
  const params = useParams<{ workspaceId?: string; projectId?: string }>();
  const state = useDemo();
  const workspace = workspaces.find((w) => w.id === params.workspaceId);
  const projects = [...demoProjects, ...state.projects].filter(
    (p) => p.workspaceId === workspace?.id,
  );
  return {
    state,
    workspace,
    projects,
    project: projects.find((p) => p.id === params.projectId),
    projectId: params.projectId,
  };
}
export function WorkspaceEntry() {
  const state = useDemo(),
    router = useRouter();
  useEffect(() => {
    if (state.ready) router.replace(`/projects/${state.workspace}`);
  }, [state.ready, state.workspace, router]);
  return (
    <p className="ws-loading" role="status">
      Opening your workspace…
    </p>
  );
}
export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { state, workspace, projects, project } = useWorkspaceData();
  const path = usePathname(),
    navigate = useSiteNavigate(),
    router = useRouter();
  const root = useRef<HTMLDivElement>(null),
    drawer = useRef<HTMLDialogElement>(null),
    create = useRef<HTMLDialogElement>(null);
  const pendingSearch = useRef(false);
  const overview = `/projects/${workspace?.id ?? state.workspace}`;
  const openCreate = () => {
    drawer.current?.close();
    create.current?.showModal();
    create.current?.querySelector("input")?.focus();
  };
  const focusSearch = () => {
    drawer.current?.close();
    const input = document.querySelector<HTMLInputElement>("#project-search");
    if (input) {
      input.focus();
      input.select();
    } else {
      pendingSearch.current = true;
      router.push(overview);
    }
  };
  useEffect(() => {
    if (state.ready && workspace) updateDemo({ workspace: workspace.id });
  }, [workspace, state.ready]);
  useEffect(() => {
    drawer.current?.close();
    if (pendingSearch.current) {
      document.querySelector<HTMLInputElement>("#project-search")?.focus();
      pendingSearch.current = false;
    } else
      root.current
        ?.querySelector<HTMLElement>("h1")
        ?.focus({ preventScroll: true });
  }, [path]);
  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() !== "f" ||
        e.ctrlKey ||
        e.altKey ||
        e.metaKey ||
        e.shiftKey ||
        (e.target as Element)?.closest(
          "input, textarea, select, [contenteditable], [role=combobox], [role=menu], [role=listbox]",
        ) ||
        document.querySelector("dialog[open]")
      )
        return;
      e.preventDefault();
      focusSearch();
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
    // The shortcut follows the current route context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overview]);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        gsap.fromTo(
          q(".ws-page-heading h1"),
          { y: 6, clipPath: "inset(0 0 100% 0)" },
          {
            y: 0,
            clipPath: "inset(0 0 0% 0)",
            duration: 0.22,
            ease: "power2.out",
          },
        );
        gsap.fromTo(
          q(
            ".ws-page-heading p, .ws-summary, .ws-project-card, .ws-detail-panel",
          ),
          { y: 6, opacity: 0.65 },
          {
            y: 0,
            opacity: 1,
            duration: 0.18,
            stagger: 0.02,
            ease: "power2.out",
          },
        );
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [path, state.ready], revertOnUpdate: true },
  );
  const workspaceSelector = (
    <Selector
      label="Switch workspace"
      value={workspace?.name ?? "Choose workspace"}
      options={workspaces.map((w) => ({
        id: w.id,
        label: w.name,
        description: `${w.code} · ${w.owner}`,
        selected: workspace?.id === w.id,
        action: () => {
          drawer.current?.close();
          navigate(`/projects/${w.id}`);
        },
      }))}
    />
  );
  const favorites = projects.filter((p) => state.pinned.includes(p.id));
  const navigation = (
    <>
      {workspaceSelector}
      <button
        className="ws-find"
        onClick={focusSearch}
        title="Find projects (F)"
      >
        <span aria-hidden="true">⌕</span>
        <span className="ws-rail-label">Find projects</span>
        <kbd className="ws-rail-label">F</kbd>
      </button>
      <div className="ws-nav-caption mono ws-rail-label">
        WORKSPACE / {workspace?.code ?? "—"}
      </div>
      <nav aria-label="Workspace navigation">
        <Link
          href={overview}
          aria-current={!project ? "page" : undefined}
          title="All projects"
        >
          <span aria-hidden="true">⊞</span>
          <span className="ws-rail-label">All projects</span>
          <small className="ws-rail-label">
            {projects.length.toString().padStart(2, "0")}
          </small>
        </Link>
        {project && (
          <>
            <Link
              href={`${projectHref(project)}#overview`}
              title="Project overview"
              aria-current={path === projectHref(project) ? "page" : undefined}
            >
              <span aria-hidden="true">⊡</span>
              <span className="ws-rail-label">Overview</span>
            </Link>
            <Link
              href={`${projectHref(project)}#analytics`}
              title="Project analytics"
            >
              <span aria-hidden="true">↗</span>
              <span className="ws-rail-label">Analytics</span>
            </Link>
            {hasTelemetry(project) && (
              <Link
                href={`${projectHref(project)}#incidents`}
                title="Project incidents"
                aria-current={path.includes("/incidents/") ? "page" : undefined}
              >
                <span aria-hidden="true">△</span>
                <span className="ws-rail-label">Incidents</span>
              </Link>
            )}
            <Link
              href={`${projectHref(project)}#services`}
              title="Project services"
            >
              <span aria-hidden="true">⋈</span>
              <span className="ws-rail-label">Services</span>
            </Link>
            <Link
              href={`${projectHref(project)}#activity`}
              title="Project activity"
            >
              <span aria-hidden="true">≋</span>
              <span className="ws-rail-label">Activity</span>
            </Link>
          </>
        )}
      </nav>
      <div className="ws-sidebar-favorites ws-rail-label">
        <span className="mono">
          YOUR FAVORITES / {favorites.length.toString().padStart(2, "0")}
        </span>
        {favorites.length ? (
          favorites.map((p) => (
            <PageLink key={p.id} href={projectHref(p)}>
              {p.name}
              <span aria-hidden="true">↗</span>
            </PageLink>
          ))
        ) : (
          <p>Pin projects to keep them close.</p>
        )}
      </div>
    </>
  );
  return (
    <Create.Provider value={openCreate}>
      <div
        ref={root}
        className={`workspace ${state.collapsed ? "ws-collapsed" : ""}`}
      >
        <aside className="ws-sidebar" data-lenis-prevent>
          <PageLink
            className="ws-brand"
            href="/"
            label="AegisOps — back to homepage"
          >
            <AegisMark />
            <span className="ws-rail-label">
              AEGISOPS<small>APPLICATION OVERSIGHT</small>
            </span>
          </PageLink>
          <div className="ws-sidebar-content">{navigation}</div>
          <div className="ws-sidebar-bottom">
            <div className="ws-demo-stamp ws-rail-label">
              <span className="mono">LOCAL DEMONSTRATION</span>
              <p>
                A considered view of
                <br />
                every application.
              </p>
            </div>
            <button
              className="ws-collapse"
              aria-label={
                state.collapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              aria-expanded={!state.collapsed}
              onClick={() => updateDemo({ collapsed: !state.collapsed })}
            >
              <span aria-hidden="true">{state.collapsed ? "→" : "←"}</span>
              <span className="ws-rail-label">Collapse sidebar</span>
            </button>
          </div>
        </aside>
        <div className="ws-main-column">
          <header className="ws-context">
            <nav aria-label="Breadcrumb">
              <PageLink href="/">AegisOps</PageLink>
              <span>/</span>
              <PageLink href={overview}>
                {workspace?.name ?? "Workspace"}
              </PageLink>
              {project && (
                <>
                  <span>/</span>
                  <span aria-current="page">{project.name}</span>
                </>
              )}
            </nav>
            <span className="ws-demo-label mono">
              DEMO / NO LIVE CONNECTION
            </span>
          </header>
          <main id="main" className="ws-content">
            {state.warning && (
              <p className="ws-storage-warning" role="status">
                {state.warning}
              </p>
            )}
            {children}
          </main>
          <div className="ws-sheet-footer mono">
            <span>AEGISOPS / APPLICATION REGISTER</span>
            <span>FICTIONAL DATA · REV 02</span>
          </div>
        </div>
        <nav className="ws-mobile-bar" aria-label="Mobile workspace actions">
          <button
            onClick={() => drawer.current?.showModal()}
            aria-label="Open workspace navigation"
          >
            ☰<span>Workspace</span>
          </button>
          <button onClick={focusSearch}>
            ⌕<span>Find</span>
          </button>
          <Link href={overview}>
            ⊞<span>Projects</span>
          </Link>
          <button onClick={openCreate}>
            ＋<span>Create</span>
          </button>
        </nav>
        <dialog
          ref={drawer}
          onKeyDown={keepDialogFocus}
          className="ws-mobile-drawer"
          aria-label="Workspace navigation"
          data-lenis-prevent
          onClick={(e) => {
            if ((e.target as Element).closest("a")) drawer.current?.close();
          }}
        >
          <div className="ws-drawer-top">
            <span className="ws-brand">
              <AegisMark />
              AEGISOPS
            </span>
            <button
              aria-label="Close workspace navigation"
              onClick={() => drawer.current?.close()}
            >
              ×
            </button>
          </div>
          {navigation}
          <PageLink href="/">← Back to homepage</PageLink>
        </dialog>
        <CreateProject
          key={workspace?.id ?? "personal"}
          dialog={create}
          workspaceId={workspace?.id ?? "personal"}
        />
      </div>
    </Create.Provider>
  );
}
export function MissingResource({ project = false }: { project?: boolean }) {
  return (
    <div className="ws-empty">
      <span className="mono">
        {project ? "ERR_PROJECT_NOT_FOUND" : "ERR_WORKSPACE_NOT_FOUND"}
      </span>
      <h1 tabIndex={-1}>
        {project ? "Project not found" : "Workspace not found"}
      </h1>
      <p>
        {project
          ? "This project is not available in this workspace or this browser’s local demo data."
          : "Choose Personal, Northstar Engineering or Sandbox to continue."}
      </p>
      <PageLink className="ws-button ws-primary" href="/projects">
        Back to Projects ↗
      </PageLink>
    </div>
  );
}
