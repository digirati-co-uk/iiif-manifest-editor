# Client vault language boundary

Status: Pending consumer integration. Module: [`packages/client-vault`](../../../../packages/client-vault).

Keep the vault language-neutral and classify the small number of candidate errors/display fallbacks.

## Prerequisites

- [Public i18n runtime and workspace bootstrap](01-public-runtime.md).

Namespace ownership: **none by default**. [Source inventory](../inventories/24-client-vault.md)

## Files and surfaces to inspect

- `packages/client-vault/src`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Review each candidate and classify it as developer error, UI-facing fallback or authored data.

2. Keep core resource operations, events, identifiers, caches and serialization independent of UI locale.

3. If a failure reaches users, return a stable error code/context and translate its presentation in the owning UI module.

4. Avoid adding the React runtime or catalog package as a dependency unless a genuinely public display contract requires a type-only reference.

## Acceptance checks

- [ ] Vault load/mutation/export tests produce identical results with different UI settings.
- [ ] No UI locale enters persisted vault data or cache keys.
- [ ] Any user-facing error has a translatable presentation owner.

## Boundaries

Zero translated messages can be the correct outcome for a data-layer module.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
