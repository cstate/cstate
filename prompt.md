# cState v7 ecosystem reliability

Current objective: commit and push the complete v7 work across the theme, MonitorBot, CLI, and embed; run remote CI and repair failures; publish only the `v7-r1` GitHub prerelease. Preserve user work. Leave master, v6.0.2, cstate/example, and tickets unchanged. The following dated missions describe earlier work and their no-push restrictions are superseded by this objective. Plan before coding.

Current objective: implement the 2026-10-16 stabilization checklist in plans.md across all four v7 repositories. Preserve existing edits and keep all releases, tickets, master, and 6.0.2 unchanged. Plan before coding and verify every audited defect with a regression.

## Current mission — 2026-10-15

Finish #344 and #198 in the existing v7 worktrees. Deliver tested container artifacts and an optional MonitorBot backend with an authenticated write/control API, signed inbound webhooks, outbound integrations, and GitHub/GitLab publishing. Keep Hugo fully static and independent. Preserve all existing edits. Do not publish v7, post issue replies, change master, or change the 6.0.2 release/example repository.

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
