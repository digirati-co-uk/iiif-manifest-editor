# Docling OCR plugin

Status: Pending consumer integration. Module: [`plugins/ocr-docling`](../../../../plugins/ocr-docling).

Localise Docling controls and feedback without changing OCR content or writeback.

## Prerequisites

- [Shell configuration and definition integration](06-shell.md).

Namespace ownership: **plugin-ocr-docling**. [Source inventory](../inventories/16-plugin-ocr-docling.md)

## Files and surfaces to inspect

- `plugins/ocr-docling/src`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Register plugin-owned catalogs and references for metadata, settings and actions.

2. Migrate language/options inputs, OCR progress, result review, apply controls, errors and empty states.

3. Replace fragment-built file/page counts with plural messages; keep URLs, model options and worker protocol data unchanged.

4. Treat extracted text, annotation bodies and selected OCR content languages as authored/output data.

5. Represent user-facing worker errors with stable codes and serialisable UI descriptors at the main-thread boundary.

## Acceptance checks

- [ ] Running and applying OCR produces unchanged annotation content and language tags.
- [ ] Second-locale UI covers configuration and result review, not only the menu label.
- [ ] Worker loading/execution remains independent of React and i18next.

## Boundaries

OCR source/target content language is not the UI locale.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
