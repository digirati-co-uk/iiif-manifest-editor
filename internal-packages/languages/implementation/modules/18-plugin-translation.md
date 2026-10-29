# Content translation plugin interface

Status: Pending consumer integration. Module: [`plugins/translation`](../../../../plugins/translation).

Localise the translation plugin's interface while keeping machine translation, content languages and model lifecycle separate.

## Prerequisites

- [Shell configuration and definition integration](06-shell.md).
- [Shared property editors and forms](07-editors.md).

Namespace ownership: **plugin-translation**. [Source inventory](../inventories/18-plugin-translation.md)

## Files and surfaces to inspect

- `plugins/translation/src/index.ts`
- `plugins/translation/src/plugin.ts`
- `plugins/translation/src/lazy.ts`
- `plugins/translation/src/sidebar.tsx`
- `plugins/translation/src/config-modal.tsx`
- `plugins/translation/src/results.tsx`
- `plugins/translation/src/languages.ts`
- `plugins/translation/src/runtime`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Register catalogs for both eager and lazy plugin entry points; make lazy-manifest metadata localisable before the worker/runtime is loaded.

2. Migrate settings, progress, results, apply/writeback actions and language-tag maintenance UI.

3. Replace or wrap the 100 English language names with UI-locale DisplayNames plus curated/native-name fallbacks; do not change the model-supported code list.

4. Keep source/target languages, M2M100 options, worker URLs, translated resource text and writeback rules independent of interface locale/profile.

5. Map worker/protocol error codes to main-thread message descriptors; do not ship React/i18next into the translation worker.

6. Review HTML/rich text summaries and task results without feeding translated content back through UI translation lookups.

## Acceptance checks

- [ ] English UI can translate Welsh content to French; French UI can perform the same operation with identical output.
- [ ] Worker lazy-loading and cancellation work across UI language changes.
- [ ] Language names, task counts and result controls translate; authored text and language tags are preserved.

## Boundaries

The existing translation plugin is not the UI localisation engine.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
