# Shared TypeScript configuration compatibility

Status: Pending consumer integration. Module: [`internal-packages/typescript-config`](../../../../internal-packages/typescript-config).

Verify new source imports and public declaration contracts without changing unrelated compiler behaviour.

## Prerequisites

- [Public i18n runtime and workspace bootstrap](01-public-runtime.md).

Namespace ownership: **none**. [Source inventory](../inventories/28-typescript-config.md)

## Files and surfaces to inspect

- `internal-packages/typescript-config/base.json`
- `internal-packages/typescript-config/package.json`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Check workspace source `.ts` exports, bundler resolution and public runtime declarations against the existing TypeScript 7 setup.

2. Keep this catalog package's erasable Node-native TS test configuration local unless another module has the same need.

3. Ensure no package emits references to private source types that external consumers cannot resolve.

4. Avoid a monorepo-wide compiler-option change merely to make one i18n helper compile; fix its package boundary first.

## Acceptance checks

- [ ] Public consumer declaration fixtures work under supported module resolution.
- [ ] A source-only private package remains typecheckable without emitting artifacts.
- [ ] Unrelated packages retain their existing compiler semantics.

## Boundaries

No UI strings belong in compiler configuration.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
