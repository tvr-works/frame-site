# Simulator contract and native evidence

This is a bounded browser port of the current Frame columns model, not a generic snapping animation or native application bridge. The native source was inspected read-only at commit `88c47e8df0e074515712c08944540bc7f3f752b6` (v3.2.1 source). The local source was clean at initial inspection and remains untouched by this work.

## Evidence

| Behavior                                                                                                                                     | Inspected source                                                                                         | Verification                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Workspace → horizontal root → vertical columns → windows                                                                                     | `Sources/FrameEngine/tree/ColumnsModel.swift`, `normalizeContainers.swift`                               | Fixture tests and mixed-trace invariants                                |
| First window fills one column; on landscape, second creates a right column; later windows append to focused column                           | `ColumnsModel.targetColumnForNewTilingWindow`, `WindowLifecycle.swift`                                   | `WindowRegistrationTest` and exported native trace                      |
| Horizontal focus chooses adjacent column's MRU window; vertical focus stays in the column; default focus stops at workspace edge             | `FocusCommand.swift`, `Common/cmdArgs/impl/FocusCmdArgs.swift`                                           | `FocusCommandTest` including MRU fixture                                |
| Horizontal move appends to neighbor; at outer edge creates a column; vertical move reorders and stops at top/bottom; empty columns disappear | `MoveCommand.swift`, `normalizeContainers.swift`                                                         | `MoveCommandTest` and native trace                                      |
| Auto weight is sibling average; layout distributes remaining size additively                                                                 | `TreeNode.bind`, `layoutRecursive.layoutTiles`                                                           | Weighted geometry and sibling tests                                     |
| Resize ±50 points; last child's direction sign flips; siblings share the change; single child cannot resize                                  | `ResizeCommand.swift`, default config                                                                    | `ResizeBehaviorTest`, browser actions                                   |
| Transfer appends to last destination column and keeps focus on source workspace                                                              | `MoveNodeToWorkspaceCommand.swift`, `ColumnsModel.targetColumnForTransferredTilingWindow`, `focus.swift` | `MoveNodeToWorkspaceCommandTest` and native trace                       |
| Workspaces remember monitor affinity; unseen/unassigned workspaces resolve to main display, with no forced numeric assignments               | `Workspace.swift`, `WorkspaceEx.swift`, `focus.swift`                                                    | Native behavior inspected; demo overrides assignment as described below |
| Eight-point inner/outer gaps; one-point height correction                                                                                    | Default TOML and `layoutRecursive.swift`                                                                 | Exact geometry assertions                                               |
| Hotkeys are global Carbon registrations                                                                                                      | `FrameMacOS/config/HotkeyBinding.swift` / HotKey 0.2.1                                                   | Read source; no real Option shortcut was sent to the owner's desktop    |

The default TOML was read directly. Native default bindings are Option H/J/K/L; Option Shift H/J/K/L; Control Shift Option H/J/K/L; Option 1–0; Option Shift 1–0. Fullscreen Option F is documented in the static guide but outside this demo's bounded actions.

## Executed native verification

Copied `Sources`, `Tests`, `Package.swift`, `Package.resolved`, `resources` and `docs` into `/private/tmp/frame-native-parity`, with a disposable `.git` marker required by the native test helper's root discovery. All caches/build output stayed in the temporary copy. No app, Accessibility permission, config, hotkey registration, release or tap was modified.

The following original suites executed 44 tests with zero failures: `MoveCommandTest`, `ResizeBehaviorTest`, `WindowRegistrationTest`, `FocusCommandTest`, `MoveNodeToWorkspaceCommandTest`. Native log for this review: `/private/tmp/frame-native-parity/test.log`. Environment: Xcode 27.2 / Swift 6.4.2, arm64 macOS.

`tests/fixtures/BrowserDemoTraceTest.swift` was additionally run only in the temporary native test copy. It exported `tests/fixtures/native-trace.json`. `tests/unit/native-trace.test.ts` compares every exported snapshot to the browser transitions, mapping native window IDs to creation order. This covers:

```text
empty → create → create → focus left → create → move right → move up
→ send to workspace 2 → switch to workspace 2 → create
```

Both layout trees and focus/workspace identities match all ten snapshots. The probe models opening an app window by registering it into the native new-window target and explicitly focusing it, as a foreground app opening would do. It does not invent a native create-window command.

To refresh this evidence, copy the native repository into a separate temporary directory, copy the retained Swift probe into `Tests/FrameEngineTests`, and run `swift test --filter BrowserDemoTraceTest` there. Keep the temporary `.git` marker and native resources for its helpers. Extract the `BROWSER_DEMO_TRACE=` JSON. Review source changes before replacing the golden fixture; a snapshot update is not itself evidence of compatibility.

## Deliberate boundaries

- Landscape virtual displays only, 1440 × 900 point work areas. The physical browser geometry scales the native logical coordinates. macOS menu bar/dock reservation, app minimum sizes and multi-display arrangement are not measured from the owner's machine.
- Six simulated windows per workspace, four columns, ten persistent workspaces. Resize stops before a column weight falls below 180 or a row weight below 150. These readability guards are demo limits, not native Frame minimum-size claims.
- The owner requested fixed workspace banks in this demo: 1–5 belong to the left display and 6–0 to the right. Initial visible workspaces are 1 and 6. Selecting a workspace shows it on its assigned display and activates its most recently focused window, or the empty workspace itself. This assignment is a demo configuration choice, rather than the native default affinity policy in the evidence table.
- Single-display mode makes every workspace available on that display. Restoring dual displays restores the fixed banks, retains the active workspace and focused window on its assigned display, and shows workspace 1 or 6 on the other display. Window state is preserved. This is not the full native nearest-point/previous-workspace hotplug algorithm.
- Create and close model demo app lifecycle actions. No native CLI command is implied. Background registration, app-specific exclusions, minimized/hidden/fullscreen windows, mouse drag, native app constraints and configuration overrides are outside scope.
- Focus outline, display headers and intentionally simplified translucent skeleton interiors are explanatory demo chrome, not a claim that Frame draws those controls over macOS. Window interiors were simplified at the owner's request during review.
- Native focus/command outcomes are verified against fixtures/traces for the supported subset; this is not a full port of every native command, platform hook or failure code.

## Playback and input

The pure session reducer owns play/pause/manual/complete state separately from layout. One initial autoplay is permitted only after first on-screen observation and when reduced motion/background state allow it. Any deliberate demo action takes over the exact current model state and disables autoplay. Reset clears the scene and stays manual; replay explicitly starts from blank. Background/offscreen transitions pause and require explicit Play to continue. Reduced motion suppresses visual transitions and initial autoplay.

All supported native actions are clickable. Keyboard commands are captured directly by the focused demo application, entered by clicking inside it or by Tab. Option H/J/K/L focuses, Option Shift moves, and Control Shift Option resizes. Option 1–0 switches workspaces and Option Shift 1–0 sends. Modifier chords use `KeyboardEvent.code` because macOS Option changes the character in `key`. Plain F/M/R chooses Focus/Move/Resize, H/J/K/L applies its directions, N/X opens/closes windows, and 1–0 switches in Focus or sends in Move. Number keys do nothing in Resize. The split 1–5 / 6–0 row reflects the fixed left/right assignment in dual-display mode.

Escape releases keyboard focus; Tab leaves normally. Events outside the demo, editable targets, active dialogs, composition and Command shortcuts are ignored. The former Learn panel and dedicated practice textarea have been removed at the owner's request. Activating the already-selected modifier row also takes over autoplay. Frame's global Carbon shortcuts can act before a browser receives them; preventing browser defaults cannot stop that. Option chords are verified only through synthetic browser DOM events, never by sending global native hotkeys on the owner's desktop. No Frame detection, pause feature, configuration alteration or native keyboard interception is claimed.

Held-key feedback is transient UI state, separate from the layout model and selected action. Matching copies of Option/Shift/Control keycaps fill while held; H/J/K/L fill independently until released. The modifier combination previews Focus, Move or Resize before a direction is pressed. Modifier-only interaction takes over autoplay without issuing a layout command. Auto-repeat does not toggle lights off. Escape, reset/replay, dialogs, focus leaving the demo, window blur and tab suspension clear feedback so a missed keyup cannot leave a key lit. Command/composition events remain excluded.

Announcements describe manual state changes without narrating every autoplay step. Simulated app previews are decorative; actual actions remain named buttons. Automated WCAG checks supplement browser interaction checks; a full VoiceOver user study is not claimed.

## Accessibility tooling exception

Base UI 1.9.0 intentionally exposes visually hidden focus guards as unnamed buttons to Safari/VoiceOver so swiping redirects focus into a modal. This produces WebKit axe `button-name` findings on the library’s sentinels. The [maintainer explicitly recommends excluding only `[data-base-ui-focus-guard]`](https://github.com/mui/base-ui/issues/5237). The installed `utils/FocusGuard.mjs` and `FloatingFocusManager.mjs` were inspected before applying that narrow scan exclusion. No app controls, rules or lint checks are excluded, and no guard markup is modified. Dedicated Chromium/WebKit tests check forward/backward modal focus containment and Escape restoration. Real VoiceOver swipe behavior remains untested locally.
