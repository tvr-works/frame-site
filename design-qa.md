# Frame site design and behavior verification

final result: passed

## Visual truth and evidence

Approved concept: `/Users/tim.vanreenen/.codex/visualizations/2026/11/07/01a1b75f-9828-7a61-ba00-32177a851259/frame-site-design/approved-landing-concept.png`.

The owner subsequently requested quiet skeleton interiors with restrained transparency. That revision is incorporated into the accepted implementation direction; the original concept remains authoritative for the composition, colors and hierarchy.

Evidence directory: `/Users/tim.vanreenen/.codex/visualizations/2026/11/12/01a1ce07-209a-7793-9b40-7d0f587d4fd7/frame-site-final/`.

- Full comparison: `comparison.png`, source on the left and implementation on the right in a single 2974 × 1058 image.
- Focused comparison: `comparison-heading.png` and `comparison-demo.png`.
- Implementation: `desktop.png`, `desktop-full.png`, `empty-desktop.png`, `mobile.png`, `tablet.png`, `single.png`, `install.png`.

The source and comparison implementation are both 1487 × 1058 pixels. Chromium CSS viewport is exactly 1487 × 1058 at deviceScaleFactor 1; no density resampling was used before compositing. Inspection through view_image can downscale the combined 2974-pixel-wide board for display; the files retain native resolution. The focused heading comparison was separately opened. Full implementation/mobile and installation views were opened and visually inspected.

Comparison state: four windows, two on each display, editor focused on the right. Source workspace labels and padding were generated details; implementation follows verified native affinity and tiling gaps. Initial actual visit is deliberately blank, as requested, with one short autoplay rather than a seeded screenshot scene. Mobile and tablet retain the same four-window state at 390 × 844 and 768 × 1024.

## Fidelity surfaces and findings

No actionable P0/P1/P2 visual findings remain.

| Surface                 | Assessment                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fonts and typography    | Self-hosted Geist variable; strong white single-line desktop heading, close weight/width/baseline match to source. Increased the original implementation heading from 3.86vw to 4.2vw and aligned the intro divider/padding at large widths. Mobile heading wraps intentionally into two lines with readable supporting text.                                                                                |
| Spacing and layout      | Preserves compact icon/wordmark header, one horizontal intro row above centered display toggle, almost full-width dual displays, compact controls underneath. At 1487 × 1058 all primary demo controls remain in the first viewport. Content is allowed to grow at smaller heights and enlarged text.                                                                                                        |
| Colors and tokens       | Near-black/navy surface, white type, icy blue focus/selected state, restrained glow. The owner’s quieter direction is reflected in low-contrast static skeletons and modest wallpaper transmission through dark panes.                                                                                                                                                                                       |
| Images and identity     | Actual supplied Frame app icon; self-hosted generated dune wallpaper inspected before use. No screenshot-as-functional-demo or real-code/CLI prose inside windows. Window bodies are interactive DOM with decorative skeletons explicitly requested by the owner. Display bezel/stand treatment is flatter than the original raster's hardware rendering; that is an intentional lightweight demo treatment. |
| Copy and content        | Above-fold heading and supporting intro match the approved text exactly (only responsive line breaks differ). Native shortcut labels, eight-point gaps, workspace affinity and guide/install commands are source-grounded. Fake generated CLI commands are removed.                                                                                                                                          |
| Controls and disclosure | One monitor toggle and small Shortcuts/Learn/Reset controls retain the source hierarchy. Open, action/keycaps, workspace/send and explicit playback controls are added to satisfy the functional requirements. No permanent shortcut grid, lesson dashboard, feature cards or repeated install CTA.                                                                                                          |

The original image uses a larger display-toggle label and stronger hardware glow. The implementation deliberately keeps those quieter and uses thinner native-scale gaps. These are accepted style/function adaptations, not unresolved defects.

## Comparison history

1. First rendered pass used realistic reading/notes/code/terminal content. It preserved composition but the owner found the content too noisy. Replaced all app prose/code with static, faint skeletons and lightly translucent panes; kept title-bar labels to preserve identity. Evidence: `/private/tmp/frame-site-chromium-desktop-initial.png` → `/private/tmp/frame-site-skeleton-desktop.png` → final `desktop.png`.
2. Full comparison showed the initial heading was narrower than the selected reference. Increased heading scale and aligned the large-screen intro divider. Re-captured at the exact reference size, then inspected the combined full comparison and heading crop. Post-fix evidence: `comparison.png`, `comparison-heading.png`.
3. Mobile first capture exposed a full-page-screenshot artifact from the offscreen skip link. Added explicit hidden opacity until focus. Current `mobile.png` has no stray skip-link block or horizontal overflow; keyboard access still exposes it on focus.
4. Accessibility scans found real app label/heading mismatches. Made preview interiors decorative, included visible keycap letters in accessible names without parenthetical-only labels, and removed redundant tiny Focused text. Current scans check the app with only Base UI's documented Safari focus-guard exception; see simulator.md. No lint rules are disabled.

## Behavior and browser evidence

The flow under test is: blank desktops → open windows → focus without rearrangement → move/resize with native transitions → send/switch workspace → visitor takeover at exact current state → pause/replay/reset.

Chromium and WebKit browser tests cover single/dual displays, pointer/touch actions, keyboard opt-in/scope/Escape/Tab, modal focus containment/restoration, lessons, shortcuts, reduced motion, one-shot autoplay, exact-state takeover, pause/resume, offscreen/background suspension, 320/390/768/1488-pixel layouts, 200% zoom-equivalent reflow and doubled text with extra spacing. No page/runtime console errors were observed in final capture or interaction checks. Actual static artifacts are tested under their generated CSP/security/indexing headers with a real 404, exact source identity and no-JavaScript guide path.

The in-app browser initially was unavailable, so the explicitly requested cross-engine verification used regular Playwright. Once the review tabs became available, the existing in-app tab was inspected, its focus-right action was exercised successfully, its empty error/warning log was checked, and the preview was marked to remain open. No browser profile or installed app was modified.

Native evidence: 44 original fixture tests passed in a temporary copy, plus one native command-trace probe. The simulator matches all ten exported layout/focus/workspace snapshots. Unit and trace tests are in the standalone site repository; the native app repository remains unchanged.

## Limits and follow-up

- No full VoiceOver user study, native Intel browser run or real minimum-macOS runtime test is claimed. Base UI's intentional Safari focus-guard scan exception is narrowly documented and separate keyboard containment tests remain enforced.
- Simulator scope is bounded: landscape virtual displays, six windows/workspace, four columns, demo minimum sizes and simplified monitor hotplug. No Accessibility or installed-Frame bridge is present. See `docs/simulator.md`.
- CI workflow and publication gate are prepared and locally checked. GitHub CI, Cloudflare edge behavior and deployment acceptance remain unverified because this milestone is explicitly local-only.

Implementation checklist: complete. Preview retained at http://127.0.0.1:4177; static artifact preview at http://127.0.0.1:4179.
