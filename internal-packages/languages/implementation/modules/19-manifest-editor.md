# Public editor facade and browser distribution

Status: Pending consumer integration. Module: [`packages/manifest-editor`](../../../../packages/manifest-editor).

Expose localisation configuration through every published editor entry point and distribution format.

## Prerequisites

- [Shell configuration and definition integration](06-shell.md).
- [Manifest preset workflows](10-manifest-preset.md).
- [Collection preset workflows](11-collection-preset.md).
- [Exhibition presets and terminology](12-exhibition-preset.md).

Namespace ownership: **facade-owned messages use shell/common or a dedicated reviewed namespace**. [Source inventory](../inventories/19-manifest-editor.md)

## Files and surfaces to inspect

- `packages/manifest-editor/src/ManifestEditor.tsx`
- `packages/manifest-editor/src/index.ts`
- `packages/manifest-editor/src/remote`
- `packages/manifest-editor/browser`
- `packages/manifest-editor/tsdown.config.ts`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Add documented runtime catalog/loader/selection props while keeping serialisable uiI18n configuration separate from callbacks. Forward them consistently to shell/runtime.

2. Expose the shared runtime/provider/reference types from stable public subpaths where useful, without leaking private authoring imports in declarations.

3. Support optional language chunks with resolvable published export paths and host-supplied loaders. Bundle catalog data explicitly rather than leaving a private dependency external.

4. Wire remote/browser mounting APIs and configuration updates to the same instance lifecycle; keep SSR and direct React use consistent.

5. Verify ESM/CJS and browser distributions share one provider with separately installed plugins, and preserve existing English defaults.

6. Use CI-produced package artifacts for publication checks while the repository's no-local-build instruction applies.

## Acceptance checks

- [ ] Install a published artifact in an external fixture with no workspace links and switch locale/profile.
- [ ] Browser and remote entry points load locale assets and update without remounting editor state.
- [ ] Declaration files and dependency manifests contain no unresolved private package reference.

## Boundaries

Developer configuration errors and resource IDs should not be blindly extracted as UI copy.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
