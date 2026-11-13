import { describe, expect, it } from "vitest";
import stylelint from "stylelint";
import config from "../../.stylelintrc.json";

async function rules(code: string, file = "src/styles/guide.css") {
  const result = await stylelint.lint({ code, codeFilename: file, config });
  return result.results.flatMap((file) => file.warnings.map((warning) => warning.rule));
}

describe("authored CSS policy", () => {
  it("rejects cascade mistakes and invalid CSS rather than only checking JSX", async () => {
    expect(
      await rules(".card { color: red; color: blue; widht: 2px; } .card { color: #xyz; }"),
    ).toEqual(
      expect.arrayContaining([
        "declaration-block-no-duplicate-properties",
        "no-duplicate-selectors",
        "property-no-unknown",
        "color-no-invalid-hex",
      ]),
    );
  });

  it("accepts Tailwind's theme directive and responsive overrides, but rejects misspelled at-rules", async () => {
    expect(
      await rules(
        "@theme inline { --color-accent: var(--accent); } .card { color: var(--accent); } @media (width < 40rem) { .card { display: block; } }",
        "src/styles/base.css",
      ),
    ).toEqual([]);
    expect(await rules("@theem { --color-accent: red; }")).toContain("at-rule-no-unknown");
  });

  it("requires tokens for page UI while allowing palette definitions and demo artwork", async () => {
    expect(await rules(".card { color: #abc; }")).toContain("color-no-hex");
    expect(await rules(":root { --accent: #abc; }", "src/styles/base.css")).toEqual([]);
    expect(await rules(".window { color: #abc; }", "src/styles/demo.css")).toEqual([]);
  });
});
