# Frame site

This is a separate repository from the native app at ../frame. Keep native source, releases, installed apps and shared taps read-only unless a later user instruction explicitly commissions that work. This initial milestone is local-only: do not create a hosted repository, push, deploy or modify hosting/DNS.

Read README.md, docs/simulator.md and docs/ci-deployment.md before changing behavior. The approved composition is recorded in design-qa.md; the owner additionally requested quiet, translucent skeleton window interiors. Keep help progressively disclosed and the demo dominant.

Use src/demo/model.ts for all commands. Autoplay, lessons and manual controls share those transitions. Preserve native fixture/trace parity, hierarchical column/window MRU, workspace affinity and the distinction between focus and movement. Do not invent native commands or map the real Option hotkeys onto browser keyboard input. Browser practice is opt-in, plain-key, scoped and escapable.

Run npm run check, npm run build and npm run test:browser. For delivery changes, also run SITE_DEPLOYMENT_MODE=production npm run build and npm run test:artifact, then restore a preview build. Keep dependencies pinned and update the Playwright package/image/peer together. Do not suppress lint to get a pass. The narrow upstream-documented axe focus-guard exception is recorded in docs/simulator.md and covered by separate focus-containment tests.
