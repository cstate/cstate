# cState v7 Ecosystem Audit

Planned at: cState `4359909`, cstate-cli `2298a83`, monitorbot `2a54b2b`, html-embed `045c810`

## Current read

The old v7 gaps around experiment authoring are mostly handled now. The theme builds, the RSS double-slash bug is fixed through Hugo output formats, Decap can write `recordKind`, `severity`, and `pin`, the CLI can create experiment records with notice/global fields, and MonitorBot can emit `content/experiments` records.

The remaining product risk is ecosystem reliability: v7 has a richer contract, but that contract is still duplicated across the theme, Decap, CLI, MonitorBot, and embeds. A few runtime/deployment paths and docs are still sharp enough to create failed first installs or weak global notices.

## Highest-priority plans

1. `001-pinned-record-notice-surface.md` - make `pin: true` records feel like real global notices, not only linked titles.
2. `002-monitorbot-runtime-hardening.md` - fix MonitorBot deployment/runtime paths that can fail outside the tested local Markdown generator.
3. `003-shared-v7-contract-and-ci.md` - add a shared v7 fixture/schema contract and CI coverage across sister repos.
4. `004-docs-and-config-drift.md` - remove stale docs and config mismatches before release.
5. `005-embed-record-context.md` - make html-embed consume v7 record context more usefully.

## Verification already run

```bash
hugo --config=exampleSite/config.yml --theme=../ --contentDir=exampleSite/content --destination /tmp/cstate-v7-build
node scripts/verify-record-sections.mjs
xmllint --noout /tmp/cstate-v7-build/index.xml /tmp/cstate-v7-build/index.atom /tmp/cstate-v7-build/records/index.xml /tmp/cstate-v7-build/records/index.atom
```

```bash
cd /Users/mantas/Git/uncwo/cstate-extra/html-embed && npm test
cd /Users/mantas/Git/uncwo/cstate-extra/monitorbot && npm test
```

`cstate-cli` tests were not rerun in this pass because `node_modules` is not installed locally and this audit did not mutate source trees outside `plans/`.
