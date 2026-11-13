import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { once } from "node:events";
import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import sharp from "sharp";

// Explicit, local-only asset generation. Production builds use the committed PNG
// and do not require a browser or expose this source template.
const root = new URL("../", import.meta.url);
const resources = new Map(
  await Promise.all(
    [
      ["/", "scripts/social-card.html", "text/html; charset=utf-8"],
      ["/social-card.css", "scripts/social-card.css", "text/css"],
      [
        "/geist.woff2",
        "node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2",
        "font/woff2",
      ],
      ["/icon.png", "public/icon.png", "image/png"],
      ["/monitor-shell.webp", "public/monitor-shell.webp", "image/webp"],
      ["/monitor-backdrop.webp", "public/monitor-backdrop.webp", "image/webp"],
      ["/wallpaper.webp", "public/wallpaper.webp", "image/webp"],
    ].map(async ([path, file, type]) => [
      path,
      { body: await readFile(new URL(file, root)), type },
    ]),
  ),
);
const server = createServer((request, response) => {
  const resource = resources.get(request.url);
  response.writeHead(resource ? 200 : 404, {
    "Content-Type": resource?.type ?? "text/plain",
    "Cache-Control": "no-store",
  });
  response.end(resource?.body ?? "Not found");
});
let browser;
try {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => errors.push(request.url()));
  page.on("response", (response) => {
    if (!response.ok()) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return url.hostname === "127.0.0.1" ? route.continue() : route.abort();
  });
  await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  assert.ok(await page.evaluate(() => document.fonts.check("650 60px Geist")));
  assert.deepEqual(errors, []);
  assert.deepEqual(
    await page.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.scrollHeight,
    ]),
    [1200, 630],
  );
  const screenshot = await page.screenshot({ type: "png" });
  const png = await sharp(screenshot).png({ compressionLevel: 9 }).toBuffer();
  const metadata = await sharp(png).metadata();
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 630);
  assert.ok(png.length < 1024 * 1024);
  await writeFile(new URL("public/social-card.png", root), png);
  console.log(`Rendered social-card.png: 1200 × 630, ${(png.length / 1024).toFixed(1)} KiB.`);
} finally {
  await browser?.close();
  server.close();
}
