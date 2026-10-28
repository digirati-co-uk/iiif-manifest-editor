# Manifest preset workflows

Status: Pending consumer integration. Module: [`presets/manifest-preset`](../../../../presets/manifest-preset).

Ship the first complete manifest-editing journey with accurate locale/profile availability.

## Prerequisites

- [Shell configuration and definition integration](06-shell.md).
- [Shared property editors and forms](07-editors.md).
- [Resource creator forms](08-creators.md).

Namespace ownership: **manifest plus shared namespaces**. [Source inventory](../inventories/10-manifest-preset.md)

## Files and surfaces to inspect

- `presets/manifest-preset/src/index.tsx`
- `presets/manifest-preset/src/left-panels`
- `presets/manifest-preset/src/center-panels`
- `presets/manifest-preset/src/av-ranges`
- `presets/manifest-preset/src/plugins`
- `presets/manifest-preset/src/bulk-thumbnail-builder`
- `presets/manifest-preset/src/context-menus.tsx`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Declare required namespaces for shell, shared forms, manifest workflow and each enabled plugin. Advertise only combinations meeting the deployment's coverage policy.

2. Convert static panel definitions, context menus and preview/onboarding metadata to deferred references.

3. Migrate canvas/range/tag lists and workbenches, including destructive confirmations, plural counts, selection summaries and empty states.

4. Migrate AV ranges, thumbnail background actions, remote inference and quality-check plugins embedded in this preset. Give independently registered plugins unique namespaces or explicit ownership within manifest.

5. Add plain wording for whole messages involving pages/items/sections, including accessibility text. Retain stable Canvas/Range IDs and protocol values.

6. Review numeric formatting: UI ratios/counts may use locale formatting; temporal selectors and machine-formatted timestamps must remain protocol compliant.

## Acceptance checks

- [ ] Open, add canvas, edit metadata, build ranges, run an action and export under the second locale.
- [ ] Manifest/plain and inherited exhibition overrides resolve without stale labels.
- [ ] AV selectors, range identifiers and exported IIIF content remain unchanged.

## Boundaries

Treat embedded plugins as real namespaces/registration boundaries, not anonymous string tables.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
