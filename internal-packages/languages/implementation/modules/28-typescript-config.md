# Shared TypeScript configuration compatibility

Status: Source-workspace compatibility review complete; emitted declaration/tarball acceptance pending the permitted release build. Module: [`internal-packages/typescript-config`](../../../../internal-packages/typescript-config).

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

- [x] Public source consumer fixtures work under the shared Bundler resolution using the real package exports, including React, core, Dutch and external plugin contracts.
- [ ] Actual emitted consumer declarations work under Bundler and Node16/NodeNext resolution with the private workspace absent (requires release artifacts; no substitute declarations created).
- [x] A source-only private package remains typecheckable without emitting artifacts.
- [x] Unrelated packages retain their existing compiler semantics; all four shared configuration JSON files are unchanged.

## Boundaries

No UI strings belong in compiler configuration.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.

## Implementation evidence — 28 October 2026

Reviewed all files in `internal-packages/typescript-config`, the complete supporting-source inventory, guides 01/02/03, the actual TypeScript 7.0.2 configuration/exports, and the public runtime's root/core/Dutch entry implementations and private authoring configuration. This is a language-neutral infrastructure module: no semantic IDs, namespaces, UI migrations, catalog changes or translator exemptions. Authored IIIF content, protocol data, editing state, undo and worker transport are untouched. No ponytail skill was available in the provided skill catalog or local skill roots.

### Policy and package boundaries

No shared compiler change is warranted. `base.json` keeps ES2022, strict checking and Bundler resolution. Library configs keep declarations/maps without imposing `noEmit`; React and Next.js settings are unchanged. The languages package's stronger Node-native authoring options remain local.

The public runtime resolves direct source exports in this checkout. Its private implementation reaches `.ts` helper imports. Each downstream **source-checking** configuration that traverses this graph must locally allow TypeScript import extensions and run with `--noEmit`. Existing i18n, creator-api, components and ui configurations already opt in. Hosts/plugins reaching this source graph as they migrate need the same checking policy; do not propagate the private authoring package's other options or globally switch compiler semantics. Without the local allowance, the focused core fixture fails with only TS5097 import-extension diagnostics. The fixture with the allowance passes. The test runner always supplies `--noEmit`; it never tests an emitting workaround.

NodeNext is not compatible with the current runtime's extensionless relative **source** imports: the negative source fixture produces TS2835 in `packages/i18n/src/core.ts` (among other dependent diagnostics). This says nothing about future emitted `.js`/`.cjs` entry points. Supported workspace resolution remains Bundler. External release consumers must later test real ESM/CJS declarations and JS exports under their relevant resolutions.

Public `types.ts` owns its contracts without private imports. Public factory/helper returns and React signatures use explicit public types; default locale metadata infers only literal/primitive object shapes. `/nl` exports explicit public `ResourceStore` annotations. The bounded source-signature guard checks these current entry implementation files for private imported symbols in exported signatures/inferred initializers and private re-exports. The runtime package manifest has languages only in development dependencies. No concrete private type leak was found in the inspected public source API; no package-boundary source edit is requested. This guard is intentionally **not** proof of generated declaration independence or bundler output.

The core/Dutch `--listFiles` graph includes the real private schema (so the import-extension case is exercised) and excludes the React provider, React types and react-i18next. This is source graph evidence for the server/task entry, not validation of emitted RSC directives. Actual publication artifacts, private-helper inlining, emitted declarations, installed plugin context identity and RSC outputs remain module 29/release checks.

### Added repeatable evidence

`test/compatibility.test.mjs` creates a temporary consumer inside this module, links real runtime/React packages and React types, and imports the package's real source exports without paths overrides. It removes the temporary files afterward. `test/fixtures/consumer.tsx` exercises providers, hooks, rich component mappings, deferred references, locale setters and external open namespace/key contracts, including rejection of nested IIIF/React interpolation values. `test/fixtures/core.mts` checks synchronous options, Dutch/profile/preset resource stores and async plugin registrations/loaders. No synthetic `.d.ts`, publication artifact or fake public signature is created. A package-local test script and README document how to repeat the checks.

### Actual checks and limits

All commands ran from repository root with Node **v24.21.0**. Dependency setup was `pnpm install --ignore-scripts --frozen-lockfile`; it succeeded without lockfile changes or lifecycle hooks.

- `npm --prefix internal-packages/typescript-config test`: six passing checks covering real source/API consumers, source graph, expected missing-allowance and NodeNext failures, shared semantics, and bounded private-signature review.
- `node node_modules/typescript/bin/tsc --noEmit -p internal-packages/languages/tsconfig.json`: passed, retaining its local Node-native authoring semantics.
- `node node_modules/typescript/bin/tsc --noEmit -p packages/i18n/tsconfig.json`: passed.
- `node node_modules/typescript/bin/tsc --noEmit -p packages/editor-api/tsconfig.json`: passed.
- `node node_modules/typescript/bin/tsc --noEmit -p packages/creator-api/tsconfig.test.json`: passed using its existing editor-api source mapping.
- `node --test internal-packages/languages/test/*.test.mjs`: 68 passed.
- `npm --prefix internal-packages/languages run translations:check`: passed; 26 Dutch files, 714 required messages, zero missing or unreviewed unchanged English strings. No catalog was modified.
- Targeted oxlint, oxfmt and `git diff --check`: passed for the added fixtures/test and owned changes.

The additional ordinary creator-api check (`node node_modules/typescript/bin/tsc --noEmit -p packages/creator-api/tsconfig.json`) fails in this clean, unbuilt checkout: its existing editor-api package entry points require absent output declarations (TS2307), with resulting TS7006/TS2322 diagnostics. Its existing source-mapped test configuration passes. This is an existing clean-workspace/publication boundary, not a shared compiler regression; parent should use the source-mapped check until real artifacts are permitted. No consumer files were edited and no legacy UI diagnostics were repaired.

No build, prepack, package emit, server start/stop/restart, browser integration, push or PR was performed. Parent owns the browser checks on the main checkout. Acceptance remains explicitly pending for emitted artifacts; passing source tests must not be reported as a successful tarball/declaration release check.
