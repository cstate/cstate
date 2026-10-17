# Execution contract

Current release contract (2026-10-17): commit and push all four v7 worktrees with plain Git, verify their exact pushed commits in remote CI, fix failures, and publish `v7-r1` as a prerelease with stable/latest promotion disabled. No master/v6.0.2/example or ticket mutations. Preserve remote history; never force-push. Earlier unpublished-work constraints below are historical.

Stabilization completion: all listed findings are implemented with regression coverage and final verification recorded in plans.md and documentation.md. Preserve dirty work. Keep v7 unpublished and do not push or post comments.

Current scope: finish the containers and optional MonitorBot backend checklist in `plans.md`. Preserve dirty work and keep v7 unpublished; do not mutate tickets, master, 6.0.2, or cstate/example. API tests use loopback servers and fake publishing providers. Validate actual container startup on both architectures before claiming completion.

Implement the cState v7 ecosystem reliability plan end to end.

## Non-negotiable behavior

- Do not stop after each milestone for confirmation when the scope is already clear.
- Treat `plans.md` as authoritative; update it when evidence changes the approach.
- Preserve all pre-existing dirty-worktree changes and adapt patches around them.
- Run milestone verification immediately and fix failures before moving on.
- Add a failing regression test before a bug fix when practical.
- Keep `documentation.md` and `changelog.md` synchronized with actual behavior.
- Use browser screenshots after every meaningful visual change and verify desktop plus mobile before completion.

## Completion criteria

- All eight milestones are complete or explicitly descoped with a concrete external blocker.
- Theme, CLI, MonitorBot, and embed validations pass from their repository roots.
- Generated JSON, XML, JavaScript, and ICS artifacts validate.
- The default generated page has no Google Fonts request.
- Pinned notices, scheduled experiments, availability, history limits, localization, and embed behavior match the acceptance criteria.
- Final desktop/mobile screenshots have been inspected.
- `plans.md`, `documentation.md`, and `changelog.md` describe the shipped result rather than the original intent.
