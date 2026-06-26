# Changelog

## v7.0

### Added

- Added skins, with the new `modern` skin becoming the default experience for cState sites. This is a complete redesign for default users, while `classic` remains available for sites that want the old minimal look.
- Added operational record content types beyond incidents: experiments, release notes, changelog entries, roadmap updates, eval reports, agent run reports, decision records, and research notes.
- Added archetypes, example content, record list/detail templates, JSON output, RSS output, and Atom output for the new record sections.
- Added Atom feed support alongside RSS feeds. cState now generates Atom feeds with the `application/atom+xml` media type and exposes Atom feed links in feed discovery and subscribe UI. Thanks to @ghost for the suggestion in #341.
- Redesigned and gave more attention to the cState marketing website. Visit it at https://cstate.uncascade.com.

### Changed

- Reworked the default site presentation around the new modern skin, including status summary, incidents, components, tabs, footer, issue detail pages, and subscribe UI.
- Expanded the API/index JSON output so operational records can be consumed alongside incident and component data.
- Updated README positioning around operational publishing from Markdown, humans, and AI agents.
- Updated the example Hugo config and templates for Hugo v0.158.0+: use `locale` instead of `languageCode`, and `.Site.Language.Locale` instead of `.Site.LanguageCode`.

### Upgrade notes

- Existing sites that stay on older Hugo versions can keep their old `languageCode` config.
- If you upgrade the Hugo dependency to v0.158.0 or later, regardless of which cState version you are on, update your site config from `languageCode` to `locale` to avoid Hugo deprecation warnings. Upgrading cState at the same time is recommended so the theme templates use Hugo's new language APIs too.

### Fixed

- Fixed unreadable text selection colors in dark mode by adding a dedicated high-contrast dark-mode selection style. Reported by @bbhtt in #353 and addressed in #354.

## How to use the new features

### Operational Records

cState now supports first-class operational records in addition to incident posts. Incidents remain in `content/issues` and continue to drive the homepage status summary. The new record types are for durable updates that should be published, searched, linked, and consumed through static feeds without implying downtime.

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
state: active
affected:
  - API
summary: Testing a search relevance update with a limited traffic slice.
---
```

Frontmatter fields:

- `title` and `date` are the main required fields.
- `recordType` is optional when the record is in one of the standard sections; cState infers it from the folder.
- `affected` links the record to existing systems/components. For non-incidents this is shown as related context, not downtime.
- `state` is optional. Supported non-incident states are `active`, `completed`, and `archived`.
- `summary` is optional and is used in cards, JSON, and feeds when present.

Behavior rules:

- Only incidents in `content/issues` affect the default `ok`, `notice`, `disrupted`, or `down` status rollup.
- Active experiments and other active records can appear next to related components as active records, but they do not change component health.
- Existing `informational: true` issue posts continue to work.
- Existing incident fields such as `resolved`, `resolvedWhen`, `severity`, and `affected` remain supported.

Experiment records specifically support the Tor Project use case from #288: they can be marked active, attached to affected systems, rendered with experiment-specific wording, and shown as related activity without calling the experiment an outage.

Example Hugo commands:

```bash
hugo new experiments/2026-05-09-search-rollout.md
hugo new release-notes/2026-05-08-notification-settings.md
hugo new agent-runs/2026-05-04-codex-docs-pass.md
```
