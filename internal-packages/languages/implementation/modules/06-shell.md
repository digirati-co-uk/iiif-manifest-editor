# Shell configuration and definition integration

Status: **Shell source migration and focused integration complete.** Parent-owned browser/host integration and publication checks remain pending. Module: [`packages/shell`](../../../../packages/shell). [Original inventory](../inventories/06-shell.md) remains unchanged.

Implementation commit: `ec656ee2589f8cb907c1b56d954ef24da3c8020f`. Baseline source/typecheck comparison: `e66b756ed6e00e1dd78920bd7e68c489744c0904`.

## Public configuration contract

`Config.i18n` retains its existing meaning: `defaultLanguage`, `availableLanguages`, `advancedLanguageMode`, and text granularity concern authored IIIF content. `Config.uiI18n?: ShellUiI18nConfig` is separate, JSON-compatible UI configuration:

| Field                             | Contract                                                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `defaultLocale`, `fallbackLocale` | Optional nonempty locale strings; runtime defaults apply when omitted. English remains the default.                                |
| `availableLocales`                | Optional nonempty string array; replaces the earlier config array. Metadata/catalogs must be enabled independently.                |
| `defaultProfile`                  | Optional nonempty wording-profile ID. The persisted field is **defaultProfile**, never the illustrative plan's `profile`.          |
| `availableProfiles`               | Optional nonempty string array, replacing the earlier config array.                                                                |
| `requiredNamespaces`              | Optional string array; deduplicated union in configuration/preset inheritance. Shell adds `shell` and reused `editor-api`.         |
| `timeZone`                        | Optional valid IANA timezone; task displays default explicitly to UTC. Does not change `navDate`, authored timestamps, or storage. |

Exported `shellUiI18nSchema` is JSON Schema with `additionalProperties: false`; `validateShellUiI18n` validates persisted input and is invoked by `mergeUiI18n`. Unknown fields (including `locale`/`profile` aliases), invalid arrays and invalid timezones are rejected. Undefined optional values are allowed in TypeScript and disappear in JSON. Runtime validates actual locale/profile availability and policy intersections. No browser detection or persistence is introduced.

`mergePartialConfig` merges `uiI18n` shallowly, in argument order; later scalars and allow-lists win, namespaces accumulate. `mergeConfig` retains existing content/config merge semantics. App/preset/plugin config is resolved by AppProvider, ShellProvider applies its host override, and ShellI18nBoundary reads the **inner ConfigProvider**, including saved runtime settings. UI selection is retained across resource/config replacement when still allowed; changing a default does not forcibly replace an existing selection.

`ShellProvider.localisation?: ShellLocalisation` and `PresetDefinition.localisation?: ShellLocalisation` hold public `EditorI18nOptions`: synchronous catalogs, locale metadata, profiles, ordered preset resource stores, preset-profile stores, host stores, registrations, policies, and required namespaces. Keep these executable/resource options outside persisted `Config`. `mergePresetConfig`/`extendApp` compose them through exported `mergeLocalisation`: resource maps merge recursively, preset arrays concatenate base then derived, policies concatenate (intersect at runtime), namespace arrays union, registrations concatenate, and later config/defaults win. For an owned runtime, selection follows the public runtime contract: explicit option selection, retained allowed selection, preferred locales, preset-policy defaults, then host defaults. An inherited host selection is authoritative (including first render); shell ignores conflicting option selection hints and only negotiates a local fallback when policy excludes the host selection. Runtime resource order remains base → presets → profile → preset profile → host. Host resources win over all preset wording.

An override creates a replacement real runtime instance with complete supplied options. **Resource options are not recoverable from an arbitrary inherited instance.** When overriding an inherited host's resources/policy, also supply its complete locale/catalog options through `ShellProvider.localisation`; metadata alone cannot supply Dutch. Host wrappers outside shell must forward this prop if they expose it. Without an override, shell retains the actual host instance obtained from `useOptionalEditorI18nInstance`, never the spread snapshot from `useEditorI18n`.

The provider position stays stable even when an override is added/removed. A controlled forwarding bridge retains the inherited actual instance when there is no override, forwards locale/profile requests through the **parent context actions**, and controls both selections from parent state. It never calls raw inherited setters to bypass controlled callbacks. With overrides, host availability intersects preset policy; unavailable requests reject. Two-editor isolation, host-controlled select/setters, policy restrictions, profile/locale changes and mounted-state preservation are covered by real React tests. No provider is keyed by locale/profile/config, and vault/form/editing/task providers are not recreated by a selection.

## Host and downstream examples

```tsx
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";

const localisation = {
  locales: [...defaultLocales, dutchLocale],
  catalogs: dutchCatalogs,
  profiles: { plain: dutchPlain },
  config: { defaultLocale: "nl" },
};
// A host can supply this provider with no shell override:
const runtime = createEditorI18n(localisation);
<EditorI18nProvider instance={runtime}>{editor}</EditorI18nProvider>;
// Or initialise/reconfigure the effective shell boundary explicitly:
<ShellProvider
  resource={resource}
  localisation={localisation}
  config={{ uiI18n: { defaultLocale: "nl", defaultProfile: "plain", timeZone: "Europe/Amsterdam" } }}
>
  {children}
</ShellProvider>;
```

All existing string fields remain compatible. Add optional references; keep IDs/URLs/option values stable:

```ts
const panel = {
  id: "my-panel", label: "Legacy label",
  labelMessage: { namespace: "my-plugin", key: "panel.label" },
  render: () => <MyPanel />,
};
const preset = {
  localisation: {
    policies: [{ availableProfiles: ["standard", "plain"] }],
    requiredNamespaces: ["my-plugin"],
    presets: [myPresetResources],
    presetProfiles: { plain: myPlainPresetResources },
  },
};
```

The types now support `titleMessage`, `labelMessage`, `summaryMessage`, `descriptionMessage`, `placeholderMessage` alongside corresponding legacy strings: app metadata; template fields/options/templates; preview actions; onboarding labels; layout/annotation/background/editor/resource/canvas-editor definitions; previews/handlers; plugin metadata/settings/options/image alternatives; upload backend/menu/context-menu labels; task definitions/targets/progress/instances; specification metadata/terminology. Onboarding additionally supports `openLabelMessage`, `dismissLabelMessage`, `primaryLabelMessage`; task definitions support `sectionMessage`. Default resource headings and specification property headings reuse `editor-api` resource/field messages so its Dutch/plain/preset terminology stays coordinated. Only existing display slots are extended; authored InternationalString fields are not widened or resolved as messages.

Shell renderers resolve descriptors at display time: regular/focused/mobile panel navigation and headers, editor tabs/titles, creator grids/help/actions/settings, onboarding actions/headings/summary, preview menus/actions, plugin manager search/display/settings/entry points/alternatives, task menus/details/logs/events/toasts. Onboarding body/preview callbacks and plugin settings render callbacks receive optional `i18n: { resolveMessage }`, so externally implemented template/settings displays can resolve their own references. Downstream consumers rendering app/template/menu metadata outside shell must also resolve these references; their source belongs to their owning module.

Creator forms receive instance-bound `CreatorContext.i18n.resolveMessage`. At the existing creation catch boundary, shell invokes optional `validationErrorMessage(error, { payload, vault })`, retains the returned descriptor/code/field, and resolves feedback on every render. Legacy error strings remain diagnostic fallback. Definition validation is not newly invoked; create/complete/undo semantics are unchanged. Tests execute the real creator runtime against a real Vault and verify mapped feedback switches to Dutch without remounting a form.

## Lazy plugins and tasks

`PluginMetadata.localisation?: Pick<ShellLocalisation, "registrations" | "requiredNamespaces">` works on both lazy manifests and loaded modules. PluginI18nBridge registers these against the effective runtime, including disabled plugin metadata needed by the manager. Successful registrations are remembered per actual runtime and registration object; failures remain retryable on subsequent bridge reconciliation. Runtime performs atomic ownership/contract/collision validation; the bridge logs registration failures without replacing technical loader errors or task status. Loading merges lazy/loaded localisation registrations and required namespaces, preserving manifest metadata. The manager displays a translated load-failure sentence; stored diagnostic `loadError` stays unchanged.

`BackgroundActionRunContext.i18n` is a required local `Pick<EditorI18n, "resolveMessage" | "translate">`. System/render context remains optional for old external callers. React binds it to that editor through exported `useBackgroundActionFormatter`; already running actions and previously obtained translators follow resource-instance replacement via a local live-method reference. Headless run-context creation supplies an isolated English formatter when omitted. This formatter is never added to instance/history/plan/result/worker payloads. Public `backgroundActionFormatter`, `backgroundActionLabel`, `backgroundActionStatus`, `shellTaskMessage` are exported for external task displays.

History retranslates only explicit display references. Fields are `labelMessage`, `statusTextMessage`, and log/event/error `messageReference`; references include primitive `values`/optional `defaultValue`, with existing legacy strings retained as fallbacks. Lifecycle APIs are additive:

```ts
ctx.setActionLabel("Old label", { namespace: "my-plugin", key: "task.label" });
ctx.setActionStatus("running", "Old status", { namespace: "my-plugin", key: "task.running" });
ctx.appendActionLog("Diagnostic fallback", "info", diagnosticData, {
  namespace: "my-plugin",
  key: "task.feedback",
  values: { count: 2 },
});
ctx.setActionProgress({
  current: 1,
  total: 2,
  label: "Fallback",
  labelMessage: { namespace: "my-plugin", key: "task.progress" },
});
```

`setActionError(error, statusText?, statusTextMessage?)` is also additive. Task result/status patches accept references. Store normalization, persistence, history cloning and error serialization preserve references. Built-in preparation/running/cancellation/resume/reload/result messages acquire explicit descriptors; raw remote diagnostics, results, stable status/event/log-level codes and target IDs are preserved. Rendering translates status/level badges, formats timestamps with UI locale + configured timezone, percentages with `Intl.NumberFormat`, and uses whole-message plural counts for items/entries/seconds. Already visible task toasts resolve through React at render time. This is display metadata, not a worker transport change.

Specification evaluators retain legacy English results when called headlessly without a formatter. Optional fourth `evaluateSpecifications(..., i18n)` resolves whole report messages and property headings. React report/terminology/policy hooks bind that formatter and subscribe to locale/profile changes. Report descriptors are serialisable; expected/actual values, authored metadata-template labels, rule IDs, property paths and machine statuses remain unchanged. Custom host messages/terminology require opt-in references.

## Whole-module review and translation evidence

Reviewed all shell `src` files and the inventory beyond seed keys. Migrated BaseCreator/BaseEditor, ConfigContext/IIIF options, all Layout render modes/components, PresetOnboarding, PreviewButton/preview definitions, PluginContext/manager, Notebook shell chrome, ManifestPaginationNavigation, CanvasProgress, task UI/store/toasts and specification feedback. Shell source and Dutch catalogs now contain **242 messages each (216 added)**. All newly added English leaves have real Dutch text, including whole messages and semantic plural variants. Translator notes were expanded only under `shell`. No unchanged-English exception was added; no blanket approval or copied-English catalog was used.

Families: `actions`, `panels`, `export`, `settings`, `preview`, `creator`, `notebook`, `plugins`, `background`, `progress`, `navigation`, `events`, `logLevels`, `specification`, `specificationFields`, plus retained project/onboarding seeds. Required built-in namespaces: `shell` and reused `editor-api`. English and explicitly enabled Dutch are supported. Wording profiles compose independently; shell standard wording is the intentional runtime fallback where no plain-specific shell override is supplied. Existing runtime plain/preset data in other namespaces remains intact; no new unregistered private overlay is imported by public shell code.

Reviewed/exempted data and diagnostics:

- EditingStack/ResourceEditingContext/context hooks: invariants are developer/lifecycle diagnostics, not catalog UI. Public status/worker codes, URL state keys, storage keys, resource types/IDs, geometry and transport are unchanged.
- Tags and Notebook model helpers: stored tag labels, notebook titles/content/links, source labels and authored resource labels are data. The default notebook title used to create a note stays stable; its UI-only missing-title fallback translates. PreviewVault's synthetic “Recent items” collection label is content in the preview vault, not rewritten on UI locale changes.
- Shell's viewer names (Universal Viewer/Mirador/Annona/IIIF Preview) are product names; URLs/config values are preserved. Preview failure exceptions and remote errors remain diagnostic data. Exported JSON/copy/download payloads are unchanged.
- AppHeader/menu/provider-only files, Atlas/TaskBridge/Universal/preview-vault/analysis/hooks/style files contain no additional shell-authored reachable English prose beyond the classified metadata/data/diagnostics. Commented PanelError branches and tutorial/example strings are not active UI.
- The embedded **IIIFBrowser/IIIFNotebook dependency** still owns reachable English UI. No shell locale API was found there. Parent tracks dependency follow-up, including existing MDX malformed-source and Vidstack spoken-unit gaps; those are not claimed complete here.

## Acceptance and actual checks

- [x] Separate content/UI configuration, schema, merge rules, preset inheritance, namespaces, profile/locale policy and explicit timezone.
- [x] Host control, locale/profile changes, restrictions, two editors, instance/config replacement, override add/remove and preserved mounted form/editing/Vault state: actual React tests.
- [x] Lazy plugin registration and retained plugin store selection; task context and JSON/history descriptor retranslation; real creator validation boundary; real Vault specification report regression.
- [x] Legacy string-only definitions and existing shell functionality: **15 Vitest files, 118 tests pass**.
- [x] Strict Dutch gate: **930 required messages across 26 catalog/overlay files, zero missing, zero unchanged English awaiting review** (whole workspace catalog check, not a whole-UI claim).
- [x] Focused source-mapped test/API no-emit typecheck: `tsconfig.test.json` passes. A type-only `unknown` intermediate fixes the pre-existing dropdown CJS/ESM narrowing error without changing its runtime branch.
- [x] Focused new i18n/helper/test/config oxlint passes without diagnostics. Whole-shell oxlint exits successfully with hook/accessibility warnings (including intentional locale/profile cache-invalidation dependencies); it is not claimed warning-free. Formatting checks cover changed shell/catalog files; unrelated shared translator-note formatting was retained.
- [ ] Full shell source typecheck still reports **13 existing layout Vault3/Vault4 compatibility diagnostics**, in regular/focused layouts. A temporary copy of HEAD's original shell source, checked against the same current dependency-source aliases, reproduces those same 13 diagnostics plus the pre-existing dropdown diagnostic fixed here. No build was used. These require the owning dependency/API compatibility follow-up, not casts hiding the mismatch.
- [ ] Parent owns integrated browser tests on its main checkout. No browser was launched here, and no worktree test assumes port 3000 contains this source. No dev/predev/build/prepack, server start/stop, PR, push or delegation occurred. Installed dependencies with lifecycle scripts disabled and frozen lockfile; only shell's jsdom importer was added.
- [ ] Publication artifacts/declarations/tarballs and host wrapper prop forwarding remain parent/module 29 integration checks. Public shell code imports only public i18n root/core entry points; tests use optional `/nl`. Existing dependency/tsdown externalization is preserved.

Commands run from repository root (Node 24):

```sh
pnpm install --ignore-scripts --frozen-lockfile
node packages/shell/node_modules/vitest/vitest.mjs run --config packages/shell/vitest.config.ts
node node_modules/typescript/bin/tsc --noEmit -p packages/shell/tsconfig.test.json
node node_modules/typescript/bin/tsc --noEmit -p packages/shell/tsconfig.json
node node_modules/oxlint/bin/oxlint packages/shell/src packages/shell/vitest.config.ts
node node_modules/oxlint/bin/oxlint packages/shell/src/i18n packages/shell/src/BackgroundTasks/BackgroundActionMessages.ts packages/shell/vitest.config.ts
npm --prefix internal-packages/languages run translations:check
```

No shared index/generated inventory/runtime/other-package source was changed. The lockfile diff is confined to `packages/shell`'s dev importer. Parent should integrate this commit before downstream consumers rely on the new shell metadata and formatter contracts.

## Parent integration review

Integrated with the web host's stable English/Dutch provider. Parent review added regression coverage and fixes for asynchronous host rejection, combined locale/profile forwarding, prototype-named configuration fields, and concurrent plugin bridges. Shared registration and namespace-load promises are coalesced per actual runtime; failed promises are evicted for retry. The header retains usable controls and announces translated failure feedback when a controlled host rejects a request. No locale key/remount was added.

The shell suite now has **121 passing tests**. Runtime and web interaction suites have **30** and **7** passing tests respectively. Existing live Chromium checks passed for create/edit/preview, server-rendered Dutch without hydration errors, keyboard language selection/reload, and bounded mobile headers. These checks establish host bootstrap behavior, not completion of all downstream UI or whole-editor undo coverage.

Source aliases now live only in `tsconfig.test.json` (explicit `noEmit`) and `tsconfig.source.json`; publication/watch configuration keeps ordinary package resolution. `typecheck:source` checks the whole shell against actual dependency source and retains the 13 known layout Vault3/Vault4 diagnostics. The focused test/API config passes. This prevents the existing declaration watcher following check-only aliases into sibling source folders. Generated declaration/source-map pairs observed there were verified against their source files and moved to a temporary recovery directory; authored files and the running server were preserved. No package build or publication artifact check was performed.

Dependency integration now wraps ProjectNotebookPanel's notebook in the shared browser i18n provider, preserving the existing note/store props and translating embedded browsers/image dialogs. This does not claim the independent notebook command UI is translated. The focused no-emit check still passes. The earlier three Chromium successes above predate this integration; the latest create/edit/preview journey passes but both host SSR tests now fail with a duplicate ProseMirror `gapcursor` registration in Turbopack, documented in the dependency handoff.
