import { test, expect, type Page } from "@playwright/test";

async function scrub(
  page: Page,
  track: string,
  progress: number,
  screens: number,
) {
  await page.evaluate(
    ({ track, progress, screens }) => {
      const el = document.querySelector(track)!;
      const start =
        el.getBoundingClientRect().top +
        scrollY -
        document.querySelector("header")!.offsetHeight -
        8;
      window.scrollTo({
        top: start + innerHeight * screens * progress,
        behavior: "instant",
      });
    },
    { track, progress, screens },
  );
  await page.waitForTimeout(1100);
}
const styles = (page: Page, selector: string, property: string) =>
  page
    .locator(selector)
    .first()
    .evaluate(
      (el, property) => getComputedStyle(el).getPropertyValue(property),
      property,
    );

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("heron-entered", "1"));
});

test("workflow continuously changes geometry, reverses, and releases its pin after resize", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".workflow-track .pin-spacer")).toBeAttached();
  await scrub(page, ".workflow-track", 0.3, 6);
  const door = page.locator(".workflow-drawing .editable-door");
  const before = await door.getAttribute("d");
  await scrub(page, ".workflow-track", 0.58, 6);
  const intermediate = await door.getAttribute("d");
  expect(intermediate).not.toBe(before);
  expect(intermediate).not.toBe("M423 191h54a54 54 0 0 1-54 54");
  await scrub(page, ".workflow-track", 0.9, 6);
  await expect(door).toHaveAttribute("d", "M423 191h54a54 54 0 0 1-54 54");
  const route = await styles(
    page,
    ".model-standard-route",
    "stroke-dashoffset",
  );
  expect(parseFloat(route)).toBeLessThan(0.15);
  await scrub(page, ".workflow-track", 0.3, 6);
  await expect(door).toHaveAttribute("d", before!);
  expect(
    parseFloat(
      await styles(page, ".model-standard-route", "stroke-dashoffset"),
    ),
  ).toBe(1);
  await page.setViewportSize({ width: 1440, height: 700 });
  await scrub(page, ".workflow-track", 1.08, 6);
  await expect(page.locator(".platform-section")).toBeInViewport();
  expect(
    await page
      .locator("#workflow")
      .evaluate((el) => el.getBoundingClientRect().bottom),
  ).toBeLessThan(700);
});

for (const [index, selector, property] of [
  [0, ".window-stack > div", "transform"],
  [1, ".plan-alert", "transform"],
  [2, ".history-spine", "transform"],
  [3, ".team-spine", "transform"],
  [4, ".standard-connection", "stroke-dashoffset"],
] as const) {
  test(`dashboard feature ${index + 1} has reversible internal motion`, async ({
    page,
  }) => {
    await page.goto("/heron-dashboard");
    await expect(page.locator(".feature-track .pin-spacer")).toBeAttached();
    await scrub(page, ".feature-track", (index + 0.16) / 5, 4);
    const target = `#feature-${index} ${selector}`;
    const early = await styles(page, target, property);
    await scrub(page, ".feature-track", (index + 0.8) / 5, 4);
    expect(await styles(page, target, property)).not.toBe(early);
    await scrub(page, ".feature-track", (index + 0.16) / 5, 4);
    const reversed = await styles(page, target, property);
    const numbers = (value: string) =>
      (value.match(/-?\d*\.?\d+/g) || []).map(Number);
    const expected = numbers(early);
    const actual = numbers(reversed);
    expect(actual).toHaveLength(expected.length);
    // Scrub interpolation can leave subpixel differences; a 0.02px tolerance still catches drift.
    actual.forEach((value, i) =>
      expect(Math.abs(value - expected[i])).toBeLessThan(0.02),
    );
  });
}

test("ink changes at intermediate scroll positions and reverses", async ({
  page,
}) => {
  await page.goto("/");
  const sample = async (progress: number) => {
    await page.locator(".ink-art").evaluate((el, progress) => {
      const box = el.getBoundingClientRect();
      window.scrollTo({
        top: box.top + scrollY - innerHeight * 0.65 + box.height * progress,
        behavior: "instant",
      });
    }, progress);
    await page.waitForTimeout(850);
    return page.locator(".ink-edge").getAttribute("d");
  };
  const states = [];
  for (const progress of [0, 0.25, 0.5, 0.75, 1])
    states.push(await sample(progress));
  expect(new Set(states).size).toBe(5);
  expect(await sample(0.25)).toBe(states[1]);
});

test("touch workflow keeps its model interactive without a pin", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  const nav = page.locator(".phase-nav");
  await nav.getByRole("button", { name: "Learn" }).click();
  await expect(
    page.locator(".workflow-drawing .editable-door"),
  ).toHaveAttribute("d", "M423 191h54a54 54 0 0 1-54 54");
  await nav.getByRole("button", { name: "Observe" }).click();
  await expect(
    page.locator(".workflow-drawing .editable-door"),
  ).toHaveAttribute("d", "M423 191h-54a54 54 0 0 0 54 54");
});

test("reduced motion shows dashboard content and allows instant model inspection", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .locator(".phase-nav")
    .getByRole("button", { name: "Learn" })
    .click();
  await expect(
    page.locator(".workflow-drawing .editable-door"),
  ).toHaveAttribute("d", "M423 191h54a54 54 0 0 1-54 54");
  await page.goto("/heron-dashboard");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".standard-saved")).toBeVisible();
  expect(await styles(page, ".history-spine", "transform")).toBe("none");
});

test("navigation and browser history remove scene transforms and duplicate pins", async ({
  page,
}) => {
  await page.goto("/");
  await scrub(page, ".workflow-track", 0.9, 6);
  await page.locator(".product-menu summary").hover();
  await page
    .locator(".product-menu")
    .getByRole("link", { name: "Heron Dashboard" })
    .click();
  await expect(page).toHaveURL("/heron-dashboard");
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  await expect(page.locator(".model-narrative")).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL("/");
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  await scrub(page, ".workflow-track", 0.3, 6);
  await expect(
    page.locator(".workflow-drawing .editable-door"),
  ).toHaveAttribute("d", "M423 191h-54a54 54 0 0 0 54 54");
});

test("first-load curtain is visible before hydration, without blocking a script-free page", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route("**/_next/**/*.js", (route) => route.abort());
  await page.goto(process.env.TEST_BASE_URL || "http://localhost:3002", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator(".preloader")).toBeVisible();
  await expect(page.locator("html")).not.toHaveClass(/heron-skip-loader/);
  await context.close();
  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(process.env.TEST_BASE_URL || "http://localhost:3002");
  await expect(staticPage.locator(".preloader")).toBeHidden();
  await expect(staticPage.locator("h1")).toBeVisible();
  await staticContext.close();
});
