import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://localhost:3002";
const dir = "artifacts/phase-2";
await mkdir(`${dir}/screenshots`, { recursive: true });
const browser = await chromium.launch();
const findings = { errors: [], warnings: [], screenshots: [] };
for (const [width, height] of [
  [1920, 1080],
  [1440, 900],
  [1440, 700],
  [1024, 768],
  [390, 844],
  [375, 812],
]) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: width < 768,
    hasTouch: width < 768,
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => findings.errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "warning" || m.type() === "error")
      findings.warnings.push(m.text());
  });
  async function shot(name, fullPage = false) {
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(350);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert.equal(overflow, false, `${width} ${name} overflow`);
    const file = `${width}x${height}-${name}.png`;
    await page.screenshot({ path: `${dir}/screenshots/${file}`, fullPage });
    findings.screenshots.push({
      file,
      width,
      height,
      name,
      fullPage,
      overflow,
    });
  }
  await page.goto(`${base}/projects/personal`);
  await page.waitForTimeout(600);
  await shot("grid");
  await shot("grid-full", true);
  await page.getByRole("button", { name: "List view", exact: true }).click();
  await shot("list", true);
  await page.getByRole("button", { name: "Grid view", exact: true }).click();
  if (width >= 768) {
    await page.getByRole("combobox", { name: "Switch workspace" }).click();
    await shot("workspace-selector");
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Collapse sidebar", exact: true })
      .click();
    await shot("collapsed");
    await page
      .getByRole("button", { name: "Expand sidebar", exact: true })
      .click();
    await page.getByRole("link", { name: "Open IronLog", exact: true }).hover();
    await shot("card-hover");
    await page.getByRole("link", { name: "Open IronLog", exact: true }).focus();
    await shot("card-focus");
  } else {
    await page
      .getByRole("button", { name: "Open workspace navigation" })
      .click();
    await shot("mobile-navigation");
    await page
      .getByRole("dialog", { name: "Workspace navigation", exact: true })
      .getByRole("combobox", { name: "Switch workspace" })
      .click();
    await shot("workspace-selector");
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
  }
  await page.getByRole("button", { name: "Pin IronLog", exact: true }).click();
  await shot("favorites", true);
  await page
    .getByRole("button", { name: "Actions for IronLog", exact: true })
    .click();
  await shot("context-menu");
  await page.keyboard.press("Escape");
  await page.getByRole("searchbox").fill("Python");
  await page.getByLabel("Filter by health").selectOption("degraded");
  await shot("filtered", true);
  await page.getByRole("searchbox").fill("No matching app");
  await shot("no-results");
  await page.goto(`${base}/projects/northstar/payment-gateway`);
  await shot("project-detail", true);
  await page.goto(`${base}/projects/sandbox`);
  await shot("empty-workspace");
  await page
    .getByRole("button", { name: /Create demo project/ })
    .first()
    .click();
  await shot("create-modal");
  await page
    .getByRole("dialog", { name: "Create demo project" })
    .getByRole("button", { name: /Create demo project/ })
    .click();
  await shot("validation");
  await context.close();
}
const reduced = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const page = await reduced.newPage();
await page.goto(`${base}/projects/northstar`);
await page.screenshot({
  path: `${dir}/screenshots/reduced-motion.png`,
  fullPage: true,
});
await reduced.close();
await browser.close();
await writeFile(
  `${dir}/browser-findings.json`,
  JSON.stringify(findings, null, 2),
);
assert.equal(findings.errors.length, 0);
assert.equal(findings.warnings.length, 0);
const sections = findings.screenshots
  .map(
    (s) =>
      `<figure><a href="screenshots/${s.file}"><img src="screenshots/${s.file}" loading="lazy" alt="${s.width} by ${s.height}: ${s.name}"></a><figcaption>${s.width} × ${s.height} / ${s.name}</figcaption></figure>`,
  )
  .join("");
await writeFile(
  `${dir}/index.html`,
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>AegisOps — Phase 2 evidence</title><style>body{background:#e0e0da;color:#282828;font:14px Arial;margin:32px}h1{text-transform:uppercase;font-size:36px}p{max-width:750px;line-height:1.6}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:20px}figure{margin:0;border:1px solid #b3b3af;padding:12px}img{width:100%;height:280px;object-fit:contain;object-position:top}figcaption{padding-top:12px;font:11px monospace;text-transform:uppercase}a{color:inherit}</style><h1>AegisOps / Phase 2</h1><p>Real Chromium captures of the frontend demonstration. Six viewport sizes, project grid and register, scoped details, selectors, favorites, validation and mobile navigation. Click an image for its full resolution. These are review artifacts, not a claim of cross-browser or accessibility certification.</p><p><a href="../../PHASE_2_IMPLEMENTATION_REPORT.md">Implementation report</a> · <a href="browser-findings.json">Browser findings</a> · <a href="screenshots/reduced-motion.png">Reduced motion capture</a></p><main>${sections}</main></html>`,
);
console.log(
  `Captured ${findings.screenshots.length + 1} screenshots. No page errors, console warnings or horizontal overflow.`,
);
