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

The demo begins with empty displays. Manual interaction takes over without a reset. Pause preserves the current step; replay explicitly restarts; reset clears to an empty manual desktop. Offscreen/background suspension never automatically resumes. Reduced motion starts stable with autoplay off. Keyboard practice is opt-in, scoped to a focusable practice field and remapped to plain keys. The visible Option shortcut labels are Frame's native defaults, not browser keyboard bindings.

[Simulator evidence and limits](docs/simulator.md) · [CI and future publication](docs/ci-deployment.md) · [Design verification](design-qa.md)
