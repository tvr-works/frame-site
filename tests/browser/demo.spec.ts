import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { story } from "../../src/demo/playback";
const windows = (page: Page) => page.locator("[data-window-id]");
const focused = (page: Page) => page.locator('[data-focused="true"]');
const open = (page: Page) => page.getByRole("button", { name: "Open window", exact: true }).click();
async function mode(page: Page, name: string) {
  await page
    .getByRole("group", { name: "Window action", exact: true })
    .getByRole("button", { name: new RegExp(`^${name} ·`) })
    .click();
}
async function workspace(page: Page, name: string, send = false) {
  await mode(page, send ? "Move" : "Focus");
  await page
    .getByRole("button", {
      name: new RegExp(`^${send ? "Send to" : "Switch to"} workspace ${name} ·`),
    })
    .click();
}
async function practice(page: Page) {
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await page.getByText("Browser keyboard practice", { exact: true }).click();
  await page.getByRole("button", { name: "Start keyboard practice", exact: true }).click();
  const area = page.getByRole("textbox", { name: "Keyboard practice area", exact: true });
  await expect(area).toBeFocused();
  return area;
}
async function direction(page: Page, action: string, dir: string) {
  await page.getByRole("button", { name: new RegExp(`^${action} ${dir}`) }).click();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
}

test("loads a meaningful empty desktop; create, focus, move, resize, close and reset operate on the same state", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Frame — Intuitive, keyboard-first window management for macOS.");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Intuitive, keyboard-first window management for macOS.",
  );
  await expect(windows(page)).toHaveCount(0);
  await open(page);
  await open(page);
  await expect(windows(page)).toHaveCount(2);
  const before = await windows(page).evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("style")),
  );
  await direction(page, "focus", "left");
  await expect(focused(page)).toHaveAttribute("data-kind", "browser");
  expect(
    await windows(page).evaluateAll((nodes) => nodes.map((node) => node.getAttribute("style"))),
  ).toEqual(before);
  await open(page);
  await expect(windows(page)).toHaveCount(3);
  await mode(page, "Move");
  await direction(page, "move", "right");
  await expect(focused(page)).toHaveAttribute("data-kind", "editor");
  await mode(page, "Resize");
  const width = await focused(page).getAttribute("style");
  await direction(page, "resize", "left");
  expect(await focused(page).getAttribute("style")).not.toBe(width);
  await focused(page)
    .getByRole("button", { name: /^Close/ })
    .click();
  await expect(windows(page)).toHaveCount(2);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(windows(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Replay", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("workspace transfers retain focus and display affinity; display changes preserve windows", async ({
  page,
}) => {
  await page.goto("/");
  await open(page);
  await workspace(page, "6", true);
  await expect(focused(page)).toHaveCount(0);
  await expect(page.getByTestId("monitor-0")).toContainText("Workspace 1");
  await expect(windows(page)).toHaveCount(1);
  await workspace(page, "6");
  await expect(focused(page)).toHaveCount(1);
  await expect(page.getByTestId("monitor-1").locator("[data-focused=true]")).toHaveCount(1);
  await workspace(page, "3");
  await expect(page.getByTestId("monitor-0")).toContainText("Workspace 3");
  await expect(page.getByTestId("monitor-1")).toContainText("Workspace 6");
  await page.getByRole("button", { name: "Single monitor", exact: true }).click();
  await expect(windows(page)).toHaveCount(0);
  await workspace(page, "6");
  await expect(windows(page)).toHaveCount(1);
  await page.getByRole("button", { name: "Dual monitors", exact: true }).click();
  await expect(windows(page)).toHaveCount(1);
});

test("Focus workspace clicks reveal and focus each bank on its locked display", async ({
  page,
}) => {
  await page.goto("/");
  for (const [index, names] of [
    [0, ["1", "2", "3", "4", "5"]],
    [1, ["6", "7", "8", "9", "0"]],
  ] as const) {
    for (const name of names) {
      const other = page.getByTestId(`monitor-${1 - index}`);
      const untouched = await other.innerText();
      await workspace(page, name);
      await expect(page.getByTestId(`monitor-${index}`)).toContainText(`Workspace ${name}`);
      await expect(other).toHaveText(untouched, { useInnerText: true });
      await expect(
        page.getByRole("button", { name: new RegExp(`^Switch to workspace ${name} ·`) }),
      ).toHaveAttribute("aria-pressed", "true");
      await open(page);
      const id = await focused(page).getAttribute("data-window-id");
      await expect(page.getByTestId(`monitor-${index}`).locator("[data-focused=true]")).toHaveCount(
        1,
      );
      await workspace(page, index === 0 ? "6" : "1");
      await workspace(page, name);
      await expect(focused(page)).toHaveAttribute("data-window-id", id!);
    }
  }
});

test("modifier composition shares directions and gates unsupported workspace combinations", async ({
  page,
}) => {
  await page.goto("/");
  await open(page);
  await open(page);
  const before = await windows(page).evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("style")),
  );
  await mode(page, "Resize");
  expect(
    await windows(page).evaluateAll((nodes) => nodes.map((node) => node.getAttribute("style"))),
  ).toEqual(before);
  const numbers = page
    .getByRole("group", { name: "Workspace shortcuts", exact: true })
    .getByRole("button");
  await expect(numbers).toHaveCount(10);
  for (const number of await numbers.all()) await expect(number).toBeDisabled();
  await expect(page.locator(".home-row").getByRole("button")).toHaveCount(4);
  await mode(page, "Focus");
  await direction(page, "focus", "left");
  await expect(focused(page)).toHaveAttribute("data-kind", "browser");
  await mode(page, "Move");
  await page.getByRole("button", { name: /^Send to workspace 6 ·/ }).click();
  await expect(page.getByTestId("monitor-0")).toContainText("Workspace 1");
  await workspace(page, "6");
  await expect(page.getByTestId("monitor-1")).toContainText("Workspace 6");
  await expect(focused(page)).toHaveAttribute("data-kind", "browser");
});

test("workspace hover leaves empty and populated monitor backgrounds unchanged", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.evaluate(() => document.fonts.ready);
  for (const populated of [false, true]) {
    if (populated) {
      await open(page);
      await open(page);
      await workspace(page, "6");
      await open(page);
      await open(page);
    }
    await expect
      .poll(() =>
        page
          .locator(".monitors")
          .evaluate(
            (node) =>
              node
                .getAnimations({ subtree: true })
                .filter((animation) => animation.playState === "running").length,
          ),
      )
      .toBe(0);
    await page.mouse.move(0, 0);
    const screens = await page.locator(".monitor-screen").all();
    const before = await Promise.all(screens.map((screen) => screen.screenshot()));
    const caption = await page.locator(".demo-caption").innerText();
    for (const name of ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]) {
      await page
        .getByRole("button", { name: `Switch to workspace ${name} · Option ${name}`, exact: true })
        .hover();
      for (const [index, screen] of screens.entries()) {
        const after = await screen.screenshot();
        expect(
          after.equals(before[index]),
          `Hovering workspace ${name} repainted ${populated ? "populated" : "empty"} display ${index + 1}`,
        ).toBe(true);
      }
      await expect(page.locator(".demo-caption")).toHaveText(caption);
    }
  }
});

test("keyboard practice is opt-in, explicitly remapped, scoped and escapable", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("n");
  await expect(windows(page)).toHaveCount(0);
  const area = await practice(page);
  await area.press("n");
  await area.press("n");
  await expect(windows(page)).toHaveCount(2);
  await area.press("h");
  await expect(focused(page)).toHaveAttribute("data-kind", "browser");
  const id = await focused(page).getAttribute("data-window-id");
  await area.dispatchEvent("keydown", { key: "l", altKey: true });
  await expect(focused(page)).toHaveAttribute("data-window-id", id!);
  await area.press("m");
  await area.press("6");
  await expect(page.getByTestId("monitor-1").locator("[data-window-id]")).toHaveCount(1);
  await expect(focused(page)).not.toHaveAttribute("data-window-id", id!);
  await area.press("r");
  await area.press("3");
  await expect(page.getByTestId("monitor-0")).toContainText("Workspace 1");
  await area.press("f");
  await area.press("6");
  await expect(focused(page)).toHaveAttribute("data-window-id", id!);
  await area.press("Escape");
  await expect(area).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Learn", exact: true })).toBeFocused();
  await page.keyboard.press("n");
  await expect(windows(page)).toHaveCount(2);
  const next = await practice(page);
  await next.press("Tab");
  await expect(next).toHaveCount(0);
});

test("help is progressively disclosed; clickable native shortcuts and lessons preserve the desktop", async ({
  page,
}) => {
  await page.goto("/");
  await open(page);
  await open(page);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await page.getByText("Shortcut index", { exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: /^Try focus left/ }).click();
  await expect(focused(page)).toHaveAttribute("data-kind", "browser");
  await expect(page.getByRole("status")).toContainText("Layout unchanged");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Learn", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await expect(windows(page)).toHaveCount(2);
  await expect(page.getByRole("heading", { name: "Start with a clear desktop" })).toBeVisible();
  await page.locator(".lesson").getByRole("button", { name: "Open a window", exact: true }).click();
  await expect(windows(page)).toHaveCount(3);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Change your point of focus" })).toBeVisible();
});

test("reduced motion starts stable and stays manual after reset", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.clock.runFor(6000);
  await expect(windows(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
  await open(page);
  expect(
    await windows(page)
      .first()
      .evaluate((node) => getComputedStyle(node).transitionDuration),
  ).toBe("0s");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.clock.runFor(6000);
  await expect(windows(page)).toHaveCount(0);
});

test("autoplay starts blank; pause/resume and exact-state takeover never restart unexpectedly", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  await expect(windows(page)).toHaveCount(0);
  await page.clock.runFor(1550);
  await expect(windows(page)).toHaveCount(1);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.clock.runFor(5000);
  await expect(windows(page)).toHaveCount(1);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.clock.runFor(2450);
  await expect(windows(page)).toHaveCount(2);
  const before = await windows(page).evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-window-id")),
  );
  await page.getByRole("button", { name: "Focus Notes window 4", exact: true }).first().click();
  await page.clock.runFor(10000);
  expect(
    await windows(page).evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-window-id")),
    ),
  ).toEqual(before);
  await open(page);
  await expect(windows(page)).toHaveCount(3);
  await page.getByRole("button", { name: "Replay", exact: true }).click();
  await expect(windows(page)).toHaveCount(0);
  await page.clock.runFor(1550);
  await expect(windows(page)).toHaveCount(1);
});

test("autoplay completes once and hands off four windows", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  for (let i = 0; i < story.length; i++) {
    await page.clock.runFor(i === 0 ? 1550 : 2450);
    await expect(page.locator(".demo-caption")).toContainText(story[i].caption);
  }
  await expect(page.getByRole("button", { name: "Replay", exact: true })).toBeVisible();
  await expect(windows(page)).toHaveCount(4);
  const ids = await windows(page).evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-window-id")),
  );
  await page.clock.runFor(12000);
  expect(
    await windows(page).evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-window-id")),
    ),
  ).toEqual(ids);
});

test("offscreen and background pause autoplay; returning requires explicit Play", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  await page.clock.runFor(1550);
  await expect(windows(page)).toHaveCount(1);
  await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.style.height = "2000px";
    spacer.id = "test-spacer";
    document.body.append(spacer);
    window.scrollTo(0, document.body.scrollHeight);
  });
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeAttached();
  await page.clock.runFor(5000);
  await expect(windows(page)).toHaveCount(1);
  await page.evaluate(() => {
    document.getElementById("test-spacer")?.remove();
    window.scrollTo(0, 0);
  });
  await page.clock.runFor(5000);
  await expect(windows(page)).toHaveCount(1);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(5000);
  await expect(windows(page)).toHaveCount(1);
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1488, height: 1058 },
  { width: 320, height: 700 },
])
  test(`responsive controls and readable displays at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await open(page);
    await open(page);
    await noOverflow(page);
    await expect(page.getByTestId("monitor-1")).toBeAttached();
    await page.getByRole("button", { name: "Learn", exact: true }).click();
    await noOverflow(page);
    await page.getByText("Shortcut index", { exact: true }).click();
    await noOverflow(page);
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close panel" }).click();
    await noOverflow(page);
  });

test("touch path opens, focuses and moves windows without keyboard shortcuts", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  await page
    .getByTestId("monitor-0")
    .getByRole("button", { name: /Room for your next idea/ })
    .tap();
  await page.getByRole("button", { name: "Open window", exact: true }).tap();
  await expect(windows(page)).toHaveCount(2);
  await page
    .getByRole("group", { name: "Window action", exact: true })
    .getByRole("button", { name: /^Move ·/ })
    .tap();
  await page.getByRole("button", { name: /^move left/ }).tap();
  await expect(windows(page)).toHaveCount(2);
  await noOverflow(page);
  await context.close();
});

test("200% zoom equivalent and enlarged text keep controls reachable", async ({ page }) => {
  await page.setViewportSize({ width: 744, height: 529 });
  await page.goto("/");
  await open(page);
  await open(page);
  await noOverflow(page);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(windows(page)).toHaveCount(0);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
    for (const element of document.querySelectorAll<HTMLElement>("p,button,a,h1,h2,h3,label")) {
      element.style.fontSize = `${parseFloat(getComputedStyle(element).fontSize) * 2}px`;
      element.style.letterSpacing = ".12em";
      element.style.wordSpacing = ".16em";
      element.style.lineHeight = "1.5";
    }
  });
  await noOverflow(page);
  await practice(page);
  await expect(page.getByRole("textbox", { name: "Keyboard practice area" })).toBeVisible();
});

// Base UI intentionally exposes Safari focus guards for VoiceOver swiping.
// Follow the maintainer’s narrow exclusion; keyboard containment is checked separately.
// https://github.com/mui/base-ui/issues/5237
test("automated accessibility: demo, help, lessons and install", async ({ page }) => {
  await page.goto("/");
  await open(page);
  await open(page);
  expect(
    (
      await new AxeBuilder({ page })
        .exclude("[data-base-ui-focus-guard]")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  expect(
    (await new AxeBuilder({ page }).exclude("[data-base-ui-focus-guard]").analyze()).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Install", exact: true }).click();
  expect(
    (await new AxeBuilder({ page }).exclude("[data-base-ui-focus-guard]").analyze()).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await page.getByText("Shortcut index", { exact: true }).click();
  expect(
    (await new AxeBuilder({ page }).exclude("[data-base-ui-focus-guard]").analyze()).violations,
  ).toEqual([]);
});

test("@artifact static HTML, security, indexing, identity, assets and honest 404", async ({
  request,
  page,
}) => {
  const home = await request.get("/");
  const html = await home.text();
  expect(html).toContain("Intuitive, keyboard-first window management for macOS.");
  expect(html).toContain("https://frame.tvr.works/");
  expect(html).not.toContain('<div id="root"></div>');
  expect(home.headers()["content-security-policy"]).toContain("script-src 'self'");
  expect(home.headers()["x-content-type-options"]).toBe("nosniff");
  const info = await (await request.get("/build-info.json")).json();
  expect(info.commit).toMatch(/^[a-f0-9]{40}$/);
  expect(info.repository).toBe("tvr-works/frame-site");
  expect(html).toContain(
    info.mode === "production" ? 'content="index, follow"' : 'content="noindex, nofollow"',
  );
  expect(home.headers()["x-robots-tag"]).toBe(
    info.mode === "preview" ? "noindex, nofollow" : undefined,
  );
  for (const path of [
    "/icon.png",
    "/wallpaper.webp",
    "/monitor-shell.webp",
    "/monitor-backdrop.webp",
    "/social-card.png",
    "/sitemap.xml",
    "/robots.txt",
    "/guide.html",
  ])
    expect((await request.get(path)).status()).toBe(200);
  const missing = await request.get("/this-is-not-a-page");
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain("A little out of frame.");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await open(page);
  await expect(windows(page)).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("@artifact no-JavaScript visitors can read the guide and install", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Intuitive, keyboard-first window management for macOS.",
  );
  await page.getByRole("link", { name: "Guide", exact: true }).click();
  await expect(page).toHaveURL(/\/guide.html$/);
  await expect(page.getByRole("heading", { name: "Install", exact: true })).toBeVisible();
  await expect(page.locator("pre")).toContainText("brew install --cask tvr-works/tap/frame");
  await context.close();
});

test("modal focus stays inside; Escape restores the opener", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Install", exact: true }).click();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    await expect
      .poll(() => page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')))
      .toBe(true);
  }
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("Shift+Tab");
    await expect
      .poll(() => page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')))
      .toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Install", exact: true })).toBeFocused();
});
