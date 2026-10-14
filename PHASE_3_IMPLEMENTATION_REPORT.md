# Phase 3 — Analytics, incident intelligence and workspace readability

Payment Gateway now supports the complete frontend journey: project overview → analytics → incident → investigation → evidence → recommended next check. The workspace has larger typography, semantic colors and clearer controls. The approved marketing pages, existing project fixtures and project store are unchanged.

## Routes and entry points

- `/projects/[workspaceId]`: existing project grid/list, filters, favorites and creation, with workspace-scoped readability improvements.
- `/projects/[workspaceId]/[projectId]`: extended project console with Analytics, Services and Incidents anchors alongside existing Overview and Activity.
- `/projects/northstar/payment-gateway`: complete synthetic analytics scenario.
- `/projects/northstar/payment-gateway/incidents/inc-payment-gw-01`: dedicated incident investigation with direct-URL and browser-history support.
- Unknown incident IDs or incident/project mismatches show an explicit recovery screen.

Open Payment Gateway, select **Last 15 minutes**, inspect **p95 latency**, then open the P2 marker or incident register. In the investigation, selecting an evidence citation opens its actual record. The recommended next step is to review the blocking-transaction query; no operation executes.

## Components and reuse

New components under `components/workspace/analytics/`:

| Component | Responsibility |
| --- | --- |
| `analytics-dashboard.tsx` | Shared range/service selection, six KPI cards, service table, incident register and quick-inspection content. |
| `time-series.tsx` | Custom SVG chart, solid/dashed comparison, exact tooltip, crosshair, incident marker, keyboard/touch slider and accessible data table. |
| `investigation-console.tsx` | Incident summary, expandable timeline, hypotheses, evidence tabs, trace waterfall, next actions and session-local review state. |
| `detail-dialog.tsx` | Shared native modal/drawer lifecycle, scroll restoration and existing keyboard focus trap. |

Reused `Project`, service IDs and existing fixtures; `useWorkspaceData`; `HealthStatus`; `ServiceDrawing`; `ProjectActions`; `Selector`; `PageLink`; route transitions; and `keepDialogFocus`. The existing GSAP registration and Lenis infrastructure remain in place. No additional project store, dependency, backend, telemetry provider or AI integration was introduced.

The Services anchor reaches the analytics table in Payment Gateway. Its original schematic and service inventory remain further down the page. Other projects keep their existing inventory anchor. The sidebar now exposes Analytics and, for the detailed scenario, Incidents.

## Readability audit and changes

The actual Phase 2 browser baseline showed 8–10px labels across cards, service health, metadata, sidebar captions and timestamps, with a 13px workspace base. The dated monochrome surfaces provided little hierarchy. Baseline evidence is saved in [readability-before.json](artifacts/phase-3/readability-before.json) and [projects-before.png](artifacts/phase-3/screenshots/projects-before.png).

Workspace body and description text now use Inter at 16px with approximately 1.6 line height. Metadata, status labels, controls and tables use at least 14px; chart axes use 13px. KPI values use 28–38px. New section headings use 24–30px. Long hypothesis explanations use proportional text; monospace remains for short technical identifiers and logs. Decorative schematic annotations remain smaller, with readable service names and an accessible diagram description elsewhere.

Scoped tokens preserve the warm architectural character:

| Role | Color |
| --- | --- |
| Canvas / card | `#FAFAF7` / `#FFFFFF` |
| Primary / secondary text | `#17212D` / `#475569` |
| Interaction / throughput | `#1D4ED8` |
| Healthy / success SLI | `#166534` |
| Degraded / P2 | `#92400E` |
| Critical / errors | `#B91C1C` |
| Latency | `#6D28D9` |
| Structural divider / control boundary | `#CBD5E1` / `#7A8798` |

Text labels accompany status colors; series use line styles and legends. Selected metrics have a border, fill and pressed state. Controls have a visible blue focus outline. Placeholder and disabled text remain legible. A computed audit found a low-contrast breadcrumb separator, which was corrected. Marketing styles were not changed; the final user brief explicitly overrides the earlier strict monochrome rule for operational usability.

## Data model and calculation decisions

`lib/demo/telemetry/telemetry.ts` holds the pure adapter, distribution contracts, fixed scenario stages, evidence and hypotheses. All reads are keyed to the existing workspace, project and service IDs. The demonstration clock is fixed at **14 Oct 2026, 09:30 UTC**.

The research contradictions are resolved explicitly:

1. Payment Gateway uses **P2 / Degraded**, consistent with its original project and service fixtures. P1 would require Critical health.
2. Queue depth exceeds 1,000 at **09:21** and remains above it until the **09:26** five-minute alert. The earlier 820-message observation is at 09:18.
3. Range summaries are calculated from counts and distributions rather than copied from incompatible sample constants.
4. Two replicas × 16 threads means 32 consumer slots. The scaling preview calculates 48 slots for three replicas, without claiming measured throughput or recovery.

Telemetry is deterministic and piecewise, split at exact scenario boundaries. Cumulative integer counters preserve request, failure and good-request totals across different bucket resolutions. Error rate is weighted by eligible requests. p95/p99 use nearest-rank quantiles from merged discrete distributions, never averaged percentiles. Request-success SLI counts non-failed requests completed within 500ms; it is not uptime. Internal service operations are distinct populations, not additive ingress traffic.

Independent checks verify 11,000 requests over 30 seconds as 366.67 req/s and 510 failures among 11,000 requests as 4.636%. They also verify percentile ranking, SLI eligibility, deterministic generation, evidence references, scoped empty states and identical totals when the same 15-minute interval is rebucketed.

Representative calculated values:

| Window | Throughput | Error rate | p95 | p99 | Request success SLI |
| --- | ---: | ---: | ---: | ---: | ---: |
| Last 10-second bucket | 1,280 req/s | 3.41% | 482ms | 1,120ms | 91.75% |
| Last 15 minutes | 1,249.3 req/s | 1.71% | 120ms | 800ms | 95.12% |
| Last hour | 1,212.3 req/s | 0.50% | 100ms | 360ms | 98.68% |
| Last 24 hours | 1,200.5 req/s | 0.10% | 60ms | 120ms | 99.87% |

The modeled incident error probability is 3.42%; an individual integer-count bucket can round to 3.41%. Long windows dilute brief degradation, which is explained beside the chart. [metric-verification.json](artifacts/phase-3/metric-verification.json) contains all six presets and raw totals.

Detailed decision changes are recorded in [phase3-implementation-decisions.md](phase3-research/architecture/phase3-implementation-decisions.md), with update notices in the original scenario, design and chart decision documents.

## Investigation and safe actions

The P2 register and chart marker open a quick-inspection drawer showing Queue Worker, alert condition, start time, duration and investigation availability. The dedicated route contains two qualitative hypotheses, explicit contradictory signals and missing evidence.

All citations resolve to four canonical synthetic records: `EV-LOG-401`, `EV-TRC-882`, `EV-MET-104` and `EV-CHG-012`. Evidence tabs support arrow keys, Home and End. Citations focus the explorer, select the correct record and highlight it; records link back to their hypotheses. Trace spans use offsets and durations; nested spans overlap and are not summed. Metric evidence shows the paired queue-depth and lock-wait observations without an unsupported confidence percentage.

SQL review displays a read-only proposal. Worker scaling calculates theoretical capacity only. The rollback checklist explains review requirements and keeps production execution disabled. Review decisions are explicitly session-local. No incident is marked resolved and no production success is fabricated.

## Motion, accessibility and responsive review

Chart selection uses a short 200ms GSAP fade with scoped cleanup. Drawers enter in 200ms; evidence receives a brief highlight. Timeline disclosure is native. There are no idle animations or competing tickers. Reduced motion disables transitions and remains fully operable.

Native modal dialogs make the background inert. The reused focus trap wraps Tab, Escape dismisses, focus returns to the trigger and scroll state is restored, including navigation out of a drawer. Chart data is accessible through a native range input and a complete table. Touch inspection and mobile navigation are exercised in Chromium emulation.

The visual pass covers all requested sizes: **1920×1080, 1440×900, 1440×700, 1024×768, 834×1112, 390×844 and 375×812**. KPI cards reflow rather than shrinking text. Service tables scroll within their region with a sticky service column; incidents, evidence tabs and action cards reflow. Drawers and SQL panels scroll internally where necessary.

[The screenshot gallery](artifacts/phase-3/index.html) contains 56 native viewport captures, plus the separate Phase 2 baseline. Captures include project cards/list/sidebar, all selected chart metrics, analytics, services, incidents, hypotheses, all evidence tabs, action review, mobile navigation and dialogs, and empty/pending/disconnected states. Desktop chart, project grid, service table, trace explorer, mobile chart, mobile investigation/evidence, tablet header and mobile dialogs were inspected at their actual image dimensions. Full-page exploratory captures are retained separately and were not used as a substitute for readable viewport inspection.

The separate computed-style audit checks visible text against the 12px absolute floor and AA contrast thresholds, excluding decorative service-drawing annotations. The focused accessibility test checks important labels at 13px or larger, placeholder/disabled text at 4.5:1, chart strokes and control boundaries at 3:1, hover/selected text and focus outlines. Final visual findings are in [browser-findings.json](artifacts/phase-3/browser-findings.json).

## Quality gates

| Check | Result | Evidence |
| --- | --- | --- |
| `npm run typecheck` | Passed | [typecheck.log](artifacts/phase-3/typecheck.log) |
| `npm run lint` | Passed | [lint.log](artifacts/phase-3/lint.log) |
| `npm run build` | Passed, including the new incident route | [build.log](artifacts/phase-3/build.log) |
| Production Playwright suite | 80 passed: 58 unchanged existing tests + 22 Phase 3 tests | [playwright.log](artifacts/phase-3/playwright.log) |
| Separate visual/readability pass | 56 captures; no page errors, horizontal body overflow or computed text failures | [capture.log](artifacts/phase-3/capture.log) |
| Diff whitespace check | Passed | `git diff --check` |

The first development-server run had seven failures during active recompilation, including existing marketing/navigation checks. Stable production verification passed all existing tests without modifying them. One new test treated a flat SVG path's zero-height bounding box as invisible; it was corrected to verify the actual stroke and path length. Subsequent production verification includes the corrected test and separate style assertions.

Reproduce against a production build:

```sh
npm run typecheck
npm run lint
npm run build
npm run start -- --port 3013
# In another terminal:
TEST_BASE_URL=http://localhost:3013 npm test
TEST_BASE_URL=http://localhost:3013 node scripts/capture-analytics.mjs
```

## Limitations and deferred integrations

Only Payment Gateway has the fully specified telemetry and investigation scenario. Other connected projects retain their dated inventory, health and activity, with an explicit detailed-telemetry-not-included message. Their original incident counts are not replaced with fabricated records. Pending, disconnected and locally created projects have no invented traffic.

Custom ranges, manual granularity, optional secondary graphs, CSV export and production-scale datasets are deferred. The tooltip is a stable panel below the chart, supporting mobile and keyboard inspection. The synthetic distribution is intentionally small and piecewise; it does not simulate production seasonality or validate real SLOs.

Chromium desktop and touch emulation were checked. Firefox, Safari, physical devices and assistive-technology sessions remain unverified. The computed contrast checker handles these solid-color surfaces; it is not a full WCAG certification or image/background audit. Backend ingestion, authentication, authorization, persistent reviews, operational actions, live AI and telemetry integrations remain deferred.

No deployment, commit or push was performed. Package manifests, lockfile, existing tests, marketing pages and the project store remain unchanged.
