# Preview server and external viewer boundary

Status: Pending consumer integration. Module: [`packages/iiif-preview-server`](../../../../packages/iiif-preview-server).

Separate editor UI localisation from preview transport and third-party viewer language configuration.

## Prerequisites

- [Public editor facade and browser distribution](19-manifest-editor.md).

Namespace ownership: **preview-owned UI only if present**. [Source inventory](../inventories/26-iiif-preview-server.md)

## Files and surfaces to inspect

- `packages/iiif-preview-server/src`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Audit preview HTML/status/error surfaces and distinguish them from machine responses and developer logs.

2. Keep manifest export, preview tokens, storage URLs and routing stable across UI locale changes.

3. If a built-in preview UI exists, pass an explicit request locale or static catalog to that surface; do not use process-global mutable state.

4. Pass locale to external viewers only through their documented configuration, recording that their messages are owned upstream.

5. Test request isolation and preview behaviour with an independently selected content language.

## Acceptance checks

- [ ] Preview manifests and URLs do not change because the editor's interface language changes.
- [ ] Concurrent previews do not leak locale configuration.
- [ ] Dependency viewer UI has a documented localisation/coverage boundary.

## Boundaries

Transport/server internals should not acquire a React translation dependency.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
