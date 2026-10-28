# Storybook localisation coverage

Status: Pending consumer integration. Module: [`packages/storybook`](../../../../packages/storybook).

Make standalone component stories a dependable visual and interaction harness for localisation.

## Prerequisites

- [Shared component messages and accessibility](04-components.md).
- [Shell configuration and definition integration](06-shell.md).
- [Shared property editors and forms](07-editors.md).
- [Public editor facade and browser distribution](19-manifest-editor.md).

Namespace ownership: **story titles stay developer-facing unless explicitly needed**. [Source inventory](../inventories/22-storybook.md)

## Files and surfaces to inspect

- `packages/storybook/src`
- `packages/storybook/.storybook (inspect actual configuration)`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Add shared-runtime decorators with selectable locale/profile and one immutable catalog snapshot per story/provider.

2. Add pseudo-locale, long-text, RTL, missing-translation and async-load failure variants for important controls.

3. Create explicit stories for definition labels, destructive confirmations, rich messages, date widgets and portals.

4. Add a two-editor isolation story and an unsaved-form switching interaction.

5. Keep fixture content language maps separate from the UI locale control.

## Acceptance checks

- [ ] Stories run without the full web application and still resolve translated metadata.
- [ ] Pseudo/RTL stories expose overflow, direction and accessible-name failures.
- [ ] Tests verify state preservation rather than snapshotting every translated string.

## Boundaries

Story titles, test descriptions and assertion fixtures are not automatically application translations.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
