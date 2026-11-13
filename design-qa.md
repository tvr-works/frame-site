# Frame site design and behavior verification

final result: passed

The latest below-the-fold build is reviewed in “Structure and composable movements” at the end of this document. Earlier review entries preserve the design history.

## Current visual target

The owner selected `option-3-matte-monitor-frames.png` in `/Users/tim.vanreenen/.codex/visualizations/2026/11/12/01a1ce07-209a-7793-9b40-7d0f587d4fd7/keyboard-control-concepts/`. This supersedes the original heading, flat CSS hardware, toolbar, workspace selectors and in-screen workspace strips. The original monitor/glow reference is retained there as `monitor-glow-reference.png`.

Implemented: one headline, “Intuitive, keyboard-first window management for macOS.”; Open window, display setup and playback/Reset above the monitors; matte monitor hardware and blue upper/ground illumination; quiet translucent skeleton windows; workspace keys locked 1–5 left / 6–0 right; modifier ladder feeding one H/J/K/L row. No default toolbar, tagline or utility buttons sit beneath the keyboard.

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
- 44 Chromium/WebKit browser cases, including composition mode changes, workspace affinity/transfers, single/dual displays, pointer/touch, scoped plain-key practice, automatic focus handoff, Escape/Tab, modal containment, progressive help, reduced motion, one-shot autoplay and exact-state takeover.
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

## Review update: workspace-hover repainting

The owner reported transient artifacts inside both monitor backgrounds while hovering workspace keys. The original artifact did not reproduce in automated Chromium/WebKit captures, including the initial before-change probe; a hardware-specific compositor failure remains an inference. The shared page-level `mix-blend-mode` backdrop and live window blur were inspected. Replaced page blending with local `background-blend-mode` on the glow artwork, and isolated/paint-contained each monitor screen so control repaints do not share that painting boundary. Retained the existing glow, wallpaper, transparency and geometry.

Added a rendered regression case with normal motion enabled, explicit Reset to stop autoplay, and both empty/populated displays. It hovers all ten workspace keys and requires each monitor screenshot to remain byte-identical to its resting capture, with an unchanged state caption. Both engine cases pass; the existing 40 browser cases, 60 unit tests, formatting, lint, TypeScript and static build also pass. The full run initially exposed autoplay still running in the new test setup; the corrected hover-only setup was rerun successfully in both engines. Final captures `hover-chromium-rest.png`, `hover-chromium-workspace.png`, `hover-webkit-rest.png` and `hover-webkit-workspace.png` are in the evidence directory. Screenshot comparison preserves the appearance with minor compositing/edge rounding differences; the Chromium hover capture was opened and inspected. The live in-app preview also showed stable monitors with the selected workspace hovered and no error/warning logs. The original transient GPU artifact is not claimed to have been reproduced and conclusively diagnosed.

## Review update: direct keyboard input and simpler menu bars

Removed Learn, its lesson/shortcut panel, the separate practice textarea, and their unused styles. The existing header Guide retains concise keyboard instructions. Each simulated menu bar now groups “Display N · Workspace N” on the left and has no Frame icon. The header wordmark stays intact. No below-the-fold content or placeholder sections were added. Current desktop/mobile evidence is `direct-keyboard-desktop.png`, `direct-keyboard-mobile.png` and `direct-keyboard-small.png` in the evidence directory; desktop and mobile were opened and inspected. The social card was refreshed.

Keyboard input formerly reached only the explicit practice textarea. It now uses one stable React effect-event listener, scoped to event targets inside the focused demo application. Clicking inside retains application focus on pointer release, including when the empty-desktop button disappears. Recognized commands preserve focus before changing windows, so closing the last window does not disable subsequent commands. Native Option chords use physical event codes to handle macOS Option-generated characters; plain keys also operate directly. Escape releases focus, ordinary Tab navigation remains intact, and editable targets, dialogs, composition, Command shortcuts and unsupported combinations are ignored. Guide explicitly focuses its opener before showing the dialog to restore focus consistently in WebKit. No lint suppression or configuration exception was added.

All 60 unit tests and all 44 Chromium/WebKit browser cases pass, as do formatting, lint, TypeScript and static build. Browser checks include direct keyboard entry after an empty-desktop click, focus/move/send/resize/workspace commands, closing and reopening windows, Escape/Tab boundaries, editable/dialog exclusion, macOS modifier-character DOM events, focus restoration, pointer/touch, hover pixel stability, mobile reflow, enlarged text, accessibility and existing autoplay/static-delivery behavior. The in-app browser additionally exercised N/H/6 directly after clicking the demo: window creation, directional focus and workspace activation were observed with no error/warning log. No real native Option chord was sent during validation; the OS-global interception limitation remains documented. JavaScript is now 107.3 KiB gzip. The preview remains local; native source and hosting remain untouched.

## Review update: held-key composition feedback

The modifier keycaps and H/J/K/L buttons now fill with the existing icy-blue accent while physically held, visibly distinct from the selected action's quiet outline. Matching modifier copies light together across the ladder. Option → Shift → Control progressively previews Focus → Move → Resize; the direction key completes the visible chord. Releasing a direction leaves held modifiers lit until their own release. Plain directional keys also light, and simultaneous keys are tracked independently. The effect is immediate and respects reduced motion. No new controls or below-the-fold content were introduced.

Transient feedback is separate from simulator state. Modifier-only input takes over autoplay without moving windows. State clears on Escape, focus departure, dialogs, reset/replay, window blur and background suspension. Current evidence: `compose-modifiers.png`, `compose-option-shift-h.png`, `compose-released.png` and focused `key-composition.png`; the held full-page and focused keycap captures were opened and inspected. The in-app preview verified a plain key command, zero remaining held lights after release and an empty warning/error log. Modifier capture used synthetic browser events only.

All 48 Chromium/WebKit browser cases and 60 unit tests pass, along with formatting, lint, TypeScript and static build. New browser coverage checks progressive combinations, independent release, repeat behavior, physical key mapping, simultaneous plain keys, Escape, dialog/focus departure, window blur and visibility loss. Existing hover-pixel, layout/focus, workspace-bank, autoplay, accessibility, responsive and static-artifact checks remain green.

## Review update: highlight only the matching modifier row

At the owner's request, held-key illumination is now limited to the row that exactly matches the modifier combination: Option lights Focus, Option + Shift lights Move, and Control + Shift + Option lights Resize. Unsupported or incomplete combinations do not fill any modifier keycaps. This supersedes the earlier behavior that lit matching key copies across all rows. H/J/K/L feedback and release/focus cleanup are unchanged.

Current visual evidence: `compose-matched-row.png` and focused `key-composition-matched-row.png` in the evidence directory. The focused capture was opened and inspected: Option + Shift + H fills only the two Move modifier caps and H. All 48 Chromium/WebKit checks, 60 unit tests, formatting, lint, TypeScript and static build pass. Existing composition checks now require the exact row's keys and also verify that Control-only and Control + Option produce no modifier fill. No new controls, layout changes or below-the-fold content were added.

## Review update: follow transferred windows

Moving a focused window to a workspace now reveals that destination on its assigned display and keeps the exact moved window focused. This covers visible/hidden destinations, same-display transfers, cross-display transfers, populated workspaces and single-display mode. Rejected transfers (self, invalid destination, full destination or no focused window) preserve focus and visibility. Source windows remain available when their workspace is revisited. The destination activation helper now accepts the specific window to focus, so placement and focus recency use the established model paths.

This owner-requested demo policy composes native send + workspace activation. The retained native fixture is unchanged; the send step is compared with its following native workspace-activation snapshot, and the remaining snapshots compare directly. Updated Guide and autoplay copy to describe follow-focus, and removed autoplay's now-redundant destination-switch step. Native app source and configuration remain untouched.

All 64 unit tests and all 48 Chromium/WebKit browser cases pass, including exact identity retention from pointer controls, plain keys and synthetic native modifier events. Guards, destination-MRU behavior, monitor reconfiguration and the existing visual/keyboard/autoplay regressions pass. Production and preview builds pass; all four production-artifact checks pass, and preview indexing was restored. Current evidence: `follow-transfer-desktop.png` and `follow-transfer-monitors.png` in the evidence directory. The latter was opened and inspected: Notes moves from the left to the populated right display, remains outlined as focused, and keeps its original window ID. The capture logged no page errors. The work remains local.

## Review update: remove the visible status caption

Removed the caption between the monitor hardware and workspace controls, including its unused responsive styles. The existing screen-reader-only, polite/atomic live region remains the single source of manual status and playback pause/completion announcements. Autoplay is not narrated step by step. A 24-pixel gap gives the hardware and keyboard controls breathing room without a text row. Current evidence: `no-visible-caption-desktop.png`, `no-visible-caption-mobile.png` and focused `caption-removed.png`; the mobile and focused captures were opened and inspected. The social card was refreshed.

All 64 unit tests, 48 Chromium/WebKit browser cases, formatting, lint, TypeScript and static build pass. Browser coverage now checks real autoplay window progression rather than visible captions and verifies that manual/completion announcements remain available in the hidden live region. The capture reported zero visible caption nodes, one polite live region and no page errors. Native source and hosting remain untouched.

## Review update: remove the workspace hint

Removed the visible “Workspaces · Option switch · Option Shift send” hint, its resize note, dangling description reference and unused styles. All ten workspace controls retain their accessible names and hidden fieldset legend. The tablet row reserved for the removed hint was also removed; desktop banks and mobile stacking remain aligned. Inspected `no-workspace-hint.png` and `no-workspace-hint-mobile.png`; full desktop evidence is `no-workspace-hint-desktop.png`. The social card was refreshed. All 64 unit tests, 48 Chromium/WebKit browser checks, formatting, lint, TypeScript and static build pass, with no page errors in the final capture.

## Review update: match the top-row action styles

Open window now uses the same small, quiet icon-and-text button treatment as Replay and Reset. Shared responsive sizing applies across all three actions, replacing the former outlined-button padding overrides. Inspected `quiet-open-window.png` and `quiet-open-window-mobile.png`; full desktop evidence is `quiet-open-window-desktop.png`. The social card was refreshed. All 64 unit tests, 48 Chromium/WebKit checks, formatting, lint, TypeScript and static build pass. Window creation, keyboard focus, hover and touch behavior remain verified; final capture had no page errors.

## Review update: additive modifier order

Resize now displays Option → Shift → Control, keeping its first two keycaps aligned with Move and its first keycap aligned with Focus. Accessible names, keyboard help, Guide and autoplay shortcut metadata use that same additive order. Shortcut behavior and matching-row illumination are unchanged. Inspected `composable-modifier-order.png`; desktop/mobile captures are also retained, and the social card was refreshed. All 64 unit tests, 48 Chromium/WebKit browser cases, formatting, lint, TypeScript, preview/production builds and four production-artifact cases pass. Preview indexing was restored; the final capture reported no page errors.

## Review update: close windows with the red traffic light

Removed the top-right X and moved close behavior to a named red traffic-light button at the left of each title bar. The red control is separate from the title/focus button, with a 24 × 24-pixel hit target, hover feedback and visible keyboard focus. Yellow/green dots remain decorative; the red close control remains available at narrow widths. Closing restores demo keyboard focus before the clicked window disappears, so keyboard commands still work after the last window closes.

Inspected `red-dot-close-titlebars.png` and the mobile capture; full desktop evidence is `red-dot-close-desktop.png`. The social card was refreshed. All 64 unit tests and 50 Chromium/WebKit browser cases pass, along with formatting, lint, TypeScript and static build. New interaction coverage closes an unfocused window by its red dot, closes the last window with Enter, and opens another with N. A 320-pixel check confirmed the 24 × 24 target stays visible and works. The capture reported no page errors. Native source and hosting remain untouched.

## Review update: scripted composability demonstration

Replaced the hands-on demo with one 27.05-second sequence. Both monitors begin empty; browser, notes and editor windows open steadily at 600 ms intervals. After a 1.2-second settle, four focus sub-beats (K/J/H/L), four movement sub-beats (L/H/K/L), four resize increments (L/L/L/H), and a transfer to workspace 7 show the same modifier ladder composing with directions and numbers. The exact focused editor window is retained through movement, resize and transfer. Modifier cues lead each direction/number and command by 650 ms; longer pauses separate action groups. Playback holds the finished scene without looping and clears the key lights.

Only Play/Pause and Replay remain as demo controls. Removed keyboard capture, display switching, Open window, Reset, interactive workspace/mode/direction buttons and window focus/close hit targets. Monitor hardware, glow, skeleton windows, red traffic lights, fixed workspace banks and additive modifier order remain as presentation. No visible caption or below-the-fold section was added. A persistent screen-reader summary explains the sequence, with polite pause/completion status. Guide and static metadata now describe the scripted demo.

Browser plugin not available; used the repository's pinned Playwright workflow. Verified the flow: empty load → three window openings → modifier cue → action sub-beats → follow-focus transfer → finished hold, plus Pause/Play and Replay from the middle/end. All 63 unit tests, 38 Chromium/WebKit browser checks, formatting, lint, TypeScript, preview/production builds and four production-artifact cases pass. Browser coverage includes no keyboard interception or stage tab stops, exact focus identity and geometry, cue-before-action timing, reduced motion, dialog/offscreen/background suspension, touch, 320/390/768/1488-pixel layouts, doubled text and axe scans. Normal-motion real-time playback also completed with three windows and no page errors. Preview indexing was restored. Native source and hosting remain untouched.

Evidence in the existing keyboard-build directory: scripted-empty-desktop.png, scripted-step-3.png, scripted-step-19.png, scripted-resize-desktop.png, scripted-final-motion.png and scripted-mobile.png. Opened and inspected the desktop movement/resize and mobile captures: only the matching modifier row lights; skeleton windows and all playback controls remain legible without overflow. The social card was refreshed to the scripted transfer scene. Automated page identity, nonblank content, console and interaction checks passed; no framework overlay was present. Manual VoiceOver testing is not claimed.

## Review update: workspace transfer out and back

The final workspace chapter now sends the focused editor to workspace 7 on the right, holds there, then cues Option Shift 1 and sends the same window back to workspace 1 on the left. Focus follows both legs. The finished scene has three windows on the left, an empty workspace 7 on the right, and no lit keys. Total playback is 29.5 seconds. The original outbound social-card pose remains a valid moment in the sequence.

Updated the persistent accessible summary and simulator documentation. Unit and browser checks now assert both destinations, matching number-key highlights and exact retained window identity. A timing-sensitive WebKit opening assertion exposed real clock time advancing during navigation; freezing that test's clock before navigation removes loading time from its 500 ms empty-scene assertion. All 63 unit tests and 38 Chromium/WebKit checks pass, as do formatting, lint, TypeScript and the static build. Inspected workspace-roundtrip-1.png in the existing evidence directory; workspace-roundtrip-7.png records the outbound pose. The preview capture reported the same focused window ID on both legs and no page errors.

## Review update: close to empty and repeat

The end now closes the focused editor, Notes and Reading individually, with 600 ms between closings and normal retile/MRU behavior. Shortcut lights switch off for closing. After the last close, the monitors remain empty for 1.8 seconds including the next opening’s lead-in, then the three-window setup begins again. Each 31.3-second cycle resets the entire model, so IDs, weights, workspace labels and focus do not accumulate across runs. Play/Pause remains available throughout the cycle; Replay restarts immediately. Reduced motion still disables initial autoplay and visual transitions. Background/offscreen/dialog suspension still requires explicit Play.

Removed the obsolete complete playback state and updated the accessible summary, Guide and current behavior documentation for repetition. The polite status announces pauses rather than every loop. Unit coverage checks individual close counts, quiet keys, exact reset state across two cycles and paused-tick guards. Browser coverage checks the closing sequence, automatic opening of the next cycle, pause/resume on the empty hold and Replay. The shared browser test setup retains a running virtual clock so Base UI focus restoration and axe scheduling can progress; only the strict opening-boundary test freezes before navigation.

All 64 unit tests, 38 Chromium/WebKit browser checks, formatting, lint, TypeScript and the static build pass. Browser plugin unavailable; verification used the pinned Playwright workflow. Captures loop-closing-1.png through loop-closing-3.png and loop-empty-mobile.png are in the existing evidence directory. The first and final desktop closing frames were opened and inspected: remaining windows retile, both monitors end empty, and no keycap stays lit. Preview capture verified 2 → 1 → 0 windows, step reset to 0, then one window in the next opening; page identity matched and console/page errors were empty. Native source and hosting remain untouched.

## Review update: cue each red close dot

Each scripted close now has a separate 450 ms cue on the exact next window’s red traffic light. The dot brightens, grows slightly and gains a red halo before the model closes that window. Cue beats reuse the existing story timing, preserving the 600 ms spacing between closes and the 31.3-second loop. Only that dot lights; shortcut keys remain quiet. Pause preserves the targeted window and cue; closing, Replay and cycle reset clear it. The cue remains a static state with reduced motion, without the brief CSS transition.

Updated the accessible description and current behavior documentation. Unit checks verify cue-before-close identity, unchanged geometry during the cue, pause preservation and Replay clearing. Chromium/WebKit checks verify exactly one cued dot on the focused window before each close, removal of that same window, no stale cue and the existing closing/loop behavior. All 64 unit tests, 40 browser checks, formatting, lint, TypeScript and the static build pass. Browser plugin unavailable; used pinned Playwright. The local capture confirmed page identity, a 31.3-second timeline and no console/page errors.

Evidence: close-dot-cue-desktop.png, close-dot-cue-titlebar.png and close-dot-cue-mobile.png in the existing keyboard-build directory. Opened and inspected the titlebar and mobile captures: the editor’s red dot has a distinct, contained halo while the other red dots and keyboard illustration remain quiet. No hands-on controls were restored. Native source and hosting remain untouched.

## Review update: slower lifecycle, structural labels and both resize axes

Window openings are now 1.2 seconds apart; closing is 1.6 seconds apart, with 650 ms of red-dot cue before each close. The returned workspace gets 2.4 seconds to settle before teardown. Geometry transitions increased from 380 to 550 ms. Empty monitors remain visible for 3 seconds before the next opening. The revised cycle is 42.95 seconds. A normal-motion run measured opening gaps around 1.2 seconds and closing gaps around 1.6 seconds, closed 3 → 2 → 1 → 0, and opened the next cycle without page errors.

Added a short visible action label using verb → object → direction/result wording. At the owner’s latest placement request, it sits centrally between the two monitor feet, scaling with the hardware; stacked mobile monitors reserve a central gap for the label. The earlier below-controls placement is superseded. The longest move phrase fits on one line between the desktop/tablet stands. Labels remain ordinary readable text, while only paused status uses the existing polite live region. No extra interaction controls were added. Full wording and pacing map: docs/demo-script.md.

The move chapter now ends with the editor back in the lower row of the right column. Column resizing expands left three steps and shrinks from the left once. Row resizing then expands upward twice and shrinks from the top once. All actions keep the same editor focused. These phrases describe the demonstrated edge; they are grounded in the model’s last-sibling resize sign, rather than assuming any direction always means grow or shrink.

All 65 unit tests, 42 Chromium/WebKit browser checks, formatting, lint, TypeScript and static build pass. A new geometry assertion proves width changes by ±50 without changing height, then height changes by ±50 without changing width. Browser checks compare rendered dimensions and visible labels on each beat, with responsive coverage exercising the longest move label. Production-artifact checks also passed during this update, and preview indexing was restored. Browser plugin unavailable; used pinned Playwright. Native source and hosting remain untouched.

Final visual evidence in the existing keyboard-build directory: feet-label-1488.png, feet-label-1286.png, feet-label-768.png, feet-label-390.png and feet-label-row-resize.png. Desktop, mobile and row-resize captures were opened and inspected: the label is central, the longest phrase clears both feet, and the row changes height within its column. Earlier labelled-* captures record the superseded below-controls position. The social card was refreshed to the final placement. No console/page errors were observed in the scripted capture.

The final timing review removes the separate leading text/modifier phase. Each shortcut now changes its label, full key chord and model state in the same beat, then holds that result before the next action. Command intervals and the 42.95-second cycle stay unchanged. Close-dot previews remain intentionally anticipatory; their text holds the previous action until the actual close. A new frozen-clock browser case verifies immediately before and after focus and resize boundaries that text/keys stay unchanged until the command, then update together. All 42 browser cases pass. Final synchronized row-resize capture: sync-feet-label-row.png; no page/console errors were observed.

## Structure and composable movements

final result: passed

### Target and captured state

Source visual truth: `/Users/tim.vanreenen/.codex/generated_images/01a1ce07-209a-7793-9b40-7d0f587d4fd7/exec-f275d786-7097-4ed8-8441-05bfb58dc697.png` (770 × 2043 pixels). This is the selected structure/movements reference with the final “Simple composable movements” heading. The owner's subsequent instruction removes dividers between major sections; whitespace replaces them. The three internal movement dividers remain. Existing hero behavior and assets are retained.

Implementation: `http://127.0.0.1:4177/`, dark theme, static explanation with all lazy images decoded, no dialog. Evidence directory: `/Users/tim.vanreenen/.codex/visualizations/2026/11/12/01a1ce07-209a-7793-9b40-7d0f587d4fd7/below-fold-build/`.

- `final-770.png`: 770 × 1100 CSS viewport, deviceScaleFactor 1; explanation element capture 710 × 2063 pixels.
- `final-desktop.png`: 1488 × 1058 CSS viewport, deviceScaleFactor 1; explanation element 1200 × 2897 pixels.
- `final-mobile.png`: 390 × 844 CSS viewport, deviceScaleFactor 1; explanation element 342 × 2227 pixels.
- `movements-desktop.png`: desktop viewport capture including heading, keycaps and diagrams.
- `reference-content.png`: source content crop at x47/y170, 680 × 1720 pixels, excluding the hero tail and footer.
- `comparison-final-770.png`: source crop on the left, implementation on the right; both content regions normalized to 680 pixels wide with preserved aspect ratios, 24-pixel gutter, overall 1384 × 1976 pixels. The implementation is proportionally reduced from 710 pixels; source is at its native crop scale. This is a content-region comparison, not a claim of identical pixel positions or section height. The larger section gaps and absence of major dividers are intentional.
- `comparison-movements-detail.png`: 1384 × 680 focused crop from the combined comparison, inspected for type, modifiers, skeleton treatment, arrows and captions. Differing vertical positions reflect the intentional whitespace; the actual Focus/Move examples are compared by their headings and assets.

The combined comparisons and final mobile capture were opened and inspected. IAB also rendered the new content at 1286 × 1309, opened the footer Guide, closed it with Escape and restored focus to that footer link. Warning/error logs were empty. The preview is kept open. No framework error overlay or blank page was observed.

### Findings and comparison history

1. [P2, fixed] Structure label transparency produced halos in the initial raster. Regenerated the structure artwork on opaque navy, with readable native image labels. A separate mobile variant increases label size. The final diagrams retain exactly one tall left window and two right-hand rows.
2. [P2, fixed] The opaque structure canvas was slightly darker than the page, leaving a visible rectangular patch. Scoped lighten blending inside an isolated, page-colored picture container removes the dark canvas boundary while preserving the image content. Final desktop/tablet/mobile captures show no hard background rectangle.
3. [P2, fixed] The first 770-pixel comparison (`comparison-770.png`) showed undersized structure type, lead text, action headings and keycaps relative to the reference. Increased the structure heading's responsive scale, lead/caption scale, action heading scale and keycap dimensions. The final comparison restores the intended strong structure heading and clear modifier progression.
4. [P2, fixed] The first full browser run found a five-pixel horizontal overflow with doubled text: the word “Workspaces,” could not break. Added emergency wrapping to explanation headings. Both engines now pass the enlarged-text case and the 320/390/768/1488-pixel reflow checks.

No actionable P0/P1/P2 findings remain after the revised capture and combined comparison.

### Required fidelity surfaces

| Surface                          | Final review                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fonts and typography             | Reused the existing self-hosted Geist family. Large, tightly tracked headings preserve the selected hierarchy; leads/captions use quieter optical weights. Keycaps use the existing font and native modifier glyphs. At tablet width the structure heading retains its two-line shape; mobile wraps the movement title without truncation. Emergency wrapping handles enlarged text. Raster labels are intentionally part of the diagram; the structural alt text carries their meaning. |
| Spacing and layout rhythm        | One wide annotated diagram followed by three editorial action rows. Desktop pairs commands with compact diagrams; mobile stacks them. Major boundaries use generous whitespace (190 px from the hero and 200 px before movements on desktop; 112/120 px on mobile). Only movement rows receive thin dividers. Content stays within the established page margins and 1200-pixel explanation width.                                                                                        |
| Colors and tokens                | Existing near-black navy, white/muted text and icy-blue accent are reused. Option has a quiet blue outline; Shift and Control fill progressively. Miniatures match the subdued translucent skeleton language. The below-fold canvas stays quiet rather than repeating the hero's monitor glow.                                                                                                                                                                                           |
| Image quality and asset fidelity | Five generated WebP assets, not CSS/SVG illustration substitutes. The annotated diagram correctly shows workspace → columns → rows; Focus highlights one window, Move shows a horizontal transfer, Resize marks both axes. Desktop/mobile structure variants avoid label halos. Transparent movement images have matched framing and no visible edge seams. Images use intrinsic dimensions, async decoding and lazy loading.                                                            |
| Copy and content                 | Exact approved hierarchy and movement title. Structural language describes containment and commands, without prescribing task organization. Captions read “Choose a window.”, “Move between columns or rows.” and “Resize a column or row.” Shortcuts keep Option, then Shift, then Control to show composition. No new marketing claims, installation block or hands-on controls were introduced.                                                                                       |

### Verification and implementation checklist

- [x] Static semantic sections, heading hierarchy, image description and spoken shortcut names.
- [x] Mobile structure asset and responsive editorial rows.
- [x] Footer reuses the Guide dialog and restores its own opener focus. Static Guide works without JavaScript.
- [x] Full `npm run check`: formatting, lint, TypeScript and all 65 unit tests.
- [x] Preview build and all 44 Chromium/WebKit browser cases, including the new content/image/footer path, existing scripted playback, axe scans, responsive layouts and enlarged text.
- [x] Production build plus all four artifact checks; restored preview indexing afterward. No publication.
- [x] Final visual comparison and IAB navigation check; no captured page/console errors.

Follow-up polish: generated raster illustrations are interpretations of the selected mock rather than extracted source pixels. Manual VoiceOver testing and a user study are not claimed. No further visual blocker remains.

## Review update: consistent modifiers and workspace composition

The owner's three browser annotations supersede the previous structure heading, movement lead, and added-modifier-only highlights. The heading is now “Simple structure”, using the same heading style as the movement section. The lead reads “Choose your action with modifiers, then a direction or workspace number.” All modifier keys, including Option, share the icy-blue fill. Directions remain dark, so the action and target are visually distinct.

Focus and Move show a second target line, “or 1–0 workspace”, aligned beneath H/J/K/L, sharing the same modifier group. Resize has only the directional target. Accessible prose spells out both shortcuts and the different results: switch workspace for Focus, send window for Move. No new interactive controls or native commands were added.

Visual evidence is in the existing below-fold-build evidence directory: refined-1047.png (owner's 1047 × 1308 viewport), refined-mobile.png (390 × 844 viewport), and refined-320.png (320 × 800 viewport). Captured at deviceScaleFactor 1. Opened and inspected the annotated-width and 320-pixel captures: modifier fills match, workspace alternatives remain attached to the same chord, and all keys fit without overflow. The simpler structure heading removes redundant naming without reducing the diagram's annotations. Prior diagram assets and section spacing are unchanged. No page/console errors were captured.

Typography, spacing, colors, image fidelity and copy were reviewed against the owner's annotated screenshots and the retained approved layout. The new content is an explicit requested revision to that target. No actionable P0/P1/P2 issue remains. Browser plugin not available; verification used the established pinned Playwright workflow. Formatting, lint, TypeScript, all 65 unit tests and all 44 Chromium/WebKit browser checks pass, including enlarged text and the renamed structure region. Production build and all four artifact checks pass; the final artifact is restored to preview mode.

final result: passed

## Review update: quieter playback and explicit movement descriptions

The owner's next two annotation sets refine the hero and movement explanations. Play/Pause and Replay now sit beside the right monitor foot, level with the caption between the feet on desktop. On stacked mobile displays, they remain beside the second monitor foot; the action caption stays in the reserved gap between displays. Removed the empty upper toolbar and its obsolete responsive styles. Buttons use the existing ghost/icon variants, retain Play/Pause/Replay accessible names and a skip-link destination, expose hover descriptions, and have 44 × 44 pixel targets. They are siblings of the decorative monitor group, so they remain available to assistive technology. Keyboard order, playback and pause behavior are unchanged.

The hero headline uses exactly the same size, weight, tracking and line-height scale as the lower section titles. Its longer copy wraps to two lines at desktop widths, rather than being compressed onto one line. At the owner's 1047-pixel viewport, both headline and section heading compute to 54.444 px; at 320 pixels they both compute to 34 px. Desktop intro margins are 64/72 px, compact-height desktop uses 48/56 px, and mobile uses 48/56 px. Emergency wrapping remains enabled for enlarged text.

The static shortcut rows now include a muted plus sign between the modifier group and its direction/workspace selection. All modifier keys retain their matching fill. Captions now read:

- Focus: “Move focus between windows or workspaces.”
- Move: “Move windows between columns, rows, or workspaces.”
- Resize: “Push column edges left or right. Push row edges up or down.”

The spoken resize description explicitly maps H/L to column width and J/K to row height, consistent with the model and retained native parity evidence.

Final visual evidence in the existing below-fold-build directory: updated-hero-1047.png, updated-movements-1047.png, updated-movements-320.png, and updated-composed-full.png. Additional hero captures hero-controls-1488.png, hero-controls-390.png and hero-controls-320.png exercise the other layouts. The final annotated-width hero and both movement captures were opened and inspected; headings, icons, captions and plus signs remain legible. The 320-pixel Resize chord fits without clipping. Final geometry probes confirm no horizontal overflow at 1047 or 320 pixels, 44-pixel controls, and 16 pixels between the bottom of the controls and the workspace-key banks. All captures use deviceScaleFactor 1; there is no density normalization. No page/console errors were captured.

Typography and section hierarchy now match by construction and by rendered measurement. Existing navy/icy-blue tokens, generated diagram assets, internal dividers and major-section whitespace remain intact. Caption wrapping is natural on narrow screens. No actionable P0/P1/P2 finding remains. The missing-selector error in the first geometry probe was confined to the capture script; a corrected probe confirmed the measurements above. The rendered app had no error.

Formatting, lint, TypeScript, all 65 unit tests and all 44 Chromium/WebKit browser cases pass on the combined changes, including icon-only accessible naming, touch controls, Tab order, modal focus, axe scans, doubled text and responsive layouts. The initial browser assertion now checks the two named controls rather than requiring visible text. Static production-artifact verification and preview restoration are completed before commit. Manual VoiceOver testing is not claimed.

final result: passed

## Review update: centered category title and quiet eyebrow

The owner requested centering the hero and proposed the shorter category title. The hero now reads “Tiling Window Manager for macOS”, centered under the eyebrow “Keyboard-first · Vim-inspired”. The eyebrow keeps two concrete descriptors rather than repeating “tiling” from the title; “Vim-inspired” describes the directional shortcuts without implying a Vim dependency. The existing type scale and generous hero margins remain. The shorter heading fits on one line at 1047/1488 pixels and wraps naturally on mobile.

Updated the document/Open Graph title and descriptions, prerender acceptance assertion, browser heading/title expectations and 1200 × 630 social screenshot to match. No new interactive behavior or diagram assets.

Evidence in the existing below-fold-build directory: centered-title-1047.png, centered-title-1488.png, centered-title-390.png and centered-title-320.png, all deviceScaleFactor 1. Opened and inspected the owner-width and smallest mobile captures plus the refreshed social card. The title/eyebrow are centered, readable and unclipped; controls remain beside the right monitor foot. Geometry probes confirm text-align center, correct document/visible titles and no horizontal overflow at all four sizes. No page errors were captured. Existing Geist, navy/white/muted palette, image quality and below-fold layout are preserved. The copy and heading placement are an explicit owner-requested change to the prior target. No actionable P0/P1/P2 findings remain.

Terminology was checked against the primary AeroSpace guide (https://nikitabobko.github.io/AeroSpace/guide.html), which describes the same macOS software category as a “tiling window manager”. This is evidence for the category wording, not a claim that Frame is built on AeroSpace or Vim.

Formatting, lint, TypeScript, all 65 unit tests and all 44 Chromium/WebKit browser cases pass, including heading/title/static HTML assertions, enlarged text and axe scans. Production-artifact checks and preview restoration are completed before commit. The site remains local-only.

final result: passed

## Review update: remove the structure caption

Removed “One workspace. Two columns. Three windows.” and its unused desktop/mobile styles at the owner's request. The annotated diagram, section lead and descriptive image alt remain. No empty caption wrapper or replacement spacer remains. The established major-section gap now runs directly from the figure to the movements heading: 200 px on desktop/tablet and 120 px on mobile.

Final evidence: structure-no-caption-1047.png and structure-no-caption-390.png in the existing below-fold-build directory, captured at the matching 1047 × 1308 and 390 × 844 CSS viewports with deviceScaleFactor 1. Opened and inspected both: the diagram transitions into a clear, uninterrupted section gap, with no stranded caption space or crowding. DOM probes confirmed zero structure captions, the intended 200/120-pixel gaps and no horizontal overflow. Typography, colors and diagram assets are unchanged.

Formatting, lint, TypeScript, all 65 unit tests and all 44 Chromium/WebKit browser checks pass. Content/no-JavaScript checks now use the retained structural explanation rather than the removed caption. Production-artifact verification and preview restoration are completed before commit. No actionable P0/P1/P2 visual issue remains.

final result: passed

## Review update: fourth install section and complete user guide

final result: passed

### Scope and delivery

The owner replaced both popup destinations with a fourth Install Frame section and a dedicated guide. Homepage Install is now a native #install link, with a focusable target. Guide links use /guide.html, including a first-launch deep link from installation. There is no dialog, focus trap or custom routing interception. Native fragment navigation respects reduced motion; moving off the demo pauses playback. The four major homepage sections retain whitespace boundaries without new dividers.

Shared header/footer, installation commands and workspace diagram now have real reuse across the two pages. Vite builds both HTML entries and the existing finalizer prerenders both React trees, so the entire guide and installation instructions work without JavaScript. The old popup components and styles are removed. Both pages retain canonical/indexing/security behavior and the 65-KiB HTML limit; total JavaScript remains below 150 KiB gzip.

### Guide coverage and factual checks

The guide covers installation/permission, tiling structure, keyboard defaults, workspace/display behavior, every configuration field, Accessibility classification, all 18 CLI commands and scripting. The command reference includes arguments, flags, constraints, output fields and examples rather than deferring to help. It explains why a CLI is useful and includes a workspace hook plus a SketchyBar display/workspace indicator. Classification documentation explains app-exposed signals, exact/regex matchers, AND semantics, first-match order, tiling/excluded results and their limits. Config documentation covers file resolution, defaults/replacement, startup, persistent workspaces, mappings, bindings/sequences, gaps/per-display fallbacks, display assignment, hooks and validation.

Native source revision, inspected files and external primary references are recorded in docs/user-guide.md. A source comparison checked all 18 commands and every declared flag. All eight rendered TOML examples parse; shell examples pass syntax checks; an isolated stubbed indicator script gives the expected two-display label. No native app, Accessibility permission, personal config or live status-bar item was changed.

### Visual evidence and corrections

Evidence remains in the existing below-fold-build directory. Source visual truth is the retained approved site composition plus the owner’s explicit new install/guide instructions; there is no separate image mock for this ordinary feature extension. Browser-rendered captures use deviceScaleFactor 1.

- install-section-final.png and homepage-four-sections-final.png: final 1047 × 1308 homepage/section captures.
- install-final-mobile.png: install section at 390 × 844.
- complete-guide-top-1047.png and complete-guide-top-320.png: final guide entry layouts.
- complete-guide-configuration-1047.png, complete-guide-window-rules-1047.png, complete-guide-cli-1047.png and complete-guide-scripting-1047.png: final chapter/reference views.
- Matching complete-guide-*-320.png captures check the narrow layout.
- opening-cues-final.png: third opening cue in the revised demo, 1047 × 1308.

Opened and inspected the install desktop/mobile views, guide entry, CLI, window-rules and mobile scripting/shortcut views. Initial P2 findings were a cramped three-column shortcut table on mobile, missing ordered-list markers under the reset stylesheet, and long-word overflow when text was doubled at 320 pixels. Fixed these with an accessible mobile definition list from the same shortcut data, explicit decimal list markers, bounded text width, wrapping navigation and emergency text wrapping. Later expanded introductory wording exposed another long word outside the article; the guide heading container now also permits emergency wrapping. Post-fix probes confirm no document overflow, including true doubled text at 320 pixels. The final mobile axe scan has no violations.

The new link buttons exposed a hover contrast risk from the global anchor color. The primary variant now preserves its foreground on hover; the existing axe flow explicitly hovers the release link before scanning. No lint rules or accessibility nodes are excluded.

### Fidelity surfaces

| Surface              | Final result                                                                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fonts and typography | Existing Geist and heading scale; readable 17-pixel guide prose with bounded line length. Monospace command/config blocks wrap without overflowing. Numbered setup steps remain visible.                                                         |
| Spacing and layout   | Fourth section uses the established 200-pixel desktop / 120-pixel mobile major-section gap. Desktop guide uses contents navigation beside the text; mobile returns it to normal flow. Internal table/reference separators group related content. |
| Colors and tokens    | Existing navy, white/muted copy, icy-blue links and primary/ghost variants. Release-link hover retains contrast.                                                                                                                                 |
| Image quality        | Existing structure diagram is reused, with its mobile source and full description. No placeholder assets, new illustrations or code-drawn substitutes.                                                                                           |
| Copy and content     | Practical setup and full reference, grounded in native source. No task-organization prescriptions. Native behavior is distinguished from demo policies.                                                                                          |

### Remaining demo refinements

Removed cursor:pointer from the old window body and made the decorative monitor group use a default cursor without text selection. Only actual playback controls and navigation retain interactive affordances. The final browser probe reports cursor default on window bodies. Opening cues now read “First window, full workspace”, “Second window, new column”, and “Then, new rows in focused column”. Full workspace avoids implying that setup enters the separate Frame fullscreen overlay. Playback timing, model transitions and native fixtures are unchanged.

### Verification

Formatting, lint, TypeScript, 65 unit tests and all 44 Chromium/WebKit cases pass on the final changes. Updated interaction contracts cover install scrolling/focus/pause, real page navigation, reference anchors, deep-link reloads, no-JavaScript guide/CLI reading, mobile reflow and enlarged text, plus unfiltered axe scans. Local preview captures reported no page/console errors. Static production builds and the four production-artifact checks are completed before commit, followed by preview restoration. Manual VoiceOver and live native/SketchyBar integration testing are not claimed. No actionable P0/P1/P2 finding remains.

## Review update: installation column layout

Removed the install subtitle and setup-guide link at the owner's request. Download release and Homebrew installation now share the left column; the right column contains only Accessibility setup. Mobile stacks installation before permission setup. Removed the obsolete subtitle/link styles and retained the existing section gap, typography, command block and native Install anchor.

The flow under test is homepage → header Install → fourth section with installation left and Accessibility right, without changing page or opening a dialog. Browser plugin not available; used the existing pinned Playwright workflow. Desktop 1484 × 1308 and mobile 390 × 844 captures are install-columns-1484.png and install-columns-390.png in the existing below-fold-build evidence directory. Both were opened and inspected: no clipping, horizontal overflow, missing content or framework overlay. Page identity and visible content match Frame, console/page errors are empty, and keyboard Install navigation still pauses the offscreen demo. The existing guide/deep-link test now reaches First launch through Guide and its contents navigation.

Formatting, lint, TypeScript, 65 unit tests, the preview build and all 44 Chromium/WebKit browser cases pass, including responsive/enlarged-text, no-JavaScript and unfiltered accessibility checks. Production artifact verification and preview restoration are completed before commit. No dependencies, guide content, native application behavior or hosting settings changed. Manual VoiceOver remains untested.

final result: passed

## Review update: balance installation below the title

Moved Install Frame above both columns and removed the macOS requirement line at the owner’s request. Both equal-width columns now begin beneath it on the same baseline, separated from the header by 48 px on desktop / 32 px on mobile. Installation contains Homebrew plus the release download; Accessibility contains the same setup instructions as three short ordered steps. Mobile retains installation followed by permission setup with a 40-pixel gap. No new content, cards or section dividers were introduced.

Browser plugin not available; verified the homepage → Install anchor → aligned installation/permission flow with the existing Playwright setup. Captures install-balanced-1484.png and install-balanced-390.png in the existing below-fold-build directory were opened and inspected. The section has clear heading hierarchy, aligned desktop column headings, visible ordered markers and no clipping or horizontal overflow. Frame page identity is correct, console/page errors are empty, and the anchor lands in the intended section without an overlay.

Formatting, lint, TypeScript, 65 unit tests, the static build and all 44 Chromium/WebKit browser checks pass, including accessibility, doubled text and native navigation. Production artifact checks and preview restoration are completed before commit. Manual VoiceOver remains untested.

final result: passed

## Review update: consolidate style ownership

Consolidated duplicate window, skeleton, skip-link and guide-back rules; grouped responsive overrides with their owning surface. The stylesheet entry now imports base tokens, shared site UI, demo, homepage and guide styles. Removed unused single-display/focused-label rules, obsolete syntax tokens and unused button variants. Decorative keys now use workspace-key/direction-key classes, and the shared command/config block uses code-block rather than an install-specific class.

Captured before/after demo, install, guide entry and CLI views at 320, 390, 1047 and 1484 CSS pixels using the existing Playwright workflow (Browser plugin not available). All 16 comparisons have identical computed styles on every rendered descendant. Screenshot comparisons allow only the observed maximum 1/255 channel rounding in composited image edges; no geometric, type, color-token or content changes remain. The matching mobile before/after images were opened and inspected. Evidence is in the sibling cleanup visualization directory.

Formatting, lint, TypeScript, 65 unit tests, the static build and all 46 Chromium/WebKit cases pass. Manual VoiceOver remains untested.

final result: passed

## Review update: complete architecture cleanup

The incremental cleanup fixes Replay during the empty opening, retires the old hands-on command paths and unread messages, retains executable guide conformance/example checks, and co-locates guide source in src/guide. The guide now uses a CSS-only HTML entry and build-time static markup, so no guide client bundle is emitted or requested. Its existing URL, fragment anchors, contents navigation, shared components, canonical and indexing policy remain intact. Vite renders the guide on request in development and reloads it after TSX edits.

The reference checks cover the versioned inventory of 18 commands/all parser flags and eight configuration roots. Actual rendered shell/TOML blocks and the hook payload are syntax checked; malformed examples fail. The integration helper runs only against isolated query/status-bar functions, covering both two-display output and unavailable-app fallback. The native checkout remains read-only; CI uses the committed inventory without requiring it. Native trace/geometry invariants remain unchanged. Retired display-count tests were removed with their unsupported feature; the final unit count is 70.

Captured a fresh before/after static-delivery baseline for demo, install, guide entry and CLI at 320, 390, 1047 and 1484 CSS pixels. All 16 computed-style comparisons match exactly; screenshot channel differences remain at most 1/255 from raster rounding. static-after-guide-390.png and static-after-demo-1484.png in the cleanup evidence directory were opened and inspected. No visual redesign or new navigation flow was introduced.

Formatting, lint, TypeScript, 70 unit tests and all 48 Chromium/WebKit checks pass. Artifact tests verify that the guide issues no JavaScript requests and still follows native chapter/command anchors. Total delivered JavaScript across the site is about 85.5 KiB gzip; the guide itself requests none. Production indexing/security checks and preview restoration are completed before commit. Development guide rendering, reload behavior and reading without JavaScript are checked separately against port 4177. Manual VoiceOver, hosted CI/hosting and live native/SketchyBar integration remain outside the claimed verification.

final result: passed

## Review update: CSS checks and shadcn component fit

Added pinned Stylelint 18.0.0 alongside Oxlint/shadcn. Source CSS now checks duplicate selectors/declarations, invalid properties/units/hex values, unknown at-rules and accidental shorthand overrides. Tailwind’s theme directive is explicitly allowed. Site/homepage/guide colors use named tokens, with unchanged values moved into the root palette. The demo’s illustrative colors and upstream Typeset defaults retain their own scope. Three policy tests prove invalid CSS fails and valid responsive/theme/palette cases pass. No lint rules or accessibility nodes were suppressed.

Reviewed Button, Skeleton, Kbd, Table, Separator, Code Block and Typeset against the pinned CLI and official docs. Header/icon sizes now belong to Button variants; the release icon uses data-icon. Existing native anchors preserve navigation semantics. Static keyboard/window artwork, responsive table/dl markup, row borders and pre/code examples retain their established responsibilities rather than adding interactive wrappers. Decisions and primary sources are in docs/design-system.md.

Guide prose now uses the official owned Typeset CSS, pinned to shadcn-ui/ui 4233ed1caded8c38f4bc14b14afe1f93ebcaf966, with its MIT notice included in the public artifact. A Frame preset supplies the existing fonts, 17-pixel desktop / 18-pixel narrow-screen text, 1.75 leading and consistent flow. Custom tables, reference definitions, command navigation and the workspace figure opt out. Prose links, lists and inline code inherit Typeset semantics while guide heading scale, chapter gaps and wrapped examples retain product styles. The guide continues to deliver no JavaScript.

The CSS token and button-variant changes each passed 16 computed-style/pixel comparisons at 320, 390, 1047 and 1484 pixels: computed styles match exactly, with at most 1/255 raster channel rounding. Typeset intentionally updates only guide prose rhythm and inline-code presentation. Final guide captures cover first launch, shortcuts, configuration and CLI at 320/390/1047 pixels; additional geometry probes cover 761/768/1484 pixels and confirm the responsive font-size boundary and no horizontal overflow. Opened and inspected final first-launch desktop, configuration mobile and shortcut-list narrow screenshots. Evidence remains in the cleanup visualization directory.

Formatting, Oxlint/shadcn, Stylelint, TypeScript, 73 unit tests and all 48 Chromium/WebKit cases pass on the final source. Production artifact checks cover indexing/security, static reading, native navigation, no guide JavaScript requests and the shipped Typeset license; preview mode is restored before commit. Manual VoiceOver and hosted CI remain unclaimed.

final result: passed
