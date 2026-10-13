import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch();
const findings = [];
for (const [width, height] of [
  [1440, 900],
  [1920, 1080],
  [390, 844],
  [1440, 700],
]) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: width < 600,
    hasTouch: width < 600,
  });
  await context.addInitScript(() =>
    sessionStorage.setItem("heron-entered", "1"),
  );
  const page = await context.newPage();
  page.on("pageerror", (e) =>
    findings.push({ viewport: `${width}x${height}`, error: e.message }),
  );
  for (const [name, route] of [
    ["home", "/"],
    ["dashboard", "/heron-dashboard"],
  ]) {
    await page.goto(`${process.env.TEST_BASE_URL || "http://localhost:3002"}${route}`);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `artifacts/screenshots/${name}-${width}x${height}.png`,
    });
    const overflowing = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((e) => {
          const b = e.getBoundingClientRect();
          return (
            b.width &&
            b.right > innerWidth + 1 &&
            getComputedStyle(e).position !== "fixed" &&
            !(e instanceof SVGElement)
          );
        })
        .map((e) => ({
          tag: e.tagName,
          class: e.className,
          right: e.getBoundingClientRect().right,
        }))
        .slice(0, 15),
    );
    findings.push({ name, width, height, documentWidth: await page.evaluate(() => document.documentElement.scrollWidth), overflowing });
    if ((width === 1440 && height === 900) || width === 390) {
      const selectors =
        name === "home"
          ? [
              ".intro",
              ".problem-section",
              ".model-workflow",
              ".platform-section",
              ".why-section",
              ".use-cases",
              ".final-cta",
              ".footer",
            ]
          : [".feature-sequence", ".three-steps", ".faq-section", ".footer"];
      for (const selector of selectors) {
        await page
          .locator(selector)
          .evaluate((e) =>
            window.scrollTo({
              top: e.getBoundingClientRect().top + scrollY - 64,
              behavior: "instant",
            }),
          );
        await page.waitForTimeout(1100);
        await page.screenshot({
          path: `artifacts/screenshots/${name}-${width}-${selector.slice(1)}.png`,
        });
      }
    }
  }
  await context.close();
}
await writeFile(
  "artifacts/visual-findings.json",
  JSON.stringify(findings, null, 2),
);
await browser.close();
console.log(JSON.stringify(findings, null, 2));
