# Editor API display metadata

Status: Pending consumer integration. Module: [`packages/editor-api`](../../../../packages/editor-api).

Make property documentation, resource names, behavior labels and canvas-layout choices localisable without changing editing semantics.

## Prerequisites

- [Public i18n runtime and workspace bootstrap](01-public-runtime.md).

Namespace ownership: **editor-api**. [Source inventory](../inventories/02-editor-api.md)

## Files and surfaces to inspect

- `packages/editor-api/src/meta`
- `packages/editor-api/src/canvas-layout/geometry.ts`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Review meta/documentation, meta/behavior, meta/rights and canvas-layout/geometry against the inventory. Separate official terminology/documentation from UI hints; retain attribution and documentation URLs.

2. Add optional message references alongside display strings in API definition contracts. Keep the fallback strings available to existing consumers until they resolve references.

3. Represent displayed behavior and resource labels as UI descriptors even where current code uses InternationalString; do not repurpose user-authored IIIF language maps as catalogs.

4. Move reviewed display messages into the editor-api namespace and add plain explanations where property labels such as navDate require them.

5. Keep identifiers, IIIF property keys, geometry IDs, behavior values, rights URIs and numeric coordinate calculations stable.

## Acceptance checks

- [ ] Metadata getters and mutation APIs produce unchanged IIIF output.
- [ ] A static geometry/behavior definition resolves different display text after a locale change.
- [ ] Public declaration files have no dependency on the private language package.

## Boundaries

No React provider belongs in the editing API; translate only the display boundary.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
