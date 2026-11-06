# Integration and translation contributor documentation

Status: Pending consumer integration. Module: [`apps/docs`](../../../../apps/docs).

Document the public API and contributor workflow with examples that work outside this workspace.

## Prerequisites

- [Public editor facade and browser distribution](19-manifest-editor.md).

Namespace ownership: **documentation localisation is a separate scope**. [Source inventory](../inventories/27-docs.md)

## Files and surfaces to inspect

- `apps/docs/content`
- `apps/docs/src`
- `apps/docs/README.md`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Document locale versus wording profile versus preset versus content-language settings, including final configuration names and merge priority.

2. Publish examples for host overrides, custom locale loaders, external plugin namespaces, deferred references and runtime failure handling.

3. Explain private TypeScript authoring versus bundled public language assets, and make examples use public imports.

4. Document catalog IDs, whole-message plurals/rich tags, translator notes, source-of-truth/export rules, coverage policy and pseudo-locale checks.

5. Review Markdown/MDX/JSON content separately; a JS/TS-only inventory does not estimate translation of the documentation site itself.

## Acceptance checks

- [ ] Examples typecheck against the installed public package contracts.
- [ ] Contributors can add a message and validate its placeholders without reading implementation internals.
- [ ] Documentation clearly states which UI locales/profiles/presets are actually available.

## Boundaries

This task documents the feature; translating all documentation prose is a separately estimated project.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
