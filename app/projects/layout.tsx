import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import "./workspace.css";
import "./analytics.css";
export const metadata: Metadata = {
  title: { absolute: "AegisOps — Project workspace" },
  description:
    "A local demonstration workspace for application monitoring. Fictional project data; no live connections.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
