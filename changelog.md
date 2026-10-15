# cState 6.0.2

Bug-fix backport for the v6 release line. Existing incident content, API v2 shape, and the classic interface remain supported.

- Serialize user-authored strings in every JSON endpoint so quotes, backslashes, Unicode, and line breaks remain valid JSON (#373).
- Read custom-tab URLs from the configured `link` field (#372).
- Keep the baseURL subdirectory in the homepage incident-history link (#374).
- Group monthly incident archives by both year and month, and honor `incidentMaxAgeYears` consistently with yearly archives (#371).
- Provide the compact incident view when Hugo renders affected-system archives, including the stricter lookup behavior in Hugo 0.164+ (#370).
- Use the new locale API on Hugo 0.158+ while retaining the legacy language API on older Hugo. New example/CMS configs use `locale` (#355).
- Resolve subscribe RSS URLs through Hugo output formats so trailing baseURL slashes do not create broken links (#357).

Existing sites using `languageCode` can keep it on older Hugo. When upgrading to Hugo 0.158+, rename that config key to `locale` to remove the config warning. This release does not require upgrading Hugo just to obtain the other fixes.

Run the isolated generated-output checks from the theme repository:

```bash
node scripts/verify-bugfixes.mjs
HUGO_BIN=/path/to/another/hugo node scripts/verify-bugfixes.mjs
```

The backport has been checked with Hugo 0.80.0, 0.101.0, 0.158.0, and 0.167.0. It does not include v7 record types, skins, Atom feeds, reporting tools, or container-release changes.
