# Frame site

A standalone local marketing site and scripted Frame demonstration. The native app stays in its own repository. No hosted repository or deployment has been created for this site.

## Run

Use Node 26.13.0 and npm 11.20.0 (`.node-version` and `packageManager`).

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 4177 --strictPort
```

Open http://127.0.0.1:4177. The development preview is kept running for the initial review.

```sh
npm run check
npm run build
npm run test:browser
```

`build` prerenders public HTML into `dist/`. `npm run preview -- --port 4178` serves that artifact, including its real headers and 404 behavior. Browser tests start and stop their own artifact server on 4178. Chromium and WebKit binaries must be available locally (`npx playwright install chromium webkit` when needed); CI uses the matching pinned browser image.

Default builds are excluded from indexing. To check production delivery locally:

```sh
SITE_DEPLOYMENT_MODE=production npm run build
npm run test:artifact
```

Return to `npm run build` afterward for preview indexing. Builds include an exact source identity in `build-info.json`; local dirty builds are labeled. Public canonicals use the provisional https://frame.tvr.works domain.

## Behavior and ownership

- `src/demo/model.ts`: immutable columns, focus/MRU, weights, workspace affinity and command transitions.
- `src/demo/playback.ts`: the repeating story, shortcut cues and playback state.
- `src/demo/use-demo.ts`: timers, reduced motion, visibility and background suspension.
- `src/components/monitor.tsx`: geometry and presentation; it never owns layout state.
- `src/components/below-fold.tsx`: static workspace structure and composable movement explanations.
- `src/components/install.tsx`: fourth homepage section and shared installation commands.
- `src/guide-page.tsx`: standalone guide at `/guide.html`; shared header/footer and diagram keep it aligned with the homepage.
- `src/components/guide-reference.tsx`: configuration, window rules, CLI and scripting chapters.
- `src/guide-cli-data.ts`: all 18 native commands, flags, constraints and examples, checked against the native parser definitions.
- `src/guide-scripting-examples.ts`: the documented workspace hook and SketchyBar example.

The current design uses the centered headline “Tiling Window Manager for macOS” with a quiet “Keyboard-first · Vim-inspired” eyebrow, matte monitor hardware with a blue stage glow, quiet translucent windows, workspace number keys locked 1–5 to the left display and 6–0 to the right and a modifier ladder feeding one shared H/J/K/L row. The keys are a read-only visualization. Play/Pause and Replay are the only demo controls: icon-only buttons beside the right monitor foot, aligned with the action label between the feet. They retain accessible names, hover descriptions, focus indicators and 44-pixel targets. The headline uses the same responsive type scale as the section titles, with more space above and below.

The script holds empty monitors for 1.2 seconds, opens three windows 1.2 seconds apart, then settles for 2.25 seconds. Option K/J/H/L demonstrate focus; Option Shift L/H/K/J moves the same focused window across columns and within a stack; Option Shift Control H/H/H/L changes column width, then K/K/J changes the lower row’s height; Option Shift 7 transfers it to the right display, then Option Shift 1 brings it back to the left, with focus following both ways. The label, full shortcut chord and layout change update together in one beat, then hold until the next action. After the transfer returns, windows close one at a time, 1.6 seconds apart, with each window’s red close dot highlighted for 650 ms beforehand and shortcut lights off. Empty monitors hold for 3 seconds before the next window opens. The full sequence repeats about every 43 seconds. Replay restarts immediately from the empty opening. Pause preserves the current scene and cue, including during closing and the empty hold; Play resumes.

Background/offscreen suspension pauses playback and requires explicit Play to continue. Install is a native link to `/#install`; scrolling away pauses the demo without clearing its scene. Guide uses normal document navigation to `/guide.html`. There are no popups. Reduced motion starts empty with autoplay off and visual transitions disabled; visitors can explicitly play. The stage and keys are decorative, with a screen-reader summary and polite pause status. There is no keyboard capture or hands-on window/workspace/display control. Existing model transitions and native parity fixtures remain the source of layout behavior. The follow-focus transfer and fixed workspace banks are deliberate demo policies documented below.

[Action wording and pacing](docs/demo-script.md) · [Simulator evidence and limits](docs/simulator.md) · [CI and future publication](docs/ci-deployment.md) · [Design verification](design-qa.md)

## Below the fold

The page continues from the scripted demonstration into three static sections: “Simple structure” explains the layout hierarchy, then “Simple composable movements” shows Focus, Move and Resize with consistently highlighted modifiers and the same H/J/K/L directions. Focus and Move also show workspace number keys (1–0) as an alternative target; Resize remains directional. The resize illustration includes both column width and row height. Whitespace separates the major sections; thin dividers separate only the three movement rows. The fourth section, “Install Frame”, includes the Homebrew commands, release link and first-launch permission instructions. Install links scroll there, while Guide links open a dedicated document page. The footer retains Guide and source links.

Five generated WebP illustrations live in `public/illustrations/`: desktop/mobile workspace diagrams and the three movement diagrams. Text outside those illustrations and keycaps remain semantic HTML. Mobile uses a separate, larger-label structure image; all illustrations load lazily, with explicit intrinsic dimensions. The page content is prerendered and remains readable without JavaScript. The approved target and browser comparisons are recorded in [design-qa.md](design-qa.md).

## Guide and delivery

Vite builds two HTML entries, each prerendered from its React component by `scripts/finalize-static.mjs`. Plain links and fragment anchors work in development, production and with JavaScript disabled. No client router or new dependency is needed. The guide covers installation, layout, default keys, workspace/display behavior, all configuration fields, Accessibility classification rules, all CLI commands and scripting. A SketchyBar example shows visible workspaces per display. Desktop uses a shortcut table and sticky contents navigation; mobile uses a shortcut list and normal document flow.

[Guide source evidence and maintenance](docs/user-guide.md).
