import { describe, expect, it } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import GuidePage from "../../src/guide-page";
import { cliGroups } from "../../src/guide-cli-data";
import { configKeys } from "../../src/guide-config-data";
import { sketchybarScript } from "../../src/guide-scripting-examples";
import inventory from "../fixtures/native-guide-api.json";

const commands = cliGroups.flatMap((group) => group.commands);
const html = renderToStaticMarkup(createElement(GuidePage));
const checker = fileURLToPath(new URL("../../scripts/check-guide-examples.py", import.meta.url));

describe("guide reference and rendered examples", () => {
  it("covers every command and declared flag in the versioned native API", () => {
    expect(inventory.revision).toMatch(/^[a-f0-9]{40}$/u);
    expect(commands.map((command) => command.name).sort()).toEqual(
      inventory.commands.map((command) => command.name),
    );
    for (const expected of inventory.commands) {
      const actual = commands.find((command) => command.name === expected.name)!;
      const syntaxFlags = [...new Set(actual.syntax.match(/--[a-z][a-z-]*/gu) ?? [])].sort();
      expect(syntaxFlags, `${actual.name} syntax flags`).toEqual(expected.flags);
      for (const flag of expected.flags)
        expect(
          `${actual.description} ${actual.options.join(" ")}`,
          `${actual.name}: ${flag}`,
        ).toContain(flag);
    }
  });

  it("covers every native root configuration key", () => {
    expect(configKeys.map(([key]) => key.replaceAll("[", "").replaceAll("]", "")).sort()).toEqual(
      inventory.configKeys,
    );
  });

  it("parses the actual rendered TOML and shell examples, including the hook payload", () => {
    const counts = JSON.parse(
      execFileSync("python3", [checker], { input: html, encoding: "utf8" }),
    );
    expect(counts.toml).toBeGreaterThan(0);
    expect(counts.sh).toBeGreaterThan(0);
    expect(counts.text).toBe(commands.length);
  });

  it.each([
    ["TOML", "start-at-login = true", "start-at-login = ["],
    ["Shell", "brew tap tvr-works/tap", "if ("],
    ["Shell", "sketchybar --trigger frame_workspace_change", "if ("],
  ])("rejects invalid %s syntax in rendered examples", (language, original, broken) => {
    expect(html).toContain(original);
    const result = spawnSync("python3", [checker], {
      input: html.replace(original, broken),
      encoding: "utf8",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`${language} example has invalid syntax`);
  });

  it.each(["two-displays", "unavailable"])(
    "runs the SketchyBar helper against isolated query stubs: %s",
    (scenario) => {
      const harness = `set -eu
frame() {
  case "$1" in
    list-monitors)
      [ "$SCENARIO" != unavailable ] || return 1
      printf '1 Built-in Display\\n2 External Display\\n'
      ;;
    list-workspaces)
      case "$2:$3:$4" in
        --monitor:1:--visible) printf '2\\n' ;;
        --monitor:2:--visible) printf '7\\n' ;;
        *) return 127 ;;
      esac
      ;;
    *) return 127 ;;
  esac
}
sketchybar() { printf '%s\\n' "$@"; }
${sketchybarScript}`;
      const output = execFileSync("/bin/sh", ["-c", harness], {
        encoding: "utf8",
        env: { PATH: "/usr/bin:/bin", NAME: "frame.workspace", SCENARIO: scenario },
      });
      expect(output).toBe(
        `--set\nframe.workspace\nlabel=${scenario === "unavailable" ? "none" : "1: 2 | 2: 7"}\n`,
      );
    },
  );
});
