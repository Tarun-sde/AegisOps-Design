import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const dir = "artifacts/phase-3";
const browser = await chromium.launch();
const context = await browser.newContext({
  baseURL: process.env.TEST_BASE_URL || "http://localhost:3011",
});
const page = await context.newPage();
const findings = { errors: [], readability: [], overflow: [], screenshots: [] };
page.on("pageerror", (e) => findings.errors.push(e.message));
const settle = async () => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
};
const capture = async (name, selector) => {
  await page.mouse.move(2, 2);
  await settle();
  if (selector) await page.locator(selector).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${dir}/screenshots/${name}.png` });
  findings.screenshots.push(name);
};
const audit = async (name) => {
  const result = await page.locator(".workspace").evaluate((root) => {
    const rgba = (s) => (s.match(/[\d.]+/g) || []).map(Number);
    const composite = (fg, bg) =>
      fg
        .slice(0, 3)
        .map((v, i) => v * (fg[3] ?? 1) + bg[i] * (1 - (fg[3] ?? 1)));
    const luminance = (c) =>
      c
        .map((v) => {
          v /= 255;
          return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        })
        .reduce((n, v, i) => n + v * [0.2126, 0.7152, 0.0722][i], 0);
    const entries = [];
    for (const el of root.querySelectorAll("*")) {
      if (el.closest("svg.ws-service-drawing") || !el.getClientRects().length)
        continue;
      if (
        !Array.from(el.childNodes).some(
          (n) => n.nodeType === 3 && n.textContent.trim(),
        )
      )
        continue;
      const chain = [];
      for (let e = el; e; e = e.parentElement) chain.unshift(e);
      if (chain.some((e) => getComputedStyle(e).visibility === "hidden"))
        continue;
      let bg = [255, 255, 255];
      for (const e of chain)
        bg = composite(rgba(getComputedStyle(e).backgroundColor), bg);
      const style = getComputedStyle(el),
        color = rgba(el instanceof SVGElement ? style.fill : style.color);
      const opacity = chain.reduce(
        (n, e) => n * Number(getComputedStyle(e).opacity),
        1,
      );
      color[3] = (color[3] ?? 1) * opacity;
      const fg = composite(color, bg),
        a = luminance(fg),
        b = luminance(bg),
        ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      const size = parseFloat(style.fontSize),
        threshold =
          size >= 24 || (size >= 18.66 && parseInt(style.fontWeight) >= 700)
            ? 3
            : 4.5;
      const text = el.textContent.trim().replace(/\s+/g, " ").slice(0, 100);
      if (size < 12 || ratio < threshold - 0.02)
        entries.push({
          text,
          tag: el.tagName,
          class: el.className.baseVal ?? el.className,
          size,
          color: style.color,
          bg,
          ratio: Math.round(ratio * 100) / 100,
          threshold,
        });
    }
    return entries;
  });
  findings.readability.push({ name, failures: result });
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  findings.overflow.push({ name, viewport: page.viewportSize().width, width });
};
const route = "/projects/northstar/payment-gateway";
for (const [width, height] of [
  [1920, 1080],
  [1440, 900],
  [1440, 700],
  [1024, 768],
  [834, 1112],
  [390, 844],
  [375, 812],
]) {
  await page.setViewportSize({ width, height });
  await page.goto(route);
  await settle();
  await capture(`analytics-header-${width}x${height}`);
  await audit(`analytics-${width}x${height}`);
  await page.getByLabel("Time range", { exact: true }).selectOption("15m");
  await capture(`analytics-chart-${width}x${height}`, ".an-primary-chart");
  await page.goto(`${route}/incidents/inc-payment-gw-01`);
  await settle();
  await capture(`investigation-${width}x${height}`);
  await audit(`investigation-${width}x${height}`);
  await capture(`evidence-${width}x${height}`, "#evidence");
}
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto("/projects/northstar");
await settle();
await capture("projects-after");
await audit("projects-grid");
await capture("project-cards", ".ws-project-grid");
await page.getByRole("button", { name: "List view", exact: true }).click();
await capture("projects-list", ".ws-project-list");
await audit("projects-list");
await page
  .getByRole("combobox", { name: "Switch workspace", exact: true })
  .click();
await capture("sidebar-selector");
await audit("sidebar-selector");
await page.keyboard.press("Escape");
await page.goto(route);
await page.getByLabel("Time range", { exact: true }).selectOption("15m");
for (const key of [
  "throughput",
  "errorRate",
  "p95",
  "p99",
  "sli",
  "incidents",
]) {
  await page
    .locator(".an-metric")
    .filter({ has: page.getByTestId(`metric-${key}`) })
    .click();
  await capture(`metric-${key}`, ".an-primary-chart");
}
await capture("service-breakdown", "#services");
await capture("incident-register", "#incidents");
await page.getByRole("button", { name: "Queue Worker ↗", exact: true }).click();
await capture("service-drawer");
await audit("service-drawer");
await page.keyboard.press("Escape");
await page
  .getByRole("button", { name: "Inspect incident ↗", exact: true })
  .click();
await capture("incident-drawer");
await audit("incident-drawer");
await page.keyboard.press("Escape");
await page.goto(`${route}/incidents/inc-payment-gw-01`);
await capture("hypotheses", ".an-hypotheses");
for (const type of ["Logs", "Traces", "Metrics", "Changes"]) {
  await page.getByRole("tab", { name: `${type} 1`, exact: true }).click();
  await capture(`evidence-${type.toLowerCase()}`, "#evidence");
  await audit(`evidence-${type}`);
}
await capture("recommended-actions", ".an-actions");
await page.getByRole("button", { name: "View rollback checklist ↗" }).click();
await capture("rollback-disabled");
await audit("rollback-disabled");
await page.keyboard.press("Escape");
for (const [path, name] of [
  ["/projects/personal/portfolio-api", "disconnected"],
  ["/projects/northstar/inventory", "pending"],
]) {
  await page.goto(path);
  await capture(name, "#analytics");
  await audit(name);
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("/projects/northstar");
await capture("mobile-projects");
await audit("mobile-projects");
await page.getByRole("button", { name: "Open workspace navigation" }).click();
await capture("mobile-navigation");
await audit("mobile-navigation");
await page.keyboard.press("Escape");
await page.goto(route);
await page.getByRole("button", { name: "Queue Worker ↗", exact: true }).click();
await capture("mobile-service-drawer");
await audit("mobile-service-drawer");
await page.keyboard.press("Escape");
await page.goto(`${route}/incidents/inc-payment-gw-01`);
await page.getByRole("button", { name: "Review diagnostic SQL ↗" }).click();
await capture("mobile-sql-review");
await audit("mobile-sql-review");
await page.keyboard.press("Escape");
await page.goto("/projects/sandbox");
await page
  .getByRole("button", { name: /Create demo project/ })
  .first()
  .click();
const create = page.getByRole("dialog", { name: "Create demo project" });
await create.getByLabel(/Project name/).fill("Local empty example");
await create.getByRole("button", { name: /Create demo project/ }).click();
await capture("local-empty", "#analytics");
await audit("local-empty");
await fs.writeFile(
  `${dir}/browser-findings.json`,
  JSON.stringify(findings, null, 2),
);
await fs.writeFile(
  `${dir}/index.html`,
  `<!doctype html><html lang="en"><meta charset="utf-8"><title>Phase 3 visual QA</title><style>body{font:16px/1.5 system-ui;background:#fafaf7;color:#17212d;max-width:1440px;margin:32px auto}img{max-width:100%;border:1px solid #cbd5e1}a{color:#1d4ed8}section{margin:48px 0}</style><h1>Phase 3 · native viewport captures</h1><p>Click an image to inspect at its original dimensions. Computed text checks: <a href="browser-findings.json">browser findings</a>.</p><a href="screenshots/projects-before.png">Phase 2 baseline</a>${findings.screenshots.map((n) => `<section><h2>${n}</h2><a href="screenshots/${n}.png"><img loading="lazy" src="screenshots/${n}.png" alt="${n}"></a></section>`).join("")}</html>`,
);
console.log(
  JSON.stringify(
    {
      errors: findings.errors,
      overflow: findings.overflow.filter((x) => x.width > x.viewport),
      readability: findings.readability.filter((x) => x.failures.length),
      screenshots: findings.screenshots.length,
    },
    null,
    2,
  ),
);
await browser.close();
assert.equal(findings.errors.length, 0, "Browser runtime errors");
assert.equal(
  findings.overflow.filter((x) => x.width > x.viewport).length,
  0,
  "Horizontal body overflow",
);
assert.equal(
  findings.readability.flatMap((x) => x.failures).length,
  0,
  "Computed typography or contrast failures",
);
