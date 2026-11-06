# Catalog quality gates and publishing

Status: Pending consumer integration. This task creates a new runtime or changes repository-level integration.

Make translation and package-boundary correctness part of the release process.

## Prerequisites

- [Public editor facade and browser distribution](19-manifest-editor.md).
- [End to end localisation acceptance](23-playwright.md).
- [Integration and translation contributor documentation](27-docs.md).

Namespace ownership: **validation and ownership policy**. No automatic source inventory is needed for this task.

## Files and surfaces to inspect

- `package.json`
- `pnpm-lock.yaml`
- `turbo.json`
- `.github/workflows`
- `package publication configuration`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Register all new workspace dependencies/importers and CI tasks after cross-workspace changes are authorized. The current package-only change intentionally does not update the root lockfile.

2. Add catalog validation, type-contract tests and placeholder/plural checks to the existing CI graph. Keep generated extraction output apart from manually authored overlays.

3. Ratchet hardcoded-string checks by migrated module; require explicit review of exemptions instead of treating a declining heuristic count as completeness.

4. Validate ESM/CJS/browser package artifacts and optional locale chunks in external install fixtures; fail unresolved private dependencies or duplicate-provider integration.

5. Integrate this package's validated JSON export/import tools into the translation review workflow, preserving TypeScript as the authoritative source. Add separate profile/preset or platform exchange where needed; do not import merged overlay snapshots as base catalogs.

6. Gate advertised locale/profile/preset combinations on required-message coverage, accessibility and integration tests. Document fallback and release ownership.

## Acceptance checks

- [ ] CI fails malformed placeholders, missing required plural forms and private dependencies in public artifacts.
- [ ] Translation-only changes do not trigger unrelated content migrations.
- [ ] Every advertised combination maps to a verified required-namespace set.

## Boundaries

Use existing CI builds/artifacts; do not run local package builds while AGENTS.md forbids them.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
