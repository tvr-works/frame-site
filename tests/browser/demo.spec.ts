import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { story } from "../../src/demo/playback";
const windows = (page: Page) => page.locator("[data-window-id]");
const focused = (page: Page) => page.locator('[data-focused="true"]');
const scene = (page: Page) => page.getByRole("region", { name: "Frame shortcut demonstration" });
async function advance(page: Page, step: number) {
  const current = Number(await scene(page).getAttribute("data-step"));
  for (let i = current; i < step; i++) {
    await page.clock.runFor(story[i].delay + 1);
    await expect(scene(page)).toHaveAttribute(
      "data-step",
      String(i + 1 === story.length ? 0 : i + 1),
    );
  }
}
async function start(page: Page) {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "Play", exact: true }).click();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
}

test("loads empty with only playback controls and no application keyboard capture", async ({
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
  await expect(scene(page).getByRole("button")).toHaveText(["Play", "Replay"]);
  await expect(page.getByRole("application")).toHaveCount(0);
  await expect(
    page.locator(".monitor button, .keyboard-controls button, .keyboard-controls [tabindex]"),
  ).toHaveCount(0);
  await page.getByTestId("monitor-0").click();
  await page.keyboard.type("nmhrx123");
  await scene(page).dispatchEvent("keydown", {
    key: "Ò",
    code: "KeyL",
    altKey: true,
    shiftKey: true,
  });
  await expect(windows(page)).toHaveCount(0);
  await expect(scene(page)).toHaveAttribute("data-step", "0");
  expect(errors).toEqual([]);
});

test("opening builds three windows steadily before the shortcut sequence", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const startTime = new Date();
  await page.clock.install({ time: startTime });
  // Freeze before navigation so loading/locator time cannot consume the empty opening.
  await page.clock.pauseAt(new Date(startTime.getTime() + 1000));
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  await page.clock.runFor(500);
  await expect(windows(page)).toHaveCount(0);
  for (let step = 1; step <= 3; step++) {
    await advance(page, step);
    await expect(windows(page)).toHaveCount(step);
    await expect(page.locator('[data-lit="true"]')).toHaveCount(0);
  }
  await expect(page.getByTestId("monitor-1").locator("[data-window-id]")).toHaveCount(0);
});

test("script cues the matching row before actions and composes L for focus, move and resize", async ({
  page,
}) => {
  await start(page);
  await advance(page, 3);
  const geometry = () =>
    windows(page).evaluateAll((nodes) =>
      nodes.map((node) => ({
        id: node.getAttribute("data-window-id"),
        style: node.getAttribute("style"),
      })),
    );
  let previous = await geometry();
  let id: string | null = null;
  let remaining = 3;
  for (let i = 3; i < story.length; i++) {
    const beat = story[i];
    await advance(page, i + 1);
    if (beat.command?.type === "close") remaining--;
    await expect(windows(page)).toHaveCount(remaining);
    const closeDot = page.locator('.window-close[data-cued="true"]');
    await expect(closeDot).toHaveCount(beat.closeCue ? 1 : 0);
    if (beat.closeCue) {
      await expect(focused(page).locator(".window-close")).toHaveAttribute("data-cued", "true");
    }
    if (beat.shortcut) {
      const row = page.locator(`.shortcut-row[data-mode="${beat.shortcut.mode}"]`);
      await expect(page.locator('.shortcut-row[data-active="true"]')).toHaveCount(1);
      await expect(row.locator('[data-lit="true"]')).toHaveCount(
        beat.shortcut.mode === "focus" ? 1 : beat.shortcut.mode === "move" ? 2 : 3,
      );
      await expect(page.locator('.home-row [data-lit="true"]')).toHaveCount(
        beat.shortcut.key && "HJKL".includes(beat.shortcut.key) ? 1 : 0,
      );
    }
    if (!beat.command || beat.command.type === "focus") expect(await geometry()).toEqual(previous);
    if (beat.command?.type === "focus" && beat.command.direction === "right")
      id = await focused(page).getAttribute("data-window-id");
    if (beat.command?.type === "move" || beat.command?.type === "resize") {
      expect(await geometry()).not.toEqual(previous);
      await expect(focused(page)).toHaveAttribute("data-window-id", id!);
      await expect(page.locator('.home-row [data-lit="true"]')).toHaveText(beat.shortcut!.key!);
    }
    if (beat.command?.type === "send") {
      const display = beat.command.name === "7" ? 1 : 0;
      await expect(
        page.getByTestId(`monitor-${display}`).locator('[data-focused="true"]'),
      ).toHaveAttribute("data-window-id", id!);
      await expect(page.getByTestId(`monitor-${display}`)).toContainText(
        `Workspace ${beat.command.name}`,
      );
      await expect(page.locator('.number-bank [data-lit="true"]')).toHaveText(beat.command.name);
    }
    previous = await geometry();
  }
  await expect(windows(page)).toHaveCount(0);
  await expect(page.getByTestId("monitor-1")).toContainText("Workspace 6");
  await expect(page.locator('[data-lit="true"]')).toHaveCount(0);
  await expect(scene(page)).toHaveAttribute("data-playback", "playing");
  await expect(scene(page)).toHaveAttribute("data-step", "0");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.clock.runFor(30000);
  await expect(windows(page)).toHaveCount(0);
});

test("pause holds the exact scene and cue; Play continues and Replay repeats the opening", async ({
  page,
}) => {
  await start(page);
  await advance(page, 8);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const before = await page.locator(".monitors").innerHTML();
  const keys = await page.locator(".keyboard-controls").innerHTML();
  await page.clock.runFor(10000);
  await expect(scene(page)).toHaveAttribute("data-step", "8");
  expect(await page.locator(".monitors").innerHTML()).toBe(before);
  expect(await page.locator(".keyboard-controls").innerHTML()).toBe(keys);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await advance(page, 9);
  await page.getByRole("button", { name: "Replay", exact: true }).click();
  await expect(windows(page)).toHaveCount(0);
  await expect(page.locator('[data-lit="true"]')).toHaveCount(0);
  await expect(scene(page)).toHaveAttribute("data-step", "0");
  await advance(page, 1);
  await expect(windows(page)).toHaveCount(1);
});

test("closing empties the monitors one window at a time and loops; Pause also holds the empty ending", async ({
  page,
}) => {
  await start(page);
  const firstCue = story.findIndex((beat) => beat.closeCue);
  await advance(page, firstCue);
  await expect(windows(page)).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await advance(page, firstCue + i * 2 + 1);
    const id = await focused(page).getAttribute("data-window-id");
    const dot = page.locator('.window-close[data-cued="true"]');
    await expect(dot).toHaveCount(1);
    await expect(focused(page).locator(".window-close")).toHaveAttribute("data-cued", "true");
    if (i === 0) {
      await page.getByRole("button", { name: "Pause", exact: true }).click();
      await page.clock.runFor(10000);
      await expect(dot).toHaveCount(1);
      await expect(windows(page)).toHaveCount(3);
      await page.getByRole("button", { name: "Play", exact: true }).click();
    }
    await advance(page, firstCue + i * 2 + 2);
    await expect(page.locator(`[data-window-id="${id}"]`)).toHaveCount(0);
    await expect(windows(page)).toHaveCount(2 - i);
    await expect(dot).toHaveCount(0);
    await expect(page.locator('[data-lit="true"]')).toHaveCount(0);
  }
  await advance(page, story.length);
  await expect(scene(page)).toHaveAttribute("data-step", "0");
  await expect(windows(page)).toHaveCount(0);
  await advance(page, 1);
  await expect(windows(page)).toHaveCount(1);
  await advance(page, story.length - 1);
  await expect(windows(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.clock.runFor(10000);
  await expect(scene(page)).toHaveAttribute("data-step", String(story.length - 1));
  await expect(windows(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await advance(page, story.length);
  await advance(page, 1);
  await expect(windows(page)).toHaveCount(1);
  await page.getByRole("button", { name: "Replay", exact: true }).click();
  await expect(windows(page)).toHaveCount(0);
  await expect(scene(page)).toHaveAttribute("data-step", "0");
});

test("Replay clears a held close-dot cue", async ({ page }) => {
  await start(page);
  const firstCue = story.findIndex((beat) => beat.closeCue);
  await advance(page, firstCue + 1);
  await expect(page.locator('.window-close[data-cued="true"]')).toHaveCount(1);
  await page.getByRole("button", { name: "Replay", exact: true }).click();
  await expect(windows(page)).toHaveCount(0);
  await advance(page, 1);
  await expect(page.locator('.window-close[data-cued="true"]')).toHaveCount(0);
});

test("reduced motion disables autoplay but allows explicit playback without transitions", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page.clock.runFor(10000);
  await expect(windows(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await advance(page, 3);
  expect(
    await windows(page)
      .first()
      .evaluate((node) => getComputedStyle(node).transitionDuration),
  ).toBe("0s");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await advance(page, 4);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(scene(page)).toHaveAttribute("data-playback", "paused");
  await page.clock.runFor(10000);
  await expect(scene(page)).toHaveAttribute("data-step", "4");
});

test("Guide pauses playback, preserves the scene and requires explicit Play on return", async ({
  page,
}) => {
  await start(page);
  await advance(page, 3);
  await page.getByRole("link", { name: "Guide", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Watch the shortcuts compose" })).toBeVisible();
  await page.clock.runFor(10000);
  await expect(scene(page)).toHaveAttribute("data-step", "3");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("link", { name: "Guide", exact: true })).toBeFocused();
  await expect(scene(page)).toHaveAttribute("data-playback", "paused");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await advance(page, 4);
});

test("offscreen and background pause; returning never resumes automatically", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  await page.goto("/");
  await expect(scene(page)).toHaveAttribute("data-playback", "playing");
  await advance(page, 1);
  await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.style.height = "2000px";
    spacer.id = "test-spacer";
    document.body.append(spacer);
    window.scrollTo(0, document.body.scrollHeight);
  });
  await expect(scene(page)).toHaveAttribute("data-playback", "paused");
  await page.clock.runFor(5000);
  await page.evaluate(() => {
    document.getElementById("test-spacer")?.remove();
    window.scrollTo(0, 0);
  });
  await page.clock.runFor(5000);
  await expect(scene(page)).toHaveAttribute("data-step", "1");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(scene(page)).toHaveAttribute("data-playback", "paused");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(5000);
  await expect(scene(page)).toHaveAttribute("data-step", "1");
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1488, height: 1058 },
  { width: 320, height: 700 },
])
  test(`script and playback controls reflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await start(page);
    await advance(page, 3);
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await noOverflow(page);
    await page.getByRole("link", { name: "Guide", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await noOverflow(page);
    await page.getByRole("button", { name: "Close panel" }).click();
    await noOverflow(page);
  });

test("touch playback starts, pauses and replays without interactive windows", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "Play", exact: true }).tap();
  await advance(page, 3);
  await page.getByRole("button", { name: "Pause", exact: true }).tap();
  await page.clock.runFor(10000);
  await expect(windows(page)).toHaveCount(3);
  await page.getByRole("button", { name: "Replay", exact: true }).tap();
  await expect(windows(page)).toHaveCount(0);
  await noOverflow(page);
  await context.close();
});

test("200% zoom equivalent and enlarged text keep playback reachable", async ({ page }) => {
  await page.setViewportSize({ width: 744, height: 529 });
  await start(page);
  await advance(page, 3);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
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
  await page.getByRole("button", { name: "Replay", exact: true }).click();
  await expect(windows(page)).toHaveCount(0);
});

test("normal Tab navigation skips decorative windows and keys", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Install", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Replay", exact: true })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeFocused();
});

// Base UI's Safari/VoiceOver focus guards are intentionally exposed; modal containment is tested below.
test("automated accessibility: scripted scene, guide and install", async ({ page }) => {
  await start(page);
  await advance(page, 3);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .exclude("[data-base-ui-focus-guard]")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("link", { name: "Guide", exact: true }).click();
  expect(
    (await new AxeBuilder({ page }).exclude("[data-base-ui-focus-guard]").analyze()).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Install", exact: true }).click();
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
  await page.clock.install();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await advance(page, 1);
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
