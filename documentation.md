# cState v7 ecosystem reliability runbook

This runbook tracks the multi-repository v7 reliability work. It must describe current verified behavior, not planned behavior.

## Repositories

- `cstate`: Hugo theme, Decap admin, canonical v7 fixture, example site, release documentation.
- `cstate-extra/cstate-cli`: command-line Markdown authoring.
- `cstate-extra/monitorbot`: monitoring and Git/local/FTP publishing.
- `cstate-extra/html-embed`: downstream status and operational-record embed.

## Toolchain

- Hugo extended 0.158.0 or later.
- Node.js 20-compatible runtime.
- Existing repository dependencies; avoid adding new runtime dependencies.

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
```

Browser regression checks cover history filtering before the display limit, normalized active-record selectors, and configured versus translated labels:

```bash
browser_tools="$(mktemp -d)"
npm install --prefix "$browser_tools" --no-save --package-lock=false playwright@1.62.1
"$browser_tools/node_modules/.bin/playwright" install chromium
CSTATE_PLAYWRIGHT_MODULE="$browser_tools/node_modules/playwright" node scripts/verify-v7-review.mjs
```

## Ecosystem verification

Run the package-defined tests from each sibling repository root. Each v7 compatibility verifier reads `cstate/test/fixtures/v7-index.json` by default and may be pointed elsewhere with `CSTATE_V7_FIXTURE`.

```bash
cd /Users/mantas/Git/uncwo/cstate-extra/cstate-cli && npm test
cd /Users/mantas/Git/uncwo/cstate-extra/monitorbot && npm test
cd /Users/mantas/Git/uncwo/cstate-extra/html-embed && npm test
```

## v7 contract invariants

- Incidents alone determine `summaryStatus`.
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

The `Container images` workflow builds `linux/amd64` (64-bit x86) and `linux/arm64` images. A published v7 release uploads versioned images to `ghcr.io/cstate/cstate`. Stable releases receive major/minor and `latest` aliases; prereleases keep their prerelease tag. Pull requests and manual workflow runs validate builds without publishing. The workflow smoke-tests startup before building the multi-platform image.

After the first stable v7 image has been published:

```bash
docker run -d --name cstate -p 8080:80 -v cstate-site:/app \
  -e CSTATE_BASE_URL=http://localhost:8080/ ghcr.io/cstate/cstate:7
```

Before publication, build and run the same image locally:

```bash
docker build -t cstate:local .
docker run -d --name cstate -p 8080:80 -v cstate-site:/app \
  -e CSTATE_BASE_URL=http://localhost:8080/ cstate:local
```

An empty `/app` volume is initialized from the example site. Mount your own Hugo site at `/app` to retain your config, content, static files, and layout overrides; the image supplies the theme and a checksum-verified Hugo binary. Restart the container after changing content. Builds go directly into the web root with stale output removed, and a failed build prevents NGINX startup. Set `CSTATE_BASE_URL` to the public URL, including any subdirectory. For subdirectory hosting, configure your reverse proxy to strip that prefix before forwarding to NGINX. The image is a static publisher and web server; its healthcheck only checks HTTP serving.

The build pattern follows [Docker's multi-platform GitHub Actions guide](https://docs.docker.com/build/ci/github-actions/multi-platform/). The editor handoff uses the [GitHub file editor](https://docs.github.com/en/repositories/working-with-files/managing-files/creating-new-files) and [GitLab Web Editor](https://docs.gitlab.com/user/project/repository/web_editor/).
