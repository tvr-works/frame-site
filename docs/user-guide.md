# User-guide evidence and maintenance

The user guide is authored in `src/guide-page.tsx`, `src/components/guide-reference.tsx` and the `src/guide-*.ts` reference/example modules. Installation text and the diagram are shared with the homepage. The guide is a normal `/guide.html` document, not a dialog or a client-router view. Both HTML entries are prerendered, including the full reference content.

## Native source authority

Read-only native source revision: `88c47e8df0e074515712c08944540bc7f3f752b6` in the neighboring Frame repository. The native repository and the owner’s running app/configuration were not modified.

| Topic                            | Source inspected                                                                                                                                                                   |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Installation and defaults        | README.md; Package.swift macOS 13 minimum; docs/config-examples/default-config.toml; release archive builder                                                                       |
| Installed app executable         | Frame.xcodeproj/project.pbxproj Release PRODUCT_NAME = Frame; script/release/build-release.sh validates Contents/MacOS/Frame                                                       |
| CLI inventory and flags          | Sources/Common/cmdArgs/cmdArgsManifest.swift and every impl/*CmdArgs.swift                                                                                                         |
| CLI context and results          | Sources/Cli/_main.swift; FrameEnvVars.swift; cmdResolveTargetOrReportError.swift; native command implementations                                                                   |
| Query JSON fields                | Sources/FrameMacOS/command/impl/ListAppsCommand.swift, ListMonitorsCommand.swift, ListWindowsCommand.swift and ListWorkspacesCommand.swift                                         |
| Config locations and schema      | ConfigFile.swift, parseConfig.swift, validateConfig.swift, parseKeyMapping.swift, parseGaps.swift, DynamicConfigValue.swift, parseWorkspaceToMonitorAssignment.swift               |
| Accessibility and classification | Sources/FrameMacOS/util/accessibility.swift; WindowClassifier.swift; AxUiElementWindowTypeHeuristics.swift; parseWindowClassificationOverride.swift; FrameEngine/tree/Window.swift |
| Workspace hooks                  | FrameEngine/util/workspaceChangeHook.swift and README.md                                                                                                                           |
| Diagnostics                      | DebugWindowEventsCommand.swift and WindowEventsDiagnosticsLogger.swift                                                                                                             |

Use parser definitions and implementations as authority. The checked-in generated help is manually maintained and omits some accepted options; for example, move’s boundary flags are present in the parser but absent from that help text. The app help’s example executable name and XDG filename are not substituted for the actual build/file-resolution code.

## External primary references

- [Apple accessibility model](https://developer.apple.com/library/archive/documentation/Accessibility/Conceptual/AccessibilityMacOSX/OSXAXmodel.html): app-exposed information, actions and notifications.
- [SketchyBar events and scripting](https://felixkratz.github.io/SketchyBar/config/events): custom events, subscriptions, trigger variables, item NAME, periodic updates and display/wake events.

The SketchyBar example is a generic documented integration. It queries each Frame display’s visible workspace and labels the item; it does not assume a particular monitor arrangement or cite personal configuration files.

## Repeatable content checks

`npm run check` includes `tests/unit/guide-content.test.ts`. It compares the documented command set with the checked-in `tests/fixtures/native-guide-api.json` snapshot of native CmdKind: all 18 commands are covered. Compared each parser’s declared flag names with its reference entry: every flag is documented. Shell command examples, hook setup and status-bar script pass `/bin/sh -n`. An isolated shell harness replaces both frame and sketchybar with functions; the sample produces `label=1: 2 | 2: 7` for two simulated displays. No native window command or real SketchyBar mutation was executed.

All eight TOML snippets extracted from the rendered guide parse with Python’s tomllib. The native schemas, required values, matching rules and command constraints were inspected independently. These checks establish syntax and source compatibility; they do not claim a live integration test against the installed apps.

When native commands or configuration change, update this evidence revision and the affected guide entries. Preserve the distinction between native default send behavior and the demo’s explicit follow-focus transfer, and between Frame fullscreen overlay and macOS native fullscreen.

The fixture records the native revision and SHA-256 hashes for the manifest, each parser and the root config parser. CI needs only that fixture, not a neighboring checkout or running Frame app. During a native release update, compare the current source read-only:

```sh
python3 scripts/refresh-guide-api.py /path/to/frame --check
```

If it differs, review the native changes and update the guide, then deliberately refresh and review the fixture:

```sh
python3 scripts/refresh-guide-api.py /path/to/frame
npm run check
```

The generator requires a clean native checkout and never writes there. The rendered-example checker uses Python 3.11+ standard-library HTML parsing and tomllib; shell blocks and shell-hook payloads are parsed with `/bin/sh -n`, never executed. Explicit data-language metadata distinguishes executable examples from placeholder command syntax. Negative tests confirm malformed TOML and shell examples fail. The helper itself is executed only with frame/sketchybar functions replacing the real tools and a restricted PATH; both two-display output and an unavailable-app fallback are covered.
