# Execution contract

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
