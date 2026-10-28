# Shared component messages and accessibility

Status: Pending consumer integration. Module: [`packages/components`](../../../../packages/components).

Localise reusable controls and definition renderers while keeping the runtime dependency below shell.

## Prerequisites

- [Public i18n runtime and workspace bootstrap](01-public-runtime.md).
- [Editor API display metadata](02-editor-api.md).
- [Creator API message contracts](03-creator-api.md).

Namespace ownership: **components and common**. [Source inventory](../inventories/04-components.md)

## Files and surfaces to inspect

- `packages/components/src/CreatorGrid.tsx`
- `packages/components/src/BackgroundActionsMenu.tsx`
- `packages/components/src/DownloadButton.tsx`
- `packages/components/src/ErrorMessage.tsx`
- `packages/components/src/ManifestOverviewEmptyState.tsx`
- `packages/components/src/SidebarTabs.tsx`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Resolve message references where components display creator, editor, panel and task metadata; accept plain-string fallbacks from old callers.

2. Replace component-owned defaults with common/actions or components messages. Continue displaying caller-supplied children and authored resource text as supplied.

3. Translate icon-button accessible names, tooltips, empty states, progress and error-boundary UI alongside visible text.

4. Review language/direction for tooltips, menus and portals, and use logical CSS properties where needed without mirroring canvas coordinates.

5. Document the direct-use provider/fallback behaviour for consumers that render components outside the full editor.

## Acceptance checks

- [ ] Standalone and full-editor components render under the same public runtime provider.
- [ ] Accessible names change with locale and remain specific to their action.
- [ ] A translated control preserves click/keyboard/selection behaviour and authored labels.

## Boundaries

Do not move the provider into this package if that would create a second context or a dependency on shell.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
