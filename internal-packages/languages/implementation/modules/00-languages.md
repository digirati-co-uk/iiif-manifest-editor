# Language catalog foundation

Status: Implemented foundation; seed coverage only. Module: [`internal-packages/languages`](../../../../internal-packages/languages).

Maintain the independent data and policy layer implemented in this package, and complete reviewed catalogs as consumer modules are migrated.

## Prerequisites

No other consumer migration is required.

Namespace ownership: **all built-in namespaces**. No automatic source inventory is needed for this task.

## Files and surfaces to inspect

- `internal-packages/languages/src/schema.ts`
- `internal-packages/languages/src/validation.ts`
- `internal-packages/languages/src/composition.ts`
- `internal-packages/languages/src/selection.ts`
- `internal-packages/languages/src/loaders.ts`
- `internal-packages/languages/src/messages.ts`
- `internal-packages/languages/src/catalogs.ts`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Keep semantic IDs stable while expanding each namespace from the linked consumer inventories. Treat the current 264 messages as seed coverage, not application completeness.

2. Add whole-message profile variants and translator notes where an action needs plainer wording; use the exhibition/profile intersection only for the same underlying action.

3. Add a real second locale only after review by a speaker. Declare its locale metadata and namespace loaders, validate its own plural categories, and keep incomplete locales out of deployment availability.

4. Extend the contract validator and typed message helper together if formatter syntax, ordinal plurals or additional interpolation syntax is introduced. Do not silently accept syntax the type layer cannot understand.

5. Maintain pseudo-locale QA and tests for validation, selection, immutable composition, ownership, async races and compatibility. Run the package's test/typecheck/validate scripts without changing consumers.

## Acceptance checks

- [ ] All seed namespace/profile/preset combinations and pseudo-catalogs validate.
- [ ] New locale coverage is assessed against required namespaces without counting fallback English.
- [ ] Importing the root API loads no locale catalogs, React context or global translation engine.

## Boundaries

No application integration or IIIF content mutation belongs in this task.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

The task guides and inventories live here intentionally. Runtime and consumer tasks below remain pending.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
