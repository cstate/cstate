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
