# OCR classification plugin

Status: Pending consumer integration. Module: [`plugins/ocr-classification`](../../../../plugins/ocr-classification).

Localise classification settings, progress and result rendering while keeping model/protocol data stable.

## Prerequisites

- [Shell configuration and definition integration](06-shell.md).

Namespace ownership: **plugin-ocr-classification**. [Source inventory](../inventories/15-plugin-ocr-classification.md)

## Files and surfaces to inspect

- `plugins/ocr-classification/src`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Register metadata/settings catalogs and migrate action/configuration/result UI.

2. Translate statuses and explanations through message descriptors; leave model IDs, classification output identifiers and worker messages machine-readable.

3. Replace implicit-locale NumberFormat usage with the chosen UI locale for displayed numbers.

4. Keep content-language detection and model/language options independent from selectable UI locales.

5. Make worker/runtime errors map to stable codes plus translatable summaries, retaining raw diagnostics where useful.

## Acceptance checks

- [ ] Model selection and classification results are identical under different UI locales.
- [ ] Progress, accessible names and formatted counts use the UI locale.
- [ ] The plugin handles a missing locale catalog through the configured fallback.

## Boundaries

No translation engine should be required in the inference worker.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
