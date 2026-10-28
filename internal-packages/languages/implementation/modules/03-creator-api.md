# Creator API message contracts

Status: Pending consumer integration. Module: [`packages/creator-api`](../../../../packages/creator-api).

Add deferred display metadata and translatable validation results to creator contracts without changing creator identity or resource generation.

## Prerequisites

- [Public i18n runtime and workspace bootstrap](01-public-runtime.md).

Namespace ownership: **creator-api**. [Source inventory](../inventories/03-creator-api.md)

## Files and surfaces to inspect

- `packages/creator-api/src/types.ts`
- `packages/creator-api/src/creator-register.ts`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Extend CreatorConfigField and creator definition display fields with optional message references. Retain label/summary fallbacks so old creators still register.

2. Define the shape for validation/error descriptors; keep programmer exceptions and machine-readable validation codes separate.

3. Expose an instance-bound formatter/reference transport in creator context where a task produces user-visible feedback outside React.

4. Update consumers in a later task to resolve references; no import-time formatting or global locale state.

5. Audit generated content labels and template defaults separately. A translated interface must not rewrite a resource's authored labels or change creator IDs.

## Acceptance checks

- [ ] Old creator definitions remain assignable and register without message fields.
- [ ] Validation descriptors are serialisable and preserve placeholder values.
- [ ] Creator payloads, generated IDs and default resource data remain unchanged.

## Boundaries

The runtime's public descriptor types must not introduce a dependency cycle with shell.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
