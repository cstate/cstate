# Plan: Make Pinned Records Work as Real Global Notices

## Problem

`pin: true` is documented as the global homepage notice path for experiments and other records, but the current homepage rendering only shows a label, title, and affected tags for pinned records. It does not show `summary` or a body excerpt.

Evidence:

- `/Users/mantas/Git/uncwo/cstate/layouts/partials/index/announcements.html:60` starts the pinned-record box.
- `/Users/mantas/Git/uncwo/cstate/layouts/partials/index/announcements.html:64` through `:75` renders label, title, and affected tags only.
- `/Users/mantas/Git/uncwo/cstate/layouts/partials/skins/modern/index/announcements.html:49` starts the modern pinned-record box.
- `/Users/mantas/Git/uncwo/cstate/layouts/partials/skins/modern/index/announcements.html:53` through `:63` renders label, title, and affected tags only.
- `/Users/mantas/Git/uncwo/cstate/changelog.md:75` promises that `pin: true` shows a record in the homepage announcement band.
- `/Users/mantas/Git/uncwo/cstate/README.md:279` describes `pin: true` as a global homepage notice.

This creates a product mismatch: a pinned experiment is technically present, but it does not yet feel like a meaningful homepage notice.

## Product stance

Experiments should not alter operational status. A pinned experiment should explain what is happening globally, using `summary` first and a short body excerpt only when no summary exists.

## Proposed implementation

1. In classic and modern announcement partials, render a compact record summary for `$pinnedRecords`.
2. Prefer `.Params.summary`.
3. Fall back to a short content excerpt.
4. Keep the visual hierarchy below incidents and active operational issues.
5. Preserve the label/tag treatment so users understand that this is a record notice, not downtime.

## Acceptance criteria

- A pinned experiment with `summary` displays that summary on the homepage.
- A pinned experiment does not affect component `status`, category status, or `summaryStatus`.
- A pinned experiment still appears as a component/category experiment notice only when `severity: notice`.
- Classic and modern skins behave consistently.
- `scripts/verify-record-sections.mjs` asserts that generated homepage HTML includes pinned experiment summary text from example content.

## Risk

Low code risk, medium product risk. Too much copy in the announcement band can make experiments feel like outages. Keep the text short and visually separate from incident severity.
