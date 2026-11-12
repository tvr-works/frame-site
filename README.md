# Frame site

A standalone local marketing site and interactive Frame demo. The native app stays in its own repository. No hosted repository or deployment has been created for this site.

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
- `src/demo/playback.ts`: the one-shot story and explicit playback/takeover ownership.
- `src/demo/use-demo.ts`: timers, reduced motion, visibility and background suspension.
- `src/components/monitor.tsx`: geometry and presentation; it never owns layout state.

The current design uses one headline, matte monitor hardware with a blue stage glow, quiet translucent windows, workspace number keys locked 1–5 to the left display and 6–0 to the right and a modifier ladder feeding one shared H/J/K/L row. Open/playback/Reset sit above the displays.

In Focus mode, selecting a workspace shows and focuses it on its assigned display, restoring its most recently focused window. Single-display mode supports all ten workspaces; returning to dual displays restores the fixed banks.

The demo begins with empty displays. Manual interaction takes over without a reset. Pause preserves the current step; replay explicitly restarts; reset clears to an empty manual desktop. Offscreen/background suspension never automatically resumes. Reduced motion starts stable with autoplay off. Click or tab into the demo to capture its keyboard controls. Displayed Option shortcuts are supported when the browser receives them; plain H/J/K/L and numbers use the selected mode, F/M/R selects Focus/Move/Resize, and N/X opens/closes windows. Escape releases focus and Tab moves normally. Editable fields, composition and Command shortcuts are ignored. Native global shortcuts can run before the browser receives an event. The simulated menu bars group Display and Workspace labels on the left; Learn has been removed.

[Simulator evidence and limits](docs/simulator.md) · [CI and future publication](docs/ci-deployment.md) · [Design verification](design-qa.md)
