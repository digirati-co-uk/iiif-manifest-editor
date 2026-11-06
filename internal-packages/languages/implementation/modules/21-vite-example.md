# Vite external integration example

Status: Pending consumer integration. Module: [`apps/vite-example`](../../../../apps/vite-example).

Provide a small, verifiable example of the public localisation API outside Next.js.

## Prerequisites

- [Public editor facade and browser distribution](19-manifest-editor.md).

Namespace ownership: **example-owned text, optional; editor messages stay in their owners**. [Source inventory](../inventories/21-vite-example.md)

## Files and surfaces to inspect

- `apps/vite-example/src`
- `apps/vite-example/vite.config.ts`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Update the example to show one controlled locale/profile selection, optional catalog loading and a host wording override.

2. Use public editor/runtime imports, not private workspace source paths, in the documented consumer example.

3. Demonstrate two editors with independent selections if practical, and ensure switching does not reset forms.

4. Document required CSS, optional locale asset paths and fallback handling.

5. Validate against CI-produced published artifacts as well as workspace development links.

## Acceptance checks

- [ ] The same example works with an installed package rather than monorepo aliases.
- [ ] Locale chunks load under Vite and host overrides affect only the intended editor.
- [ ] No Next.js-specific module is needed.

## Boundaries

Example wording should not become a dependency of production catalogs.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
