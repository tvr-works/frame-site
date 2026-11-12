import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
const args = process.argv.slice(2),
  port = Number(args[args.indexOf("--port") + 1]) || 4177;
const root = resolve(import.meta.dirname, "../dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
const headers = await readFile(resolve(root, "_headers"), "utf8");
const common = Object.fromEntries(
  headers
    .split("\n")
    .filter((line) => line.startsWith("  ") && !line.includes("Cache-Control"))
    .map((line) => {
      const i = line.indexOf(":");
      return [line.slice(2, i), line.slice(i + 1).trim()];
    }),
);
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let file = resolve(root, "." + path + (path.endsWith("/") ? "index.html" : ""));
    let status = 200;
    if (!file.startsWith(root + "/")) throw new Error("Invalid path");
    try {
      if (!(await stat(file)).isFile()) throw new Error("not file");
    } catch {
      file = resolve(root, "404.html");
      status = 404;
    }
    const body = await readFile(file);
    res.writeHead(status, {
      ...common,
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": path === "/build-info.json" ? "no-store" : "no-cache",
    });
    res.end(body);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
  }
}).listen(port, "127.0.0.1", () => console.log(`Static preview http://127.0.0.1:${port}`));
