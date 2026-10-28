# Shared component messages and accessibility

Status: First-party component migration implemented and tested. Dependency-owned gaps and parent integration checks remain below. Module: [`packages/components`](../../../../packages/components).

Namespace ownership in this change: **components only**. No common catalog, shared index, generated inventory or shared runtime edits. [Source inventory](../inventories/04-components.md).

Read alongside the [runtime](01-public-runtime.md), [editor metadata](02-editor-api.md) and [creator contracts](03-creator-api.md) guides, and `packages/i18n/README.md`.

## Implemented surfaces

- `CreatorGrid`: optional grid `labelMessage` and item `titleMessage`/`descriptionMessage` resolve at render time using the existing strings as fallbacks. Text values, accessible names, descriptions and tooltip content update together. Description uses React Aria's `Text` description slot, including its Safari/VoiceOver textContent behavior. Creator IDs and action callbacks are unchanged. Shell can continue supplying already-resolved strings, as documented in module 03; no creator definition or transport contract changes are required.
- `PanelSideMenu`/`PanelSideMenuItem`, `SidebarTabs` and `SidebarHeader`: optional label/title references resolve live; old callers remain valid. Tab overflow measurements refresh when resolved labels/menu change and on the existing 500ms interval, including React Aria’s deferred collection commits. Hidden tabs are measured synchronously and restored before paint. Tab IDs, selected keys and mounted panel state are preserved. `SidebarHeader` only resolves references for string titles; authored InternationalString titles always remain authored content. `IconButton` also accepts optional `labelMessage` with legacy label fallback.
- Built-in UI: manifest onboarding title, complete instruction and action; grid size heading/options; more actions/tabs; reorder/resize; modal close; download default label/tooltip; notification region/close; background menu/information/progress/count summary; select-item fallback; spinner name; canvas untitled fallback; thumbnail missing/error fallback; missing textual content; provider edit action and missing link text; the three named SVG icon labels/titles.
- Background counts use a complete sentence that works with zero, one or many tasks in both languages, rather than assembled translated fragments. Display percentages use the selected UI locale's `Intl.NumberFormat`; numeric progress values and CSS width remain unchanged.
- Joyride receives all seven configurable locale labels, including its progress label; caller `lastButtonLabel` and step content retain precedence. Tour IDs, storage keys and completion behavior are unchanged.
- MDXEditor receives the public dependency translation callback. All messages reachable from the configured bold/italic/underline, list, block type, link dialog/preview and image toolbar are in `components.mdx`. The IIIF insert toolbar label and exposed dialog/image-action labels are translated. The toolbar component has stable identity. Locale changes update plugins through their update API without keying/remounting the editor or changing HTML/Markdown conversion, debounce, document callbacks or authored values. Caller-supplied `translation`/`plugins` props retain their previous override precedence.
- Vidstack receives a complete `DefaultLayoutTranslations` map, checked with `satisfies`, including the dictionary used by its announcer. UI language scope is independent of the existing `language` prop, subtitle track labels/languages, media URL/type and current-time values.
- Tooltip, creator-tooltip, modal, tab/menu and toast portals retain React context and carry UI language/direction. `ComponentI18nProvider` bridges the selected UI locale to React Aria's own instructions/collation in collection/tab, canvas drag, sidebar menu, modal, toast and MDX roots. This is React Aria's locale provider, not a new editor runtime instance. Canvas geometry is not mirrored. Existing physical layout styles are not a claim of full RTL design verification.

## Catalog and public-package boundary

`components` now contains **142 English keys and 142 real Dutch values** (132 additions to the ten-key seed). Added groups are `actions`, `onboarding`, `grid`, `provider`, `background`, `notifications`, `icons`, `panels`, `tour`, `mdx`, `media`, plus additional empty/control/error/selection messages. The source and Dutch keys have matching interpolation contracts. `translator-notes.ts` adds only the components section, documenting authored name/URL placeholders, semantic counts, heading levels and Joyride's special single-brace tokens.

The sole added unchanged-Dutch review is exact-source `icons.manifest = "manifest"`: the technical Dutch noun has the same spelling. There is no wildcard approval or English-copy translation. Standard English/Dutch work directly; plain English/Dutch inherit these standard component messages where no profile overlay exists. No new plain or exhibition wording coverage is claimed.

Published source imports only public `@manifest-editor/i18n` APIs/types. The package declares that dependency and explicitly externalizes its root and subpaths in `tsdown.config.ts`. There is no private catalog import in published source. Dutch tests use the optional public `/nl` entry. The lockfile change is restricted to the components importer, reusing existing Vitest/jsdom resolutions. Source typechecking enables `.ts` workspace imports. Publication output is not built or asserted here.

Direct-use behavior and reference props are documented in `packages/components/README.md`: outside a provider, built-in English is used; under the host provider, selection changes propagate. This package does not choose UI locale from browser settings/storage or modify content-language configuration.

## Whole-package review and explicit exemptions

Review covered `src`, `src/hooks`, every icon and the story candidates, beyond the heuristic inventory:

- `CanvasLabel`, manifest/collection list items, `MetadataContainer`, `ProviderImage`, `HTMLAnnotationBodyRender`, and authored portions of `ViewProvider`, `ProviderLink` and `RenderTextualContent` display IIIF content. Existing language maps, HTML rendering, resource labels, URLs, captions and content-language selection remain unchanged. Missing-content/link/canvas labels are UI fallbacks only. The existing `Unknown` provider sentinel remains a legacy content test, not a translated resource value. Composited decorative thumbnail images now have empty alt text; the enclosing canvas item supplies the authored accessible name.
- Generic `ActionButton`, `ControlButton`, `ConfirmSelectionButton`, `AccessibilityButton`, `EmptyState`, notices (`ErrorMessage`, `InfoMessage`, `WarningMessage`), form/layout/handle primitives, `SvgControlBar`, `AtlasBanner` and all other path-only icons receive caller content or have no UI prose. No automatic lookup is applied to their children, titles or authored labels. Caller-owned text must migrate in its owning namespace. `SelectionCheckbox` adds an optional label; React Aria's contextual row association and selection state remain intact.
- `Tooltip`'s missing-provider exception is a programmer diagnostic and remains exact. Console diagnostics and conversion helpers are not user feedback. `LazyThumbnail` previously had an empty error boundary; its new localised fallback does not change retry/network behavior.
- Protocol strings, MIME types, HTML tags, selector/geometry data, resource types, CSS classes, SVG paths/IDs, DOM IDs, slot names, file names and storage keys remain machine data. In particular `grid-sm/md/lg`, `tour_step/${id}`, download MIME/payloads, caption language matching and canvas drag JSON are unchanged.
- Storybook headings, example titles/descriptions and modal body/button fixtures remain illustrative caller content. They do not establish production UI coverage.
- Retained unused seed keys (`empty.manifest/selection`, zoom/reset/fullscreen controls, `errors.title/retry`, `selection.selectItem`) have complete Dutch catalog values but no newly claimed consumer. Current generic primitives expose caller content instead of using those seed defaults.

## Actual acceptance evidence

Nine tests in `packages/components/test`, using real React 19, react-dom, jsdom, the public runtime, React Aria, Vault and MDXEditor (no fake translation function or mocked component renderer):

1. Standalone English fallback, then live Dutch onboarding action/progress; click callback and numeric progress preserved.
2. Deferred creator label/description changes, stable option ID, untouched legacy caller label and real keyboard Enter activation.
3. Grid-size interaction, locale/profile changes, and persistent original grid-size storage key/value.
4. Panel/tab references, selected tab and mounted unsaved form state across locale change.
5. Real portalled modal language, caller children and localised close interaction.
6. Real rich-text toolbar English/Dutch labels, same editable DOM node and edited Welsh Markdown, and no extra change callback on locale selection.
7. Real Vault provider data: authored Welsh provider/manifest labels and the entire vault state remain byte-for-byte unchanged while the edit accessible name changes and its action remains functional.
8. A queued real toast: Dutch region/close names and portal language, unchanged caller title, functional dismissal.
9. Actual tab collection with simulated layout measurements: already-hidden tabs remeasure after longer Dutch labels arrive; overflow names and the selected panel remain correct.

The test environment supplies missing browser primitives (`ResizeObserver`, media query listeners, CSS escaping and scrollIntoView). The overflow test simulates layout widths and waits for the existing measurement interval; jsdom does not supply real layout. Vitest inlines installed iiif-browser/react-timeago for extensionless dependency imports. This is not a production browser/polyfill change.

Final checks from repository root with Node 24 (no package build or server command):

```sh
node packages/components/node_modules/vitest/vitest.mjs run --config packages/components/vitest.config.ts
node node_modules/typescript/bin/tsc --noEmit -p packages/components/tsconfig.json
node node_modules/typescript/bin/tsc --noEmit -p packages/components/tsconfig.test.json
node node_modules/typescript/bin/tsc --noEmit -p internal-packages/languages/tsconfig.json
node node_modules/oxlint/bin/oxlint packages/components/src packages/components/test packages/components/vitest.config.ts
npm --prefix internal-packages/languages run translations:check
```

Tests: **9 passed**. All three no-emit checks pass, including stories in the ordinary package config and tests in the test config. Translation check: **25 Dutch catalog/overlay files, 565 required messages, zero missing and zero unreviewed unchanged English messages**. Targeted formatting and `git diff --check` pass. Oxlint exits successfully with zero errors and 12 existing warnings (SVG/progress semantic-element advice, thumbnail/ProviderImage native-image advice and existing effect dependencies in thumbnail/Card3D/SvgControlBar). The missing decorative-image alt warning was fixed; no warning suppression was added for those existing files. Spinner's SVG animation has a documented semantic-element exception.

Dependency installation used `pnpm install --ignore-scripts`; the final frozen-lockfile installation also disabled scripts. No lifecycle/build hook, build, dev-server operation, browser integration, push or PR action was run.

## Pending dependency and integration evidence

These are explicit gaps, not translated by fallback and not counted as completed Dutch UI:

- Installed `iiif-browser` exposes labels for the toolbar/dialog/output actions (wired above), but has no general locale/message dictionary in `IIIFBrowserProps`. Its browser navigation/search and image-options UI still contain hardcoded English, including the image preview accessible label and option headings. Completing those requires an upstream dependency API/update; copying its UI or editing dependency code is outside this module's assigned scope. Host imports of the same dependency elsewhere remain their owners' work.
- MDXEditor 4.0.4 `plugins/diff-source/DiffSourceWrapper.js` hardcodes parse-error recovery instructions and displays a raw parser error. Its public diff/source params provide no error-renderer/translation override. Normal reachable toolbar/link/image messages use the translation adapter, but malformed-source feedback needs upstream support. CodeMirror search/source dependency UI is also not claimed translated by the toolbar adapter.
- Vidstack's layout/announcer dictionary is complete, but its internal `formatSpokenTime` hardcodes time-unit abbreviations/`hour`; that function is used in time-slider/seek announcements. Its layout dictionary has no unit keys. This requires upstream formatter/locale support (or a separate reviewed custom slider/announcer), rather than claiming dictionary coverage proves all spoken UI.
- Parent owns browser integration against its already-running main feature/i18n checkout, including actual tour progression, overflow popovers, media playback/seek/caption behavior, rich-editor history and full editor undo across switches. No `E2E_TARGET=local` or default Playwright setup was run. RTL visual layout and installed-consumer/publication checks remain integration/release work.

## Parent integration checkpoint

Integrated and reviewed metadata/reference boundaries, React Aria locale wrappers, MDX plugin updates, portal scopes and translated tab measurements. All nine component tests pass again against the merged runtime/profile changes, as does the component-test no-emit check. The live English create/edit/metadata/preview journey passes after consumer dependency bootstrap. Dependency-language gaps above remain open; neither catalog parity nor this regression establishes whole-UI Dutch completion.
