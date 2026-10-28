# Translation gaps

Snapshot: 2026-10-28T18:33:12.160Z. English source: 26 base/overlay files.

Current on-disk catalogs only, without fallback. Presence does not establish linguistic quality, source freshness, UI reachability or host registration.

| Locale | Language | Present / required | Key coverage | Missing | Invalid | English matches needing review |
| --- | --- | --- | --- | --- | --- | --- |
| cs | Czech | 1948 / 2639 | 73.82% | 691 | 0 | 47 |
| da | Danish | 1888 / 2481 | 76.1% | 593 | 0 | 83 |
| de | German | 1888 / 2481 | 76.1% | 593 | 0 | 87 |
| es | Spanish | 1918 / 2560 | 74.92% | 642 | 0 | 38 |
| fi | Finnish | 1888 / 2481 | 76.1% | 593 | 0 | 33 |
| fr | French | 1918 / 2560 | 74.92% | 642 | 0 | 110 |
| hi | Hindi | 1888 / 2481 | 76.1% | 593 | 0 | 17 |
| it | Italian | 1918 / 2560 | 74.92% | 642 | 0 | 38 |
| ja | Japanese | 1858 / 2402 | 77.35% | 544 | 0 | 17 |
| ms | Malay | 1858 / 2402 | 77.35% | 544 | 0 | 60 |
| nl | Dutch | 2481 / 2481 | 100% | 0 | 0 | 0 |
| pl | Polish | 1948 / 2639 | 73.82% | 691 | 0 | 34 |
| pt | Portuguese | 1918 / 2560 | 74.92% | 642 | 0 | 34 |
| ta | Tamil | 1888 / 2481 | 76.1% | 593 | 0 | 17 |
| tr | Turkish | 1888 / 2481 | 76.1% | 593 | 0 | 26 |
| uk | Ukrainian | 1948 / 2639 | 73.82% | 691 | 0 | 21 |
| zh | Chinese | 1858 / 2402 | 77.35% | 544 | 0 | 18 |

Coverage means required keys are present. Blank/invalid messages are counted separately; unchanged English may be a legitimate technical term and needs individual review. Required counts differ with each locale's plural rules. Plain/preset gaps are measured independently, even when base fallback exists.

## Gaps by catalog

| English source | Affected locales | Missing per affected locale | Invalid issues across locales |
| --- | --- | --- | --- |
| `locales/en-GB/editors.ts` | cs, da, de, es, fi, fr, hi, it, ja, ms, pl, pt, ta, tr, uk, zh | 53–89 | 0 |
| `locales/en-GB/manifest.ts` | cs, da, de, es, fi, fr, hi, it, ja, ms, pl, pt, ta, tr, uk, zh | 343–409 | 0 |
| `profiles/plain/en-GB/manifest.ts` | cs, da, de, es, fi, fr, hi, it, ja, ms, pl, pt, ta, tr, uk, zh | 148–193 | 0 |

## Example missing keys

- `locales/en-GB/editors.ts`: `map.draw.toolbar.actions.title`, `map.draw.toolbar.actions.text`, `map.draw.toolbar.finish.title`, `map.draw.toolbar.finish.text`, `map.draw.toolbar.undo.title`, `map.draw.toolbar.undo.text`, …
- `locales/en-GB/manifest.ts`: `workflow.rangeCount_one`, `workflow.rangeCount_few`, `workflow.rangeCount_many`, `workflow.rangeCount_other`, `workflow.inferenceFailed`, `workflow.aVRanges`, …
- `profiles/plain/en-GB/manifest.ts`: `workflow.rangeCount_one`, `workflow.rangeCount_few`, `workflow.rangeCount_many`, `workflow.rangeCount_other`, `workflow.inferenceFailed`, `workflow.aVRanges`, …

## Re-run

```sh
npm --prefix internal-packages/languages run translations:gaps
npm --prefix internal-packages/languages run translations:gaps -- --locale fr --locale de
npm --prefix internal-packages/languages run translations:gaps -- --format json --output translations/export/gaps.json
```

JSON includes every missing key and its current English wording, target paths, invalid contracts, exact-source terminology reviews and stale review records. Reports do not edit catalogs. Use `--check` for a nonzero exit status when gaps or outstanding reviews exist. Existing translations cannot be proven up to date after an English wording change without a stored source revision or human review. Whole-UI migration and native-speaker review remain separate checks.
