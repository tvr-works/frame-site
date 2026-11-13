export const configKeys = [
  ["start-at-login", "Boolean. Starts Frame at login; the bundled default is false."],
  [
    "persistent-workspaces",
    "An array of workspace names that remain addressable when empty. The bundled defaults keep 1–9 and 0.",
  ],
  [
    "workspace-change-hook",
    "An executable-and-arguments array run when focused workspace changes. See Scripting and integrations.",
  ],
  ["[binding]", "Key combinations mapped to one Frame command or an ordered array of commands."],
  [
    "[key-mapping]",
    "A qwerty, dvorak or colemak preset and optional custom key-notation mappings.",
  ],
  ["[gaps]", "Inner and outer spacing in points, either constant or selected by display."],
  [
    "[workspace-to-monitor-force-assignment]",
    "Workspace-to-display rules, with optional ordered fallback selectors.",
  ],
  [
    "[[window-classification-override]]",
    "Ordered rules that choose tiling or excluded placement for matching windows.",
  ],
];
