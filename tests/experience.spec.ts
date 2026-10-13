import { test, expect } from "@playwright/test";
import { drawingPoint, overlaps, selectionBox } from "../lib/geometry";

test("selection math handles reversed drags, edge overlap and letterboxing", () => {
  expect(selectionBox({ x: 90, y: 80 }, { x: 20, y: 10 })).toEqual({
    x: 20,
    y: 10,
    width: 70,
    height: 70,
  });
  expect(
    overlaps(
      { x: 0, y: 0, width: 20, height: 20 },
      { x: 20, y: 20, width: 5, height: 5 },
    ),
  ).toBe(true);
  expect(
    overlaps(
      { x: 0, y: 0, width: 20, height: 20 },
      { x: 21, y: 21, width: 5, height: 5 },
    ),
  ).toBe(false);
  expect(
    drawingPoint(
      { x: 510, y: 520 },
      { x: 10, y: 20, width: 1000, height: 1000 },
    ),
  ).toEqual({ x: 500, y: 310 });
});

test.describe("site experience", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() =>
      sessionStorage.setItem("heron-entered", "1"),
    );
  });
  for (const size of [
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
    { width: 390, height: 844 },
    { width: 1440, height: 700 },
  ]) {
    for (const route of ["/", "/heron-dashboard"])
      test(`${route} fits ${size.width}×${size.height} without runtime errors`, async ({
        page,
      }) => {
        await page.setViewportSize(size);
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(route);
        await expect(page.locator("h1")).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(size.width);
        await expect(page.locator("footer")).toBeAttached();
        expect(errors).toEqual([]);
      });
  }
  test("hero drag, keyboard inspection and clear work", async ({ page }) => {
    await page.goto("/");
    const svg = page.locator(".interactive-elevation"),
      box = (await svg.boundingBox())!;
    const scale = Math.min(box.width / 1000, box.height / 620),
      ox = box.x + (box.width - scale * 1000) / 2,
      oy = box.y + (box.height - scale * 620) / 2;
    await page.mouse.move(ox + 235 * scale, oy + 345 * scale);
    await page.mouse.down();
    await page.mouse.move(ox + 330 * scale, oy + 440 * scale, { steps: 10 });
    await expect(page.locator(".issue-marker").nth(0)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator(".issue-marker").nth(1)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await page.mouse.up();
    await page.getByRole("button", { name: "Inspect all issues" }).click();
    await expect(page.locator(".issue-marker[aria-pressed=true]")).toHaveCount(
      3,
    );
    await page.getByRole("button", { name: "Clear inspection" }).click();
    const marker = page.getByRole("button", {
      name: "Inspect Door maneuvering clearance",
    });
    await marker.focus();
    await page.keyboard.press("Enter");
    await expect(marker).toHaveAttribute("aria-pressed", "true");
  });
  test("platform tabs support keyboard and persona accordion toggles", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "Revit", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByRole("tab", { name: "Rhino", exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".viewport-badge")).toContainText("RHINO");
    const persona = page.getByRole("button", { name: "BIM managers" });
    await persona.click();
    await expect(persona).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#persona-4")).toBeVisible();
  });
  test("scroll phases reverse and route changes clean up pins", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#workflow").scrollIntoViewIfNeeded();
    await page
      .locator(".phase-nav")
      .getByRole("button", { name: "Learn" })
      .click();
    await expect(page.locator(".phase-nav button").nth(3)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator(".workflow-copy").nth(3)).toHaveCSS(
      "opacity",
      "1",
    );
    await expect(page.locator(".workflow-drawing .editable-door")).toHaveAttribute("d", "M423 191h54a54 54 0 0 1-54 54");
    await page
      .locator(".phase-nav")
      .getByRole("button", { name: "Advise" })
      .click();
    await expect(page.locator(".phase-nav button").nth(1)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator(".workflow-drawing .editable-door")).toHaveAttribute("d", "M423 191h-54a54 54 0 0 0 54 54");
    await page.locator(".product-menu summary").hover();
    await page
      .locator(".product-menu")
      .getByRole("link", { name: "Heron Dashboard" })
      .click();
    await expect(page).toHaveURL("/heron-dashboard");
    await expect(page.locator(".route-curtain")).toHaveAttribute(
      "data-active",
      "false",
    );
    await expect(page.locator(".pin-spacer")).toHaveCount(1);
    await page.getByRole("link", { name: "Heron AI home" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.locator(".pin-spacer")).toHaveCount(1);
    await expect(page.locator(".route-curtain")).toHaveAttribute(
      "data-active",
      "false",
    );
  });
  test("dashboard feature navigation and approval decisions", async ({
    page,
  }) => {
    await page.goto("/heron-dashboard");
    await expect(page.locator(".feature-track .pin-spacer")).toBeAttached();
    await page.getByRole("button", { name: "Approval Queue" }).click();
    await expect(page.locator(".feature-tabs button").nth(1)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.locator(".approval-actions").getByRole("button", { name: "Approve" }).click();
    await expect(page.getByRole("status")).toContainText("approved");
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await page.getByRole("button", { name: "Reject", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("rejected");
    await page.getByRole("button", { name: "Firm Standards" }).click();
    await expect(page.locator(".feature-tabs button").nth(4)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator("#feature-4")).toHaveCSS("opacity", "1");
  });
  test("FAQ supports keyboard open and close", async ({ page }) => {
    await page.goto("/heron-dashboard#faq");
    const question = page.getByRole("button", {
      name: "Can my team share the same dashboard?",
    });
    await question.focus();
    await page.keyboard.press("Enter");
    await expect(question).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#faq-a-3")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("#faq-a-3")).toBeHidden();
  });
  test("footer lens follows the pointer and collapses on exit", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.locator(".footer-wordmark");
    await footer.scrollIntoViewIfNeeded();
    const box = (await footer.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
    const lens = footer.locator("mask circle");
    await expect
      .poll(async () => Number(await lens.getAttribute("r")))
      .toBeGreaterThan(100);
    await expect
      .poll(async () => Number(await lens.getAttribute("cx")))
      .toBeLessThan(450);
    await page.mouse.move(5, 5);
    await expect
      .poll(async () => Number(await lens.getAttribute("r")))
      .toBeLessThan(1);
  });
  test("reduced motion removes pins and exposes all features", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await expect(page.locator(".custom-cursor")).toBeHidden();
    await expect(page.locator(".preloader")).toBeHidden();
    await page.goto("/heron-dashboard");
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    for (const panel of await page.locator(".feature-panel").all())
      await expect(panel).toBeVisible();
  });
});

test("touch navigation, inspection and modal escape", async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3002",
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await context.addInitScript(() =>
    sessionStorage.setItem("heron-entered", "1"),
  );
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator(".custom-cursor")).toBeHidden();
  await page.getByRole("button", { name: "Inspect all issues" }).tap();
  await expect(page.locator(".issue-marker[aria-pressed=true]")).toHaveCount(3);
  await page.getByRole("button", { name: "Menu" }).tap();
  await expect(page.locator("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).toBeHidden();
  await page.getByRole("button", { name: "Menu" }).tap();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Heron Dashboard" })
    .tap();
  await expect(page).toHaveURL(/heron-dashboard$/);
  await expect(page.locator("dialog")).toBeHidden();
  await context.close();
});

test("preloader finishes and does not repeat in the session", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".preloader")).toBeHidden({ timeout: 8000 });
  await expect(page.locator("[data-counter]")).toHaveText("100%");
  await page.reload();
  await expect(page.locator(".preloader")).toBeHidden();
});
