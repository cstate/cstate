# cState v7 ecosystem reliability implementation plan

## Active v7-r1 publication — 2026-10-17

Commit and push all current v7 work in cstate, monitorbot, cstate-cli, and html-embed. Run remote CI against each exact pushed head and repair failures. Publish cState `v7-r1` as a GitHub prerelease; do not promote v7 to production. Do not modify master, v6.0.2, cstate/example, or tickets. Use plain Git for commits/pushes and preserve remote commits without force-pushing. Earlier local-only constraints are historical.

- [x] Prepare source version `7.0.0-r1`, exact `v7-r1` tag handling, notes, and prerelease-only container aliases.
- [ ] Commit and push the complete current v7 state in all four repositories after preservation/whitespace checks.
- [ ] Inspect remote CI for every pushed head; fix and push any failures until required jobs pass.
- [ ] Publish/verify the prerelease, versioned images/downloadable artifacts, clean local/remote parity, and unchanged stable/default refs.

Acceptance: four clean v7 worktrees match remote heads; exact-head Actions runs succeed; `v7-r1` exists as published `prerelease: true`; stable/latest remains 6.0.2; container tags cannot alter `7`, `7.0`, or `latest`; no ticket messages or labels change. Baseline refs/backups and publication proof live in `/tmp/cstate-v7-r1-20261017/`.


## Completed stabilization goal — 2026-10-16

Fix every finding in the attached goal across the theme, MonitorBot, CLI, and embed. Preserve all pre-existing v7 edits; do not modify master, 6.0.2, or cstate/example. Do not push, publish, run publishing workflows, or reply to tickets. Baselines and backups are in `/tmp/cstate-v7-stabilization-20261016`.

- [x] Escape embedded record titles and add hostile-title coverage in the healthy opt-in flow.
- [x] Prevent CLI create/draft collisions using exclusive writes; keep literal template substitutions.
- [x] Serialize CLI publication/resolution timestamps with offsets; retain resolution time and validate chronology.
- [x] Forward real Hugo arguments and propagate subprocess failures; exercise the actual CLI with a fake Hugo executable.
- [x] Refresh CLI/admin YAML and CLI moment dependencies; install and run the full CLI suite.
- [x] Allocate a unique MonitorBot incident path per outage lifecycle, preserving persisted open paths.
- [x] Isolate monitor state by configured monitor ID; migrate legacy state safely, including duplicate display names.
- [x] Reset below-threshold failure counts on successful checks; publish reliable recoveries.
- [x] Make single-mode execution/publication failures exit nonzero while keeping scheduled monitoring resilient.
- [x] Make known pre-execution busy webhook failures retryable without losing crash/replay protection.
- [x] Emit RFC3339 incident dates across static API endpoints and verify generated data in Chromium and WebKit.
- [x] Keep section-inferred records visible/editable in Decap while excluding index files and mismatched explicit types.
- [x] Respect GitHub prerelease status as well as semver suffixes; prevent stable container aliases on prereleases.
- [x] Update changelog/runbooks, add targeted regressions, test all four repos, both skins and container architectures, and inspect desktop/mobile screenshots.
- [x] Review final diffs against backups, verify no source regressions or lost user work, and record the unpublished release-readiness evidence.

Ownership: MonitorBot executor owns only its repository; CLI executor owns only its repository; embed executor owns only its repository. The parent owns theme/admin/release workflow/changelog/control docs and final cross-repo verification. Workers must preserve others' edits and coordinate through messages. Each starts from the current dirty tree, not an older clean commit.

Verification: theme Hugo 0.158/0.167 and existing verifiers plus new Safari/admin/release-policy regressions; MonitorBot old Markdown verifier, real HTTP/service/Git tests, failure/recovery/migration cases, Node 20/22 and non-root container; CLI full installed suite with actual subprocess/file/zone tests; embed tests and a real browser hostile-title check. External providers stay mocked or local. Remote CI/publication is not part of this local stabilization run.


Completion evidence: both Hugo matrices and generated artifact validation pass; MonitorBot 23/23 and CLI 11/11 pass on the host and Node 20/22; real Chromium/WebKit, actual Decap editor, hostile embed, and both static container architectures pass. The non-root MonitorBot image passes restart/crash recovery. Final source hashes, preservation report, logs, and screenshots are under `/tmp/cstate-v7-stabilization-20261016/`; refreshed static archives are in `/tmp/cstate-v7-artifacts/`. All four branches remain `v7`, with no commits, pushes, remote workflow runs, provider writes, ticket changes, or releases in this stabilization run.

## Current work — containers and optional MonitorBot backend (2026-10-15)

- [x] Package and actually smoke-test amd64/arm64 static-site images; produce downloadable archives/checksums in CI without publishing on pushes/manual runs. Test persistent mounts, removed pages, subdirectory URLs, and failed builds.
- [x] Add a disabled-by-default Node HTTP service with scoped bearer authentication, loopback binding, bounded requests, rate limits, durable idempotency, serialized writes, optimistic revisions, and server-generated content paths.
- [x] Support incident create/update/resolve and all eight v7 operational record types with validated state, severity, pin, affected, and summary. Preserve original publication dates during edits.
- [x] Add authenticated configured-monitor run/pause/resume controls without arbitrary request-supplied probe URLs.
- [x] Add signed generic incoming events and GitHub/GitLab push hooks, replay protection, configured outbound signed events, and direct GitHub/GitLab file publishing alongside Git/local/FTP.
- [x] Add command-line interaction, OpenAPI contract, example configurations, optional sidecar packaging, lifecycle/error handling, and upgrade documentation.
- [x] Verify real HTTP requests, unauthorized/invalid/replayed/concurrent input, provider mocks, durable restart behavior, Hugo-generated output, both containers, and the existing suites. Restore changes into the original MonitorBot worktree without overwriting baseline edits.
- [x] Update changelog/runbook and report verified local results. Leave v7 unpublished and the issues untouched.

Architecture: the API is a separate opt-in MonitorBot process. The public Hugo/NGINX image has no API credentials or write service. A private volume holds automation state; only validated Markdown is sent through the configured publisher. API records are managed in their own namespace so manual content cannot be overwritten. Tokens and destinations come only from operator configuration. Hooks cannot choose network targets, content paths, credentials, or executable commands.

Risk controls: preserve a baseline copy of the dirty MonitorBot tree; do development in `/tmp/cstate-monitorbot-v7`, then apply only the changed files after comparing the baseline. Never call real publishing integrations during tests. Container builds and archives stay local or in non-publishing CI; release publication remains gated on a future published v7 release. Tests cover queue recovery after errors, rejected symlinks/path traversal, no secrets in errors, authentication before parsing payloads, and webhook replay across restarts.

This is the execution source of truth. Update checkboxes and the decision log only after the corresponding behavior is implemented and verified.

## Repositories and ownership

- Theme, Decap contract, canonical fixture, release docs: `/Users/mantas/Git/uncwo/cstate`
- CLI record authoring compatibility: `/Users/mantas/Git/uncwo/cstate-extra/cstate-cli`
- MonitorBot publishing/runtime reliability: `/Users/mantas/Git/uncwo/cstate-extra/monitorbot`
- HTML embed record consumption: `/Users/mantas/Git/uncwo/cstate-extra/html-embed`

All four worktrees were dirty at task start. Existing changes are user/concurrent work and must be preserved.

## Verification checklist

- [x] Baseline desktop and mobile screenshots captured before edits
- [x] Hugo example site builds with path and i18n warnings enabled
- [x] Theme record-section verifier passes
- [x] Theme v7 contract verifier passes
- [x] Generated JSON parses, including JSON-encoded record-index title/base URL templates
- [x] RSS and Atom XML validate
- [x] Generated inline JavaScript parses
- [x] cstate-cli tests pass against canonical fixture
- [x] MonitorBot tests pass, including executable deployment and awaited SSL regressions
- [x] html-embed tests pass against canonical fixture and healthy/notice/disrupted cases
- [x] Desktop and mobile after-screenshots inspected; DOM geometry confirms no overflow
- [x] No default Google Fonts request remains in generated HTML
- [x] `changelog.md`, README/PRD, MonitorBot docs, and this runbook match shipped behavior
- [x] Final `git diff --check` passes in every repository

## Milestone 01 — Baseline, plan, and failing coverage [complete]

Scope:

- Preserve dirty worktrees and inspect all existing changes.
- Capture the current homepage at desktop and mobile.
- Add regression assertions for each reviewed theme behavior before fixing it where practical.
- Confirm the canonical v7 fixture can be located by sibling repositories without assuming the current working directory.

Acceptance criteria:

- Four control documents are complete enough for another agent to resume.
- Baseline screenshots exist.
- Tests express uptime duration semantics, pinned notice visibility, scheduled experiment classification, history limits, no remote font, localization, ICS escaping, and JSON serialization.

Verification:

- `hugo --source exampleSite --themesDir ../.. --theme cstate --destination /tmp/cstate-v7-build --cleanDestinationDir --printPathWarnings --printI18nWarnings`
- `CSTATE_BUILD_DIR=/tmp/cstate-v7-build node scripts/verify-record-sections.mjs`
- `CSTATE_BUILD_DIR=/tmp/cstate-v7-build node scripts/verify-v7-contract.mjs`

## Milestone 02 — Truthful theme behavior [complete]

Scope:

- Duration-based availability for the 60-day histogram window.
- Scheduled experiment classification.
- Mode-independent pinned notice with summary.
- Combined-history cap and archive links.
- Safe record JSON and correct ICS escaping.

Key files:

- `layouts/partials/index/components.html`
- `layouts/partials/experiments/for-affected.html`
- `layouts/index.html`
- `layouts/partials/index/records.html`
- `layouts/partials/skins/modern/index/records.html`
- `layouts/partials/skins/modern/index/history.html`
- `layouts/partials/skins/modern/issues/issue.html`
- `layouts/records/list.json`
- `scripts/verify-record-sections.mjs`

Acceptance criteria:

- One minute of downtime does not count as a full unavailable day.
- A future `state: active` experiment is “starting soon” until its date.
- Pinned context appears above components in combined and separate history modes, without changing `summaryStatus`.
- The homepage renders at most the configured history count.
- Calendar output has one layer of quoting and RFC 5545 text escaping.
- Quoted titles produce parseable JSON.

## Milestone 03 — Portable, localized UI [complete]

Scope:

- Remove Google Fonts from the default skin.
- Add i18n keys for record metadata, history controls, empty states, component availability, and calendar UI.
- Update all shipped locale files with safe translations or explicit English fallback translations where native copy is unavailable.
- Keep ordinary record cards compact; summary is only added to the pinned notice.

Acceptance criteria:

- Generated modern pages make no font request outside the site origin.
- A Lithuanian build contains no newly introduced English interface strings covered by the v7 keys.
- Desktop and mobile retain clear incident > pinned notice > components > history hierarchy.

## Milestone 04 — Canonical ecosystem contract [complete]

Scope:

- Expand `test/fixtures/v7-index.json` and its verifier into the canonical compatibility fixture.
- Make CLI, MonitorBot, and embed verifiers consume the fixture through robust path/config resolution.
- Check the Decap record definitions against the same record types and field semantics.
- Add CI workflows or test commands in sibling repositories where absent and in scope.

Acceptance criteria:

- A contract change in the fixture breaks incompatible consumers.
- Record type, kind, state, severity/statusImpact, pin, summary, permalink, affected, and experiment context are asserted.
- Tests work when launched from each repository root.

## Milestone 05 — MonitorBot runtime hardening [complete]

Scope:

- Finish ESM-safe FTP deployment.
- Ensure Git/local deployment creates nested record directories and fails clearly without a path.
- Ensure SSL incident create/resolve work is awaited exactly once.
- Normalize deployment defaults and documentation.
- Prefer executable tests with temporary directories and injected/fake collaborators over source-regex-only checks.

Acceptance criteria:

- FTP modules import in the ESM package.
- Git/local can write the first `content/experiments/...` file.
- SSL monitor promises resolve only after incident actions finish and do not double-report socket failures.
- Missing `LOCAL_CSTATE_PATH` is harmless in test mode and explicit in write modes.

## Milestone 06 — Useful, conservative embed [complete]

Scope:

- Select the highest-priority active record deterministically.
- Keep `summaryStatus: ok` silent by default.
- Add opt-in notice rendering with record title/summary/kind/permalink.
- Preserve disruption/down alert behavior.

Acceptance criteria:

- Healthy pages remain quiet without notice opt-in.
- Opted-in notices use concrete record context and link to the record when available.
- Disrupted/down status remains the dominant alert.
- Fixture-backed tests cover all three paths.

## Milestone 07 — Documentation and release record [complete]

Scope:

- Add a complete v7 bug-fix and behavior-change section to `changelog.md`.
- Update PRD test status and compatibility claims.
- Correct MonitorBot `checkInterval`, `runningMethod`, deployment path, and record-publishing docs.
- Document privacy, history limit, availability calculation, scheduled experiment, pinned notice, embed opt-in, and contract fixture behavior.

Acceptance criteria:

- No checked-in document contradicts the implemented defaults or tests.
- Upgrade notes clearly identify behavior changes.

## Milestone 08 — Browser and final validation [complete]

Scope:

- Rebuild and inspect homepage, pinned notice, history, component availability, and maintenance calendar.
- Capture desktop and mobile after-screenshots.
- Run every repository’s full available test suite and final diff checks.

Acceptance criteria:

- Visual hierarchy is intentional at 1440px and 390px.
- No horizontal overflow, duplicated framing, missing notice context, or misleading metric labels.
- All verification checklist items pass or an external blocker is documented with evidence.

## Risk register

1. Dirty worktrees and concurrent edits
   - Mitigation: inspect status/diffs before every milestone, patch narrowly, never reset or overwrite whole files.
2. Cross-repository filesystem permissions
   - Mitigation: use the user-authorized sibling paths; if sandbox write approval is required, request only the narrow repository operation.
3. “Uptime” precision from incident-only data
   - Mitigation: calculate interval overlap against the observation window and document that availability derives from published incident windows, not active probing.
4. Contract duplication
   - Mitigation: make the theme fixture canonical and require every consumer test to read it.
5. Localization breadth
   - Mitigation: add every key to every locale; do not leave Hugo missing-translation warnings for v7 UI.
6. Embed over-alerting
   - Mitigation: keep healthy-state notices opt-in and status disruptions dominant.

## Acceptance demo

1. Show a future experiment labeled scheduled and a pinned notice with concise context above components.
2. Show duration-based availability and capped combined history on desktop and mobile.
3. Download a valid ICS file and parse quoted record JSON.
4. Run theme, CLI, MonitorBot, and embed fixture-backed checks.
5. Show the changelog and corrected operator documentation.

## Architecture and decisions

- The theme’s `test/fixtures/v7-index.json` is the canonical versioned compatibility payload.
- `summaryStatus` remains incident-only. Record `statusImpact` describes visibility/context and never changes the outage rollup.
- Pinned notices are a separate homepage surface, not verbose history cards.
- Availability is calculated from incident-duration overlap within the displayed window.
- Default pages use system fonts; remote typography is not a hidden dependency.
- Record notices in the embed are opt-in when the status is healthy.

## Decision log

- 2026-07-18: Existing uncommitted edits in all four repositories are preserved as user/concurrent work.
- 2026-07-18: Baseline browser evidence exposed misleading `0% uptime`, an ordinary-history pinned experiment, and weak mobile flow; fixes will address semantics and hierarchy together.
- 2026-07-18: Pinned summaries are limited to the dedicated notice surface; combined history cards remain compact.
- 2026-07-18: A future-dated active fixture now verifies scheduled experiment behavior through generated Hugo output.
- 2026-07-18: Mobile DOM inspection found hidden tooltip overflow; hidden tooltips now leave layout and edge tooltips anchor inward.
- 2026-07-18: All theme and sibling-repository checks pass; XML, inline JavaScript, localization, JSON parsing, responsive geometry, and diff whitespace were validated.

## Current integration verification — 2026-10-15

- Both `linux/amd64` and `linux/arm64` static images passed `scripts/verify-container.mjs`, including failed-build shutdown and removal of stale output. Exported archives were SHA-256 checked and loaded back into Docker. Local deliverables: `/tmp/cstate-v7-artifacts/`.
- Original MonitorBot worktree: existing Markdown/fixture verifier and all 11 API/lifecycle tests pass. The actual Node 20 and Node 22 container runtimes pass the same suite. A real Hugo build accepts every generated v7 record type. Git publishing was exercised against a temporary bare repository, including a failed push/retry and unrelated staged work.
- The MonitorBot image runs as uid 1000, publishes only after explicit opt-in, retains pause/replay state after restart, and recovers after SIGKILL once its 10-second lease expires. `proper-lockfile` is the one added runtime utility, replacing PID-based ownership that breaks in containers. npm reports zero known vulnerabilities after the axios/simple-git updates.
- Theme Hugo build, records/contract verifiers, issue regressions, reporting round trips, 15 Atom feeds, and Chromium history/default/label checks pass. Both Compose profiles parse. OpenAPI JSON and local references validate.
- Existing MonitorBot diff matched the saved baseline before applying changes. Overlapping files were backed up; untouched baseline files match byte-for-byte. Both worktrees remain on v7 with local uncommitted changes; no pushes, releases, or issue mutations occurred.
- Remote master, tag 6.0.2, and example theme pointer were verified at `1f53d60257d32f9ec981846eb55e55de3051de71`; GitHub latest release was 6.0.2, published and stable. These were left unchanged.
