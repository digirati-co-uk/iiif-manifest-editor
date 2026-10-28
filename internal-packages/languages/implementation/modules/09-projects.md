# Project and draft controls

Status: Pending consumer integration. Module: [`packages/projects`](../../../../packages/projects).

Localise project controls while keeping stored titles, filenames and backend state stable.

## Prerequisites

- [Public i18n runtime and workspace bootstrap](01-public-runtime.md).
- [Shared component messages and accessibility](04-components.md).

Namespace ownership: **projects and common**. [Source inventory](../inventories/09-projects.md)

## Files and surfaces to inspect

- `packages/projects/src/components/AppMenu.tsx`
- `packages/projects/src/components/DraftTitleEditor.tsx`
- `packages/projects/src/ProjectContext.tsx`
- `packages/projects/src/helpers`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Migrate app-menu actions, draft-title form labels, confirmations, empty/error states and fallback display text.

2. Separate a displayed Untitled fallback from a persisted project title; do not rename existing projects on locale changes.

3. Keep ensure-unique-filename and backend/storage keys deterministic and independent of translated display labels.

4. Use serialisable descriptors for user-facing backend failures only where the public API can support them; preserve diagnostic codes.

## Acceptance checks

- [ ] Project titles and exported filenames do not change when switching UI language.
- [ ] Draft title edits survive a locale switch.
- [ ] Storage round-trips match previous formats.

## Boundaries

Project data is content, not a translation resource.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
