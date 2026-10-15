# cState v7 ecosystem reliability implementation plan

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
