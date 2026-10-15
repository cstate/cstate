# Changelog

### Additional v7 fixes and integrations (2026-10-15)

- Fixed combined-history filters searching only the initial display window; matching entries are now selected from the complete history before applying the page limit.
- Used normalized active defaults in component selectors and experiment counts, with explicit completed/archived states taking precedence over legacy severity hints.
- Preserved configured record labels across cards, details, feeds, and filters while retaining translations for default labels.
- Fixed quoted and escaped text throughout incident, page, system, and homepage JSON APIs (#373); corrected custom-tab URLs (#372).
- Preserved subdirectory hosting in the classic homepage history link (#374).
- Grouped monthly archives by year and month and applied the same calendar-safe age cutoff as yearly archives (#371).
- Added a default compact incident view for affected archives without changing record rendering, including Hugo 0.167 compatibility (#370).
- Kept the existing locale migration, RSS URL fix, Atom feeds, experiments, operational records, and modern skin (#355, #357, #341, #288).
- Added separate, severity-ordered notices and excluded informational announcements from operational status and availability (#283).
- Added a dependency-free reporting web component, Hugo shortcode, example page, Markdown export, and GitHub/GitLab editor handoff (#348).
- Added checksum-verified, multi-platform container builds and a release-triggered GHCR publication workflow (#344).
- Added generated-output regression checks, reporting round-trip tests, Atom validation, and a Hugo 0.158/0.167 CI matrix.

## v7.0

**v7 is a major product update for cState.** The release keeps the static, Hugo-based architecture that makes cState cheap to host, portable, and easy to own, then expands what a status page can publish around incidents.

**The headline change is operational publishing.** cState can now publish experiments, release notes, roadmap updates, eval reports, agent run reports, decision records, research notes, and changelog entries beside traditional incidents. Incidents still drive outage state. The new records give teams a cleaner way to show what is changing, what is being tested, and what operators should know without turning every update into downtime.

**The default experience feels current again.** The new modern skin refreshes the homepage, components, incident pages, feeds, subscribe surfaces, footers, and record pages. The classic skin remains available for sites that need the older minimal presentation.

**Strategically, v7 moves cState further into the status-page-as-code lane:** static by default, Git-native, readable by humans and tools, and easier to integrate into product surfaces through JSON, RSS, Atom, badges, and embeds.

### Added

- **Skins:** added the new `modern` skin as the default experience for cState sites, while `classic` remains available for sites that want the older minimal look.
- **Operational record types:** added experiments, release notes, changelog entries, roadmap updates, eval reports, agent run reports, decision records, and research notes.
- **Record publishing:** added archetypes, example content, record list/detail templates, JSON output, RSS output, and Atom output for the new record sections.
- **Atom feeds:** added Atom support alongside RSS feeds. cState now generates Atom feeds with the `application/atom+xml` media type and exposes Atom feed links in feed discovery and subscribe UI. Thanks to @ghost for the suggestion in #341.
- **Record semantics:** added explicit support for `recordKind`, `severity`, and `pin`. Records can identify whether they are an `experiment`, `announcement`, `maintenance`, or another operational entry while keeping `severity` as the status-impact marker. JSON still exposes this as `kind`.
- **Experiment notices:** added component and category notices for active or starting-soon experiment records, while leaving the system status unchanged.
- **Pinned record announcements:** added a homepage path for surfacing an experiment, release note, or operational update globally without creating an incident.
- **Per-page feeds:** added RSS and Atom links in the modern footer when a page exposes its own feeds.
- **Release checks:** added a workflow for v7 and `master` that builds the example site with Hugo and verifies generated records, URLs, JSON, and template placeholders.
- **Canonical v7 contract fixture:** added `test/fixtures/v7-index.json` as the shared API 2.1 compatibility payload for the theme, Decap CMS, cstate-cli, MonitorBot, and HTML embed. It covers all eight operational record types and their required fields.
- **Ecosystem checks:** added fixture-backed test workflows to cstate-cli, MonitorBot, and the HTML embed so record-model drift fails in the repository that consumes it.
- **cState website:** redesigned and gave more attention to the cState marketing website. Visit it at https://cstate.uncascade.com.

### Changed

- **Modern skin:** reworked the default site presentation, including status summary, incidents, components, tabs, footer, issue detail pages, and subscribe UI.
- **Homepage clarity:** gave current status, active incidents, component health, experiment context, and pinned records distinct visual roles.
- **API/index JSON:** expanded output so operational records can be consumed alongside incident and component data. Record JSON now includes `kind`, `severity`, `statusImpact`, and `pin`.
- **Affected-system JSON:** exposed experiment status, visible experiments, running experiment counts, and absolute experiment URLs.
- **Component availability:** the optional 60-day percentage now uses the duration of published `down` incident intervals, merges overlapping outages, and clips them to the observation window. It is incident-history-derived availability, not an active probe or SLA measurement.
- **Component histograms:** components without history now render a stable all-OK view when history JSON is absent.
- **Theme colors:** normalized configured colors before rendering CSS, JavaScript color variables, and status shadows. Short hex values and missing values are handled with safer fallbacks.
- **Pinned records:** separated pinned operational records from incident announcements. A pinned notice now appears above components in combined and separate history modes, includes its concise summary, and remains visible when incident history is disabled. Ordinary history cards stay compact.
- **Experiment timing:** a future-dated experiment is shown as starting soon even if its frontmatter already says `state: active`; it becomes running when its publication date arrives.
- **History limits:** modern combined history now honors `incidentPostsPerPage` and links to the incident and record archives when more entries exist.
- **Record defaults:** omitted state values normalize to `active` for experiments and roadmap entries and `completed` for other operational records; omitted non-incident severity normalizes to `none`.
- **Private-by-default typography:** the modern skin now uses the system font stack and no longer contacts Google Fonts on page load.
- **Localized v7 UI:** record labels and state, history controls, empty states, pinned notices, experiment timing, informational badges, and calendar actions now use Hugo translation keys. English and Lithuanian v7 copy is included; other locales fall back to the site’s configured default language until native strings are contributed.
- **HTML embed notices:** disruption and outage dialogs remain dominant. Healthy record notices are quiet by default and can be enabled with `cStateShowRecordNotices = true`; record-aware dialogs expose the highest-priority active record’s kind, title, summary, and permalink.
- **MonitorBot safety:** MonitorBot now defaults to dry-run mode, accepts `DEPLOYMENT_METHOD`, honors millisecond `CHECK_INTERVAL` values without invalid cron expressions, skips overlapping runs, and requires an explicit local path only when a real local/Git write occurs.
- **README positioning:** updated the product framing around operational publishing from Markdown, humans, and AI agents.
- **Hugo v0.158.0+ compatibility:** updated the example config and templates to replace `languageCode` with `locale`, and replace `.Site.LanguageCode` with `.Site.Language.Locale`.

### Upgrade notes

- **Older Hugo sites:** existing sites that stay on older Hugo versions can keep their old `languageCode` config.
- **Hugo v0.158.0 or later:** update your site config from `languageCode` to `locale` to avoid Hugo deprecation warnings. Upgrading cState at the same time is recommended so the theme templates use Hugo's new language APIs too.
- **MonitorBot:** deployments are now dry-run by default. Set `TESTMODE=false` only after choosing `DEPLOYMENT_METHOD` and configuring `LOCAL_CSTATE_PATH` for local/Git or all `FTP_*` values for FTP.
- **HTML embed:** existing outage/disruption behavior is unchanged. Define `cStateShowRecordNotices = true` before `dialog.js` only if healthy operational-record notices should open a dialog.

### Fixed

- **Dark-mode selection:** fixed unreadable text selection colors by adding a dedicated high-contrast dark-mode selection style. Reported by @bbhtt in #353 and addressed in #354.
- **Homepage RSS link:** fixed the remaining subscribe link to use Hugo output formats for the feed URL, avoiding the double-slash 404 reported by @anarcat in #357 and addressed in #358.
- **Notice wording:** fixed templates that still referenced the old maintenance translation key.
- **Histogram loading text:** fixed typoed loading translation usage in component histograms.
- **Optional JSON fields:** fixed `severity` and `resolvedAt` output so missing values do not leak Hugo `<no value>` placeholders.
- **Experiment URLs:** fixed generated JSON so API consumers receive absolute URLs where expected.
- **Availability percentage:** fixed a full-day penalty for incidents that lasted only minutes or hours, and prevented overlapping outage intervals from being counted twice.
- **Pinned record visibility:** fixed `pin: true` having no visible effect in the default combined history mode and restored the context needed for global announcements.
- **Future experiments:** fixed future-dated active experiments being reported as currently running.
- **Combined history pagination:** fixed the modern combined stream ignoring the configured homepage history limit.
- **Undocumented third-party request:** removed the default Google Fonts stylesheet and preconnect requests.
- **Record localization:** fixed new record labels and state text bypassing Hugo i18n.
- **Calendar downloads:** fixed maintenance descriptions being JSON encoded twice; calendar title, description, location, and reminder text now escape RFC 5545 text delimiters and line breaks, and generated blob URLs are revoked.
- **Record JSON:** fixed valid titles and base URLs containing quotes, backslashes, or control characters breaking `/records/index.json`.
- **MonitorBot deployments:** fixed CommonJS `require()` calls in the ESM FTP path, created missing parent directories before local/Git record writes, rejected paths outside `LOCAL_CSTATE_PATH`, applied `FTP_REMOTE_PATH`, and made missing deployment configuration fail clearly.
- **MonitorBot SSL actions:** fixed TLS callbacks returning before incident creation/resolution finished and prevented a failed incident action from being launched twice.

## How to use the new features

### Operational Records

cState now supports first-class operational records in addition to incident posts. Incidents remain in `content/issues` and continue to drive outage severity. Experiment records can surface as component/category notices or pinned homepage notices, but they do not change operational status.

Supported record sections:

- `content/experiments` for public experiment summaries and rollout tests.
- `content/release-notes` for user-facing release notes.
- `content/changelog` for concise change entries.
- `content/roadmap` for planned operational or product updates.
- `content/evals` for eval and benchmark reports.
- `content/agent-runs` for reports from AI-assisted work.
- `content/decisions` for decision records.
- `content/research` for research notes.

Each section gets list pages, detail pages, JSON, RSS, and Atom output. The aggregate `content/records/_index.md` page publishes a combined `/records/` view of all operational records.

Use this frontmatter shape for new records:

```md
---
title: Search relevance rollout experiment
date: 2026-05-09 09:00:00
recordType: experiment
recordKind: experiment
state: active
severity: notice
pin: true
affected:
  - API
summary: Testing a search relevance update with a limited traffic slice.
---
```

Frontmatter fields:

- `title` and `date` are the main required fields.
- `recordType` is optional when the record is in one of the standard sections; cState infers it from the folder.
- `recordKind` describes what the entry is. Incidents default to `incident`, legacy informational posts default to `announcement`, and experiments default to `experiment`. The API exposes this as `kind`.
- `affected` links the record to existing systems/components. For non-incidents this is shown as related context, not downtime.
- `state` is optional. Supported non-incident states are `active`, `completed`, and `archived`. When omitted, experiments and roadmap entries normalize to `active`; other operational records normalize to `completed`.
- `severity` remains the status-impact marker. Incidents use `notice`, `disrupted`, or `down` for operational status. Records default to `none`; an active experiment with `severity: notice` shows a component/category notice without changing status.
- `pin: true` shows a record in the homepage announcement band. This is the global notice path for experiments and other operational records.
- `summary` is optional and is used in pinned notices, record detail/API output, and feeds when present. Ordinary history cards remain concise.

Behavior rules:

- Only incidents in `content/issues` affect the default `ok`, `notice`, `disrupted`, or `down` status rollup.
- Experiments are not outages. An active experiment with `severity: notice` can add a notice to affected components/categories, and `pin: true` can show it globally, but neither changes the operational status.
- Existing `informational: true` issue posts continue to work.
- Existing incident fields such as `resolved`, `resolvedWhen`, `severity`, and `affected` remain supported.

Experiment records specifically support the Tor Project use case from #288: they can be marked active, attached to affected systems, rendered with experiment-specific wording, and shown as related activity without calling the experiment an outage. For monitor-bot and other writers, cState v7 expects incident automation to keep writing `content/issues` with `section: issue`, `resolved`, and `severity`, while optional non-incident notices should use records with `recordKind`, `state`, `severity`, and `pin`.

Example Hugo commands:

```bash
hugo new experiments/2026-05-09-search-rollout.md
hugo new release-notes/2026-05-08-notification-settings.md
hugo new agent-runs/2026-05-04-codex-docs-pass.md
```
