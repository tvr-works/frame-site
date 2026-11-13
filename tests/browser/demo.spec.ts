import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";
import { story } from "../../src/demo/playback";
const windows = (page: Page) => page.locator("[data-window-id]");
const focused = (page: Page) => page.locator('[data-focused="true"]');
const scene = (page: Page) => page.getByRole("region", { name: "Frame shortcut demonstration" });
const headerGuide = (page: Page) =>
  page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Guide", exact: true });
// React commits can schedule passive effects on a subsequent browser task.
// Let that queue settle without advancing the virtual clock or consuming a beat.
async function settleTasks(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = () => {
          channel.port1.close();
          channel.port2.close();
          resolve();
        };
        channel.port2.postMessage(null);
      }),
  );
}
function checkIndexingHeader(header: string | undefined, mode: string, url: string) {
  const directives = (header || "").split(",").map((directive) => directive.trim());
  const immutableOrBranchPreview = new URL(url).hostname.endsWith(".frame-site.pages.dev");
  expect(directives.includes("noindex")).toBe(mode === "preview" || immutableOrBranchPreview);
  if (mode === "preview") expect(directives).toContain("nofollow");
}
async function advance(page: Page, step: number) {
  const current = Number(await scene(page).getAttribute("data-step"));
  for (let i = current; i < step; i++) {
    await settleTasks(page);
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
  await expect(page).toHaveTitle("Frame — Tiling Window Manager for macOS");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Tiling Window Manager for macOS",
  );
  await expect(windows(page)).toHaveCount(0);
  await expect(scene(page).getByRole("button")).toHaveCount(2);
  await expect(scene(page).getByRole("button", { name: "Play", exact: true })).toBeVisible();
  await expect(scene(page).getByRole("button", { name: "Replay", exact: true })).toBeVisible();
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

test("label, full chord and window changes land together, then hold before the next action", async ({
  page,
}) => {
  const startTime = new Date();
  await page.clock.install({ time: startTime });
  await page.clock.pauseAt(new Date(startTime.getTime() + 1000));
  await page.goto("/");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await advance(page, 3);
  const label = page.locator(".demo-action-label");
  await page.clock.runFor(story[3].delay - 20);
  await expect(label).toHaveText("Then, new rows in focused column");
  await expect(page.locator('[data-lit="true"]')).toHaveCount(0);
  await expect(focused(page)).toHaveAttribute("data-kind", "editor");
  await page.clock.runFor(21);
  await expect(label).toHaveText("Focus window above");
  await expect(page.locator('.home-row [data-lit="true"]')).toHaveText("K");
  await expect(focused(page)).toHaveAttribute("data-kind", "notes");
  await page.clock.runFor(story[4].delay - 20);
  await expect(label).toHaveText("Focus window above");
  await expect(page.locator('.home-row [data-lit="true"]')).toHaveText("K");
  await expect(focused(page)).toHaveAttribute("data-kind", "notes");
  await page.clock.runFor(21);
  await expect(label).toHaveText("Focus window below");
  await expect(page.locator('.home-row [data-lit="true"]')).toHaveText("J");
  await expect(focused(page)).toHaveAttribute("data-kind", "editor");
  const resize = story.findIndex((beat) => beat.command?.type === "resize");
  await advance(page, resize);
  const before = await focused(page).getAttribute("style");
  await page.clock.runFor(story[resize].delay - 20);
  await expect(label).toHaveText("Move window down within column");
  await expect(focused(page)).toHaveAttribute("style", before!);
  await page.clock.runFor(21);
  await expect(label).toHaveText("Expand column left");
  await expect(page.locator('.home-row [data-lit="true"]')).toHaveText("H");
  await expect(page.locator('.modifier-chord [data-lit="true"]')).toHaveCount(3);
  expect(await focused(page).getAttribute("style")).not.toBe(before);
});

test("script updates the label and full chord with focus, move, column and row resize actions", async ({
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
  let caption = await page.locator(".demo-action-label").textContent();
  for (let i = 3; i < story.length; i++) {
    const beat = story[i];
    await advance(page, i + 1);
    if (beat.command?.type === "close") remaining--;
    if (i + 1 === story.length) caption = "Start with an empty workspace";
    else if (beat.caption) caption = beat.caption;
    await expect(page.locator(".demo-action-label")).toHaveText(caption!);
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
      if (beat.command.type === "resize") {
        const beforeStyle = previous.find((win) => win.id === id)!.style!;
        const afterStyle = await focused(page).getAttribute("style");
        const property =
          beat.command.direction === "left" || beat.command.direction === "right" ? "--w" : "--h";
        const value = (style: string) =>
          Number(style.match(new RegExp(`${property}:\\s*([\\d.]+)`))![1]);
        const expands = beat.command.direction === "left" || beat.command.direction === "up";
        if (expands) expect(value(afterStyle!)).toBeGreaterThan(value(beforeStyle));
        else expect(value(afterStyle!)).toBeLessThan(value(beforeStyle));
      }
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

test("Replay during the empty opening restarts the full opening delay", async ({ page }) => {
  const startTime = new Date();
  await page.clock.install({ time: startTime });
  await page.clock.pauseAt(new Date(startTime.getTime() + 1000));
  await page.goto("/");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.clock.runFor(800);
  await page.getByRole("button", { name: "Replay", exact: true }).click();
  await page.clock.runFor(1199);
  await expect(windows(page)).toHaveCount(0);
  await expect(scene(page)).toHaveAttribute("data-step", "0");
  await page.clock.runFor(2);
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
});

test("changing reduced motion pauses live playback and preserves its scene", async ({ page }) => {
  // Exercise native media-query delivery with real rendering/timers. A paused
  // virtual clock can prevent Linux WebKit from delivering that browser event.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(scene(page)).toHaveAttribute("data-playback", "playing");
  await expect(windows(page)).toHaveCount(3, { timeout: 6000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(scene(page)).toHaveAttribute("data-playback", "paused");
  const step = await scene(page).getAttribute("data-step");
  const caption = await page.locator(".demo-action-label").textContent();
  // Hold beyond the next real beat to verify pausing actually cancels its timer.
  await page.waitForTimeout(story[Number(step)].delay + 100);
  await expect(scene(page)).toHaveAttribute("data-step", step!);
  await expect(page.locator(".demo-action-label")).toHaveText(caption!);
  await expect(windows(page)).toHaveCount(3);
});

test("Guide opens a document page and links back to the demonstration", async ({ page }) => {
  await start(page);
  await advance(page, 3);
  await headerGuide(page).click();
  await expect(page).toHaveURL(/\/guide$/);
  await expect(page).toHaveTitle("User guide — Frame");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("User guide");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "On this page" })
    .getByRole("link", { name: "Configuration", exact: true })
    .click();
  await expect(page).toHaveURL(/#configuration$/);
  await expect(page.getByRole("heading", { name: "Configuration", exact: true })).toBeInViewport();
  await page
    .getByRole("navigation", { name: "Command reference" })
    .getByRole("link", { name: "list-windows", exact: true })
    .click();
  await expect(page).toHaveURL(/#cli-list-windows$/);
  await expect(page.getByRole("heading", { name: "list-windows", level: 4 })).toBeInViewport();
  await expect(page.locator("#cli-list-windows")).toContainText("--app-bundle-id");
  await page
    .getByRole("navigation", { name: "On this page" })
    .getByRole("link", { name: "Scripting and integrations", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Scripting and integrations", level: 2 }),
  ).toBeInViewport();
  await page.getByRole("link", { name: "Back to Frame", exact: true }).click();
  await expect(scene(page)).toHaveAttribute("data-playback", "paused");
  await expect(windows(page)).toHaveCount(0);
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
  { width: 760, height: 1024 },
  { width: 768, height: 1024 },
  { width: 1488, height: 1058 },
  { width: 320, height: 700 },
])
  test(`script and playback controls reflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await start(page);
    await advance(page, story.findIndex((beat) => beat.command?.type === "move") + 1);
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await noOverflow(page);
    const banks = [];
    const screens = [];
    for (const [index, names] of [
      [0, ["1", "2", "3", "4", "5"]],
      [1, ["6", "7", "8", "9", "0"]],
    ] as const) {
      const monitor = page.getByTestId(`monitor-${index}`);
      const bank = monitor.locator(".number-bank");
      await expect(bank.locator("kbd")).toHaveText([...names]);
      const screen = (await monitor.locator(".monitor-shell").boundingBox())!;
      screens.push(screen);
      if (viewport.width <= 760) {
        await expect(bank).toBeHidden();
      } else {
        const bounds = (await bank.boundingBox())!;
        expect(bounds.y - screen.y - screen.height).toBeCloseTo(24, 0);
        expect(bounds.x + bounds.width / 2).toBeCloseTo(screen.x + screen.width / 2, 0);
        banks.push(bounds);
      }
    }
    const playback = (await page.locator(".utility-controls").boundingBox())!;
    if (viewport.width <= 760) {
      await expect(page.locator(".keyboard-composition")).toBeHidden();
      const caption = (await page.locator(".demo-action-label").boundingBox())!;
      const chord = (await page.locator(".active-shortcut").boundingBox())!;
      expect(screens[1].y - screens[0].y - screens[0].height).toBeCloseTo(24, 0);
      expect(caption.y).toBeGreaterThanOrEqual(screens[1].y + screens[1].height);
      expect(playback.y + playback.height).toBeLessThan(caption.y);
      expect(chord.y - caption.y - caption.height).toBeCloseTo(12, 0);
      await expect(page.locator(".active-modifiers kbd")).toHaveText(["⌥", "⇧"]);
      await expect(page.locator(".active-key")).toHaveText("L");
      const key = (await page.locator(".active-key").boundingBox())!;
      const arrow = (await page.locator(".active-target svg").boundingBox())!;
      expect(key.width).toBe(40);
      expect(arrow.y - key.y - key.height).toBeCloseTo(6, 0);
      expect(arrow.x + arrow.width / 2).toBeCloseTo(key.x + key.width / 2, 0);
      const directions = await page
        .locator(".movement-directions")
        .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().left));
      expect(Math.max(...directions) - Math.min(...directions)).toBeLessThan(1);
    } else {
      await expect(page.locator(".active-shortcut")).toBeHidden();
      expect(playback.y + playback.height).toBeLessThanOrEqual(banks[1].y);
      expect(banks[0].y).toBeCloseTo(banks[1].y, 0);
    }
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Install", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Install Frame", exact: true }),
    ).toBeInViewport();
    await noOverflow(page);
    await headerGuide(page).click();
    await expect(page).toHaveURL(/\/guide$/);
    await noOverflow(page);
    if (viewport.width === 320) {
      await page.evaluate(() => {
        const text = [...document.querySelectorAll<HTMLElement>("p,a,h1,h2,h3,li,dt,dd")];
        const sizes = text.map((node) => parseFloat(getComputedStyle(node).fontSize));
        text.forEach((node, index) => {
          node.style.fontSize = `${sizes[index] * 2}px`;
          node.style.letterSpacing = ".12em";
          node.style.lineHeight = "1.5";
        });
      });
      await noOverflow(page);
    }
    await page
      .getByRole("navigation", { name: "On this page" })
      .getByRole("link", { name: "Keyboard shortcuts", exact: true })
      .click();
    await noOverflow(page);
    await page.getByRole("link", { name: "Back to Frame", exact: true }).click();
    await page
      .getByRole("heading", { name: "Simple composable movements" })
      .scrollIntoViewIfNeeded();
    await noOverflow(page);
  });

test("mobile cue composes one live chord, keeps arrows under keys and includes workspace targets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  const cue = page.locator(".active-shortcut");
  const height = (await cue.boundingBox())!.height;
  await expect(cue.locator("kbd")).toHaveCount(0);
  await advance(page, 4);
  await expect(page.locator(".demo-action-label")).toHaveText("Focus window above");
  await expect(cue.locator(".active-modifiers kbd")).toHaveText(["⌥"]);
  await expect(cue.locator(".active-key")).toHaveText("K");
  await expect(cue.locator("svg")).toHaveCount(1);
  const resize = story.findIndex((beat) => beat.command?.type === "resize");
  await advance(page, resize + 1);
  await expect(cue.locator(".active-modifiers kbd")).toHaveText(["⌥", "⇧", "⌃"]);
  await expect(cue.locator(".active-key")).toHaveText("H");
  const send = story.findIndex((beat) => beat.command?.type === "send");
  await advance(page, send + 1);
  await expect(page.locator(".demo-action-label")).toHaveText("Send window to workspace 7");
  await expect(cue.locator(".active-modifiers kbd")).toHaveText(["⌥", "⇧"]);
  await expect(cue.locator(".active-key")).toHaveText("7");
  await expect(cue.locator("svg")).toHaveCount(0);
  await expect(page.getByTestId("monitor-1")).toContainText("Workspace 7");
  await expect(page.locator(".number-bank").first()).toBeHidden();
  expect((await cue.boundingBox())!.height).toBe(height);
  await page.getByRole("button", { name: "Replay", exact: true }).click();
  await expect(cue.locator("kbd")).toHaveCount(0);
  expect((await cue.boundingBox())!.height).toBe(height);
});

test("structure and movements explain the model; footer Guide opens the user guide", async ({
  page,
}) => {
  await page.goto("/");
  const structure = page.getByRole("region", { name: "Simple structure" });
  await structure.scrollIntoViewIfNeeded();
  await expect(
    structure.getByText("A workspace contains columns. Windows stack as rows within each column."),
  ).toBeVisible();
  const movements = page.getByRole("region", { name: "Simple composable movements" });
  await movements.scrollIntoViewIfNeeded();
  await expect(movements.getByRole("article")).toHaveCount(3);
  await expect(movements.getByRole("heading", { level: 3 })).toHaveText([
    "Focus",
    "Move",
    "Resize",
  ]);
  for (const image of await page.locator(".explanation img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0),
      )
      .toBe(true);
  }
  await noOverflow(page);
  const footerGuide = page
    .getByRole("navigation", { name: "Footer navigation" })
    .getByRole("link", { name: "Guide", exact: true });
  await footerGuide.click();
  await expect(page).toHaveURL(/\/guide$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("User guide");
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
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Install", exact: true })
    .focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Replay", exact: true })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeFocused();
});

// Base UI's Safari/VoiceOver focus guards are intentionally exposed; modal containment is tested below.
test("automated accessibility: scripted scene, install section and user guide", async ({
  page,
}) => {
  await start(page);
  await advance(page, 3);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Install", exact: true })
    .click();
  await page.getByRole("link", { name: "Download release", exact: true }).hover();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await headerGuide(page).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("@artifact static HTML, security, indexing, identity, assets and honest 404", async ({
  request,
  page,
}) => {
  const home = await request.get("/");
  const html = await home.text();
  expect(html).toContain("Tiling Window Manager for macOS");
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
  if (process.env.DEPLOYMENT_URL) {
    expect(info.commit).toBe(process.env.EXPECTED_COMMIT_SHA);
    expect(info.branch).toBe(process.env.EXPECTED_BRANCH);
    expect(info.mode).toBe(process.env.DEPLOYMENT_MODE);
    expect(info.dirty).toBe(false);
  }
  checkIndexingHeader(home.headers()["x-robots-tag"], info.mode, home.url());
  for (const path of [
    "/icon.png",
    "/wallpaper.webp",
    "/monitor-shell.webp",
    "/monitor-backdrop.webp",
    "/social-card.png",
    "/licenses/shadcn-ui.txt",
    "/sitemap.xml",
    "/robots.txt",
    "/guide",
  ])
    expect((await request.get(path)).status()).toBe(200);
  const legacyGuide = await request.get("/guide.html?from=legacy", { maxRedirects: 0 });
  expect([301, 308]).toContain(legacyGuide.status());
  const guideLocation = new URL(legacyGuide.headers().location, legacyGuide.url());
  expect(guideLocation.pathname).toBe("/guide");
  expect(guideLocation.search).toBe("?from=legacy");
  const guide = await request.get("/guide");
  const guideHtml = await guide.text();
  expect(guideHtml).toContain("User guide");
  expect(guideHtml).toContain("frame doctor");
  expect(guideHtml).toContain("https://frame.tvr.works/guide");
  expect(guideHtml).not.toContain('<div id="root"></div>');
  expect(guideHtml).toContain(
    info.mode === "production" ? 'content="index, follow"' : 'content="noindex, nofollow"',
  );
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

test("@artifact search and social metadata describe each static page and its real image", async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const origin = "https://frame.tvr.works";
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const info = await (await request.get("/build-info.json")).json();
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toBe(
    info.mode === "production"
      ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`
      : "User-agent: *\nDisallow: /\n",
  );
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const locations = await page.evaluate((xml) => {
    const document = new DOMParser().parseFromString(xml, "application/xml");
    if (document.querySelector("parsererror")) throw new Error("Invalid sitemap XML");
    return [...document.querySelectorAll("url > loc")].map((node) => node.textContent);
  }, sitemap);
  expect(locations).toEqual([`${origin}/`, `${origin}/guide`]);

  for (const path of ["/", "/guide"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    checkIndexingHeader(response?.headers()["x-robots-tag"], info.mode, page.url());
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const title = await page.title();
    expect(title).not.toBe("");
    expect(titles.has(title)).toBe(false);
    titles.add(title);
    const canonical = page.locator('head link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    await expect(canonical).toHaveAttribute("href", `${origin}${path}`);
    const meta = async (attribute: "name" | "property", key: string) => {
      const node = page.locator(`head meta[${attribute}="${key}"]`);
      await expect(node).toHaveCount(1);
      const content = await node.getAttribute("content");
      expect(content).not.toBe("");
      return content!;
    };
    const description = await meta("name", "description");
    expect(descriptions.has(description)).toBe(false);
    descriptions.add(description);
    expect(await meta("name", "robots")).toBe(
      info.mode === "production" ? "index, follow" : "noindex, nofollow",
    );
    expect(await meta("property", "og:type")).toBe("website");
    expect(await meta("property", "og:site_name")).toBe("Frame");
    expect(await meta("property", "og:locale")).toBe("en_US");
    expect(await meta("property", "og:url")).toBe(`${origin}${path}`);
    expect(await meta("property", "og:title")).toBe(title);
    expect(await meta("property", "og:description")).toBe(description);
    expect(await meta("name", "twitter:card")).toBe("summary_large_image");
    expect(await meta("name", "twitter:title")).toBe(title);
    expect(await meta("name", "twitter:description")).toBe(description);
    const imageUrl = await meta("property", "og:image");
    expect(imageUrl).toBe(`${origin}/social-card.png`);
    expect(await meta("name", "twitter:image")).toBe(imageUrl);
    const alt = await meta("property", "og:image:alt");
    expect(alt).toContain("two monitors");
    expect(await meta("name", "twitter:image:alt")).toBe(alt);
    // Fetch the deployed path locally; never probe the provisional production host.
    const image = await request.get(new URL(imageUrl).pathname);
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toBe(await meta("property", "og:image:type"));
    const body = await image.body();
    expect(body.length).toBeLessThan(1024 * 1024);
    const dimensions = await sharp(body).metadata();
    expect(dimensions.format).toBe("png");
    expect(dimensions.width).toBe(1200);
    expect(dimensions.height).toBe(630);
    expect(await meta("property", "og:image:width")).toBe(String(dimensions.width));
    expect(await meta("property", "og:image:height")).toBe(String(dimensions.height));
  }
  await context.close();
});

test("@artifact guide loads no client runtime and keeps native navigation", async ({ page }) => {
  const scripts: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") scripts.push(request.url());
  });
  await page.goto("/guide");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("User guide");
  await page
    .getByRole("navigation", { name: "On this page" })
    .getByRole("link", { name: "Command-line API", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Command reference" })
    .getByRole("link", { name: "resize", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "resize", level: 4 })).toBeInViewport();
  await expect(page.locator("script")).toHaveCount(0);
  expect(scripts).toEqual([]);
});

test("@artifact no-JavaScript visitors can read the guide and install", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Tiling Window Manager for macOS",
  );
  await expect(page.getByRole("heading", { name: "Simple composable movements" })).toBeVisible();
  await expect(
    page.getByText("A workspace contains columns. Windows stack as rows within each column."),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Install", exact: true })
    .click();
  await expect(page).toHaveURL(/#install$/);
  await expect(page.getByRole("heading", { name: "Install Frame", exact: true })).toBeInViewport();
  await expect(page.locator("#install pre")).toContainText(
    "brew install --cask tvr-works/tap/frame",
  );
  await headerGuide(page).click();
  await expect(page).toHaveURL(/\/guide$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("User guide");
  await expect(page.locator("#install-frame pre")).toContainText(
    "brew install --cask tvr-works/tap/frame",
  );
  await page
    .getByRole("navigation", { name: "On this page" })
    .getByRole("link", { name: "Configuration", exact: true })
    .click();
  await expect(page).toHaveURL(/#configuration$/);
  await expect(page.getByRole("heading", { name: "Configuration", exact: true })).toBeInViewport();
  await page
    .getByRole("navigation", { name: "Command reference" })
    .getByRole("link", { name: "list-windows", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "list-windows", level: 4 })).toBeInViewport();
  await expect(page.locator("#cli-list-windows")).toContainText("--app-bundle-id");
  await context.close();
});

test("Install scrolls to the fourth section, pauses the demo and keeps normal navigation", async ({
  page,
}) => {
  await start(page);
  await advance(page, 3);
  const ids = await windows(page).evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-window-id")),
  );
  const install = page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Install", exact: true });
  await install.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#install$/);
  await expect(page.getByRole("heading", { name: "Install Frame", exact: true })).toBeInViewport();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(scene(page)).toHaveAttribute("data-playback", "paused");
  await page.clock.runFor(10000);
  await expect(scene(page)).toHaveAttribute("data-step", "3");
  expect(
    await windows(page).evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-window-id")),
    ),
  ).toEqual(ids);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Guide", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "On this page" })
    .getByRole("link", { name: "First launch", exact: true })
    .click();
  await expect(page).toHaveURL(/\/guide#first-launch$/);
  await expect(page.getByRole("heading", { name: "First launch", exact: true })).toBeInViewport();
  await page.reload();
  await expect(page.getByRole("heading", { name: "First launch", exact: true })).toBeInViewport();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Install", exact: true })
    .click();
  await expect(page).toHaveURL(/\/#install$/);
  await expect(page.getByRole("heading", { name: "Install Frame", exact: true })).toBeInViewport();
});
