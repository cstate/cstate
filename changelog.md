# Changelog

## v7.0

### Added

- Added skins, with the new `modern` skin becoming the default experience for cState sites. This is a complete redesign for default users, while `classic` remains available for sites that want the old minimal look.
- Added operational record content types beyond incidents: experiments, release notes, changelog entries, roadmap updates, eval reports, agent run reports, decision records, and research notes.
- Added archetypes, example content, record list/detail templates, JSON output, RSS output, and Atom output for the new record sections.
- Added Atom feed support alongside RSS feeds. cState now generates Atom feeds with the `application/atom+xml` media type and exposes Atom feed links in feed discovery and subscribe UI. Thanks to @ghost for the suggestion in #341.
- Added explicit record semantics for `recordKind`, `severity`, and `pin`. Records can identify whether they are an `experiment`, `announcement`, `maintenance`, or another operational entry while keeping `severity` as the status-impact marker. JSON still exposes this as `kind`.
- Redesigned and gave more attention to the cState marketing website. Visit it at https://cstate.uncascade.com.

### Changed

- Reworked the default site presentation around the new modern skin, including status summary, incidents, components, tabs, footer, issue detail pages, and subscribe UI.
- Expanded the API/index JSON output so operational records can be consumed alongside incident and component data. Record JSON now includes `kind`, `severity`, `statusImpact`, and `pin`.
- Updated README positioning around operational publishing from Markdown, humans, and AI agents.
- Updated the example Hugo config and templates for Hugo v0.158.0+: use `locale` instead of `languageCode`, and `.Site.Language.Locale` instead of `.Site.LanguageCode`.

### Upgrade notes

- Existing sites that stay on older Hugo versions can keep their old `languageCode` config.
- If you upgrade the Hugo dependency to v0.158.0 or later, regardless of which cState version you are on, update your site config from `languageCode` to `locale` to avoid Hugo deprecation warnings. Upgrading cState at the same time is recommended so the theme templates use Hugo's new language APIs too.

### Fixed

- Fixed unreadable text selection colors in dark mode by adding a dedicated high-contrast dark-mode selection style. Reported by @bbhtt in #353 and addressed in #354.
- Fixed the remaining homepage RSS subscribe link to use Hugo output formats instead of manually joining `baseURL` and `/index.xml`, avoiding the double-slash 404 reported by @anarcat in #357 and addressed in #358.

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
- `state` is optional. Supported non-incident states are `active`, `completed`, and `archived`.
- `severity` remains the status-impact marker. Incidents use `notice`, `disrupted`, or `down` for operational status. Records default to `none`; an active experiment with `severity: notice` shows a component/category notice without changing status.
- `pin: true` shows a record in the homepage announcement band. This is the global notice path for experiments and other operational records.
- `summary` is optional and is used in cards, JSON, and feeds when present.

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
