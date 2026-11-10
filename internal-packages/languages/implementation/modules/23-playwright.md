# End to end localisation acceptance

Status: Pending consumer integration. Module: [`packages/playwright`](../../../../packages/playwright).

Cover complete translated journeys and update page objects without making tests locale-fragile.

## Prerequisites

- [Public editor facade and browser distribution](19-manifest-editor.md).
- [Web host locale preferences and application UI](20-web.md).

Namespace ownership: **no catalog ownership**. [Source inventory](../inventories/23-playwright.md)

## Files and surfaces to inspect

- `packages/playwright/src/pom`
- `packages/playwright/src/tests`
- `packages/playwright/README.md`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Define a small matrix: default English regression, a real second locale, plain wording, pseudo-locale and an advertised RTL locale.

2. Update page objects to select stable roles/test IDs or intentional translated accessible names; do not translate every fixture/assertion string mechanically.

3. Cover manifest and collection editing, exhibition onboarding, plugin lazy loading, task results, dialogs and keyboard operation.

4. Add invariants for unchanged IIIF exports, content languages, undo/form state and two-editor isolation.

5. Use the existing running server at port 3000; do not invoke test commands that auto-build packages or restart it without resolving repository instructions.

## Acceptance checks

- [ ] A complete user journey passes per supported preset and selected locale/profile policy.
- [ ] Race/error fallback tests preserve previous UI and editing state.
- [ ] Default-language regressions remain covered by existing meaningful checks.

## Boundaries

Test fixtures and snapshots are evidence, not UI catalog sources.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
