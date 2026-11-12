# Frame site design and behavior verification

final result: passed

## Current visual target

The owner selected `option-3-matte-monitor-frames.png` in `/Users/tim.vanreenen/.codex/visualizations/2026/11/12/01a1ce07-209a-7793-9b40-7d0f587d4fd7/keyboard-control-concepts/`. This supersedes the original heading, flat CSS hardware, toolbar, workspace selectors and in-screen workspace strips. The original monitor/glow reference is retained there as `monitor-glow-reference.png`.

Implemented: one headline, “Intuitive, keyboard-first window management for macOS.”; Open window, display setup and playback/Learn/Reset above the monitors; matte monitor hardware and blue upper/ground illumination; quiet translucent skeleton windows; workspace keys locked 1–5 left / 6–0 right; modifier ladder feeding one H/J/K/L row. No default toolbar, tagline or utility buttons sit beneath the keyboard.

## Rendered evidence

Evidence directory: `/Users/tim.vanreenen/.codex/visualizations/2026/11/12/01a1ce07-209a-7793-9b40-7d0f587d4fd7/keyboard-build/`.

- `comparison.png`: approved target left, implementation right, 2982 × 1055.
- `comparison-heading.png`: focused heading/upper-control comparison.
- `desktop.png`: four live windows, editor focused on the right, 1491 × 1055.
- `empty.png`, `single.png`, `mobile.png`, `tablet.png`, `small.png`, `learn.png`: empty, single-display, 390/768/320-pixel layouts and progressive help.

Captured at deviceScaleFactor 1. The desktop comparison uses the reference's exact 1491 × 1055 dimensions without resampling. Full comparison and separate desktop/mobile/tablet/single/help renders were opened and inspected. Initial visits remain blank with optional one-shot autoplay; the populated comparison scene was assembled through real demo controls.

| Fidelity surface     | Observed result                                                                                                                                                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typography           | Self-hosted Geist, single strong desktop headline, compact wordmark/navigation. Smaller screens intentionally wrap the headline.                                                                                                                                                   |
| Layout and spacing   | Almost full-width dual displays; controls aligned above; split numeric banks underneath; modifier ladder and shared direction row centered. Desktop primary controls fit the reference viewport. Mobile stacks monitors and modifier/direction groups; tablet keeps dual displays. |
| Colors and effects   | Near-black navy, white text, icy-blue selected/focus treatments. Generated stage artwork supplies the upper light blooms and ground pools. Soft edge masking avoids a visible backdrop rectangle.                                                                                  |
| Assets and hardware  | Supplied Frame app icon, generated dune wallpaper, transparent matte monitor shell and stage backdrop. HTML sits beneath the shell's transparent opening, with a one-pixel underlap to avoid seams. Hardware has a narrow dark bezel, broad short neck and small flat foot.        |
| Content and controls | Quiet decorative skeletons, named window actions and one shared directional row. Focus/Move/Resize select the modifier combination; workspace keys switch in Focus and send in Move. Resize disables numeric keys because no equivalent native default exists.                     |

No actionable P0/P1/P2 visual findings remain. The hardware and lighting are generated interpretations of the approved reference rather than extracted pixels. The implementation retains verified native eight-point tiling gaps, small display/workspace headers and a compact state caption between the hardware and numeric row. These functional details explain the visible differences from the mockup's larger padding and bare desktop. Mobile omits the wide stage backdrop to keep the stacked presentation restrained.

## Iteration and corrections

The first implementation had realistic app content and a busy toolbar. Owner feedback replaced the interiors with faint skeletons, removed all in-screen workspace buttons, and selected modifier-ladder option 3. The final implementation removes the extra controls beneath that ladder and promotes the former subtitle to the only headline.

During this build, rendered checks caught obsolete layout rules causing horizontal overflow and an isolated backdrop drawing across earlier content. Removed the obsolete rules and moved the artwork behind the full composition. Responsive checks now pass at 320, 390, 768 and 1488 pixels, including doubled text and a 200% zoom-equivalent viewport.

## Behavior and verification

All controls, autoplay and lessons still call the same immutable simulator transitions. The layout and focus algorithms retain their native fixture/trace coverage. The owner-requested fixed monitor assignment is a demo policy; autoplay uses workspace 6 for the right display. Native evidence remains applicable: 44 original fixture tests and one exported native command-trace probe passed in a temporary copy; all ten trace snapshots match the browser model. See `docs/simulator.md` for inspected source, limits and refresh procedure.

Final checks passed:

- Runtime pins, formatting, Oxlint/shadcn lint, TypeScript and 60 unit/parity/playback/gate tests.
- Static preview and production builds; JavaScript remains 108.2 KiB gzip, below the 150 KiB limit.
- 40 Chromium/WebKit browser cases, including composition mode changes, workspace affinity/transfers, single/dual displays, pointer/touch, scoped plain-key practice, automatic focus handoff, Escape/Tab, modal containment, progressive help, reduced motion, one-shot autoplay and exact-state takeover.
- Four production artifact cases: real prerendered content, security/indexing headers, assets, source identity, honest 404 and no-JavaScript guide/install path. Preview indexing was restored afterward.
- Automated accessibility scans across demo/help/install, with only Base UI's narrowly documented Safari focus-guard exception. Separate focus-containment tests remain enforced.

The in-app browser verified the updated composition and clicked focus-right: the active window changed to Terminal and the layout stayed unchanged. Its error/warning log was empty. The current preview tab was marked to remain open. Final screenshot capture reported no page errors.

## Limits and delivery

No full VoiceOver user study or real minimum-macOS runtime test is claimed. The simulator remains bounded to landscape virtual displays, six windows/workspace, four columns and simplified monitor hotplug. Browser practice is explicitly remapped and cannot intercept Frame's global native Option shortcuts.

Everything remains local in the separate `frame-site` repository. The native repository, installed app, releases, taps, hosting and DNS were untouched. Nothing was pushed or deployed. GitHub CI and real hosting acceptance remain outside this milestone.

Development preview: http://127.0.0.1:4177. Static artifact preview: http://127.0.0.1:4179.

## Review update: fixed workspace banks and activation

The owner requested fixed assignments after the initial modifier-ladder build. Workspaces 1–5 now belong to display 1 (left), and 6–0 to display 2 (right), with initial workspaces 1 and 6. Focus-mode workspace clicks reveal the selected workspace on its assigned display and restore its most recent focus, including activation of an empty workspace. The other display remains unchanged. Sending stays on the source workspace. Single-display mode accepts both banks; returning to dual displays restores the assignments and preserves active focus and all windows.

Current evidence: `workspace-banks-desktop.png` supersedes the earlier desktop capture's workspace labels; `workspace-locks.png` shows workspace 5 active on the left while workspace 0 remains visible on the right. Both are in the evidence directory above. The social card now uses workspaces 1 and 6. This is a behavioral revision; visual spacing, assets and responsive layout remain unchanged.

All 60 unit tests pass, including the unchanged native layout/focus trace and explicit coverage of all ten bank assignments, hidden-workspace transfers and single/dual restoration from either bank. The 40 Chromium/WebKit cases pass, with a corrected inner-text assertion rerun for the new all-workspaces case in both engines; the other 38 cases passed in the full run. Rendered verification selected 5 → 0 → 5, confirmed left/right headers and restored focus, and reported no page errors. The in-app preview exercised the same bank activation and was retained. Formatting, lint, TypeScript and static build also pass. The native repository remains unchanged.
