import type { Project } from "../projects";

export const DEMO_CLOCK = Date.parse("2026-10-14T09:30:00Z");
export const incident = {
  id: "inc-payment-gw-01",
  reference: "INC-2026-1014-01",
  investigation: "INV-8042",
  projectId: "payment-gateway",
  workspaceId: "northstar",
  serviceId: "payment-gateway-svc-2",
  title: "Settlement queue backlog and worker thread starvation",
  severity: "P2",
  status: "Investigating",
  startedAt: Date.parse("2026-10-14T09:26:00Z"),
  trigger: "Settlement queue depth > 1,000 messages for 5 minutes",
} as const;
export const ranges = {
  "15m": { seconds: 900, bucket: 10, label: "15 minutes" },
  "1h": { seconds: 3600, bucket: 60, label: "1 hour" },
  "6h": { seconds: 21600, bucket: 300, label: "6 hours" },
  "24h": { seconds: 86400, bucket: 900, label: "24 hours" },
  "7d": { seconds: 604800, bucket: 3600, label: "7 days" },
  "30d": { seconds: 2592000, bucket: 21600, label: "30 days" },
} as const;
export type Range = keyof typeof ranges;
export const metrics = {
  throughput: {
    label: "Request throughput",
    unit: "req/s",
    color: "#1d4ed8",
    context: "Requests ÷ elapsed seconds",
  },
  errorRate: {
    label: "Error rate",
    unit: "%",
    color: "#b91c1c",
    context: "Server failures ÷ eligible requests",
  },
  p95: {
    label: "p95 latency",
    unit: "ms",
    color: "#6d28d9",
    context: "95th percentile of the combined distribution",
  },
  p99: {
    label: "p99 latency",
    unit: "ms",
    color: "#6d28d9",
    context: "99th percentile of the combined distribution",
  },
  sli: {
    label: "Request success SLI",
    unit: "%",
    color: "#166534",
    context: "Non-failed requests within 500 ms; not uptime",
  },
  incidents: {
    label: "Active incidents",
    unit: "active",
    color: "#92400e",
    context: "Open at the end of the selected window",
  },
} as const;
export type Metric = keyof typeof metrics;
export type Distribution = { ms: number; count: number; errors: number }[];
export type Bucket = {
  start: number;
  end: number;
  requests: number;
  errors: number;
  good: number;
  distribution: Distribution;
};
export type Summary = Record<Metric, number> & {
  requests: number;
  errors: number;
  good: number;
};
export const hasTelemetry = (p: Project) =>
  !p.local &&
  p.monitoringStatus === "connected" &&
  p.workspaceId === incident.workspaceId &&
  p.id === incident.projectId;
const stages = [
  {
    at: -Infinity,
    rate: 1200,
    error: 0.0008,
    latency: [22, 35, 45, 60, 82, 120],
    queue: 65,
  },
  {
    at: Date.parse("2026-10-14T09:18:00Z"),
    rate: 1240,
    error: 0.008,
    latency: [30, 80, 180, 300, 460, 700],
    queue: 820,
  },
  {
    at: Date.parse("2026-10-14T09:21:00Z"),
    rate: 1260,
    error: 0.018,
    latency: [40, 95, 360, 520, 800, 1200],
    queue: 1100,
  },
  {
    at: incident.startedAt,
    rate: 1280,
    error: 0.0342,
    latency: [48, 100, 482, 680, 1120, 1400],
    queue: 1420,
  },
];
const weights = [50, 44, 1, 3, 1, 1];
export function percentile(distribution: Distribution, quantile: number) {
  const ordered = [...distribution].sort((a, b) => a.ms - b.ms);
  const total = ordered.reduce((sum, b) => sum + b.count, 0);
  if (!total) return 0;
  let count = 0;
  for (const b of ordered) {
    count += b.count;
    if (count >= Math.ceil(total * quantile)) return b.ms;
  }
  return 0;
}
export function aggregate(buckets: Bucket[], serviceId = ""): Summary {
  const requests = buckets.reduce((n, b) => n + b.requests, 0);
  const errors = buckets.reduce((n, b) => n + b.errors, 0);
  const good = buckets.reduce((n, b) => n + b.good, 0);
  const seconds = buckets.reduce((n, b) => n + (b.end - b.start) / 1000, 0);
  const distribution = buckets.flatMap((b) => b.distribution);
  const end = buckets.at(-1)?.end ?? 0;
  return {
    requests,
    errors,
    good,
    throughput: seconds ? requests / seconds : 0,
    errorRate: requests ? (errors / requests) * 100 : 0,
    sli: requests ? (good / requests) * 100 : 0,
    p95: percentile(distribution, 0.95),
    p99: percentile(distribution, 0.99),
    incidents:
      end >= incident.startedAt &&
      (!serviceId || serviceId === incident.serviceId)
        ? 1
        : 0,
  };
}
// Each service has its own operation population; do not add internal operations to ingress requests.
function makeBucket(start: number, end: number, serviceId: string): Bucket {
  const cuts = [
    start,
    ...stages.map((s) => s.at).filter((t) => t > start && t < end),
    end,
  ];
  const distribution: Distribution = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const stage = stages.findLast((s) => s.at <= cuts[i])!;
    const worker = serviceId === incident.serviceId;
    const api = serviceId.endsWith("svc-1");
    const db = serviceId.endsWith("svc-3");
    const degraded = stage.at >= incident.startedAt;
    const rate = worker ? 320 : db ? 2400 : stage.rate;
    const latency =
      worker && degraded
        ? [48, 200, 680, 900, 1400, 1800]
        : api
          ? [18, 30, degraded ? 42 : 38, 60, 80, 120]
          : db
            ? [2, 4, degraded ? 14 : 6, 25, 40, 70]
            : stage.latency;
    const error = api || db ? 0.0008 : stage.error;
    // Cumulative counters keep counts identical when the same window is rebucketed.
    const origin = Number.isFinite(stage.at)
      ? stage.at
      : DEMO_CLOCK - ranges["30d"].seconds * 2000;
    const totals = [cuts[i], cuts[i + 1]].map(
      (time) => (rate * (time - origin)) / 1000,
    );
    const allocated = [0, 0];
    weights.forEach((weight, index) => {
      const counts = totals.map((total, side) => {
        const count =
          index === weights.length - 1
            ? total - allocated[side]
            : Math.floor((total * weight) / 100);
        allocated[side] += count;
        return count;
      });
      distribution.push({
        ms: latency[index],
        count: counts[1] - counts[0],
        errors: Math.round(counts[1] * error) - Math.round(counts[0] * error),
      });
    });
  }
  return {
    start,
    end,
    distribution,
    requests: distribution.reduce((n, b) => n + b.count, 0),
    errors: distribution.reduce((n, b) => n + b.errors, 0),
    good: distribution.reduce(
      (n, b) => n + (b.ms <= 500 ? b.count - b.errors : 0),
      0,
    ),
  };
}
export function telemetry(
  project: Project,
  range: Range,
  serviceId = "",
  previous = false,
): Bucket[] {
  if (
    !hasTelemetry(project) ||
    (serviceId && !project.services.some((s) => s.id === serviceId))
  )
    return [];
  const config = ranges[range],
    end = DEMO_CLOCK - (previous ? config.seconds * 1000 : 0);
  return Array.from({ length: config.seconds / config.bucket }, (_, i) => {
    const start = end - config.seconds * 1000 + i * config.bucket * 1000;
    return makeBucket(start, start + config.bucket * 1000, serviceId);
  });
}
export const queueReadings = [
  { at: "09:18", depth: 820, lockMs: 180 },
  { at: "09:21", depth: 1100, lockMs: 360 },
  { at: "09:24", depth: 1320, lockMs: 520 },
  { at: "09:26", depth: 1420, lockMs: 612 },
];
export function formatValue(metric: Metric, value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits:
      metric === "errorRate" || metric === "sli"
        ? 2
        : metric === "throughput"
          ? 1
          : 0,
    minimumFractionDigits: metric === "errorRate" || metric === "sli" ? 2 : 0,
  });
}
export const timestamp = (time: number) =>
  new Date(time).toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }) + " UTC";
export const evidence = [
  {
    id: "EV-LOG-401",
    type: "Logs",
    at: "2026-10-14T09:25:48.120Z",
    service: "Queue Worker",
    title: "Write-lock acquisition timed out",
    body: "ERROR ConnectionTimeoutException: Failed to acquire write lock on table 'settlement_records'. pool=worker-pool-4; timeoutMs=5002; batchId=batch_settle_89214.",
  },
  {
    id: "EV-TRC-882",
    type: "Traces",
    at: "2026-10-14T09:24:30Z",
    service: "Queue Worker",
    title: "Settlement batch trace · 642 ms",
    body: "trc-8820f1a4e · ERROR. Baseline duration: 22 ms. Nested spans overlap; their durations must not be added.",
  },
  {
    id: "EV-MET-104",
    type: "Metrics",
    at: "2026-10-14T09:26:00Z",
    service: "Queue Worker",
    title: "Queue depth and lock waits rose together",
    body: "Queue exceeded 1,000 messages at 09:21 and remained above the threshold for five minutes. Co-movement supports investigation; it does not establish causation.",
  },
  {
    id: "EV-CHG-012",
    type: "Changes",
    at: "2026-10-14T09:12:00Z",
    service: "Payment API",
    title: "Release v2.14.0 · batch size 50",
    body: "Commit 4a9f1bc · engineering-team. Enable multi-item settlement batching (batch_size=50). Deployment precedes the lock contention; rollback efficacy is unverified.",
  },
] as const;
export const spans = [
  { name: "POST /v1/settlements/batch", offset: 0, duration: 642 },
  { name: "queue_publish", offset: 0, duration: 18 },
  { name: "worker_settlement_consume", offset: 18, duration: 624 },
  { name: "db_tx_settlement_write", offset: 30, duration: 612 },
];
export const hypotheses = [
  {
    id: "HYP-01",
    title: "Database write locks are starving settlement workers",
    certainty: "Strong supporting evidence",
    explanation:
      "Larger settlement batches may hold write locks longer. Blocked consumers then delay acknowledgements and allow the queue to accumulate.",
    supporting: ["EV-LOG-401", "EV-TRC-882", "EV-MET-104", "EV-CHG-012"],
    contradictory:
      "The database’s overall latency remains low; a small set of blocked transactions can still explain this trace. Aggregate health cannot rule out contention.",
    missing:
      "The blocking query, lock owner and transaction age have not been captured. Correlation is not a confirmed root cause.",
  },
  {
    id: "HYP-02",
    title: "RabbitMQ prefetch may be limiting consumer progress",
    certainty: "Low certainty · deprioritized",
    explanation:
      "Consumer saturation and a growing queue could be consistent with prefetch or pool sizing that no longer fits the batch workload.",
    supporting: ["EV-MET-104", "EV-TRC-882"],
    contradictory:
      "Write-lock timeouts in EV-LOG-401 point to database contention, which this hypothesis alone does not explain.",
    missing:
      "Broker prefetch configuration and per-consumer acknowledgement timings are unavailable.",
  },
];
