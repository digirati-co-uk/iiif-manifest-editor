# Resource creator forms

Status: Pending consumer integration. Module: [`packages/creators`](../../../../packages/creators).

Localise creator selection, resource forms, validation and progress without changing created content.

## Prerequisites

- [Creator API message contracts](03-creator-api.md).
- [Shell configuration and definition integration](06-shell.md).
- [Shared property editors and forms](07-editors.md).

Namespace ownership: **creators and common**. [Source inventory](../inventories/08-creators.md)

## Files and surfaces to inspect

- `packages/creators/src/ContentResource`
- `packages/creators/src`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Resolve creator-definition references in picker cards, headings and configuration controls; preserve the old English fallback contract.

2. Migrate image-service, URL, thumbnail, canvas, manifest, collection and web-page creator forms, including submit errors and preview alt text.

3. Turn count/size/result sentences into whole messages while retaining numeric values and machine-formatted URLs/service identifiers.

4. Keep empty authored label defaults and intentional template text separate from UI copy. Decide their content-language behaviour before any translation.

5. Add profile-specific messages for shared canvas actions without replacing every occurrence of Canvas globally.

## Acceptance checks

- [ ] Creator validation and accessible names change with UI locale.
- [ ] Created manifests/canvases and content-language defaults match existing behaviour.
- [ ] Changing language during image/service loading does not discard form state.

## Boundaries

Translate the form around a resource, not its fetched IIIF labels or service metadata.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
