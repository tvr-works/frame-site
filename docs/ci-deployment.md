# CI and future Cloudflare Pages publication

This repository is local-only. The workflow and gate are prepared but have not run on GitHub. No repository has been created, and no Cloudflare settings, DNS or deployment have been changed.

The prepared publication identity is `tvr-works/frame-site`; confirm that identity when the owner commissions publication. Canonical domain is provisionally `https://frame.tvr.works`.

## Checks

`ci.yml` follows the neighboring TVR Works sites: read-only permissions, no checkout credentials, immutable action SHAs, per-ref cancellation, a 12-minute timeout and the Blacksmith Ubuntu 24.04 runner. Microsoft's Playwright 1.64.1 Noble image is pinned by digest. `@playwright/test` and `playwright-core` are both pinned to 1.64.1; keep them and the browser image together. Node 26.13.0 and npm 11.20.0 are checked before installation. The container verifies Python 3.11+ and installs Ubuntu’s Python package if its standard-library TOML parser is absent. `npm ci` uses the committed lockfile.

Every push, pull request and manual dispatch runs the locked dependency audit, formatting, Oxlint plus shadcn lint, TypeScript, unit/parity/playback/publication-gate tests plus guide API inventory and rendered shell/TOML example checks (Python 3.11+ standard library), a preview static build with the full Chromium and WebKit suite, then a production build with static-artifact acceptance tests. Failure screenshots/traces and validated public artifacts are retained for seven days. No Cloudflare token or deploy hook is used.

The six current audit advisories are two low and four moderate transitive CLI-tool findings. There are no high/critical findings. No breaking downgrade is applied to silence them. Runtime components use the standard `clsx` + `tailwind-merge` utility; the generated CLI's direct `cn` dependency is intentionally removed. Shadcn lint retains its own compatible internal grammar dependency.

## Exact-SHA gate

Future Pages build command:

```sh
npm run ci:gate && npm run build
```

Future output: `dist`. Production branch: `main`. Main production environment only: `SITE_DEPLOYMENT_MODE=production`; branch previews leave it unset. Use the existing GitHub App pattern, automatic main production and all repository-branch previews. No separate deployment service is needed.

`scripts/wait-for-ci.ts` is adapted from key-site's established gate with its complete contract tests. It accepts only the latest successful **push** run of `ci.yml` for both the exact `CF_PAGES_COMMIT_SHA` and `CF_PAGES_BRANCH`. A stale success, different branch, pull-request check, dispatch result or older successful attempt cannot authorize publication. Malformed responses, denied/rate-limited API access, failures and timeouts fail closed. Each request is bounded to 15 seconds; polling backs off to 60 seconds and stops after 16 minutes. This uses the public GitHub API without credentials, so the future repository must be public for this gate.

The gate is an operational guard against publishing unvalidated commits. Collaborators can change build configuration; branch protection is a separate repository policy decision.

Before declaring hosting ready, verify a disposable failing preview is rejected before the build/deploy step, then verify successful preview and main deployments with their exact SHA. No hosted acceptance is claimed here. Migration commits can use `[CF-Pages-Skip]` while CI is being established.

## Static delivery

Both the homepage and /guide.html are Vite HTML entries, prerendered from their React components and hydrated. Both remain readable without JavaScript; install and guide links use native anchors. Unknown URLs return a real 404. The public artifact excludes source, the server render bundle, native test fixtures and source maps. `build-info.json` exposes only source SHA, branch, mode and dirty status and is served with `no-store`.

Production permits indexing; preview HTML and response headers independently exclude it. The 404 always excludes indexing. Sitemap/canonicals point to the provisional production origin. The artifact server used by browser tests applies the generated Pages headers.

CSP permits same-origin scripts, styles, fonts and images, blocks objects/frames/forms, and has no blanket inline-script/eval exception. `style-src-attr 'unsafe-inline'` allows measured numeric geometry custom properties on simulated windows. Referrer, permissions, framing and MIME-sniffing headers follow the other sites. The build currently bounds total JavaScript at 150 KiB gzip and each page’s HTML at 65 KiB; current total JavaScript across both pages is about 98.5 KiB gzip.

A failed gate leaves existing production unchanged. Retry a Pages build after a successful CI rerun; CI success does not itself retry Pages. Normal recovery is a source revert through the same gate. Hosting setup and real edge-header/SHA verification remain a later owner-authorized milestone.

References: [Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [headers](https://developers.cloudflare.com/pages/configuration/headers/), [skip markers](https://developers.cloudflare.com/pages/configuration/git-integration/#skip-builds), [Playwright Docker](https://playwright.dev/docs/docker).
