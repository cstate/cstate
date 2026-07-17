# Plan: Remove Docs and Config Drift Before v7 Release

## Problem

Several docs now disagree with the current code. These are small individually, but they undermine trust during setup.

Evidence:

- `/Users/mantas/Git/uncwo/cstate/PRD-public.md:257` says there is no visible automated test suite in the repo, but `/Users/mantas/Git/uncwo/cstate/.github/workflows/release-checks.yml:1` now defines release checks.
- `/Users/mantas/Git/uncwo/cstate/PRD-public.md:416` and `:417` still frame smoke tests as future requirements, but the branch now has a Hugo build and record verifier.
- `/Users/mantas/Git/uncwo/cstate-extra/monitorbot/README.md:216` says the default interval is 60 seconds, while `/Users/mantas/Git/uncwo/cstate-extra/monitorbot/config/config.js:20` defaults to 5 seconds.
- `/Users/mantas/Git/uncwo/cstate-extra/monitorbot/config/config-full.js:6` sets `10 * 1000` but comments `60 seconds`.
- `/Users/mantas/Git/uncwo/cstate-extra/monitorbot/README.md:237` tells GitLab pipeline users to set `runningMode`, but `/Users/mantas/Git/uncwo/cstate-extra/monitorbot/config/config.js:19` and `/Users/mantas/Git/uncwo/cstate-extra/monitorbot/index.js:45` use `runningMethod`.

## Proposed implementation

1. Update the PRD to reflect the new release-check workflow and current verification coverage.
2. Normalize MonitorBot docs and config comments around the chosen default interval.
3. Replace `runningMode` with `runningMethod` in docs.
4. Add a simple docs lint or regex test for critical config names:
   - `runningMethod`
   - `checkInterval`
   - `testMode`
   - `outputMode`
   - `recordKind`
   - `severity`
   - `pin`

## Acceptance criteria

- A user following MonitorBot README can configure cron/single mode without guessing field names.
- PRD describes the current test baseline instead of an older absence of tests.
- Config comments match actual values.
- The changelog remains the canonical release-facing summary of the v7 model.

## Risk

Low. This is documentation and test hygiene, but it should happen before public v7 messaging.
