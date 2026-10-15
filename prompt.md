# cState v7 ecosystem reliability

Act as the senior product engineer and release owner for cState v7. Finish the release across the Hugo theme and the sibling CLI, MonitorBot, and HTML embed repositories without discarding existing uncommitted work.

## Mission

Ship a truthful, portable, localized, and testable v7 operational-record system. Fix the reviewed theme defects, harden the automation paths that publish records, make downstream consumers use the same contract, and document every bug fix and behavior change in `changelog.md`.

## Required outcomes

- Replace the current day-count “uptime” percentage with duration-based availability derived from incident overlap.
- Make `pin: true` a mode-independent homepage notice with useful summary context and no effect on operational status.
- Treat future experiments as scheduled, not running; keep the supported state model coherent across Markdown, Decap, CLI, JSON, and UI.
- Honor `incidentPostsPerPage` in the default modern combined history and preserve archive access.
- Remove the default Google Fonts request so the default theme remains self-contained and privacy-preserving.
- Route all new record, history, filter, state, empty-state, and calendar UI through Hugo i18n.
- Produce valid ICS values and safe JSON for all valid content titles and text.
- Establish the theme fixture as the canonical v7 compatibility fixture and validate it in cstate-cli, monitorbot, and html-embed.
- Fix MonitorBot FTP ESM loading, Git parent-directory creation, awaited SSL actions, and missing deployment-path behavior; add executable regression coverage.
- Let html-embed optionally show the highest-priority active record’s title, summary, kind, and permalink while keeping healthy pages quiet by default.
- Correct stale PRD, MonitorBot, configuration, README, and changelog claims.
- Verify all repositories and capture before/after desktop and mobile screenshots for the theme changes.

## Constraints

- Preserve all existing user/concurrent edits in every dirty worktree.
- Do not add descriptions to ordinary history cards. Notice context belongs in the pinned notice surface.
- Incidents alone drive `summaryStatus`; operational records never create downtime.
- Keep new dependencies to a minimum. Do not add a runtime network dependency to the default theme.
- Use Hugo 0.158.0 and Node 20-compatible JavaScript.
- Planning comes before broad implementation. Treat `plans.md` as authoritative and keep it current.

Start now. Do NOT start broad coding until `plans.md` exists and is coherent.
