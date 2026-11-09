# Specifications plugin

Status: Pending consumer integration. Module: [`plugins/specifications`](../../../../plugins/specifications).

Localise report controls and explanations while preserving specification rules and user-authored guidance.

## Prerequisites

- [Shell configuration and definition integration](06-shell.md).

Namespace ownership: **plugin-specifications**. [Source inventory](../inventories/17-plugin-specifications.md)

## Files and surfaces to inspect

- `plugins/specifications/src/index.tsx`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Register plugin metadata/panel labels and migrate scope/type/status filters, counts, empty states and action controls.

2. Use translated labels for stable status and rule-type codes without changing those codes.

3. Determine which rule explanations are built-in UI text versus institution-authored specification content; translate only the former through this catalog.

4. Use complete messages for report summaries and values rather than concatenating resource names/status fragments.

5. Keep links and rule IDs stable.

## Acceptance checks

- [ ] Filtering and report evaluation are unaffected by locale.
- [ ] Status labels, plural result summaries and accessible filter names translate.
- [ ] Institution-provided rule descriptions remain as supplied.

## Boundaries

Specification validation semantics and status values are protocol data.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
