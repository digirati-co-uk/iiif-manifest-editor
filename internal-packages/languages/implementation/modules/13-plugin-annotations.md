# Annotations plugin

Status: Pending consumer integration. Module: [`plugins/annotations`](../../../../plugins/annotations).

Register and migrate the annotations plugin as an independently loadable language owner.

## Prerequisites

- [Shell configuration and definition integration](06-shell.md).
- [Shared property editors and forms](07-editors.md).

Namespace ownership: **plugin-annotations**. [Source inventory](../inventories/13-plugin-annotations.md)

## Files and surfaces to inspect

- `plugins/annotations/src/index.ts`
- `plugins/annotations/src/annotation-panel.tsx`
- `plugins/annotations/src/components`
- `plugins/annotations/src/importer`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Add catalog registration to plugin metadata/lazy loading and deferred references for the plugin label, description, panels and actions.

2. Migrate annotation listing, empty/create controls, OCR shortcuts and importer configuration/results/progress.

3. Separate annotation body text, resource labels and external importer errors from interface messages.

4. Store serialisable action/result references for text intended to change language in task history.

5. Verify the plugin works when loaded after the user's locale/profile selection and when no second-locale plugin catalog exists.

## Acceptance checks

- [ ] Import, create and inspect annotations under a second UI locale.
- [ ] Annotation bodies, targets and external labels do not get translated by the UI engine.
- [ ] Loading the plugin cannot overwrite another plugin/core namespace.

## Boundaries

The plugin remains installable without access to the private catalog package.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
