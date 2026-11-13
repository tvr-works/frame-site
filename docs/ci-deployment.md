# CI and Cloudflare Pages publication

The owner authorized GitHub/Cloudflare publication on 2026-11-12. The existing license-only tvanreenen/frame-site repository is transferred to tvr-works/frame-site, preserving repository ID 1194931754 and its initial commit. The existing Cloudflare Pages frame-site project and active frame.tvr.works custom domain are preserved. Hosted verification is recorded below when complete.

Publication identity is `tvr-works/frame-site`; canonical origin is `https://frame.tvr.works`.

## Checks

`ci.yml` follows the neighboring TVR Works sites: read-only permissions, no checkout credentials, immutable action SHAs, per-ref cancellation, a 12-minute timeout and the Blacksmith Ubuntu 24.04 runner. Microsoft's Playwright 1.64.1 Noble image is pinned by digest. `@playwright/test` and `playwright-core` are both pinned to 1.64.1; keep them and the browser image together. Node 26.13.0 and npm 11.20.0 are checked before installation. The container verifies Python 3.11+ and installs Ubuntu’s Python package if its standard-library TOML parser is absent. `npm ci` uses the committed lockfile.

Every push, pull request and manual dispatch runs the locked dependency audit, formatting, Oxlint plus shadcn lint, TypeScript, unit/parity/playback/publication-gate tests plus guide API inventory and rendered shell/TOML example checks (Python 3.11+ standard library), a preview static build with the full Chromium and WebKit suite, then a production build with static-artifact acceptance tests. Failure screenshots/traces and validated public artifacts are retained for seven days. No Cloudflare token or deploy hook is used.

The six current audit advisories are two low and four moderate transitive CLI-tool findings. There are no high/critical findings. No breaking downgrade is applied to silence them. Runtime components use the standard `clsx` + `tailwind-merge` utility; the generated CLI's direct `cn` dependency is intentionally removed. Shadcn lint retains its own compatible internal grammar dependency.

## Exact-SHA gate

Pages build command:

```sh
npm run ci:gate && npm run build
```

Output: `dist`. Production branch: `main`. Main production environment only: `SITE_DEPLOYMENT_MODE=production`; branch previews leave it unset. Both environments pin NODE_VERSION=26.13.0 and NPM_VERSION=11.20.0 on build image v3. Use the existing GitHub App pattern, automatic main production and all repository-branch previews. No separate deployment service is needed.

`scripts/wait-for-ci.ts` is adapted from key-site's established gate with its complete contract tests. It accepts only the latest successful **push** run of `ci.yml` for both the exact `CF_PAGES_COMMIT_SHA` and `CF_PAGES_BRANCH`. A stale success, different branch, pull-request check, dispatch result or older successful attempt cannot authorize publication. Malformed responses, denied/rate-limited API access, failures and timeouts fail closed. Each request is bounded to 15 seconds; polling backs off to 60 seconds and stops after 16 minutes. This uses the public GitHub API without credentials, so the future repository must be public for this gate.

The gate is an operational guard against publishing unvalidated commits. Collaborators can change build configuration; branch protection is a separate repository policy decision.

Before declaring hosting ready, verify a disposable failing preview is rejected before the build/deploy step, then verify successful preview and main deployments with their exact SHA. No hosted acceptance is claimed here. Migration commits can use `[CF-Pages-Skip]` while CI is being established.

## Static delivery

The homepage and guide.html are Vite HTML entries prerendered from their React components. The guide is served at /guide, matching Cloudflare Pages’ extensionless routing; /guide.html redirects to /guide. Development and artifact servers model the same route and preserve legacy query strings. Links, canonical/Open Graph URLs and sitemap entries use /guide. The homepage hydrates its demo; the guide has no script tags, client bundle or JavaScript requests. Artifact tests enforce this distinction. Both remain readable without JavaScript; install and guide links use native anchors. Unknown URLs return a real 404. The public artifact excludes source, the server render bundle, native test fixtures and source maps. `build-info.json` exposes only source SHA, branch, mode and dirty status and is served with `no-store`.

Production permits indexing; preview HTML and response headers independently exclude it. The 404 always excludes indexing. Sitemap/canonicals point to the production origin. The artifact server used by browser tests applies the generated Pages headers.

Both pages have unique titles and descriptions, matching canonical/Open Graph URLs, and explicit Open Graph and Twitter large-image metadata. The shared 1200 × 630 PNG includes a descriptive image alternative and declared MIME type/dimensions. Artifact checks read the HTML with JavaScript disabled, check unique/nonempty metadata, load the actual image and compare its decoded dimensions, parse the sitemap, and verify robots directives/response headers in both modes. Keep the origin consistent in both HTML entries and the finalizer when the production domain changes; update the artifact expectations in the same change. No social account handle is claimed.

Software rich-result markup is deferred: the site has no published review/rating data, which [Google’s software app feature requires](https://developers.google.com/search/docs/appearance/structured-data/software-app). The current work does not claim rich-result eligibility. At publication, verify the confirmed public canonicals, robots/sitemap, real crawler previews and Search Console ownership/submission. None of those hosted checks has been run locally.

Metadata follows the [Open Graph protocol](https://ogp.me/), including its image description and structured image properties.

CSP permits same-origin scripts, styles, fonts and images, blocks objects/frames/forms, and has no blanket inline-script/eval exception. `style-src-attr 'unsafe-inline'` allows measured numeric geometry custom properties on simulated windows. Referrer, permissions, framing and MIME-sniffing headers follow the other sites. The build currently bounds total JavaScript at 150 KiB gzip and each page’s HTML at 65 KiB; current total JavaScript across both pages is about 85.6 KiB gzip.

A failed gate leaves existing production unchanged. Retry a Pages build after a successful CI rerun; CI success does not itself retry Pages. Normal recovery is a source revert through the same gate. Hosting setup and real edge-header/SHA verification remain a later owner-authorized milestone.

References: [Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [headers](https://developers.cloudflare.com/pages/configuration/headers/), [skip markers](https://developers.cloudflare.com/pages/configuration/git-integration/#skip-builds), [Playwright Docker](https://playwright.dev/docs/docker).
