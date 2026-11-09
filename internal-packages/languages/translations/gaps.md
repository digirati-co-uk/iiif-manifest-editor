# Translation gaps

Snapshot: 2026-10-28T18:49:54.164Z. English source: 26 base/overlay files.

Current on-disk catalogs only, without fallback. Presence does not establish linguistic quality, source freshness, UI reachability or host registration.

| Locale | Language | Present / required | Key coverage | Missing | Invalid | English matches needing review |
| --- | --- | --- | --- | --- | --- | --- |
| cs | Czech | 2639 / 2639 | 100% | 0 | 0 | 56 |
| da | Danish | 2481 / 2481 | 100% | 0 | 0 | 102 |
| de | German | 2481 / 2481 | 100% | 0 | 0 | 108 |
| es | Spanish | 2560 / 2560 | 100% | 0 | 0 | 47 |
| fi | Finnish | 2481 / 2481 | 100% | 0 | 0 | 38 |
| fr | French | 2560 / 2560 | 100% | 0 | 0 | 135 |
| hi | Hindi | 2481 / 2481 | 100% | 0 | 0 | 20 |
| it | Italian | 2560 / 2560 | 100% | 0 | 0 | 46 |
| ja | Japanese | 2402 / 2402 | 100% | 0 | 0 | 19 |
| ms | Malay | 2402 / 2402 | 100% | 0 | 0 | 70 |
| nl | Dutch | 2481 / 2481 | 100% | 0 | 0 | 0 |
| pl | Polish | 2639 / 2639 | 100% | 0 | 0 | 40 |
| pt | Portuguese | 2560 / 2560 | 100% | 0 | 0 | 45 |
| ta | Tamil | 2481 / 2481 | 100% | 0 | 0 | 19 |
| tr | Turkish | 2481 / 2481 | 100% | 0 | 0 | 32 |
| uk | Ukrainian | 2639 / 2639 | 100% | 0 | 0 | 23 |
| zh | Chinese | 2402 / 2402 | 100% | 0 | 0 | 20 |

Coverage means required keys are present. Blank/invalid messages are counted separately; unchanged English may be a legitimate technical term and needs individual review. Required counts differ with each locale's plural rules. Plain/preset gaps are measured independently, even when base fallback exists.

## Gaps by catalog

No missing messages or invalid target catalogs found.

## Re-run

```sh
npm --prefix internal-packages/languages run translations:gaps
npm --prefix internal-packages/languages run translations:gaps -- --locale fr --locale de
npm --prefix internal-packages/languages run translations:gaps -- --format json --output translations/export/gaps.json
```

JSON includes every missing key and its current English wording, target paths, invalid contracts, exact-source terminology reviews and stale review records. Reports do not edit catalogs. Use `--check` for a nonzero exit status when gaps or outstanding reviews exist. Existing translations cannot be proven up to date after an English wording change without a stored source revision or human review. Whole-UI migration and native-speaker review remain separate checks.
