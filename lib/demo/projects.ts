export type Health = "healthy" | "degraded" | "critical" | "unknown";
export type Environment = "production" | "staging" | "development";
export type Monitoring = "connected" | "disconnected" | "pending";
export type Service = { id: string; name: string; technology: string; health: Health };
export type Activity = { id: string; at: string; message: string; kind: "signal" | "incident" | "setup" };
export type Project = {
  id: string; workspaceId: string; name: string; description: string;
  technology: string; environment: Environment; monitoringStatus: Monitoring;
  health: Health; services: Service[]; activeIncidentCount: number;
  lastSignalAt: string | null; activities: Activity[]; local?: boolean;
};
export const workspaces = [
  { id: "personal", name: "Personal", owner: "Individual Developer", code: "P / 01" },
  { id: "northstar", name: "Northstar Engineering", owner: "Organization workspace", code: "N / 02" },
  { id: "sandbox", name: "Sandbox", owner: "An empty space to start", code: "S / 03" },
];
export const healthOptions: Health[] = ["healthy", "degraded", "critical", "unknown"];
export const environments: Environment[] = ["production", "staging", "development"];
const fixtures: Array<[string, string, string, string, string, Environment, Monitoring, Health, number, string | null, Array<[string, string, Health]>, string]> = [
  ["ironlog", "personal", "IronLog", "A stronger everyday. Fitness tracking and training plans.", "Next.js / PostgreSQL", "production", "connected", "healthy", 0, "2026-10-14T09:28:00Z", [["API", "Node.js", "healthy"], ["Frontend", "Next.js", "healthy"], ["Database", "PostgreSQL", "healthy"]], "Training plan sync completed"],
  ["rentsense", "personal", "RentSense", "Fleet operations, rentals and every mile in between.", "Python / Redis", "staging", "connected", "degraded", 1, "2026-10-14T09:23:00Z", [["Fleet API", "FastAPI", "healthy"], ["Location Worker", "Python", "degraded"], ["Cache", "Redis", "healthy"]], "Location updates delayed in the sample fleet"],
  ["portfolio-api", "personal", "Portfolio API", "A small backend for selected work and new ideas.", "Go / SQLite", "development", "disconnected", "unknown", 0, null, [["Content API", "Go", "unknown"], ["Store", "SQLite", "unknown"]], "Sample collector disconnected"],
  ["customer-portal", "northstar", "Customer Portal", "A single point of access for Northstar customers.", "React / Node.js", "production", "connected", "healthy", 0, "2026-10-14T09:29:00Z", [["Web Portal", "React", "healthy"], ["Customer API", "Node.js", "healthy"]], "Customer session checks completed"],
  ["payment-gateway", "northstar", "Payment Gateway", "Payment processing, settlement and reconciliation.", "Java / PostgreSQL", "production", "connected", "degraded", 1, "2026-10-14T09:26:00Z", [["Payment API", "Java", "healthy"], ["Queue Worker", "RabbitMQ", "degraded"], ["Database", "PostgreSQL", "healthy"]], "Settlement queue exceeded the sample threshold"],
  ["authentication", "northstar", "Authentication Service", "Identity, access and secure sessions across the platform.", "Go / Redis", "production", "connected", "critical", 2, "2026-10-14T09:27:00Z", [["Identity API", "Go", "critical"], ["Session Store", "Redis", "critical"], ["Worker", "Go", "healthy"]], "Identity failures and session-store timeouts detected"],
  ["inventory", "northstar", "Inventory Platform", "Stock movement and fulfillment, kept in step.", "Python / PostgreSQL", "staging", "pending", "unknown", 0, null, [["Inventory API", "Django", "unknown"], ["Stock Worker", "Python", "unknown"], ["Warehouse DB", "PostgreSQL", "unknown"]], "Sample service inventory prepared; connection pending"],
];
export const demoProjects: Project[] = fixtures.map(([id, workspaceId, name, description, technology, environment, monitoringStatus, health, activeIncidentCount, lastSignalAt, services, message]) => ({
  id, workspaceId, name, description, technology, environment, monitoringStatus, health, activeIncidentCount, lastSignalAt,
  services: services.map(([name, technology, health], i) => ({ id: `${id}-svc-${i + 1}`, name, technology, health })),
  activities: [{ id: `${id}-event-1`, at: lastSignalAt ?? "2026-10-14T09:00:00Z", message, kind: activeIncidentCount ? "incident" : lastSignalAt ? "signal" : "setup" },
    { id: `${id}-event-2`, at: "2026-10-13T16:00:00Z", message: `${name} sample service inventory defined`, kind: "setup" }],
}));
export const projectHref = (project: Project) => `/projects/${project.workspaceId}/${project.id}`;
export function signalLabel(at: string | null) {
  if (!at) return "No telemetry received";
  return `${at.slice(8, 10)} Oct · ${at.slice(11, 16)} UTC`;
}
export type ProjectQuery = { search: string; health: string; environment: string; sort: string };
export function selectProjects(projects: Project[], query: ProjectQuery) {
  const ranks: Record<Health, number> = { critical: 0, degraded: 1, unknown: 2, healthy: 3 };
  const compareName = (a: Project, b: Project) => a.name.localeCompare(b.name, "en") || a.id.localeCompare(b.id, "en");
  return projects.filter(p => [p.name, p.description, p.technology, p.environment].join(" ").toLowerCase().includes(query.search.trim().toLowerCase()) && (!query.health || p.health === query.health) && (!query.environment || p.environment === query.environment))
    .sort((a, b) => (query.sort === "health" ? ranks[a.health] - ranks[b.health] : query.sort === "activity" ? (b.lastSignalAt ?? "").localeCompare(a.lastSignalAt ?? "") : 0) || compareName(a, b));
}
