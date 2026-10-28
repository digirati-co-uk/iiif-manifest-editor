# Server vault language boundary

Status: Pending consumer integration. Module: [`packages/server-vault`](../../../../packages/server-vault).

Keep server storage and transport neutral while identifying any user-facing errors at the HTTP/UI boundary.

## Prerequisites

No other consumer migration is required.

Namespace ownership: **none by default**. [Source inventory](../inventories/25-server-vault.md)

## Files and surfaces to inspect

- `packages/server-vault/src`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Review errors and endpoint responses manually even if the heuristic inventory has no candidates.

2. Retain stable diagnostic/error codes and protocol data; translate only at a boundary that has an explicit request locale policy.

3. Do not introduce browser language detection, React providers or a mutable process-global locale into server vault operations.

4. Keep authored IIIF language maps and server cache keys unchanged.

## Acceptance checks

- [ ] Concurrent requests with different UI locales cannot affect each other's stored or returned IIIF data.
- [ ] Existing server-vault checks remain valid without locale initialization.
- [ ] User-visible errors, if any, have an explicit boundary owner.

## Boundaries

A module with no UI does not need an i18n runtime dependency.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
