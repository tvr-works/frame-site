import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const pin = (await readFile(new URL("../.node-version", import.meta.url), "utf8")).trim();
assert.equal(process.versions.node, pin, `Use Node ${pin}`);
if (process.env.npm_config_user_agent)
  assert.equal(
    process.env.npm_config_user_agent.split(" ")[0],
    pkg.packageManager.replace("@", "/"),
    "Use the pinned npm version",
  );
assert.equal(
  pkg.devDependencies["playwright-core"],
  pkg.devDependencies["@playwright/test"],
  "Keep accessibility and browser tooling aligned",
);
console.log(`Runtime: Node ${pin}, ${pkg.packageManager}`);
