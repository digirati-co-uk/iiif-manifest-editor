# Public i18n runtime and workspace bootstrap

Status: Runtime implemented and source-tested. Parent application and release-package integration checks remain; see implementation evidence below.

Create the shared, publishable React provider and i18next adapter that every independently published consumer and plugin can resolve.

## Prerequisites

- [Language catalog foundation](00-languages.md).

Namespace ownership: **runtime contract; no messages owned**. No automatic source inventory is needed for this task.

## Files and surfaces to inspect

- `packages/i18n/package.json (new)`
- `packages/i18n/src/index.ts (new)`
- `packages/i18n/src/I18nProvider.tsx (new)`
- `pnpm-lock.yaml`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Bootstrap the new private package's workspace importer and add the public runtime package in one later cross-workspace change. Pin tested i18next/react-i18next versions; update the lockfile with lifecycle scripts disabled where appropriate. This root update was deliberately deferred to respect the package-only scope.

2. Define the public MessageReference, serialisable configuration and plugin registration contracts. Adopt the shapes in this package without exposing imports of an unpublished private package from public declarations.

3. Create one initialized i18next instance per editor/provider. Consume composed resources and createI18nextOptions; do not initialize the global singleton. Use public wrapper hooks/components so consumers share one context module.

4. Bridge selections, loaders and subscriptions into React. Commit a completed resource/locale/profile snapshot together; preserve the mounted editor, retain the old snapshot on failure and ignore superseded async work.

5. Resolve deferred references at display time and expose string formatting for worker/task contexts plus rich React rendering. Keep values as data and prevent translation catalogs from supplying executable callbacks or HTML.

6. Handle SSR initial resources, hydration, lang/dir scoping, portals, cleanup and controlled/uncontrolled locale selection. Export runtime contracts for external plugin typing without a central monorepo-only key union.

7. Configure package externals so UI packages share this provider. Inline catalog data or emit assets separately; never inline a fresh React context into each published consumer.

## Acceptance checks

- [x] Two providers on one page use different locales/profiles without leaking text or resource changes (React/jsdom fixture).
- [x] Switching locale with unsaved form state and undo history preserves both (mounted React fixture; whole-editor integration pending).
- [ ] A separately installed plugin resolves the host provider; SSR hydration starts with identical messages.
- [x] Actual i18next integration verifies English fallback plural rules and a non-English locale.

## Boundaries

Keep runtime routing independent of Next.js; keep the private authoring package unpublished.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

The public runtime and engine dependencies now exist. Application bootstrap and consumer migration remain separate modules.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.

## Implementation evidence — 28 October 2026

Implemented in `packages/i18n` as public `@manifest-editor/i18n`; no consumer UI migrated and no authored IIIF/content-language or worker data changed. The package owns no new semantic messages. Existing English namespace sources and plain overlays are consumed synchronously by `src/builtins.ts`, so edits to those source catalogs are immediately available in development. New namespaces can be added there or registered at runtime. No Dutch translations were authored; `dutchLocale` is metadata for host-supplied future `nl` catalogs/loaders.

Completed runtime work:

- Public self-contained serialisable contracts: `MessageReference`, `Catalog`, `CatalogContract`, `ResourceStore`, `UiI18nConfig`, locale metadata and loader registration. No public signature imports private authoring types. Open string namespaces/keys support later complete catalogs and third-party plugins.
- Pinned actual engine versions `i18next@26.5.11` / `react-i18next@17.1.9`, installed with lifecycle scripts disabled. Added languages/runtime workspace importers to the lockfile; pnpm also updated engine/test-environment peer snapshots. Existing workspace globs suffice; root scripts were not changed.
- `createEditorI18n()` creates a synchronous SSR-safe isolated instance. `EditorI18nProvider`, `useEditorI18n`, `useTranslations`, `EditorTrans`, `EditorI18nScope`, `createMessageReference`, and `createCatalogContract` are exported from one shared package entry point. There is no initialized global i18next singleton.
- Foundation composition, validation, locale selection, registry and latest-loader helpers are used behind public wrappers. Presets → profile → preset/profile → host composition remains explicit. Missing/fallback string diagnostics and strict coverage are exposed separately.
- Locale/profile/resource snapshots commit together. Failed loads preserve the previous snapshot, failed requests retry, overlapping loads coalesce, and superseded selections cannot overwrite newer results. Changing selection does not key/remount the React subtree. Controlled setters request host updates; uncontrolled setters update the instance.
- English defaults work outside a provider. SSR initializes from supplied resources with no browser/storage reads; client hydration uses the same selection. `lang`/`dir` are scoped locally; portal content can use `EditorI18nScope`. React subscriptions clean up; pending network operations are not aborted.
- Development exports resolve source directly, with no manual build. `publishConfig` targets ESM/CJS/declarations; tsdown explicitly bundles private authoring data/helpers and externalizes React/engines. Downstream packages must externalize `@manifest-editor/i18n` itself to share the context. See `packages/i18n/README.md` for the precise API and integration examples.

Actual validation (no package build or server operations):

- Runtime Vitest integration suite (7 tests): actual French zero/other plurals, English fallback under Russian plural rules, diagnostics/coverage, profile/layer composition, runtime namespace registration, validation rejection, failed-loader recovery, selection races, atomic locale/profile commits, serialisable references, and interpolation that cannot override engine options.
- React/jsdom suite (6 tests): two provider instances, a consumer fixture importing the public package export, unsaved form/undo-history preservation, controlled host updates, full rich sentences, scoped portal content, standalone defaults, and SSR-to-hydration parity without recoverable errors.
- `pnpm --filter @manifest-editor/i18n typecheck` and targeted `oxlint src test --deny-warnings`.
- Foundation regression suite: 30 tests pass. `pnpm --filter @manifest-editor/languages validate` validates 264 seed messages across 19 namespaces and six profile/preset combinations; this is foundation coverage, not application translation completeness.

Acceptance status and remaining integration checks:

- [x] Two mounted providers use isolated locales/profiles and resources.
- [x] Mounted React form/undo fixture survives locale/profile switches.
- [x] Actual i18next plural/fallback tests and real non-English fixture data.
- [x] SSR/hydration parity with synchronous supplied catalogs.
- [x] Separate source consumer module resolves the shared public package/context without building.
- [ ] Whole-editor unsaved state, undo store, unchanged exported IIIF, dependency widgets and browser accessibility: parent/consumer integration checks; this module intentionally does not migrate those surfaces.
- [ ] Published ESM/CJS tarballs, emitted declaration inspection, independently installed plugin identity and production browser distribution: module 29/release verification. Build prohibition means these have not been executed; source tests are not evidence of tarball validity.
- [ ] Complete English/Dutch catalogs and their required-namespace coverage belong to consumer/translation modules. Only English is enabled by default. Enabling metadata without catalogs exposes incomplete coverage and fallback, not a claim of translation support.

The parent server at port 3000 was left untouched. This checkout's changes require parent integration before browser verification. The acceptance checklist distinguishes source/runtime evidence from release checks still outstanding.

## Parent fixes following independent runtime review

The independent review found unsafe rich interpolation, numeric tags bypassing validation, combined selection bypassing controlled props, registration rollback failures, and the missing server entry. Parent fixes add:

- Literal React text interpolation through reserved internal marker components, without spreading values into engine options. Numeric tags, reserved catalog tags, component indices and attributed fallback markup are rejected.
- One controlled/uncontrolled policy for `select`, `setLocale` and `setProfile`.
- Staged registry clones and serialized atomic registration, reserved built-in namespace ownership, compatible preloaded plugin contracts, successful loader cache preservation and rollback after rejection.
- `@manifest-editor/i18n/core` as a server/task-safe source entry, separate configured publication entries/banners, and `useOptionalEditorI18nInstance` for provider inheritance.

Regression evidence: 26 runtime/React tests and 67 foundation tests pass, along with both package no-emit typechecks and targeted lint. The runtime/React tests exercise the actual engines and DOM rendering for the reported failures, registration races/retry, unsubscribe behavior and provider identity. Source tests and typechecks do not establish emitted package or actual Next RSC artifact validity; those remain pending under the repository's build prohibition. A fresh independent review follows the parent fix commit.

## Optional Dutch data integration

`@manifest-editor/i18n/nl` exports explicitly typed resource stores for all 19 current Dutch namespaces, the four plain overlays and both exhibition overlays. The host enables these together with Dutch locale metadata; default English behavior is preserved. The private package exposes Dutch source subpaths for bundling into the public entry, with no private imports in its public type signatures. Two additional runtime tests verify complete declared Dutch coverage, real plurals, reversible profile switches and the exhibition/plain intersection through the public subpath exports. App mounting and remaining module translations are still pending.

## Follow-up review fixes

The fresh review confirmed the original fixes and source-only `core`/`nl` imports with React imports rejected, then identified two further cases. Validation now scans every `<` delimiter and rejects incomplete or nested attribute markup instead of skipping it. A rejected staged locale loader is ignored when its selection version is obsolete, allowing registration to retry against the latest locale. Exact regression inputs include `<link href="https://evil.example/<link>">Injected</link>` and a French registration loader rejecting after a successful switch to English. All 29 runtime/React/Dutch tests and 67 foundation tests pass, with no-emit checks and targeted lint. Emitted artifacts and application integration remain unverified.

## Missing-key fallback review

The follow-up reviewer independently confirmed strict nested-markup rejection and obsolete-registration failure handling. One remaining finding involved Trans using an absent key as implicit markup. `EditorTrans` now resolves and renders identifiers containing markup delimiters as literal React text, including when a safe explicit fallback is supplied. The actual DOM regression confirms no injected anchor. Catalog rich tags remain supported through ordinary semantic message IDs.
