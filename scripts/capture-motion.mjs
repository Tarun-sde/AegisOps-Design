import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.TEST_BASE_URL || "http://localhost:3002";
const dir = "artifacts/motion";
await mkdir(`${dir}/frames`, { recursive: true });
await mkdir(`${dir}/video`, { recursive: true });
const browser = await chromium.launch();
const findings = { errors: [], warnings: [], states: [] };
async function session(name, route, run, skip = true) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: `${dir}/video`, size: { width: 1440, height: 900 } },
  });
  if (skip)
    await context.addInitScript(() =>
      sessionStorage.setItem("heron-entered", "1"),
    );
  const page = await context.newPage();
  page.on("pageerror", (e) => findings.errors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() === "warning") findings.warnings.push(msg.text());
  });
  await page.goto(base + route);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(skip ? 1700 : 300);
  await run(page);
  const video = page.video();
  await context.close();
  await video.saveAs(`${dir}/video/${name}.webm`);
  await video.delete();
}
async function frame(page, name, selector = "main") {
  await page.screenshot({ path: `${dir}/frames/${name}.png` });
  findings.states.push({
    name,
    scrollY: await page.evaluate(() => scrollY),
    layers: await page
      .locator(
        ".workflow-drawing .editable-door, .model-clearance, .model-standard-route, .feature-panel .history-spine, .feature-panel .team-spine, .standard-connection, .ink-edge, .ink-displacement",
      )
      .evaluateAll((nodes) =>
        nodes.map((el) => ({
          class: el.getAttribute("class"),
          d: el.getAttribute("d"),
          x: el.getAttribute("x"),
          scale: el.getAttribute("scale"),
          transform: getComputedStyle(el).transform,
          opacity: getComputedStyle(el).opacity,
          dashOffset: getComputedStyle(el).strokeDashoffset,
        })),
      ),
    geometry: await page
      .locator(selector)
      .first()
      .evaluate((el) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          transform: getComputedStyle(el).transform,
          path: el.getAttribute("d"),
          attributeX: el.getAttribute("x"),
        };
      }),
  });
}
async function move(page, top) {
  const start = await page.evaluate(() => scrollY);
  for (let i = 1; i <= 16; i++) {
    await page.evaluate(
      (top) => window.scrollTo({ top, behavior: "instant" }),
      start + ((top - start) * i) / 16,
    );
    await page.waitForTimeout(35);
  }
  await page.waitForTimeout(1150);
}
async function track(page, selector, screens) {
  await page.locator(`${selector} .pin-spacer`).waitFor();
  return page.locator(selector).evaluate(
    (el, screens) => ({
      start:
        el.getBoundingClientRect().top +
        scrollY -
        document.querySelector("header").offsetHeight -
        8,
      distance: innerHeight * screens,
    }),
    screens,
  );
}
await session(
  "01-preloader-entrance",
  "/",
  async (page) => {
    for (let i = 0; i < 5; i++) {
      await frame(page, `entrance-${i * 25}`);
      await page.waitForTimeout(1000);
    }
  },
  false,
);
await session("02-hero-drag-interaction", "/", async (page) => {
  const box = await page.locator(".hero-drawing > svg").boundingBox();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3);
  await page.mouse.down();
  for (let i = 0; i < 5; i++) {
    await page.mouse.move(
      box.x + box.width * (0.2 + i * 0.15),
      box.y + box.height * (0.3 + i * 0.12),
      { steps: 12 },
    );
    await page.waitForTimeout(200);
    await frame(page, `inspection-${i * 25}`);
  }
  await page.mouse.up();
});
await session("03-observe-advise-act-learn", "/", async (page) => {
  const { start, distance } = await track(page, ".workflow-track", 6);
  for (const p of [0, 0.25, 0.5, 0.75, 1]) {
    await move(page, start + distance * p);
    await frame(
      page,
      `workflow-${p * 100}`,
      ".workflow-drawing .editable-door",
    );
  }
  for (const p of [0.12, 0.38, 0.58, 0.68, 0.88]) {
    await move(page, start + distance * p);
    await frame(
      page,
      `workflow-detail-${Math.round(p * 100)}`,
      ".model-clearance",
    );
  }
  await move(page, start + distance * 0.12);
});
await session("04-footer-lens-reveal", "/", async (page) => {
  await page.locator(".footer-wordmark").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const box = await page.locator(".footer-wordmark").boundingBox();
  for (let i = 0; i < 5; i++) {
    await page.mouse.move(
      box.x + box.width * (0.1 + i * 0.2),
      box.y + box.height * 0.5,
      { steps: 18 },
    );
    await page.waitForTimeout(600);
    await frame(page, `lens-${i * 25}`);
  }
  await page.mouse.move(4, 4);
  await page.waitForTimeout(900);
});
await session(
  "05-dashboard-scroll-sequence",
  "/heron-dashboard",
  async (page) => {
    const { start, distance } = await track(page, ".feature-track", 4);
    for (let i = 0; i < 5; i++) {
      for (const p of [0, 0.25, 0.5, 0.75, 1]) {
        // 8–82% of each phase contains its internal scene; avoid sampling a hidden outgoing panel.
        await move(page, start + (distance * (i + 0.08 + p * 0.74)) / 5);
        await frame(
          page,
          `feature-${i + 1}-${p * 100}`,
          `#feature-${i} .product-preview`,
        );
      }
    }
    await move(page, start + distance * 0.48);
  },
);
await session("06-page-transition", "/", async (page) => {
  await page.locator(".product-menu summary").hover();
  await page
    .locator(".product-menu")
    .getByRole("link", { name: "Heron Dashboard" })
    .click();
  for (let i = 0; i < 5; i++) {
    await frame(page, `navigation-${i * 25}`);
    await page.waitForTimeout(240);
  }
  await page.waitForTimeout(1200);
  await page.getByRole("link", { name: "Heron AI home" }).click();
  await page.waitForTimeout(2000);
});
await session("07-ink-reveal", "/", async (page) => {
  const art = await page.locator(".ink-art").evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top + scrollY - innerHeight * 0.65, height: r.height };
  });
  for (const p of [0, 0.25, 0.5, 0.75, 1]) {
    await move(page, art.top + art.height * p);
    await frame(page, `ink-${p * 100}`, ".ink-art");
  }
  await move(page, art.top + art.height * 0.25);
});
for (const size of [
  { width: 1440, height: 700 },
  { width: 1920, height: 1080 },
  { width: 390, height: 844 },
]) {
  const context = await browser.newContext({
    viewport: size,
    isMobile: size.width === 390,
    hasTouch: size.width === 390,
  });
  await context.addInitScript(() =>
    sessionStorage.setItem("heron-entered", "1"),
  );
  const page = await context.newPage();
  page.on("pageerror", (e) => findings.errors.push(e.message));
  for (const route of ["/", "/heron-dashboard"]) {
    await page.goto(base + route);
    await page.waitForTimeout(1600);
    if (size.width === 390) {
      if (route === "/")
        await page
          .locator(".phase-nav")
          .getByRole("button", { name: "Act", exact: false })
          .click();
      else
        await page
          .locator("#feature-2 .feature-visual")
          .scrollIntoViewIfNeeded();
      await page.waitForTimeout(1200);
    } else {
      const t = await track(
        page,
        route === "/" ? ".workflow-track" : ".feature-track",
        route === "/" ? 6 : 4,
      );
      await move(page, t.start + t.distance * 0.6);
    }
    await frame(
      page,
      `${route === "/" ? "home" : "dashboard"}-${size.width}x${size.height}`,
    );
    const width = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    if (width > size.width)
      findings.errors.push(`Overflow ${route} ${size.width}: ${width}`);
  }
  await context.close();
}
await browser.close();
await writeFile(
  `${dir}/browser-findings.json`,
  JSON.stringify(findings, null, 2),
);
console.log(
  `Captured ${findings.states.length} frames; ${findings.errors.length} errors; ${findings.warnings.length} warnings.`,
);
if (findings.errors.length || findings.warnings.length) process.exitCode = 1;
