# CI and Cloudflare Pages publication

The owner authorized GitHub/Cloudflare publication on 2026-11-12. The existing license-only tvanreenen/frame-site repository was transferred to tvr-works/frame-site, preserving repository ID 1194931754 and its initial commit. The existing Cloudflare Pages frame-site project and active frame.tvr.works custom domain are preserved. Hosted qualification is recorded below.

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

Before declaring hosting ready, verify a disposable failing preview is rejected before the build/deploy step, then verify successful preview and main deployments with their exact SHA. The initial hosted qualification is recorded below; repeat these checks after material publication changes. Migration commits can use `[CF-Pages-Skip]` while CI is being established.

## Static delivery

The homepage and guide.html are Vite HTML entries prerendered from their React components. The guide is served at /guide, matching Cloudflare Pages’ extensionless routing; /guide.html redirects to /guide. Development and artifact servers model the same route and preserve legacy query strings. Links, canonical/Open Graph URLs and sitemap entries use /guide. The homepage hydrates its demo; the guide has no script tags, client bundle or JavaScript requests. Artifact tests enforce this distinction. Both remain readable without JavaScript; install and guide links use native anchors. Unknown URLs return a real 404. The public artifact excludes source, the server render bundle, native test fixtures and source maps. `build-info.json` exposes only source SHA, branch, mode and dirty status and is served with `no-store`.

Production permits indexing; preview HTML and response headers independently exclude it. The 404 always excludes indexing. Sitemap/canonicals point to the production origin. The artifact server used by browser tests applies the generated Pages headers.

Both pages have unique titles and descriptions, matching canonical/Open Graph URLs, and explicit Open Graph and Twitter large-image metadata. The shared 1200 × 630 PNG includes a descriptive image alternative and declared MIME type/dimensions. Artifact checks read the HTML with JavaScript disabled, check unique/nonempty metadata, load the actual image and compare its decoded dimensions, parse the sitemap, and verify robots directives/response headers in both modes. Keep the origin consistent in both HTML entries and the finalizer when the production domain changes; update the artifact expectations in the same change. No social account handle is claimed.

Software rich-result markup is deferred: the site has no published review/rating data, which [Google’s software app feature requires](https://developers.google.com/search/docs/appearance/structured-data/software-app). The current work does not claim rich-result eligibility. At publication, verify the confirmed public canonicals, robots/sitemap, real crawler previews and Search Console ownership/submission. The initial Search Console submission is recorded below; indexing and third-party preview caches can change independently of a release.

Metadata follows the [Open Graph protocol](https://ogp.me/), including its image description and structured image properties.

CSP permits same-origin scripts, styles, fonts and images, blocks objects/frames/forms, and has no blanket inline-script/eval exception. `style-src-attr 'unsafe-inline'` allows measured numeric geometry custom properties on simulated windows. Referrer, permissions, framing and MIME-sniffing headers follow the other sites. The build currently bounds total JavaScript at 150 KiB gzip and each page’s HTML at 65 KiB; current total JavaScript across both pages is about 85.6 KiB gzip.

A failed gate leaves existing production unchanged. Retry a Pages build after a successful CI rerun; CI success does not itself retry Pages. Normal recovery is a source revert through the same gate. Initial hosting and real edge-header/SHA verification are recorded below.

References: [Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [headers](https://developers.cloudflare.com/pages/configuration/headers/), [skip markers](https://developers.cloudflare.com/pages/configuration/git-integration/#skip-builds), [Playwright Docker](https://playwright.dev/docs/docker).

## Hosted verification command

The existing artifact browser checks also run against an explicitly supplied HTTPS origin, without starting a local server:

```sh
DEPLOYMENT_URL=https://DEPLOYMENT_ID.frame-site.pages.dev \
DEPLOYMENT_MODE=production \
EXPECTED_COMMIT_SHA=FULL_COMMIT_SHA \
EXPECTED_BRANCH=main npm run verify:deployment
```

Repeat against https://frame.tvr.works with the same identity. Preview branches use DEPLOYMENT_MODE=preview and their exact branch/SHA. The remote mode requires all identity arguments and rejects stale/dirty output. Public HTML remains indexable for production builds, while immutable deployment and branch preview URLs require Cloudflare’s edge noindex. Preview builds additionally require HTML noindex/nofollow and blocked robots. Both pages’ canonicals, sitemap, image metadata/decoded PNG, security headers, true 404s, legacy guide redirect, native navigation and JavaScript-free guide reading remain checked in Chromium and WebKit.

## Initial publication — November 12, 2026

The existing repository was transferred from tvanreenen/frame-site to tvr-works/frame-site with repository ID 1194931754 preserved. Its original license-only commit 9d1331789da81e3d5ffbb0fcda72da87f686ec3f is retained as a parent through the launch-history merge, with both existing copyright notices preserved. Cloudflare Pages project 387dfcac-6b57-47b4-8e36-a81648b4e464 and the active frame.tvr.works domain/certificate were preserved. The Git source was explicitly approved for disconnect/reconnect after the provider refused an in-place ownership update. It now points to tvr-works/frame-site through the existing all-repository Cloudflare GitHub App installation. No app selection or credentials were expanded.

Readback confirmed native Git integration, main production, all repository-branch previews, the exact-SHA gate command, dist output, build image v3, pinned Node/npm in both environments, and production/preview indexing modes. GitHub Actions needs no Cloudflare token. The Blacksmith runner, immutable action/image pins, read-only permissions and per-ref cancellation follow key-site/company-site.

The first Linux run exposed paused-clock scheduling differences in WebKit. Playback checks now settle browser tasks before advancing virtual time; live media-preference changes are tested on real browser timers and must pause the scene beyond its next scheduled beat. No playback assertion was removed and no retry or platform exclusion was added. The resulting qualification includes 73 unit tests, 52 Chromium/WebKit cases and eight production artifact cases.

| Acceptance            | Recorded result                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Main push CI          | [43362766645](https://github.com/tvr-works/frame-site/actions/runs/43362766645) passed for d1232ced6debb9fd9344dac311427657bfb40f65.                                                                                                                                                                                                                                                                     |
| Gated production      | [e461629c](https://e461629c.frame-site.pages.dev) accepted that exact main push run before building and deploying. Eight hosted artifact cases passed separately on its immutable URL and https://frame.tvr.works.                                                                                                                                                                                       |
| Preview push CI       | [43362770061](https://github.com/tvr-works/frame-site/actions/runs/43362770061) passed for the same commit on qa/site-launch.                                                                                                                                                                                                                                                                            |
| Gated preview         | [24d0cadf](https://24d0cadf.frame-site.pages.dev) deployed with preview identity, blocked robots and HTML/edge noindex. Eight hosted artifact cases passed.                                                                                                                                                                                                                                              |
| Negative preview      | A deliberately failing test on qa/gate-negative at 71f81c8596165efb601cf346635600362512e1f8 failed [CI 43363098848](https://github.com/tvr-works/frame-site/actions/runs/43363098848). Deployment 383e3b03-c8ba-4dd6-a0ee-27caab33e775 logged “CI run 43363098848 concluded failure; refusing deployment.” Its application build never started and deploy stage stayed idle. The test was never on main. |
| Social asset          | Public social-card.png was fetched and its SHA-256 matched the committed PNG. Hosted checks decoded its dimensions and verified metadata, type and delivery on both pages.                                                                                                                                                                                                                               |
| Search Console        | Submitted https://frame.tvr.works/sitemap.xml in the existing verified sc-domain:tvr.works property using the owner’s personal Google account. The UI reported success and two discovered pages. This is not a claim that both pages are indexed.                                                                                                                                                        |
| Frame README          | [Frame PR 25](https://github.com/tvr-works/frame/pull/25) passed required native CI and merged as 0cfb9b1e335dbeb1347b343779589f041a34e696. Only the opener image/link changed.                                                                                                                                                                                                                          |
| Company software card | facd0a390657413592bf3bdf94e8bac5b0c65af3 changed the Frame card destination to https://frame.tvr.works. [Push CI 43362149188](https://github.com/tvr-works/company-site/actions/runs/43362149188) passed; immutable deployment 81f6c719-b198-4b12-b8c8-26b4911e0397 and https://tvr.works passed that repository’s exact-identity verifier.                                                              |

Temporary acceptance branches/worktrees are cleaned up after verification; the immutable deployment and CI records retain the evidence. Manual VoiceOver was deferred at the owner’s request because the Mac was locked. Keyboard navigation and automated accessibility checks passed; no installed app, native hotkeys, Accessibility permission, release or signing settings were changed by the website launch.
