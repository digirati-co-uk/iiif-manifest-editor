# Canvas label generator plugin

Status: Pending consumer integration. Module: [`plugins/canvas-label-generator`](../../../../plugins/canvas-label-generator).

Localise the generator's interface while preserving the deliberately generated content labels.

## Prerequisites

- [Shell configuration and definition integration](06-shell.md).

Namespace ownership: **plugin-canvas-label-generator**. [Source inventory](../inventories/14-plugin-canvas-label-generator.md)

## Files and surfaces to inspect

- `plugins/canvas-label-generator/src`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Register plugin metadata, settings, action labels and catalogs with the shared runtime.

2. Migrate config controls, examples, previews, validation, result summaries and task logs intended for users.

3. Replace suffix-built counts with plural messages and use meaningful placeholder names.

4. Keep the label pattern, output numbers, content language and actual generated canvas labels independent of the interface locale. Any new content-language feature is a separate decision.

5. Exercise lazy plugin loading and fallback while generation is running.

## Acceptance checks

- [ ] The same input pattern produces the same IIIF labels under different UI languages.
- [ ] Counts and error messages change correctly without changing generated content.
- [ ] A running task is unaffected by locale/profile changes.

## Boundaries

This plugin intentionally writes content; translated UI must not silently alter that writeback.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
