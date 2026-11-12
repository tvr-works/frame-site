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

The current design uses one headline, matte monitor hardware with a blue stage glow, quiet translucent windows, workspace number keys locked 1–5 to the left display and 6–0 to the right and a modifier ladder feeding one shared H/J/K/L row. The keys are a read-only visualization. Play/Pause and Replay are the only demo controls, above the displays. No visible caption sits between the monitors and keys.

The script holds empty monitors for 600 ms, opens three windows 600 ms apart, then settles for 1.2 seconds. Option K/J/H/L demonstrate focus; Option Shift L/H/K/L moves the same focused window through columns and a stack; Option Shift Control L/L/L/H resizes it in several steps; Option Shift 7 transfers it to the right display, then Option Shift 1 brings it back to the left, with focus following both ways. Each shortcut cues its matching modifier row 650 ms before its direction/number and action. After the transfer returns, windows close one at a time, 600 ms apart, with shortcut lights off. Empty monitors hold for 1.8 seconds before the next window opens. The full sequence repeats about every 31 seconds. Replay restarts immediately from the empty opening. Pause preserves the current scene and cue, including during closing and the empty hold; Play resumes.

Background/offscreen suspension and opening Guide/Install pause playback and require explicit Play to continue. Reduced motion starts empty with autoplay off and visual transitions disabled; visitors can explicitly play. The stage and keys are decorative, with a screen-reader summary and polite pause/completion status. There is no keyboard capture or hands-on window/workspace/display control. Existing model transitions and native parity fixtures remain the source of layout behavior. The follow-focus transfer and fixed workspace banks are deliberate demo policies documented below.

[Simulator evidence and limits](docs/simulator.md) · [CI and future publication](docs/ci-deployment.md) · [Design verification](design-qa.md)
