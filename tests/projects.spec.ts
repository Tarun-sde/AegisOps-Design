import { test, expect, type Page } from "@playwright/test";
import {
  demoProjects,
  selectProjects,
  type ProjectQuery,
} from "../lib/demo/projects";
import { validLocalProject } from "../lib/demo/store";
const query: ProjectQuery = {
  search: "",
  health: "",
  environment: "",
  sort: "activity",
};
const cards = (page: Page) => page.locator(".ws-project-card");
async function workspace(page: Page, name: string) {
  await page.getByRole("combobox", { name: "Switch workspace" }).click();
  await page.getByRole("option", { name: new RegExp(name) }).click();
  await expect(page.locator("h1")).toContainText("Your Projects");
}
test("selectors are deterministic, immutable and compose all search fields", () => {
  const original = demoProjects.map((p) => p.id);
  expect(
    selectProjects(demoProjects, {
      ...query,
      search: " REDIS ",
      health: "critical",
      environment: "production",
    }).map((p) => p.id),
  ).toEqual(["authentication"]);
  expect(
    selectProjects(demoProjects, { ...query, search: "fitness" }).map(
      (p) => p.id,
    ),
  ).toEqual(["ironlog"]);
  expect(
    selectProjects(demoProjects, { ...query, search: "development" }).map(
      (p) => p.id,
    ),
  ).toEqual(["portfolio-api"]);
  expect(
    selectProjects(demoProjects, { ...query, sort: "health" }).map(
      (p) => p.health,
    ),
  ).toEqual([
    "critical",
    "degraded",
    "degraded",
    "unknown",
    "unknown",
    "healthy",
    "healthy",
  ]);
  expect(selectProjects(demoProjects, query)[0].id).toBe("customer-portal");
  expect(
    selectProjects([...demoProjects].reverse(), { ...query, sort: "name" }),
  ).toEqual(selectProjects(demoProjects, { ...query, sort: "name" }));
  expect(demoProjects.map((p) => p.id)).toEqual(original);
  for (const p of demoProjects) {
    expect(new Set(p.services.map((s) => s.id)).size).toBe(p.services.length);
    if (p.monitoringStatus !== "connected") {
      expect(p.health).toBe("unknown");
      expect(p.lastSignalAt).toBeNull();
    }
  }
});
test("stored local projects reject malformed or invented telemetry", () => {
  const local = {
    ...demoProjects[0],
    id: "local-test",
    services: [],
    activities: [],
    monitoringStatus: "pending",
    health: "unknown",
    activeIncidentCount: 0,
    lastSignalAt: null,
    local: true,
  };
  expect(validLocalProject(local)).toBe(true);
  for (const change of [
    { health: "healthy" },
    { lastSignalAt: "2026-10-14" },
    { workspaceId: "missing" },
    { name: "  " },
    { services: null },
    { id: "../../bad" },
    { activities: [{}] },
    { name: "x".repeat(81) },
  ])
    expect(validLocalProject({ ...local, ...change })).toBe(false);
});
test("entry, workspace switching, counts and remembered route", async ({
  page,
}) => {
  await page.goto("/projects");
  await expect(page).toHaveURL(/\/projects\/personal$/);
  await expect(cards(page)).toHaveCount(3);
  await workspace(page, "Northstar");
  await expect(page).toHaveURL(/\/northstar$/);
  await expect(cards(page)).toHaveCount(4);
  await expect(page.locator("main")).not.toContainText("IronLog");
  await page.reload();
  await expect(cards(page)).toHaveCount(4);
  await page.goto("/projects");
  await expect(page).toHaveURL(/\/northstar$/);
  await workspace(page, "Sandbox");
  await expect(cards(page)).toHaveCount(0);
  await expect(page.getByText("Room for your next idea.")).toBeVisible();
});
test("search, clear, filters, reset and grid/list retain the same results", async ({
  page,
}) => {
  await page.goto("/projects/northstar");
  await page.getByRole("searchbox").fill("JAVA");
  await expect(cards(page)).toHaveCount(1);
  await expect(cards(page).first()).toContainText("Payment Gateway");
  await page.getByLabel("Filter by health").selectOption("degraded");
  await page.getByLabel("Filter by environment").selectOption("production");
  await page.getByRole("button", { name: "List view", exact: true }).click();
  await expect(page.locator(".ws-project-row")).toHaveCount(1);
  await expect(page.getByRole("searchbox")).toHaveValue("JAVA");
  await page.getByRole("button", { name: "Grid view", exact: true }).click();
  await expect(cards(page)).toHaveCount(1);
  await page.getByLabel("Filter by environment").selectOption("staging");
  await expect(
    page.getByText("No projects found", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Reset all filters/ })
    .first()
    .click();
  await expect(cards(page)).toHaveCount(4);
  await expect(page.getByRole("searchbox")).toBeFocused();
  await page.getByRole("searchbox").fill("zzz");
  await expect(cards(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(cards(page)).toHaveCount(4);
});
test("sorting orders project collection and list groups environments", async ({
  page,
}) => {
  await page.goto("/projects/northstar");
  await expect(cards(page).first()).toHaveAttribute(
    "data-project",
    "customer-portal",
  );
  await page.getByLabel("Sort projects").selectOption("health");
  await expect(cards(page).first()).toHaveAttribute(
    "data-project",
    "authentication",
  );
  await expect(cards(page).nth(1)).toHaveAttribute(
    "data-project",
    "payment-gateway",
  );
  await page.getByLabel("Sort projects").selectOption("name");
  await expect(cards(page).nth(1)).toHaveAttribute(
    "data-project",
    "customer-portal",
  );
  await page.getByRole("button", { name: "List view", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "production projects" }).locator("li"),
  ).toHaveCount(3);
  await expect(
    page.getByRole("region", { name: "staging projects" }).locator("li"),
  ).toHaveCount(1);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "List view", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("favorites and context menu persist, remain scoped, and do not open card accidentally", async ({
  page,
}) => {
  await page.goto("/projects/personal");
  await page
    .getByRole("button", { name: "Actions for IronLog", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "Add favorite", exact: true })
    .click();
  await expect(page).toHaveURL(/\/personal$/);
  await expect(page.locator(".ws-favorites")).toContainText("IronLog");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Unpin IronLog", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await workspace(page, "Northstar");
  await expect(page.locator(".ws-favorites")).toHaveCount(0);
  await expect(
    page.locator(".ws-sidebar .ws-sidebar-favorites"),
  ).not.toContainText("IronLog");
  await page
    .getByRole("button", { name: "Actions for Payment Gateway", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "View services", exact: true })
    .click();
  await expect(page).toHaveURL(/payment-gateway#services$/);
  await expect(page.locator("#services")).toContainText("Queue Worker");
});
for (const project of demoProjects)
  test(`project link and direct data: ${project.name}`, async ({ page }) => {
    await page.goto(`/projects/${project.workspaceId}`);
    await page
      .getByRole("link", { name: `Open ${project.name}`, exact: true })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/projects/${project.workspaceId}/${project.id}$`),
    );
    await expect(page.locator("h1")).toHaveText(project.name);
    await expect(page.locator(".ws-service-list li")).toHaveCount(
      project.services.length,
    );
    for (const service of project.services)
      await expect(page.locator("#services")).toContainText(service.name);
    await expect(page.locator("#activity")).toContainText(
      project.activities[0].message,
    );
    await page.reload();
    await expect(page.locator("h1")).toHaveText(project.name);
  });
test("switch project, breadcrumbs and native history follow the correct scope", async ({
  page,
}) => {
  await page.goto("/projects/northstar/payment-gateway");
  await page.getByRole("combobox", { name: "Switch project" }).click();
  await page.getByRole("option", { name: /Customer Portal/ }).click();
  await expect(page.locator("h1")).toHaveText("Customer Portal");
  await expect(page.locator("#services")).not.toContainText("Payment API");
  await page.goBack();
  await expect(page.locator("h1")).toHaveText("Payment Gateway");
  await page.goForward();
  await expect(page.locator("h1")).toHaveText("Customer Portal");
  await page
    .getByRole("navigation", { name: "Breadcrumb", exact: true })
    .getByRole("link", { name: "Northstar Engineering", exact: true })
    .click();
  await expect(cards(page)).toHaveCount(4);
});
test("unknown workspace, unknown project and wrong workspace are useful states", async ({
  page,
}) => {
  await page.goto("/projects/missing");
  await expect(page.locator("h1")).toHaveText("Workspace not found");
  for (const route of [
    "/projects/personal/missing",
    "/projects/personal/payment-gateway",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toHaveText("Project not found");
  }
  await page.getByRole("link", { name: /Back to Projects/ }).click();
  await expect(cards(page)).toHaveCount(3);
});
test("creation validates names and duplicates, persists honest data in target workspace", async ({
  page,
}) => {
  await page.goto("/projects/personal");
  await page.getByRole("button", { name: /Create demo project/ }).click();
  const dialog = page.getByRole("dialog", { name: "Create demo project" });
  await expect(dialog.getByLabel(/Project name/)).toBeFocused();
  await dialog.getByRole("button", { name: /Create demo project/ }).click();
  await expect(dialog.getByRole("alert")).toContainText("Enter a project name");
  await dialog.getByLabel(/Project name/).fill("  IRONLOG  ");
  await dialog.getByRole("button", { name: /Create demo project/ }).click();
  await expect(dialog.getByRole("alert")).toContainText("already exists");
  await dialog.getByLabel(/Project name/).fill("Billing Dispatcher");
  await dialog
    .getByLabel("Description", { exact: true })
    .fill("Invoice scheduling");
  await dialog.getByLabel("Workspace", { exact: true }).selectOption("sandbox");
  await dialog
    .getByLabel("Environment", { exact: true })
    .selectOption("staging");
  await dialog.getByLabel(/Technology/).fill("Node.js");
  await dialog.getByRole("button", { name: /Create demo project/ }).click();
  await expect(page).toHaveURL(/\/projects\/sandbox\/local-/);
  await expect(page.locator("h1")).toHaveText("Billing Dispatcher");
  await expect(page.locator(".ws-project-badges")).toContainText("pending");
  await expect(page.locator(".ws-project-badges")).toContainText("unknown");
  await expect(page.locator("#services")).toContainText(
    "No services configured",
  );
  await expect(page.locator(".ws-project-facts")).toContainText(
    "No telemetry received",
  );
  await page.reload();
  await expect(page.locator("h1")).toHaveText("Billing Dispatcher");
  await page.getByRole("link", { name: "← All Projects", exact: true }).click();
  await expect(cards(page)).toHaveCount(1);
  await workspace(page, "Personal");
  await expect(cards(page)).toHaveCount(3);
  await expect(page.locator("main")).not.toContainText("Billing Dispatcher");
});
test("keyboard selectors, escape, focus restore, shortcut and collapse", async ({
  page,
}) => {
  await page.goto("/projects/personal");
  const selector = page.getByRole("combobox", { name: "Switch workspace" });
  await selector.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: /Personal/ })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: /Northstar/ })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(selector).toBeFocused();
  await page.keyboard.press("f");
  await expect(selector).toBeFocused();
  await selector.blur();
  await page.locator("h1").click();
  await page.keyboard.press("f");
  await expect(page.getByRole("searchbox")).toBeFocused();
  await page.keyboard.type("f");
  await expect(page.getByRole("searchbox")).toHaveValue("f");
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  const trigger = page.getByRole("button", { name: /Create demo project/ });
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .click();
  await expect(page.locator(".workspace")).toHaveClass(/ws-collapsed/);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Expand sidebar", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Expand sidebar", exact: true })
    .click();
  await expect(page.locator(".workspace")).not.toHaveClass(/ws-collapsed/);
});
for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1440, height: 700 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
])
  test(`workspace responsive, usable and error free at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of [
      "/projects/northstar",
      "/projects/northstar/payment-gateway",
    ]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(viewport.width);
    }
    if (viewport.width < 768) {
      await page
        .getByRole("button", { name: "Open workspace navigation" })
        .click();
      const drawer = page.getByRole("dialog", {
        name: "Workspace navigation",
        exact: true,
      });
      await expect(drawer).toBeVisible();
      await drawer.getByRole("combobox", { name: "Switch workspace" }).click();
      await page.getByRole("option", { name: /Sandbox/ }).click();
      await expect(page).toHaveURL(/\/sandbox$/);
      await expect(drawer).not.toBeVisible();
      await page
        .getByRole("button", { name: "Open workspace navigation" })
        .click();
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: "Open workspace navigation" }),
      ).toBeFocused();
    }
    expect(errors).toEqual([]);
  });
test("reduced motion skips animation and remains functional", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects/personal");
  expect(
    await cards(page)
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
  await page.getByRole("link", { name: "Open IronLog", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("IronLog");
  await expect(page.locator(".route-curtain")).not.toHaveAttribute(
    "data-active",
    "true",
  );
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
});
test("corrupt storage is preserved and projects remain usable", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("aegisops-demo-v1", "{broken"),
  );
  await page.goto("/projects/personal");
  await expect(cards(page)).toHaveCount(3);
  await expect(page.locator(".ws-storage-warning")).toContainText(
    "could not be read",
  );
  await page.getByRole("button", { name: "Pin IronLog", exact: true }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("aegisops-demo-v1")),
  ).toBe("{broken");
});
test("storage write failure keeps newly created project usable with a clear warning", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "aegisops-demo-v1")
        throw new DOMException("Full", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page.goto("/projects/sandbox");
  await page
    .getByRole("button", { name: /Create demo project/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: "Create demo project" });
  await dialog.getByLabel(/Project name/).fill("Ephemeral");
  await dialog.getByRole("button", { name: /Create demo project/ }).click();
  await expect(page.locator("h1")).toHaveText("Ephemeral");
  await expect(page.locator(".ws-storage-warning")).toContainText(
    "will not survive a refresh",
  );
});
test("marketing entry and repeated navigation do not leave pins or scroll locks", async ({
  page,
}) => {
  await page.addInitScript(() => sessionStorage.setItem("heron-entered", "1"));
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: /Workspace/ })
    .click();
  await expect(page).toHaveURL(/\/projects\/personal$/);
  for (let i = 0; i < 2; i++) {
    await page.getByRole("link", { name: "Open IronLog", exact: true }).click();
    await expect(page.locator("h1")).toHaveText("IronLog");
    await page
      .getByRole("link", { name: "← All Projects", exact: true })
      .click();
    await expect(cards(page)).toHaveCount(3);
  }
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  expect(
    await page.evaluate(() => getComputedStyle(document.body).overflow),
  ).not.toBe("hidden");
  await expect(page.locator(".route-curtain")).toHaveAttribute(
    "data-active",
    "false",
  );
});

test("multiple tabs synchronize favorites without overriding route scope or looping storage writes", async ({
  page,
  context,
}) => {
  await page.goto("/projects/personal");
  const other = await context.newPage();
  await other.goto("/projects/northstar");
  await page.evaluate(() => {
    (window as Window & { storageEvents?: number }).storageEvents = 0;
    window.addEventListener("storage", () => {
      const w = window as Window & { storageEvents?: number };
      w.storageEvents = (w.storageEvents ?? 0) + 1;
    });
  });
  await page.getByRole("button", { name: "Pin IronLog", exact: true }).click();
  await other.goto("/projects/personal");
  await expect(
    other.getByRole("button", { name: "Unpin IronLog", exact: true }),
  ).toBeVisible();
  await other
    .getByRole("button", { name: "Unpin IronLog", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Pin IronLog", exact: true }),
  ).toBeVisible();
  await other.goto("/projects/northstar");
  await expect(cards(page)).toHaveCount(3);
  await expect(cards(other)).toHaveCount(4);
  await page.waitForTimeout(250);
  expect(
    await page.evaluate(
      () => (window as Window & { storageEvents?: number }).storageEvents ?? 0,
    ),
  ).toBeLessThan(8);
  await other.close();
});
test("dialog traps focus, menu dismisses outside, and row opens the selected project", async ({
  page,
}) => {
  await page.goto("/projects/personal");
  await page
    .getByRole("button", { name: "Actions for IronLog", exact: true })
    .click();
  await page.locator("h1").click();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await page.getByRole("button", { name: /Create demo project/ }).click();
  const modal = page.getByRole("dialog", { name: "Create demo project" });
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(
      await modal.evaluate((el) => el.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "List view", exact: true }).click();
  await page.getByRole("link", { name: "Open RentSense", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("RentSense");
  await page
    .getByRole("button", { name: "Actions for RentSense", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "View activity", exact: true })
    .click();
  await expect(page).toHaveURL(/rentsense#activity$/);
  await expect(page.locator(".route-curtain")).toHaveAttribute(
    "data-active",
    "false",
  );
});
