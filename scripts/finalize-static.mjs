import { readFile, writeFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { render, renderGuide } from "../.cache/prerender/entry-server.js";
const dist = new URL("../dist/", import.meta.url);
const mode = process.env.SITE_DEPLOYMENT_MODE === "production" ? "production" : "preview";
for (const [file, renderPage, heading] of [
  ["index.html", render, "Tiling Window Manager for macOS"],
  ["guide.html", renderGuide, "User guide"],
]) {
  let html = await readFile(new URL(file, dist), "utf8");
  assert.ok(html.includes('<div id="root"></div>'));
  html = html.replace('<div id="root"></div>', () => `<div id="root">${renderPage()}</div>`);
  if (mode === "production")
    html = html.replace('content="noindex, nofollow"', 'content="index, follow"');
  assert.ok(html.includes(heading));
  if (file === "guide.html")
    assert.ok(!/<script\b/iu.test(html), "Guide must have no client runtime");
  assert.ok(html.length < 65 * 1024, `${file} exceeds 65 KiB budget`);
  await writeFile(new URL(file, dist), html);
}
await writeFile(
  new URL("404.css", dist),
  ":root{color-scheme:dark;font:17px/1.7 system-ui;background:#06101b;color:#f5f7fa}body{margin:0}main{max-width:720px;margin:auto;padding:48px 24px}a{color:#b4e5ff}h1{font-size:48px;line-height:1.1;letter-spacing:-.04em}",
);
await writeFile(
  new URL("404.html", dist),
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found — Frame</title><link rel="stylesheet" href="/404.css"></head><body><main><h1>A little out of frame.</h1><p>This page doesn’t exist.</p><a href="/">Back to Frame</a></main></body></html>',
);
const csp =
  "default-src 'self'; script-src 'self'; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'";
await writeFile(
  new URL("_headers", dist),
  `/*\n  Content-Security-Policy: ${csp}\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Frame-Options: DENY\n${mode === "preview" ? "  X-Robots-Tag: noindex, nofollow\n" : ""}\n/build-info.json\n  Cache-Control: no-store\n`,
);
await writeFile(
  new URL("robots.txt", dist),
  mode === "production"
    ? "User-agent: *\nAllow: /\nSitemap: https://frame.tvr.works/sitemap.xml\n"
    : "User-agent: *\nDisallow: /\n",
);
await writeFile(
  new URL("sitemap.xml", dist),
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://frame.tvr.works/</loc></url><url><loc>https://frame.tvr.works/guide</loc></url></urlset>',
);
const commit =
  process.env.CF_PAGES_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const branch =
  process.env.CF_PAGES_BRANCH ||
  process.env.GITHUB_REF_NAME ||
  execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
assert.match(commit, /^[a-f0-9]{40}$/u);
await writeFile(
  new URL("build-info.json", dist),
  JSON.stringify(
    {
      repository: "tvr-works/frame-site",
      commit,
      branch,
      mode,
      dirty:
        !process.env.CF_PAGES_COMMIT_SHA &&
        !process.env.GITHUB_SHA &&
        !!execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim(),
    },
    null,
    2,
  ) + "\n",
);
for (const file of await readdir(dist, { recursive: true }))
  assert.ok(
    !/functions|_worker|\.map$|entry-server/.test(file),
    `Unexpected public artifact ${file}`,
  );
const files = await readdir(new URL("assets/", dist));
let total = 0;
for (const file of files.filter((x) => x.endsWith(".js")))
  total += gzipSync(await readFile(new URL(`assets/${file}`, dist))).length;
assert.ok(total < 150 * 1024, "JavaScript exceeds 150 KiB gzip budget");
console.log(
  `Prerendered static site (${mode}); JavaScript ${(total / 1024).toFixed(1)} KiB gzip. Source ${commit}.`,
);
