# Web host locale preferences and application UI

Status: Web host implementation and Dutch migration complete in this checkout; combined SSR/browser acceptance pending. Module: [`apps/web`](../../../../apps/web).

Add allowed, persistent interface preferences and localise host-owned UI without coupling reusable packages to Next.js.

## Prerequisites

- [Public editor facade and browser distribution](19-manifest-editor.md).
- [Project and draft controls](09-projects.md).

Namespace ownership: **web plus reusable editor namespaces**. [Source inventory](../inventories/20-web.md)

## Files and surfaces to inspect

- `apps/web/src/components`
- `apps/web/src/app`
- `apps/web/next.config.ts (inspect existing configuration filename)`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Choose host default/available locale/profile policy, store user preferences separately from content-language config and supply initial SSR resources/selection consistently.

2. Add interface-language and wording controls. Hide combinations failing required-namespace coverage; define fallback/loading/error behaviour.

3. Migrate launcher, local/browser editor settings, project menus, tutorials and host error states. Audit MDX/JSON/help copy separately from the JS/TS inventory.

4. Review LegacyManifestEditor reachability before migrating its candidates; record explicit support/defer decisions.

5. Use locale-aware timestamps and language display names; coordinate root document lang/dir only in the full-page host.

6. Configure workspace TS transpilation/optional assets after the package boundary is integrated. Avoid introducing URL-localisation/routing requirements for the embedded editor.

## Acceptance checks

- [ ] A persisted UI preference renders identically on the server and first client render.
- [ ] Browser refresh and opening a project retain permitted preferences.
- [ ] Editing content in another language and exporting it preserves all language maps.
- [ ] Unsupported persisted choices fall back to the current allow-list.

## Boundaries

Changing the interface language must not rewrite project/content settings or require translated URL routing.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.

## Parent host bootstrap

`apps/web/src/i18n/policy.ts` declares registered English/Dutch catalogs and standard/plain profiles. `NEXT_PUBLIC_MANIFEST_EDITOR_UI_LOCALES`, `...UI_PROFILES`, `...UI_DEFAULT_LOCALE` and `...UI_DEFAULT_PROFILE` can constrain the host policy; unknown/empty choices and unavailable defaults fail configuration validation. English remains a registered fallback even if it is not selectable. Source consumers use local no-emit TypeScript settings.

`WebI18nProvider` creates one stable runtime outside site/project/editor providers, imports optional Dutch stores, and keeps it across locale/profile/route renders. A successful snapshot synchronizes the full-page `lang`/`dir`; embedded scopes remain runtime-owned. The version-1 `manifest-editor-ui` cookie stores optional `locale` and `profile` separately from project/content-language config. Only changed choices are persisted, so changing wording does not silently persist the default locale. Invalid versions/values fall back to the current allow-list. Failed selections retain the prior cookie and UI. Default initialization does not write a preference.

The main root layout reads and validates the cookie before emitting HTML, then passes the same preferences to the client provider. This makes the cookie-owning root request-dependent, rather than relying on a client-only storage read or adding translated routes. No project data, existing storage key, content-language setting or URL is rewritten.

`HeaderLanguageSwitcher` wires the Claude-designed control to the effective runtime and React Aria locale, with translated accessible copy, loading/error status and portal direction. It is mounted in the site and BrowserEditor headers, including focused exhibition variants. Other local/share/examples/external/legacy headers, wording controls and the rest of web text remain for the module20 agent. Header styling uses structural selectors rather than translated accessible names; the site header uses two rows on narrow screens.

Validation: six web unit/interaction tests pass, including server-to-client Dutch/plain hydration, immutable policy validation, partial preference persistence, rejected selection, and mounted draft/undo fixture preservation. The host-focused no-emit config and targeted lint pass. Three actual Chromium tests pass on the existing port3000 server: the original create/edit/metadata/preview journey, saved Dutch SSR/hydration, and keyboard switching/reload with bounded 320px header controls. No server/build command was run. These checks do not establish complete translated editor forms or full vault/undo integration; those remain with modules07/20/23.

Coordinate effective shell/preset policy and host preference forwarding after module06 integration; keep its controlled callbacks authoritative. Do not replace this with no-op controls, client-only initial preference reads or locale-derived editor keys. Required-namespace deployment gating, remaining routes, and full Dutch inventory review are still pending.

## Module20 implementation handoff (28 October 2026)

Web implementation is complete in this checkout; combined browser/SSR acceptance remains pending.
This section supersedes the bootstrap's remaining-web-work list and its historical browser
results. The parent's current integrated SSR failure is **not** a passing acceptance result.

### Migrated source and reachability

Reviewed every file under `apps/web/src`, route entry points, public JSON, README/help
Markdown and the tutorial Markdown embedded in TypeScript, rather than stopping at the
heuristic inventory. Current routes were retained:

- The server launcher route still resolves `searchParams` on the server, then supplies a
  reactive client `site/Launcher` island. Launcher tabs, create/import/file failure/loading,
  recent projects/context actions and URL/browser modals now use `web`. Stable tab IDs,
  project IDs, routes, telemetry values and exported download filenames are unchanged.
- Browser manifest/collection and all six exhibition normal/focused routes use translated
  headers, theme accessible names, share/copy feedback, settings/content-language headings,
  export-type sentences and preset/layout controls. Deferred `labelMessage` references retain
  panel/preview definitions and fallback labels instead of rebuilding them on UI selection.
  Content Config.i18n and FormData field names stay separate from UI preferences.
- Local, external, example and share hosts have interface controls and translated friendly
  load/import/save errors. Local file parsing/saving catches failures and cancellations;
  a failed save keeps the editor mounted. Local timestamps use the selected UI locale.
  Existing raw API diagnostics are not shown as friendly UI messages.
- `IIIFBrowserModal` now renders the current public `LocalizedIIIFBrowser`. Its caller-owned
  output label, title, loading-resource sentence and error feedback are translated. Callback
  URLs, supported IIIF types, navigation/output configuration and isolated Vault stay data.
- `/legacy` is a real, supported Next route (`legacy/page.tsx` imports the dynamic editor).
  It was **not removed or silently excluded**. Its initial launcher, header, file/help menus,
  templates/projects, manifest opener and About/help paragraphs are migrated. Definition
  titles/labels carry deferred references. Its existing project/storage contracts remain.
- Iframe-preview route and host plugin panels translate status/title/buttons while preserving
  origin checks, message types, ports, Vault transport and selection handling.
- Tutorial listing, counts/duration sentence and start/continue/failure UI are translated.
  The complete teaching Markdown is a single message with retained links/protocol examples.
  New tutorial working copies resolve it once at creation. Existing notebook notes, source
  metadata, checked steps and edits are never rewritten by locale/profile changes.
  Joyride receives all supported locale labels, including its complete progress sentence.
- New route-level not-found/error UI uses the runtime, translated retry/home actions and live
  reset callbacks. Root metadata and footer are product/author credits, kept as proper names.
  Example identifiers are route/resource identifiers, not UI labels.

Explicit reviewed exclusions: `remote-editor/create-demo.tsx` has no importing consumer or
Next UI route in this source tree; it remains a developer-only remote-runtime example, with
no claim that a separately loaded remote runtime shares the local provider. Its release/resolve
API endpoints remain supported protocol endpoints; JSON diagnostic payloads and catalog URLs
stay unchanged. `browser-editor/example-specifications.ts` likewise has no consumer/import in
the current app; its authored terminology, fixed values, metadata-template InternationalString
values and rule semantics remain example data. `examples.json`, `public/collection.json`,
remote titles/preview text, IIIF labels and starter resource defaults are authored data.
`docs/Card` and `docs/Label` render caller-supplied content and contain no owned UI messages.
No MDX file exists in this module; embedded tutorial Markdown was separately reviewed.

### Policy, controls and effective runtimes

`HeaderLanguageSwitcher` retains the designed language control and adds an independently
labelled standard/plain selector. Both use the effective runtime's authoritative setters,
allowed choices and translated loading/rejection feedback. Rejected requests retain the
current selection/cookie. Supported headers expose the controls; small site screens use three
rows to accommodate both controls, and local/external/legacy headers can wrap. Real 320px
layout and keyboard/browser acceptance belongs to the parent; no worktree screenshot claim.

`createWebUiPolicy` measures the runtime's **selected-locale coverage**, excluding English
fallback, across each exposed locale/profile pair. Its mandatory namespaces are `web`,
`common`, `components`, `shell`, `editor-api`, `editors`, `projects`, `ui`; the optional
`NEXT_PUBLIC_MANIFEST_EDITOR_UI_REQUIRED_NAMESPACES` CSV adds deployment requirements.
Incomplete locales are removed; no remaining locale or an unavailable explicit default
fails configuration. This is declared-message coverage, not a claim about untranslated
upstream controls. Standard/plain and en-GB/nl currently cover these contracts.

The host keeps one runtime through ordinary renders, route, locale and profile changes.
A changed deployment-policy prop replaces its configuration instance while retaining the
React tree and permitted selection; tests retain the same draft DOM and reject a newly
forbidden choice. Cookie fields remain independent; policy-induced fallback does not invent
an explicit user preference. SSR policy/resources/initial preference match the client.
Document lang/dir synchronization remains host-owned. No localized URLs or locale remount
keys were introduced.

`resources.ts` forwards the full public Dutch catalog/profile resources to override runtimes.
`WebShellProvider` merges them with explicit localisation; inherited host control/policy remains
ShellI18nBoundary's authority. Exhibition hosts additionally forward Dutch exhibition and
plain-exhibition layers only for exhibition presets; ordinary manifest canvases do not become
dias. English preset resource expansion belongs to module12; no blanket full-preset UI claim.

**Exact module19 follow-up:** the current public `ManifestEditorProps` lacks `localisation`.
The web-only `WebManifestEditor` uses that public prop type and preserves the facade's
Vault/ref/load/plugin/AppProvider/layout behavior while routing its ShellProvider through the
web resource adapter. Module19 should add typed `localisation?: EditorI18nOptions` (or the
public ShellLocalisation equivalent), forward it unchanged to ShellProvider, test controlled
host selection plus preset overrides, then replace this temporary adapter in local/example/
share hosts. No fabricated prop cast or hook-snapshot-as-instance workaround is used.

### Catalog and check evidence

`web` now has **224 English messages and 224 real Dutch messages** (209 added beyond the
15-message bootstrap). New groups cover actions/feedback, share/projects, external/local,
preview, tutorials, legacy/About, preset/exhibition, import/web-page, examples/tour/routes;
existing navigation/settings/browser/launcher groups expand. Translator context is recorded
in `translations/notes/web.md`. One exact-source review adds the normal Dutch adjective
`Recent`; existing brand reviews remain. No wildcard review or English-copy approval.
Standard/plain selection uses actual runtime profiles; unchanged technical help may inherit
standard wording. No separate complete plain-language rewrite of every teaching paragraph
is claimed.

Commands run from the repository root with working Node 24, without builds or lifecycle hooks:

```sh
pnpm install --ignore-scripts --frozen-lockfile
node apps/web/node_modules/vitest/vitest.mjs run --config apps/web/vitest.config.ts
node node_modules/typescript/bin/tsc --noEmit -p apps/web/tsconfig.i18n-host.json
node node_modules/typescript/bin/tsc --noEmit -p apps/web/tsconfig.i18n.json
node node_modules/oxlint/bin/oxlint apps/web/src apps/web/test apps/web/vitest.config.ts
npm --prefix internal-packages/languages run translations:check
```

- Real React tests: **18 pass**, including actual wording controls, server-render/hydrate
  parity with Dutch help, independent cookie writes, host rejection, live allow-list change,
  unchanged draft DOM/state, translated route retry, the actual React Aria import modal,
  collection-loading/failure branches and unchanged imported object/URL. Only navigation,
  project storage/import I/O are mocked in dialog/tutorial tests; rendering/translations and
  runtime are real. Tutorial tests verify Dutch creation and existing authored-note retention.
- Host/control no-emit check passes. Full source no-emit check is **not clean**: 109 diagnostics,
  with zero added signatures against a temporary unchanged-HEAD web-source snapshot using
  the same noEmit aliases/type environment (normalize only file-location prefixes/positions).
  The web-local diagnostic remains unchanged `cloudflare-preview-store.ts:6` TS2339 PREVIEW_KV;
  108 come from dependent packages/plugins/presets. No suppression was added. Source aliases
  are limited to explicit local noEmit configs; publishing/watch tsconfig is untouched.
- Oxlint: zero errors; 18 existing warnings (dependency arrays and legacy image elements).
  New loading/status markup and browser-output memo dependencies were checked. Changed
  TS/TSX/JSON files pass oxfmt; `git diff --check` passes.
- Strict Dutch gate: **1764 required messages, zero missing and zero unreviewed English
  copies**, across 26 catalog/overlay files. This is catalog evidence, not browser acceptance.

### Remaining integrated gates and dependency limits

Parent owns live browser acceptance in its main checkout. This isolated checkout did not
exercise unrelated localhost source. No Playwright source was changed; no local/default
webServer configuration, dev/build/predev, cache deletion, server restart, dependency-global
mutation, push or PR was used. Required combined checks remain reload/project preference
retention, full Vault/editing/undo preservation on real routes, mobile headers and current SSR.
The React state tests are not a claim of full editor undo acceptance.

The reported live `GET /` HTTP500 `Duplicate use of selection JSON ID gapcursor` remains
unresolved. Source trace: the old server launcher imported the components barrel; that barrel
re-exports MDXEditor/IIIFBrowser adapters, while shell's Notebook imports `iiif-browser/notebook`,
`iiif-browser/tiptap` and Tiptap StarterKit. Installed ProseMirror gapcursor has separate ESM/CJS
entries, each registering `gapcursor` with Selection.jsonID. The launcher now uses a normal
SSR-enabled client island for reactive copy, reducing its server-barrel exposure, but this is
**not evidence of a duplicate-module fix**. Parent should inspect cold versus retained HMR
module identities and those entry boundaries; this work did not disable SSR or add a global
registration guard. Clean integrated SSR remains an open acceptance gate.

Standalone notebook dependency commands, Leaflet/Draw, vault shape controls and independently
installed npm consumers still have the limits in guide04-dependency-localisation and
patches/README. Web translations and current browser adapter wiring do not close those gaps.

## Parent integration review

Integrated with creator08 and the shared shape/search/plugin fixes. Parent reran **19 web tests**, including the retained-browser-action regression, the host/control no-emit check and strict Dutch validation (**1883 combined messages**, zero missing/unreviewed). Mandatory host coverage now also includes creators, which is used by the editing workflows.

Review found that the retained IIIFBrowserModal output descriptor captured the initial action label. It now resolves the label through a getter, matching the creator browser contract. A regression mounts the real localized browser through the real import modal, changes EN/NL with a selected Welsh-labelled manifest, and verifies the same action DOM, selection, history, Vault content and callback URL.

The latest running-app create/edit/metadata/preview journey passes; both host SSR/header tests still fail with HTTP500 from duplicate ProseMirror gapcursor registration during Turbopack SSR. The narrow header checks and client selection run before the reload failure, but a full SSR/hydration acceptance result is still absent. No server restart, cache deletion or SSR suppression occurred. Public facade19 must still replace WebManifestEditor while retaining the current resource forwarding and behavior; an independent web/creator integration review remains pending.

The real browser-modal test initially exposed mismatched installed copies: filtered installs had linked patched IIIF Browser in shared packages while apps/web still referenced its old copy. A full `pnpm install --ignore-scripts --frozen-lockfile` synchronized all 30 workspace projects. Web, components, creators and shell now resolve the same patched browser path, and the real-context test passes. The existing SSR500 remains after synchronization, so this is not claimed as its fix. Web Vitest inlines iiif-browser/react-timeago for the dependency's extensionless ESM imports, matching the component/creator test setup.

The latest full source check reports **108 diagnostics**, with the same web-local CloudflareEnv.PREVIEW_KV diagnostic and none in the new browser test. The focused host check passes. Shared shape controls now cover the earlier vault fallback; independent notebook commands and Leaflet/Draw remain open dependency surfaces.

## Independent review: provider replacement

The modal's retained output getter now reads a stable ref containing the current translator and mutation callback. This covers provider/policy replacement as well as selecting a locale on one instance. A real-browser/modal test covers both paths: a replacement English runtime after Dutch selection, and a bilingual-to-Dutch-only host policy change. Action DOM, history, selected IDs, Welsh Vault data and callback URL remain intact. The web suite now has **20 passing tests**. Full source checking retains **108 diagnostics**, with only the existing CloudflareEnv.PREVIEW_KV diagnostic in web and no new test diagnostics.

The same independent review reproduced the NL-only shell fallback metadata failure. Module19 owns its fix and real shell/facade regression; that finding is not closed by the modal-only test. Existing SSR gapcursor acceptance remains open. No catalog messages or authored data changed in this fix.
