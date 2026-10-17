# cState v7 ecosystem reliability runbook

Release track: `v7-r1` is the cState prerelease, with source/API version `7.0.0-r1`. Companion tools are committed on their v7 branches and pinned in the prerelease notes. The stable release stays at v6.0.2. This release track supersedes the dated local-only verification records below; remote CI and release proof are recorded with the prerelease.

The 2026-10-16 stabilization covers repeated outages, duplicate monitor names, busy webhook retries, failed state checkpoints, browser timestamp compatibility, Decap section defaults, CLI collision/argument paths, and hostile embed content. The active checklist in plans.md records the final verification evidence.

This runbook tracks the multi-repository v7 reliability work. It must describe current verified behavior, not planned behavior.

The v7 worktrees include #344 container artifacts and the #198 optional MonitorBot backend. The static theme remains independent of MonitorBot. v6.0.2 remains the latest published stable release; v7 is unpublished and no issue replies are part of this work.

## Repositories

- `cstate`: Hugo theme, Decap admin, canonical v7 fixture, example site, release documentation.
- `cstate-extra/cstate-cli`: command-line Markdown authoring.
- `cstate-extra/monitorbot`: monitoring, optional write/control API, webhooks, and local/Git/FTP/GitHub/GitLab publishing.
- `cstate-extra/html-embed`: downstream status and operational-record embed.

## Toolchain

- Hugo extended 0.158.0 or later.
- Node.js 20-compatible runtime.
- MonitorBot dependencies are installed from its lockfile. A renewable filesystem lease uses `proper-lockfile`; the static site needs no new runtime dependency.

## Local preview

From the cState repository:

```bash
hugo server --source exampleSite --themesDir ../.. --theme cstate --buildFuture
```

## Theme verification

```bash
hugo \
  --source exampleSite \
  --themesDir ../.. \
  --theme cstate \
  --destination /tmp/cstate-v7-build \
  --cleanDestinationDir \
  --printPathWarnings \
  --printI18nWarnings

CSTATE_BUILD_DIR=/tmp/cstate-v7-build node scripts/verify-record-sections.mjs
CSTATE_BUILD_DIR=/tmp/cstate-v7-build node scripts/verify-v7-contract.mjs
xmllint --noout \
  /tmp/cstate-v7-build/index.xml \
  /tmp/cstate-v7-build/index.atom \
  /tmp/cstate-v7-build/records/index.xml \
  /tmp/cstate-v7-build/records/index.atom

node scripts/verify-bugfixes.mjs
node scripts/verify-status-tool.mjs
node scripts/verify-v7-features.mjs
node scripts/verify-release-policy.mjs
```

Browser regression checks cover history filtering before the display limit, normalized active-record selectors, and configured versus translated labels:

```bash
browser_tools="$(mktemp -d)"
npm install --prefix "$browser_tools" --no-save --package-lock=false playwright@1.62.1
"$browser_tools/node_modules/.bin/playwright" install chromium webkit
CSTATE_PLAYWRIGHT_MODULE="$browser_tools/node_modules/playwright" node scripts/verify-v7-review.mjs
CSTATE_PLAYWRIGHT_MODULE="$browser_tools/node_modules/playwright" node scripts/verify-v7-timestamps.mjs
```

Decap's backend adapter supplies missing record types, states, and severity before its exact collection filter. It decorates the configured provider and local proxy, preserves cursor metadata and save behavior, and leaves explicit record index pages editable. It reads YAML/JSON with the patched admin YAML parser; TOML support loads its pinned parser only when a TOML file is read. Listing never persists inferred metadata. Normal editor saves retain Decap's existing YAML serialization, including for TOML/JSON source files. Check the adapter with temporary test dependencies:

```bash
admin_tools="$(mktemp -d)"
npm install --prefix "$admin_tools" --no-save --ignore-scripts --no-package-lock js-yaml@4.3.2 smol-toml@1.9.1
CSTATE_ADMIN_TEST_MODULES="$admin_tools" node scripts/verify-admin-records.mjs
```

`scripts/verify-admin-browser.mjs` exercises the actual Decap bundle through list/edit/Publish with every request intercepted and writes limited to an in-memory repository. Supply `CSTATE_PLAYWRIGHT_MODULE`, `CSTATE_ADMIN_TEST_MODULES`, `CSTATE_ADMIN_CMS_BUNDLE` (a cached `decap-cms.js`), and `CSTATE_ADMIN_YAML_BROWSER` (the pinned YAML browser build). CI downloads the same Decap major version used by the admin and runs this proof. Set `CSTATE_ADMIN_SCREENSHOT` to save its final editor screenshot.

## Ecosystem verification

Run the package-defined tests from each sibling repository root. Each v7 compatibility verifier reads `cstate/test/fixtures/v7-index.json` by default and may be pointed elsewhere with `CSTATE_V7_FIXTURE`.

```bash
cd /Users/mantas/Git/uncwo/cstate-extra/cstate-cli && npm test
cd /Users/mantas/Git/uncwo/cstate-extra/monitorbot && npm test
cd /Users/mantas/Git/uncwo/cstate-extra/html-embed && npm test
```

Run `npm ci --ignore-scripts` before the CLI and MonitorBot suites. Their CI matrices use Node 20 and 22. The CLI's `CSTATE_REQUIRE_HUGO=1 npm test` gate requires the real Hugo round trip rather than skipping it when Hugo is absent. The embed also runs `npm run test:browser` with the same `CSTATE_PLAYWRIGHT_MODULE` setting to check hostile record text at desktop/mobile widths.

## v7 contract invariants

- Incidents alone determine `summaryStatus`.
- Incident `createdAt`, `lastMod`, and nonempty `resolvedAt` values use RFC3339 timestamps. Offset-free legacy frontmatter uses the site's `timeZone`, defaulting to UTC; new CLI documents serialize explicit UTC instants. API field names are unchanged.
- Operational records expose `recordType`, `kind`, `state`, `severity`, `statusImpact`, `pin`, `affected`, `summary`, and `permalink`.
- Experiments may be scheduled, active, completed, or archived without creating downtime.
- A future-dated experiment is treated as starting soon until its date, even when authored with `state: active`.
- `pin: true` creates a contextual homepage notice above components in every history mode but never changes operational status.
- Component availability is calculated from the merged duration of published `down` intervals in the displayed 60-day window. It is not active monitoring or an SLA claim.
- The default modern skin uses system fonts and performs no Google Fonts request.
- Consumers must tolerate additional record kinds and fields while preserving the v7.0/API 2.1 required fields.

## MonitorBot deployment contract

- Dry-run mode is the default. Set `TESTMODE=false` to authorize incident/record writes.
- Set `DEPLOYMENT_METHOD` to `local`, `git`, or `ftp`.
- Local and Git writes require `LOCAL_CSTATE_PATH`; relative record paths are confined to that directory and nested content folders are created automatically.
- FTP writes require `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`, and `FTP_REMOTE_PATH`.
- `CHECK_INTERVAL` is milliseconds and must be at least 1000. A scheduled run is skipped if the previous run is still active.

## HTML embed record notices

The dialog always prioritizes `disrupted` and `down` status. Healthy operational-record notices are opt-in:

```html
<script>var cStateShowRecordNotices = true;</script>
<script src="dialog.js"></script>
```

When enabled, the embed selects the highest-priority active record deterministically and uses its kind, title, summary, and permalink.

## Browser acceptance

- Desktop viewport: 1440 × 1000.
- Mobile viewport: 390 × 844.
- Inspect the summary/incident stack, pinned record notice, component availability, history count/filtering, footer, and maintenance calendar.
- Confirm no horizontal overflow and no default request to Google Fonts.

## Troubleshooting

- If the Hugo verifier says generated files are missing, build the example site first and set `CSTATE_BUILD_DIR`.
- If a sibling verifier cannot find the fixture, set `CSTATE_V7_FIXTURE` to the absolute fixture path.
- MonitorBot local and Git writes require `LOCAL_CSTATE_PATH`; test mode must not attempt a real deployment.
- All worktrees may contain user edits. Never use destructive reset or checkout commands to resolve overlap.

## Incident reporting component (#348)

Add a reporting page to your own site's content:

```md
---
title: Report an incident
---

# Report an incident

{{< report repository="https://github.com/your-team/status" branch="main" >}}
```

Use `provider="gitlab"` for GitLab, including self-hosted repositories. `branch` defaults to `main`; supply the branch that actually exists in your repository. The example site's `/pages/report/` demonstrates the workflow. The page is optional and is not added to the public navigation.

The component loads systems from the homepage JSON API, prepares valid incident frontmatter, and offers copy, download, and a prefilled Git editor link. Review and commit the file in your Git provider to publish it. No access token or write API is used by the component. Long drafts use copy or download because editor URLs have practical length limits. If the API is unavailable, retry or write an update without selecting affected systems.

To embed the component outside Hugo, load the module from your status site (cross-origin API access must be allowed by your host):

```html
<script type="module" src="https://status.example/cstate-status-tool.mjs"></script>
<cstate-status-tool base="https://status.example/" repository="https://github.com/your-team/status" branch="main">
  <textarea name="content" slot="details-field"></textarea>
  <input name="filename" slot="filename-field">
</cstate-status-tool>
```

The optional slots receive generated Markdown and filename values, with bubbling `input` events for an enclosing form. Listen for `cstate-draft` to consume `{ markdown, filename }`. The `labels` attribute accepts a JSON dictionary of UI label overrides (also supported by the shortcode). `default-details` accepts a body template with `{{SYSTEMS}}`, `{{DATETIME}}`, and `{{STAND}}` placeholders. There are no external scripts, stylesheets, or runtime dependencies.

## Pinned severities (#283)

Active incidents appear in separate notices in the order `down`, `disrupted`, `notice`, followed by pinned informational announcements. Newer posts appear first within each severity. `pin: false` removes a notice from the homepage without changing its status impact. Informational posts appear once, use the informational treatment, and do not contribute to status or availability. Pinned operational records retain their existing separate section.

## Container releases (#344)

The `Container images` workflow builds `linux/amd64` (64-bit x86) and `linux/arm64` images. Each architecture must pass actual first startup, persistent-volume restart, subdirectory URL, removed-page cleanup, and failed-build shutdown checks. The two CI artifacts contain `cstate-linux-<arch>.tar.gz` and `SHA256SUMS`; download the artifact for your host, extract it, verify the checksum, and load it:

```sh
sha256sum -c SHA256SUMS  # macOS: shasum -a 256 -c SHA256SUMS
docker load -i cstate-linux-amd64.tar.gz
docker run -d --name cstate -p 8080:80 -v cstate-site:/app \
  -e CSTATE_BASE_URL=http://localhost:8080/ cstate:verify-amd64
```

Use `arm64` in the archive and tag names for ARM hosts. These images support 64-bit x86 and ARM; 32-bit x86 is not included. Pushes and pull requests targeting `v7`, and manual workflow runs, produce build artifacts without publishing images. Once a v7 release is published, the workflow also uploads versioned images to `ghcr.io/cstate/cstate`. Stable releases receive major/minor and `latest` aliases. A semver prerelease suffix or GitHub's prerelease checkbox restricts publication to its version tag; neither can advance stable aliases. Non-v7 releases are excluded.

After the first stable v7 image has been published:

```bash
docker run -d --name cstate -p 8080:80 -v cstate-site:/app \
  -e CSTATE_BASE_URL=http://localhost:8080/ ghcr.io/cstate/cstate:v7-r1
```

Before publication, build and run the same image locally:

```bash
docker build -t cstate:local .
docker run -d --name cstate -p 8080:80 -v cstate-site:/app \
  -e CSTATE_BASE_URL=http://localhost:8080/ cstate:local
```

An empty `/app` volume is initialized from the example site. Mount your own Hugo site at `/app` to retain your config, content, static files, and layout overrides; the image supplies the theme and a checksum-verified Hugo binary. Restart the container after changing content. Builds go directly into the web root with stale output removed, and a failed build prevents NGINX startup. Set `CSTATE_BASE_URL` to the public URL, including any subdirectory. For subdirectory hosting, configure your reverse proxy to strip that prefix before forwarding to NGINX. The image is a static publisher and web server; its healthcheck only checks HTTP serving.

The image serves `.mjs` files as JavaScript so the reporting tool and Decap adapter load under strict browser module checks. Custom static servers must also use a JavaScript MIME type for those files.

The build pattern follows [Docker's multi-platform GitHub Actions guide](https://docs.docker.com/build/ci/github-actions/multi-platform/). The editor handoff uses the [GitHub file editor](https://docs.github.com/en/repositories/working-with-files/managing-files/creating-new-files) and [GitLab Web Editor](https://docs.gitlab.com/user/project/repository/web_editor/).

For `v7-r1`, the registry exposes `v7-r1` and `7.0.0-r1`. The short release tag is normalized for semantic version consumers and never receives production aliases, even if a release flag is misconfigured.

## Optional MonitorBot backend (#198)

The public Hugo/NGINX site has no write endpoint and needs no credentials or backend. MonitorBot is an opt-in trusted process that publishes Markdown through your chosen deployment path. Its API defaults to disabled, binds to `127.0.0.1` when enabled, and keeps dry-run publication as the default. Node.js 20 or later is required.

The MonitorBot v7 worktree provides:

- Scoped bearer tokens for read, write, and configured-monitor control; browser-origin requests are rejected.
- Incident create/update/resolve and all eight operational record types, with preserved publication dates and `If-Match` revisions.
- Required idempotency keys, a durable publication journal, serialized writes, replay protection, bounded bodies/timeouts, and peer rate limits. API records use generated paths and cannot take over manually authored files.
- Run/pause/resume for existing monitor ids. Requests cannot add arbitrary probes or supply network targets or commands.
- HMAC-signed generic webhooks, GitHub/GitLab push hooks with repository/ref allowlists, and signed outbound events with durable retry.
- Local, Git, FTP, GitHub contents API, and GitLab repository files API publishers; command-line and JavaScript clients; an authenticated OpenAPI document.
- All v7 record output modes in configured monitors, an independent non-root container with private persistent state, and GitHub Actions/GitLab CI examples that need no HTTP server.

See [MonitorBot's v7 runbook](https://github.com/cstate/monitorbot/blob/v7/README.md#optional-v7-write-api-and-integrations-198) for configuration and request examples. The implementation is local and unpublished until the v7 work is pushed/released.

From a local MonitorBot checkout, build `docker build -t cstate-monitorbot:local .`. From this theme checkout, the optional Compose profile can then start both services:

```sh
# Static site only; no MonitorBot configuration required:
docker compose -f docker/compose.monitorbot.yml up -d --build

# Optional backend, with its own private volume and loopback port:
export MONITORBOT_API_TOKEN="$(openssl rand -hex 32)"
docker compose -f docker/compose.monitorbot.yml --profile automation up -d
```

The backend profile starts in API-only dry-run mode. It does not automatically write into the site's volume. Configure a private repository publisher and your normal static deployment pipeline to enable publication, or explicitly mount a writable content directory and rebuild/restart Hugo after local changes. Keep tokens and the backend's `/data` state outside the public site. Remote API/webhook access requires a private network or an HTTPS reverse proxy. No backend or integration is contacted merely by serving a static cState page.

Before upgrading an existing MonitorBot deployment, back up both private state files and assign stable monitor ids. Unambiguous legacy open incidents retain their original paths; duplicate-name or conflicting histories require operator reconciliation as documented in MonitorBot's runbook. Retrying a failed publication uses its exact frozen document before applying another check result. API requests must retry their original route/body/key. A busy hook reserves no delivery; a partially dispatched batch resumes only unstarted monitors. Started checks without completed checkpoints are reported as `interrupted` and need inspection before deliberately starting a new delivery. Single mode fails for execution or publication errors, while a successfully published service outage still counts as a completed check.

Failed persistence checkpoints restore the prior in-memory state. API record/revision/replay/outbox acknowledgements become visible together after a successful save. After repairing a storage failure, retry the original request; if an atomic write left a `.tmp` state file, stop and inspect/restore the intended state before restarting. Automatic checks emit `monitor.run.completed`; `record.published` currently describes API-authored publications.

## Local verification record — 2026-10-16

- Hugo 0.158.0 and 0.167.0: example build, record/API contracts, issue regressions, reporting round trips, Atom feeds, release policy, Decap defaults, history/default/label browser checks, and timestamp checks all pass. Modern/classic generated dates agree in Chromium and WebKit; explicit offsets, offset-free legacy dates under `Europe/Vilnius`, and empty resolutions are covered. Each example build has 37 valid JSON files, 32 XML/Atom files, and 90 parseable inline scripts.
- Decap: all eight record types and configured/local backend boundaries pass the focused verifier, including cursor metadata and subsequent pages. The real Decap CMS 3.17.1/core 3.20.1 bundle loads and saves untyped YAML/TOML/JSON records at their original paths; unknown metadata/body survives, index pages remain separately editable, and listing causes no writes.
- MonitorBot: the Markdown verifier and 23 tests pass on the host and Node 20/22. Coverage includes repeated cycles, duplicate names, legacy migration, frozen failed publications, busy/restarted batches, state-checkpoint failures, real single/cron processes, local Git, API lifecycle and host Hugo publication. Its non-root image passes publication, private-state, restart, and SIGKILL recovery. Node 20/22 dependency audits report zero known vulnerabilities.
- CLI: 11 tests pass without skips on the host and Node 20/22, including real Commander/execa argument handling and failures, exclusive create/draft collisions, literal replacements, local/offset/DST dates, resolved historical incidents, all eight record types, legacy templates, and actual Hugo 0.158 output. Dependency audit reports zero known vulnerabilities.
- Embed: fixture/lifecycle/escaping checks and six real Chromium hostile-content cases pass across healthy/disrupted/down states at desktop/mobile widths. Screenshots confirm inert text wraps within the viewport. CI includes the browser regression.
- Static images: amd64 and arm64 pass persistent volume, subdirectory URL, removed-page, failed-build, and JavaScript-module MIME checks. Fresh archives and SHA-256 checksums are in `/tmp/cstate-v7-artifacts/`; both are loaded back into Docker. GitHub prerelease flags and semver suffixes cannot advance stable aliases.
- Desktop/mobile homepage and filtered-history screenshots were inspected. Workflow YAML, optional Compose configuration, generated artifacts, and whitespace checks pass. Baseline comparisons find no removed files; changes are restricted to the intended fixes, regression checks, workflows, and docs. Backups, logs, screenshots, and the final source manifest are under `/tmp/cstate-v7-stabilization-20261016/`.

All work remains local and uncommitted in the four v7 worktrees. No push, remote workflow, release, ticket reply/label change, or live provider write was performed. GitHub/GitLab/outbound provider contracts use injected fixtures; their real production credentials/destinations were not exercised. Master, 6.0.2, and cstate/example were left untouched.

## Previous verification record — 2026-10-15

Static images passed the full container verifier on amd64 and arm64. The local archives in `/tmp/cstate-v7-artifacts/` include SHA-256 checksums and were loaded back into Docker. CI has been configured to produce equivalent downloadable artifacts; it has not been run remotely as part of this unpublished work. Both `7.0` and full semantic version tags normalize for a future v7 release.

MonitorBot passed the existing Markdown contract verifier and 11 API/lifecycle tests on the host and Node 20/22 containers, including a real local Git remote, unauthorized/scoped requests, replay/concurrent writes, signed hooks, crash recovery, and all v7 content types. Its container passed non-root publication and durable restart/SIGKILL recovery checks. The real service-to-Hugo round trip passed on the host. GitHub/GitLab publishing and outbound webhooks were verified against injected provider contracts; no live repository or external destination was written. npm audit reported zero known vulnerabilities.

The v7 theme build, record/JSON contracts, issue regression checks, reporting tool, Atom validation, Chromium history/default/label checks, Compose parsing, and whitespace checks passed. The local static page was inspected before and after; no visual source changes were made. Work remains local and uncommitted in the theme and MonitorBot v7 worktrees.
