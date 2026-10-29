# Collection preset workflows

Status: Pending consumer integration. Module: [`presets/collection-preset`](../../../../presets/collection-preset).

Localise collection navigation and embedded-resource editing independently of manifest preset readiness.

## Prerequisites

- [Shell configuration and definition integration](06-shell.md).
- [Shared property editors and forms](07-editors.md).
- [Resource creator forms](08-creators.md).

Namespace ownership: **collection plus shared namespaces**. [Source inventory](../inventories/11-collection-preset.md)

## Files and surfaces to inspect

- `presets/collection-preset/src/preset.tsx`
- `presets/collection-preset/src/left-panels`
- `presets/collection-preset/src/center-panels`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Declare collection required namespaces and effective locale/profile restrictions; do not inherit a translated status merely from the shell.

2. Convert metadata and panel definitions in preset.tsx to deferred references.

3. Migrate summary/items/overview UI, collection-item actions, no-selection messages, counts and confirmations.

4. Retain fetched manifest/collection labels and stable template/field selection identifiers as authored/protocol data.

5. Review embedded Manifest and EmbeddedCollection forms with the shared editor wording profile.

## Acceptance checks

- [ ] Add/remove/reorder collection items under a real second locale.
- [ ] Collection labels and item language maps round-trip unchanged.
- [ ] String-only custom creators and external items remain supported.

## Boundaries

Collection-specific meanings deserve their own IDs even when English resembles the manifest preset.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
