# Public editor facade and browser distribution

Status: **Source implementation complete; publication and integrated browser acceptance pending.**
Module: [`packages/manifest-editor`](../../../../packages/manifest-editor).
The shared index and generated inventory are unchanged.

## Public facade and host integration

`ManifestEditorProps.localisation?: ShellLocalisation` is a public typed resource/runtime
option forwarded **unchanged** to `ShellProvider`. The root exports `ShellLocalisation`
and `ShellUiI18nConfig`; `manifest-editor/shell` continues to export the complete shell
API. Public types reference the shared public `@manifest-editor/i18n/core` contract,
never private authoring sources. No new facade namespace/messages were necessary.

`Config.uiI18n` remains serialisable selection/policy configuration, distinct from
content `Config.i18n`. Catalogs, profile overlays, locale metadata, lazy namespace
registrations, host resource overrides and callbacks stay in local provider/resource
options. No runtime/function was added to Vault/IIIF exports, worker/remote release
transport, editing/history data, or persisted configuration.

The existing Vault fallback/ref, synchronous-data load, URL load deduplication,
manifest/collection choice, plugin composition/configuration, AppProvider instance ID,
VaultProvider position and layout mode are preserved. No locale/profile key or remount
was introduced. Shell remains responsible for effective runtime creation, host/preset
policy intersection and selection retention. Controlled host requests go through the
parent provider callbacks; failed requests retain the authoritative selection. With
no override, the actual inherited instance is retained. Resource/configuration or
explicit host instance replacement updates the effective runtime without remounting
children. Resource input identity should be stable between ordinary renders.

The web local/example/share hosts now import the actual public `ManifestEditor` and
pass complete `webUiResources`; the temporary 96-line copied `WebManifestEditor` is
deleted. `WebShellProvider` already merges those same resources and needs no copy.
Resources now explicitly register `[...defaultLocales, dutchLocale]`, including
English fallback metadata. A real NL-only web policy plus facade/Shell override test
confirms Dutch remains the only selectable locale, English fallback stays registered,
and requesting English rejects. This fixes the independently reproduced P1
“Configuration contains an unregistered locale” failure without weakening policy.

## Entrypoint and update matrix

| Surface                                                    | Source behavior and review evidence                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root React `ManifestEditor` / `ManifestEditorProps`        | Public optional localisation forwarded to real Shell; Manifest and Collection paths exercised. Stable Vault/resource/layout/plugin behavior retained.                                                                                                                                                 |
| `manifest-editor/shell` and preset/component/API reexports | Reexport existing public packages; shell/preset localisation composition remains owned there. No new preset assumptions or translated ID matching.                                                                                                                                                    |
| `browser/entry.ts`                                         | Exports the same facade and props, plus shared `i18n` and `i18nCore` namespaces. Browser runtime contract is now **API 2**.                                                                                                                                                                           |
| `ManifestEditor.createRuntime`                             | API 2 requires host `I18n` and `I18nCore` modules alongside the six React/renderer modules. They are supplied to the factory under exact public package keys, retaining context/factory identity.                                                                                                     |
| `ManifestEditor.automaticRuntime`                          | Imports pinned React and the public i18n root once, using its core reexports for both dependency keys; caches success, retries failed imports and exposes API 2 with shared module identities. Public i18n publication/CDN availability is a release gate.                                                                   |
| `manifest-editor/remote` loader                            | API 2 requires the same public root/core entries in `RuntimeHost`; rejects API 1 and absent modules before asset loading. Loaded exports must retain host provider/factory identity. Factory cache is per host object, not merely React identity; CSS disposal remains independent of editor unmount. |
| Browser/remote configuration updates                       | No separate imperative mount/update or worker API exists. Keep one React root, Vault and captured runtime/component type; rerender it with updated `localisation`/`config`, or select through the shared provider. Do not recreate a factory/root for language changes.                               |
| Release resolver/register/catalog                          | Existing stable version selection, integrity descriptors and trusted-asset validation stay technical data. Browser build descriptors now identify API 2. Release resolver remains version-agnostic and rejects mismatched requested API contracts.                                                    |
| ESM/CJS source bundling                                    | tsdown already externalizes public i18n subpaths. Browser build now also externalizes root/core and rejects bundled public-runtime/private-catalog source modules. No private language import or dependency is added to facade consumer source/types.                                                 |
| Optional locale assets                                     | Use public `@manifest-editor/i18n/nl` or host-owned registration loaders. Locale metadata alone supplies no messages. No invented standalone facade locale chunk or undocumented locale is advertised.                                                                                                |
| Server/task boundary                                       | React/CSS facade is client UI; use public `/core` for server/task factories/types and `/nl` for optional server-safe catalog data. Supply matching synchronous SSR/hydration resources. Native-renderer/dependency SSR and emitted RSC boundaries need release/integration checks.                    |

**Compatibility:** API 1 browser assets/host signatures are incompatible with API 2's
shared-runtime injection. Regenerate trusted release descriptors and migrate browser
hosts together; no old descriptor/catalog asset was rewritten or published here.
`createRuntime` takes `I18n`/`I18nCore`; the lower-level remote host uses package-name
keys. Use one stable host object to reuse a remote factory result. Automatic CDN imports
are pinned source configuration, not proof that a new public release already exists.

README examples cover public Dutch/plain resources, independent content languages,
controlled outer providers, lazy loaders, resource replacement, browser/remote updates,
shared context injection and source/server-safe boundaries. Standard English remains
the default; reviewed Dutch resources must be explicitly enabled. Exhibition stores
are only for explicitly composed exhibition hosts. No complete preset/whole-UI coverage
is claimed from the facade forwarding.

## Whole-module review and exemptions

Reviewed all source files, remote resolver/loader, every subpath reexport, browser
entry/runtime/register/build, package exports/dependencies, tsdown and TS configurations,
styles and README. The only facade literal is a developer configuration invariant with
an API usage example; remote/release/build errors and asset names are technical
configuration diagnostics. They are not user-authored content or application messages
and were not blindly extracted. CSS/reset files contain no UI text. No English/Dutch
catalog namespace was changed; all expanded product catalogs remain with their owners.

No shared runtime/shell/preset/plugin/catalog edits, generated inventory changes,
rotation-feature changes, dependency-store mutations, next-env edits, server commands,
build/prepack operations, pushes, PRs or delegates occurred. No ponytail skill was
available in the supplied skill catalog or installed skill roots.

## Actual checks

Run from root with working Node 24 and direct installed tools:

- `pnpm install --ignore-scripts --frozen-lockfile`: all 30 workspaces synchronized,
  no lockfile diff or lifecycle scripts.
- `node packages/manifest-editor/node_modules/vitest/vitest.mjs run --config packages/manifest-editor/vitest.config.ts`:
  **33 tests pass** (6 facade, 3 remote-loader, 5 browser API, 19 release resolver).
- `node packages/manifest-editor/node_modules/vitest/vitest.mjs run --config apps/web/vitest.config.ts`:
  **19 tests pass** across 6 web files.
- `node node_modules/typescript/bin/tsc --noEmit -p packages/manifest-editor/tsconfig.source.json`:
  **86 baseline dependency diagnostics**, exactly identical complete diagnostic output
  against starting HEAD `57a2127a` using the same source config. No facade diagnostic added.
- `node node_modules/typescript/bin/tsc --noEmit -p packages/manifest-editor/tsconfig.test.json`:
  same **86 dependency diagnostics**, none in facade/test/public contract files.
  Compile-only public source imports assert the localisation and browser context types
  and reject executable registrations in persisted `ShellUiI18nConfig`.
- `node node_modules/typescript/bin/tsc --noEmit -p apps/web/tsconfig.i18n-host.json`: **passes**.
- Direct root `oxlint` over facade source/browser/tests/config and changed web source:
  **passes**; `git diff --check`: **passes**.
- `npm --prefix internal-packages/languages run translations:check`: **1,883 required
  Dutch messages; zero missing, zero unreviewed English copies**. No new keys/reviews.

Source aliases occur only in explicit `noEmit` source/test configs, never publishing/
watch tsconfig. Whole-source diagnostics are recorded rather than suppressed.
Tailwind emits its existing missing-content warning while importing real component CSS
in the mounted tests; no package build is invoked.

The facade tests use actual public i18n, Shell/App/Plugin/Vault providers, real Vault
edits and editing-stack selection. Fixture preset definitions replace production
layouts/plugins, and Layout is replaced by probes to avoid native renderers/IO. Mounted
form-history undo survives configuration replacement; this is **not** native rich-text
or whole-app undo acceptance. Tests also exercise controlled host rejection/updates,
explicit host instance replacement, preset/host restrictions, two-editor isolation,
default English and lazy English/Dutch namespace loading. Remote tests simulate asset
completion/SRI success but use real public modules to check identity and cache isolation.
Browser API tests stub CDN imports; they do not fetch published modules.

## Remaining acceptance / release29 handoff

- [x] Source React/browser/remote contracts reconciled and tested; public host adapter
      duplication removed; NL-only fallback registration fixed without selectable English.
- [x] Source public types and externalization configuration reviewed; no private
      authoring references in facade consumer source/types.
- [ ] Build and install CI-produced ESM/CJS tarballs outside workspace links; inspect
      declarations/exports and verify independent installed-plugin context identity.
- [ ] Produce API 2 browser assets/trusted descriptors; verify actual classic-script
      injection, optional locale URLs, CDN availability, real network/SRI and bundle guards.
- [ ] Parent-owned integrated browser acceptance in main checkout: full preset/editor
      state, native undo/selection, hydration/SSR and actual dependency renderers. Existing
      retained-server `gapcursor` HTTP500 is unresolved; no source test here proves it fixed.
- [ ] Full manifest/collection/exhibition coverage remains with their module owners;
      Leaflet/Draw and independent notebook UI remain documented upstream gaps.

No local build or installed-artifact success is claimed. This source module is ready
for parent review/integration; the publication acceptance boxes remain deliberately open.

## Parent integration review

Integrated both source commits with the current creators/web work. Parent reran all **33 facade/browser/remote tests**, the focused web host check and the combined web suite (currently **25 tests**, including concurrent user language-menu tests). The real NL-only facade/Shell test passes with registered English fallback remaining nonselectable. The copied WebManifestEditor is removed from all three hosts. Browser API2 assets, actual remote injection/CDN behavior and independently installed artifacts still need their existing release/integration gates. An independent source review of this boundary is pending.

Production `tsconfig.json` now excludes colocated test files. The no-emit test config explicitly includes them. The existing declaration watcher had followed the facade test's web fixture imports and emitted three .d.ts/.map pairs into apps/web/src/i18n; those untracked, source-map-verified pairs were moved to a temporary recovery directory. The resolved production config has **17 root files and no test roots**. No build or server operation was invoked. This config correction does not claim emitted publication verification.

Additional generated languages are experimental user test data and may be stale. EN/NL remain the required migration targets; source completeness/release claims do not extend to those extra catalogs. Concurrent user rotation, inline-label and language-menu edits remain outside these commits.

## Independent review: local-file host regression

The source review found one P1 in a web callsite: a replacement had changed the header logo to a resource-less ManifestEditor. Restored `ManifestEditorLogo` while retaining localisation on the actual editor. A mounted local-file regression runs the real facade/Shell/Vault with a fixture native layout, opens a valid Welsh-labelled manifest, edits a draft, switches EN/NL and fails a file save. It verifies the logo/editor mount, original language maps, draft DOM/value, file name/handle and retained editor on failure. The targeted test passes; native layout/renderers and filesystem I/O are explicitly fixture boundaries. No other actionable source finding was reported. Release/API2 asset/CDN and whole-browser/SSR gates remain open.

## Lazy locale and distribution follow-up — 29 October 2026

The public runtime now accepts ordered `resourceLoaders` for locale bundles, including
base/profile/preset/intersection data. Shell merges their entries. Web imports optional
languages dynamically, gates choices through CI-validated coverage metadata, and
preloads only the initial locale for the root and child runtimes. The initial loaders
reuse serialized data after hydration instead of downloading that locale again.

Browser dependency pins come from installed package versions and enter the build ID.
The automatic path supplies the root entry's exact core reexports; injected/remote
hosts reject mismatched factories before initialization. Tests cover those contracts.

Distribution, payload and published-CDN diagnostics remain available as opt-in local
commands, using existing build artifacts where required. The normal Build workflow
checks generated coverage metadata; there are no separate i18n verification workflows
or post-release CDN gates. The pkg.pr.new workflow includes the public i18n package
and private catalog triggers.

Local runtime/web/facade tests and focused TypeScript no-emit checks pass. The existing
port-3000 server still returns the previously documented duplicate `gapcursor` error
on SSR/reload, so the two live host acceptance tests remain blocked by that baseline.
No local package build, prepack, server restart or publication was performed.
