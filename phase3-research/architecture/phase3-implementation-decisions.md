# Phase 3 implementation decisions

This addendum supersedes conflicting research examples. The final user brief explicitly prioritizes operational readability over the earlier monochrome restrictions. Marketing is unchanged.

## Scoped operational design

Workspace tokens use warm near-white `#FAFAF7`, white surfaces, charcoal `#17212D`, secondary slate `#475569`, blue `#1D4ED8`, green `#166534`, amber `#92400E`, red `#B91C1C` and violet `#6D28D9`. Structural dividers remain subtle; input boundaries use `#7A8798`. Text and selected states are checked using actual browser styles. Status always includes words.

Body copy uses Inter at 16px; metadata and status labels use 14px; chart axes use 13px. Short identifiers and timestamps may use Geist Mono. Descriptions no longer inherit tiny monospaced styling. Decorative schematic labels remain small, with service names repeated in readable inventory text and an accessible SVG description. Cards use six columns only on wide workstations, three on ordinary laptops, two on portrait tablets and one on narrow mobile screens. Readability takes priority over the research's six-column laptop layout.

## Coherent scenario, with corrections

- Payment Gateway uses **P2 / Degraded**, matching the existing project and Queue Worker fixtures. An active P1 would require Critical health; no P1 is introduced for this scenario.
- The queue crosses 1,000 at **09:21**, remains above it, and triggers at **09:26**. The research's 820-message observation after 09:22 contradicted its five-minute alert; 820 now occurs at 09:18. The canonical metric evidence, timeline and marker agree.
- Demo clock is **14 October 2026, 09:30 UTC**. The incident is four minutes old. The original project last-signal fact remains the incident event at 09:26; analytics explicitly labels its separate last sample bucket at 09:30.
- The narrative is a hypothesis, not a verified causal diagnosis. No unsupported confidence percentage or correlation coefficient is displayed. Metric evidence provides four paired queue/lock observations instead.
- Two replicas each have 16 consumer threads. The simulation compares 32 with 48 theoretical slots; it never conflates consumer threads with pods or predicts a recovery.

## Mathematical source of truth

`lib/demo/telemetry/telemetry.ts` is a pure, read-only adapter using existing Project and service IDs. It does not create a project store or alter local persistence.

The fixture integrates piecewise scenario stages across exact time boundaries. Each distribution has six discrete duration bands with request counts and failed-request counts. Cumulative integer counters are differenced so rebucketing the same interval preserves request, failure and good counts. Error counts are deterministically rounded cumulative counts, not independently rounded bucket percentages.

- Throughput: total requests divided by elapsed seconds.
- Error rate: total failed requests divided by eligible requests. Failures represent 5xx and timeouts; other requests remain eligible.
- p95/p99: nearest-rank quantiles of the combined request distribution. Percentiles are never averaged.
- Success SLI: non-failed requests with duration at most 500ms divided by all eligible requests. It is **not uptime** and need not equal 100% minus error rate.
- Active incident counts: counts open at the bucket/window end, never averaged.
- Service operations have their own populations. Internal operations are not added to ingress traffic. Health badges describe the fixed current snapshot, while table quantities describe the selected period.

Range summaries are calculated, so they intentionally differ from conflicting research constants. In particular, four minutes of degradation cannot be presented as the same aggregate p95 or SLI for every range. A note explains dilution in long windows and offers a 15-minute inspection window. Baseline stages are constant synthetic distributions; they are not claimed to resemble historical production seasonality.

## Chart decision

Custom SVG meets the implemented requirements: one selected metric, exact linear axes, a solid current series, a dashed previous-period series, incident marker, pointer inspection, native range input for keyboard and touch, and a full data-table alternative. Native ResizeObserver keeps SVG labels at their intended rendered size. No chart package was added.

This decision is based on the limited chart scope and installed React/SVG capabilities, **not** the research's unsupported claim that current Recharts releases are incompatible with React 19. The research bundle-size and zero-lag promises were not measured and are not asserted.

The tooltip is a stable readable panel below the chart, rather than a floating card that can obscure data or clip on mobile. Only one primary chart is rendered, so there are no independent crosshairs to synchronize. All cards, service filters, summaries and comparison series share the same range and service scope. Automatic granularity is displayed; a custom date picker and manual resolution controls are deferred.

## Navigation and implementation boundaries

The main console retains Overview, Analytics, Services, Incidents & Intelligence and the existing Activity anchor. Services links to the analytics table for Payment Gateway; the original schematic and readable inventory remain supporting content. Incident quick view leads to `/projects/northstar/payment-gateway/incidents/inc-payment-gw-01`. Unknown incident/project combinations show recovery UI.

The detailed scenario exists only for Payment Gateway. Other connected projects keep their original dated inventory, activity, health and incident counts and explicitly say that detailed telemetry is not included. They do not show a misleading zero-incident register. Pending, disconnected and local projects show educational empty states with no invented traffic. This follows the final brief's permission to use simpler scenarios only where sufficient records exist.

Evidence uses the four canonical records, two hypotheses, bidirectional citation links and a nested-span waterfall. Nested trace durations overlap and are not summed. SQL review, capacity arithmetic and a rollback checklist perform no network or infrastructure operations. Review decisions last for the current page session only.

Native dialogs reuse the existing focus trap, restore focus, dismiss with Escape and restore scrolling on route changes. GSAP fades chart series for 200ms; CSS handles drawer entrance and evidence highlighting. All animation respects reduced motion, and no idle loops or competing tickers were introduced.

CSV export, optional secondary graphs, SLO budget forecasts, custom ranges, streaming, authentication, real telemetry, live AI diagnosis and operational execution remain outside this frontend demonstration.
