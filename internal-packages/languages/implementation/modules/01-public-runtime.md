# Public i18n runtime and workspace bootstrap

Status: Pending new module. This task creates a new runtime or changes repository-level integration.

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

- [ ] Two providers on one page use different locales/profiles without leaking text or resource changes.
- [ ] Switching locale with unsaved form state and undo history preserves both.
- [ ] A separately installed plugin resolves the host provider; SSR hydration starts with identical messages.
- [ ] Actual i18next integration verifies English fallback plural rules and a non-English locale; unit tests of option objects alone are insufficient.

## Boundaries

Keep runtime routing independent of Next.js; keep the private authoring package unpublished.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

This is the next integration task. No public runtime or engine dependency has been created in the current package-only work.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
