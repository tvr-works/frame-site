import { readFile, writeFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { render } from "../.cache/prerender/entry-server.js";
const dist = new URL("../dist/", import.meta.url);
const mode = process.env.SITE_DEPLOYMENT_MODE === "production" ? "production" : "preview";
let html = await readFile(new URL("index.html", dist), "utf8");
assert.ok(html.includes('<div id="root"></div>'));
html = html.replace('<div id="root"></div>', () => `<div id="root">${render()}</div>`);
if (mode === "production")
  html = html.replace('content="noindex, nofollow"', 'content="index, follow"');
assert.ok(html.includes("Intuitive, keyboard-first window management for macOS."));
await writeFile(new URL("index.html", dist), html);
// Keep installation and basic native guidance available without JavaScript.
const guide = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Guide — Frame</title><meta name="description" content="Install Frame and learn its default window and workspace shortcuts."><meta name="robots" content="${mode === "production" ? "index, follow" : "noindex, nofollow"}"><link rel="canonical" href="https://frame.tvr.works/guide.html"><link rel="icon" href="/icon.png"><link rel="stylesheet" href="/guide.css"></head><body><main><a href="/">← Frame</a><h1>Your first workspace.</h1><p>Keyboard-first window management for macOS.</p><h2>Install</h2><pre>brew tap tvr-works/tap\nbrew install --cask tvr-works/tap/frame</pre><p>Requires macOS Ventura or later. <a href="https://github.com/tvr-works/frame/releases/latest">Download the latest release</a>.</p><p>Open Frame from Applications and grant Accessibility access in System Settings → Privacy &amp; Security → Accessibility.</p><h2>Keep your hands in the flow</h2><ul><li>Focus left/down/up/right: Option + H/J/K/L</li><li>Move: Option + Shift + H/J/K/L</li><li>Resize: Option + Shift + Control + H/J/K/L</li><li>Switch workspace: Option + 1–0</li><li>Send window to workspace: Option + Shift + 1–0</li><li>Fullscreen: Option + F</li></ul><p>On landscape displays, the second window creates a right-hand column. Subsequent windows join the focused column. Focus stops at workspace edges; moving horizontally at an edge creates a column. Frame’s native default keeps focus in the source workspace when sending. The scripted demo follows the moved window and activates its destination workspace.</p><h2>Configure</h2><p>Frame works with its defaults. Create <code>~/.frame.toml</code> to customize shortcuts, gaps and startup. <a href="https://github.com/tvr-works/frame#configuration">Configuration documentation</a>.</p><p><a href="https://github.com/tvr-works/frame">Source &amp; documentation</a> · <a href="https://tvr.works">TVR Works</a></p></main></body></html>`;
await writeFile(new URL("guide.html", dist), guide);
await writeFile(
  new URL("guide.css", dist),
  ":root{color-scheme:dark;font:17px/1.7 system-ui;background:#06101b;color:#f5f7fa}body{margin:0}main{max-width:720px;margin:auto;padding:48px 24px}a{color:#b4e5ff}h1{font-size:48px;line-height:1.1;letter-spacing:-.04em}h2{margin-top:36px}pre{padding:20px;background:#122435;white-space:pre-wrap;overflow-wrap:anywhere;border-radius:10px;font-size:13px}li{margin-bottom:8px}",
);
await writeFile(
  new URL("404.html", dist),
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found — Frame</title><link rel="stylesheet" href="/guide.css"></head><body><main><h1>A little out of frame.</h1><p>This page doesn’t exist.</p><a href="/">Back to Frame</a></main></body></html>',
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
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://frame.tvr.works/</loc></url><url><loc>https://frame.tvr.works/guide.html</loc></url></urlset>',
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
assert.ok(html.length < 65 * 1024, "HTML exceeds 65 KiB budget");
console.log(
  `Prerendered static site (${mode}); JavaScript ${(total / 1024).toFixed(1)} KiB gzip. Source ${commit}.`,
);
