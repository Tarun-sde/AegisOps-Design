import { test, expect } from "@playwright/test";
import { demoProjects } from "../lib/demo/projects";
import {
  aggregate,
  DEMO_CLOCK,
  evidence,
  hasTelemetry,
  hypotheses,
  incident,
  metrics,
  percentile,
  queueReadings,
  ranges,
  telemetry,
  type Bucket,
  type Metric,
  type Range,
} from "../lib/demo/telemetry/telemetry";
const project = demoProjects.find((p) => p.id === "payment-gateway")!;
const route = "/projects/northstar/payment-gateway";
const investigation = `${route}/incidents/${incident.id}`;
test("weighted rates, elapsed time and merged percentiles have independent numeric oracles", () => {
  const make = (
    requests: number,
    errors: number,
    ms: number,
    start: number,
    end: number,
  ): Bucket => ({
    start,
    end,
    requests,
    errors,
    good: requests - errors,
    distribution: [{ ms, count: requests, errors }],
  });
  const result = aggregate([
    make(1000, 10, 10, 0, 10000),
    make(10000, 500, 100, 10000, 30000),
  ]);
  expect(result.throughput).toBeCloseTo(11000 / 30);
  expect(result.errorRate).toBeCloseTo((510 / 11000) * 100);
  expect(result.sli).toBeCloseTo((10490 / 11000) * 100);
  expect(result.p95).toBe(100);
  expect(result.p99).toBe(100);
  expect(percentile([], 0.95)).toBe(0);
  expect(aggregate([]).throughput).toBe(0);
});
test("deterministic telemetry, period scope, SLI eligibility and scenario invariants", () => {
  for (const range of Object.keys(ranges) as Range[]) {
    const current = telemetry(project, range),
      previous = telemetry(project, range, "", true);
    expect(current).toEqual(telemetry(project, range));
    expect(current).toHaveLength(ranges[range].seconds / ranges[range].bucket);
    expect(current.at(-1)!.end).toBe(DEMO_CLOCK);
    expect(previous.at(-1)!.end).toBe(current[0].start);
    for (const b of current) {
      expect(b.requests).toBe(b.distribution.reduce((n, d) => n + d.count, 0));
      expect(b.good).toBe(
        b.distribution
          .filter((d) => d.ms <= 500)
          .reduce((n, d) => n + d.count - d.errors, 0),
      );
      expect(b.errors).toBeLessThanOrEqual(b.requests);
      expect(b.good).toBeLessThanOrEqual(b.requests - b.errors);
    }
    expect(aggregate(current).incidents).toBe(1);
    expect(aggregate(previous).incidents).toBe(0);
  }
  const latest = aggregate([telemetry(project, "15m").at(-1)!]);
  const lastFifteenInDay = telemetry(project, "24h").slice(-1);
  const shortWindow = aggregate(telemetry(project, "15m"));
  const sameWindow = aggregate(lastFifteenInDay);
  for (const key of ["requests", "errors", "good", "p95", "p99"] as const)
    expect(shortWindow[key]).toBe(sameWindow[key]);
  expect(latest.throughput).toBe(1280);
  expect(latest.errorRate).toBeCloseTo(3.42, 1);
  expect(latest.p95).toBe(482);
  expect(latest.p99).toBe(1120);
  expect(aggregate(telemetry(project, "15m")).errorRate).toBeGreaterThan(
    aggregate(telemetry(project, "24h")).errorRate,
  );
  expect(
    aggregate(
      [telemetry(project, "15m", incident.serviceId).at(-1)!],
      incident.serviceId,
    ).p95,
  ).toBe(680);
  expect(
    queueReadings.filter((r) => r.at >= "09:21").every((r) => r.depth > 1000),
  ).toBe(true);
  expect(incident.severity).toBe("P2");
  expect(project.health).toBe("degraded");
  for (const h of hypotheses)
    for (const id of h.supporting)
      expect(evidence.some((e) => e.id === id)).toBe(true);
  expect(evidence.every((e) => Date.parse(e.at) <= incident.startedAt)).toBe(
    true,
  );
  expect(telemetry(project, "1h", "invalid-service")).toEqual([]);
  for (const p of demoProjects.filter(
    (p) => p.monitoringStatus !== "connected",
  ))
    expect(telemetry(p, "24h")).toEqual([]);
  expect(hasTelemetry({ ...project, local: true })).toBe(false);
  expect(hasTelemetry({ ...project, workspaceId: "personal" })).toBe(false);
});
test("all six metric cards select an appropriately labelled chart", async ({
  page,
}) => {
  await page.goto(route);
  for (const key of Object.keys(metrics) as Metric[]) {
    const button = page
      .locator(".an-metric")
      .filter({ has: page.getByTestId(`metric-${key}`) });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#chart-title")).toHaveText(metrics[key].label);
  }
});
test("time ranges update real summaries, resolution and comparison", async ({
  page,
}) => {
  await page.goto(route);
  const original = await page.getByTestId("metric-errorRate").innerText();
  await page.getByLabel("Time range", { exact: true }).selectOption("15m");
  await expect(page.getByTestId("metric-errorRate")).not.toHaveText(original);
  await expect(page.locator(".an-resolution")).toContainText("10 seconds");
  // A horizontal SVG path has zero bounding-box height despite a visible stroke.
  await expect(page.locator(".an-previous")).toHaveCount(1);
  expect(
    await page
      .locator(".an-previous")
      .evaluate((el) => (el as SVGPathElement).getTotalLength()),
  ).toBeGreaterThan(100);
  await expect(page.locator(".an-previous")).toHaveCSS(
    "stroke",
    "rgb(100, 116, 139)",
  );
  await page.getByLabel("Compare previous period").uncheck();
  await expect(page.locator(".an-previous")).toHaveCount(0);
  for (const range of Object.keys(ranges)) {
    await page.getByLabel("Time range", { exact: true }).selectOption(range);
    await expect(page.locator(".an-clock")).toContainText("14 Oct 2026");
  }
});
test("chart precise tooltips, pointer crosshair, keyboard and accessible data table", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByLabel("Time range", { exact: true }).selectOption("15m");
  const slider = page.getByRole("slider", { name: "Chart data point" });
  await slider.focus();
  await page.keyboard.press("End");
  await expect(page.getByTestId("chart-tooltip")).toContainText("482 ms");
  await expect(page.getByTestId("chart-tooltip")).toContainText("09:29:50");
  await expect(page.getByTestId("chart-tooltip")).toContainText(
    "12,800 eligible requests",
  );
  await page.keyboard.press("Home");
  await expect(page.getByTestId("chart-tooltip")).toContainText("45 ms");
  const chart = page.locator(".an-chart-svg");
  await chart.scrollIntoViewIfNeeded();
  const box = (await chart.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.3, box.y + 80);
  const first = await page.getByTestId("crosshair").getAttribute("x1");
  await page.mouse.move(box.x + box.width * 0.8, box.y + 80);
  expect(await page.getByTestId("crosshair").getAttribute("x1")).not.toBe(
    first,
  );
  await page.getByText("View chart data as a table", { exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Chart data", exact: true })
      .locator("tbody tr"),
  ).toHaveCount(90);
});
test("service drawer focus trap, filtering and incident association", async ({
  page,
}) => {
  await page.goto(route);
  const trigger = page.getByRole("button", {
    name: "Queue Worker ↗",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "Queue Worker",
    exact: true,
  });
  await expect(dialog).toContainText(incident.serviceId);
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog
    .getByRole("button", { name: "Filter analytics to this service" })
    .click();
  await expect(page.getByLabel("Service scope", { exact: true })).toHaveValue(
    incident.serviceId,
  );
  await expect(page.locator(".an-service-table tbody tr")).toHaveCount(1);
  await page
    .getByLabel("Service scope", { exact: true })
    .selectOption("payment-gateway-svc-1");
  await expect(page.locator("#incidents")).toContainText("No incidents match");
  await page.getByRole("button", { name: "Clear service filter" }).click();
  await expect(page.locator(".an-service-table tbody tr")).toHaveCount(3);
});
test("annotation drawer, register filtering, investigation navigation and history", async ({
  page,
}) => {
  await page.goto(route);
  await page
    .getByRole("button", { name: "Inspect incident at 09:26 UTC" })
    .click();
  const dialog = page.getByRole("dialog", { name: incident.reference });
  await expect(dialog).toContainText("4 minutes active");
  await dialog.getByRole("link", { name: "Open investigation →" }).click();
  await expect(page).toHaveURL(investigation);
  await expect(page.locator("h1")).toHaveText("Follow the evidence.");
  expect(
    await page.evaluate(() => getComputedStyle(document.body).overflow),
  ).not.toBe("hidden");
  await page.goBack();
  await expect(page.locator("h1")).toHaveText("Payment Gateway");
  await page
    .getByLabel("Incident status", { exact: true })
    .selectOption("resolved");
  await expect(page.locator("#incidents")).toContainText("No incidents match");
  await page.getByLabel("Incident status", { exact: true }).selectOption("all");
  await expect(page.locator("#incidents")).toContainText(incident.title);
});
test("direct investigation route, all citations, evidence tabs and hypotheses", async ({
  page,
}) => {
  await page.goto(investigation);
  await expect(page.locator(".an-hypothesis")).toHaveCount(2);
  await expect(page.locator(".an-hypotheses")).toContainText("Still unknown");
  for (const record of evidence) {
    await page
      .getByRole("button", {
        name: `Inspect ${record.id} for HYP-01`,
        exact: true,
      })
      .click();
    await expect(page.locator("#evidence")).toBeFocused();
    await expect(page.getByRole("tabpanel")).toContainText(record.id);
    await expect(
      page.getByRole("tab", { name: `${record.type} 1`, exact: true }),
    ).toHaveAttribute("aria-selected", "true");
  }
  await page.getByRole("tab", { name: "Changes 1", exact: true }).focus();
  await page.keyboard.press("Home");
  await expect(
    page.getByRole("tab", { name: "Logs 1", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tabpanel")).toContainText("642 ms");
  await expect(page.locator(".an-waterfall > div")).toHaveCount(4);
  await page.reload();
  await expect(page.locator("h1")).toHaveText("Follow the evidence.");
  await page.goto("/projects/personal/ironlog/incidents/inc-payment-gw-01");
  await expect(page.locator("h1")).toHaveText("Incident not found");
});
test("safe SQL, scaling, rollback and review controls never claim remediation", async ({
  page,
}) => {
  await page.goto(investigation);
  await page.getByRole("button", { name: "Review diagnostic SQL ↗" }).click();
  await expect(page.getByRole("dialog")).toContainText("pg_blocking_pids");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Simulate worker scaling ↗" }).click();
  await page
    .getByRole("button", { name: "Calculate proposed capacity" })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "48 theoretical consumer slots",
  );
  await expect(page.getByRole("dialog")).toContainText(
    "No workers were scaled",
  );
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "View rollback checklist ↗" }).click();
  await expect(
    page.getByRole("button", { name: "Production rollback unavailable" }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await page
    .getByLabel("Review decision", { exact: true })
    .selectOption("more");
  await expect(page.locator(".an-review-controls")).toContainText(
    "page session only",
  );
});
for (const [path, text] of [
  ["/projects/personal/portfolio-api", "Collector disconnected"],
  ["/projects/northstar/inventory", "Awaiting telemetry"],
  ["/projects/personal/ironlog", "Detailed telemetry is not included"],
])
  test(`honest empty telemetry: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("#analytics")).toContainText(text);
    await expect(page.locator(".an-chart-svg")).toHaveCount(0);
  });
test("locally created project keeps empty analytics after reload", async ({
  page,
}) => {
  await page.goto("/projects/sandbox");
  await page
    .getByRole("button", { name: /Create demo project/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: "Create demo project" });
  await dialog.getByLabel(/Project name/).fill("Telemetry-free local");
  await dialog.getByRole("button", { name: /Create demo project/ }).click();
  await expect(page.locator("#analytics")).toContainText(
    "Local demo project. No live connection.",
  );
  await page.reload();
  await expect(page.locator(".an-chart-svg")).toHaveCount(0);
});
for (const [width, height] of [
  [1920, 1080],
  [1440, 900],
  [1440, 700],
  [1024, 768],
  [834, 1112],
  [390, 844],
  [375, 812],
])
  test(`analytics and investigation fit ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const path of [route, investigation]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    }
    if (width < 768) {
      await page
        .getByRole("button", { name: "Open workspace navigation" })
        .click();
      await expect(
        page.getByRole("dialog", { name: "Workspace navigation", exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
    }
    expect(errors).toEqual([]);
  });
test("reduced motion, touch chart and drawer remain usable", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(route);
  await page.getByLabel("Time range", { exact: true }).selectOption("15m");
  const chart = page.locator(".an-chart-svg");
  await chart.scrollIntoViewIfNeeded();
  await chart.tap({ position: { x: 150, y: 100 } });
  await expect(page.getByTestId("chart-tooltip")).toBeVisible();
  await page
    .getByRole("button", { name: "Inspect incident at 09:26 UTC" })
    .tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.keyboard.press("Escape");
  await context.close();
});

test("computed text, series, control boundaries and focus meet readability targets", async ({
  page,
}) => {
  const contrast = async (
    selector: string,
    property: "color" | "stroke" | "borderTopColor",
    pseudo?: string,
  ) =>
    page
      .locator(selector)
      .first()
      .evaluate(
        (el, args) => {
          const channels = (value: string) =>
            (value.match(/[\d.]+/g) || []).map(Number);
          const luminance = (rgb: number[]) =>
            rgb
              .slice(0, 3)
              .map((value) => {
                const v = value / 255;
                return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
              })
              .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
          const ancestors: Element[] = [];
          for (let e: Element | null = el; e; e = e.parentElement)
            ancestors.unshift(e);
          let background = [255, 255, 255];
          for (const e of ancestors) {
            const c = channels(getComputedStyle(e).backgroundColor);
            background = background.map(
              (v, i) => c[i] * (c[3] ?? 1) + v * (1 - (c[3] ?? 1)),
            );
          }
          const color = channels(
            getComputedStyle(el, args.pseudo)[args.property],
          );
          const a = luminance(color),
            b = luminance(background);
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        },
        { property, pseudo },
      );
  await page.goto("/projects/northstar");
  expect(
    await contrast(".ws-search input", "color", "::placeholder"),
  ).toBeGreaterThanOrEqual(4.5);
  expect(
    await contrast(".ws-selector-trigger", "borderTopColor"),
  ).toBeGreaterThanOrEqual(3);
  await page.goto(route);
  for (const key of Object.keys(metrics) as Metric[]) {
    const card = page
      .locator(".an-metric")
      .filter({ has: page.getByTestId(`metric-${key}`) });
    await card.click();
    expect(await contrast(".an-current", "stroke")).toBeGreaterThanOrEqual(3);
    await card.hover();
    expect(
      await contrast(".an-metric[aria-pressed=true]", "color"),
    ).toBeGreaterThanOrEqual(4.5);
  }
  const range = page.getByLabel("Time range", { exact: true });
  await range.focus();
  await expect(range).toHaveCSS("outline-style", "solid");
  await expect(range).toHaveCSS("outline-width", "2px");
  for (const selector of [
    ".an-metric-context",
    ".an-chart-svg text",
    ".ws-health",
    ".an-clock",
  ]) {
    const sizes = await page
      .locator(selector)
      .evaluateAll((elements) =>
        elements.map((el) => parseFloat(getComputedStyle(el).fontSize)),
      );
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(13);
  }
  expect(await contrast(".an-previous", "stroke")).toBeGreaterThanOrEqual(3);
  await page.goto(investigation);
  await page.getByRole("button", { name: "View rollback checklist ↗" }).click();
  expect(
    await contrast(".an-dialog button:disabled", "color"),
  ).toBeGreaterThanOrEqual(4.5);
});
