# Plan: Make html-embed Use v7 Record Context Better

> Implemented on 2026-07-18. Retained as the original problem statement.

## Problem

html-embed is compatible with v7, but it consumes only a thin slice of the new model. `dialog.js` reads `summaryStatus` and checks `records` for active experiments, then shows generic copy.

Evidence:

- `/Users/mantas/Git/uncwo/cstate-extra/html-embed/dialog.js:21` through `:29` filters active records.
- `/Users/mantas/Git/uncwo/cstate-extra/html-embed/dialog.js:31` through `:41` only switches between generic alert descriptions.
- `/Users/mantas/Git/uncwo/cstate-extra/html-embed/scripts/verify-v7-api.mjs:5` through `:16` defines its own narrow v7 payload rather than using a generated cState fixture.

This is acceptable for basic compatibility, but it leaves the new v7 product value underused. Experiments can now be a precise non-outage notice; embeds still mostly say "status changed."

## Proposed implementation

1. Teach `dialog.js` to choose copy from the highest-priority active record when status is not `ok`.
2. Prefer record `summary`, then `title`.
3. Include a link to the record permalink when available; otherwise link to the status page.
4. Keep healthy pages silent even when informational records exist unless the user opts into showing notices.
5. Move the test payload to a shared v7 fixture from the theme contract.

## Acceptance criteria

- A disrupted/down incident still opens a disruption alert.
- A status page with `summaryStatus: ok` and an active experiment remains quiet by default.
- An opted-in notice mode can show active experiment copy without implying downtime.
- Tests cover both `summaryStatus` and v7 `records` behavior using a shared fixture.

## Risk

Medium product risk. Embeds live on customer sites; copy must be conservative and should not over-alert for experiments.
