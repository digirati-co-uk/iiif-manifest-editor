# Shared property editors and forms

Status: **First-party consumer migration implemented; integrated browser and upstream dependency gates remain open.** Module: [`packages/editors`](../../../../packages/editors). Baseline: `a80581d4` (foundation ancestry includes `288a0405`). No builds, server operations, pushes or PRs were performed.

Namespace ownership in this change: **editors**. Existing **common** action keys are reused without modifying common catalogs. **editor-api** supplies shared property/resource, behavior, rights, documentation and layout references. [Original generated inventory](../inventories/07-editors.md) is retained unchanged; it is not a completion checklist. [Translator context](../../translations/notes/editors.md) describes message families, interpolation, semantic counts and Dutch terminology reviews.

## Implemented source and APIs

Reviewed all application TS/TSX under `packages/editors/src`, including public barrels, definition metadata, form elements, helper-generated display fallbacks, retained React nodes and dependency boundaries, rather than only inventory seed locations.

- All supported definition labels carry serialisable `labelMessage` references alongside the original legacy string. Locally typed intersections support the concurrent shell metadata contract without editing shell. Existing definitions had no summary text to migrate; their intersection also permits `summaryMessage`.
- Descriptive/metadata forms resolve interface labels, required-statement/provider empty states, confirmations, add/remove/reorder actions, item ordinals and accessible names at render time. Property fields consume `propertyLabels`; rights datalist options keep the exact URI values and resolve supplied Creative Commons names/descriptions. Dimensions retain their original IDs and numerical callbacks, using editor-api field labels and documentation summary/link metadata.
- Technical/linking/structural/annotation/choice/image/media forms, captions, preview fallbacks, viewer flags, annotation drawing tools, region actions and menus use translated copy. Choice, annotation and layout counts use whole `_one`/`_other` messages. Viewing-direction, time-mode, behavior, MIME, service-profile, URI and selector values remain unchanged. Legacy custom behavior InternationalString labels retain their existing fallback; supplied `labelMessage` references resolve through the shared runtime.
- CanvasLayout/size/shape controls consume the original layout/preset objects and `labelMessage` references. Whole instructions, clipping warnings, resize-handle names, image-position actions and size descriptions have English/Dutch copy and plain terminology overlays. Callbacks receive original IDs, slots and geometry.
- Plain, rich and HTML-source controls, link/image dialogs, format/toolbars, imported-HTML guidance, formatting-loss confirmation and content-language controls are translated. No locale/profile key or editor reinitialisation is used. Tiptap's stable placeholder extension reads a current display-text ref; changing wording does not reconstruct ProseMirror.
- `LanguageFieldEditor` adds optional `labelMessage` with legacy `label` fallback. `MediaEditorSection` adds optional `labelMessage`. `createAppActions(editor, callback?, editorsTranslate?, commonTranslate?)` and `getPaintingChoiceCandidates(vault, refs, editorsTranslate?)` accept real public translators and retain their standalone English defaults. All internal callers pass the appropriate translators; no private authoring imports enter published source.
- `contentLanguageName` uses the UI locale for `Intl.DisplayNames`, retaining unknown/invalid authored tags verbatim and translating `none` separately. It does not filter tags against UI locale availability or change persisted content-language configuration. Captions use the same policy. Annotation-body defaulting no longer overwrites an existing authored language when language controls are hidden.
- `NavigationDateField` localises the actual calendar, month/year navigation, date/time field names and invalid-input alert. It passes Date/null callbacks unchanged. Equal timestamp values retain a stable Date object even when `getDate()` allocates on a parent render, protecting an incomplete date draft. Calendar display follows UI locale; storage/timezone conversion remains in the unchanged editor-api NavDateEditor.
- The installed date widget's `react-fit@1.7.1` imports ReactDOM.findDOMNode, removed by React 19. Editor-owned dependencies were moved to `react-datetime-picker@6.0.1`, `react-calendar@5.1.0`, `react-clock@5.0.0`; `react-fit@2` uses the compatible implementation. All installs used explicit `--ignore-scripts`. Only this module's importer and corresponding dependency snapshots changed; root patches/workspace configuration were preserved.
- Sortable metadata and resource lists supply translated dnd-kit instructions, role descriptions and position-based live announcements. Resource IDs remain identifiers, not translated labels.
- Atlas crosses a custom React renderer and creates separate DOM roots in HTMLPortal. `EditorI18nBridgeContext`, `useEditorsTranslations`, `EditorI18nBoundary` and the internal `EditorHTMLPortal` adapter transfer the **actual** runtime through existing custom context bridges, owned HTML portals, viewer/media controls and context-menu/annotation-popup boundaries. Existing providers are retained when present, including their controlled callbacks. Retained annotation-request nodes use a subscribing message component. Native-scene hooks subscribe to that actual bridged instance without inserting the public provider’s DOM wrapper into Atlas. Only DOM roots receive a public provider. No runtime object is placed in persisted config or worker messages.

English is the standalone default. Dutch is explicitly enabled by the host using the public `@manifest-editor/i18n/nl` catalogs/overlays. Standard and plain English/Dutch are implemented; no extra production locale is advertised. Shared runtime dependency/externalisation bootstrapping from `462da8a6` remains intact.

## Invariants and reviewed exemptions

Authored IIIF InternationalString content, content-language tags, IDs, stable input IDs, creation defaults (`Your institution`, `Untitled collage`, empty English metadata/body defaults), MIME/URI/protocol strings, navDate timestamps/timezones, dimensions, selectors, vault mutations and undo/worker transport retain their existing semantics. Authored strings are not looked up in catalogs. Literal HTML placeholders and link protocol examples remain technical examples. Caption format acronyms (WebVTT/SRT/TTML) remain standard names.

Existing unsupported/no-UI code is not promoted to a supported feature:

- `accompanyingCanvas`/`placeholderCanvas` in DescriptiveProperties remain the pre-existing unrendered TODO fields.
- Behavior template editing remains unimplemented; its previous “todo” surface now explains that limitation in English/Dutch.
- `ReorderList/ReorderList.tsx`, `strict-mode-droppable.tsx` and `ReorderListItem/ReorderListItem.tsx` are the old react-beautiful-dnd implementation, not imported by supported module code or exported by the public barrel. Active sorting uses `.dndkit`.
- Local `RenderAnnotationEditing.tsx`, `SVGAnnotationEditor.tsx` and `use-svg-editor.tsx` form an unused older implementation; InternalRenderCanvas imports the active renderer from react-iiif-vault. Existing local visible copy was migrated, but unused SVG theme `name` strings remain compatibility/style data, with no rendered picker. `use-resize-world-item.ts` is unused; active ResizeWorldItem uses Atlas's hook. `ResizeCanvasOnCanvas` is commented out in the viewer and its strings are developer logging.
- `SelectSearchField` and `ImageServiceSizeField` have no supported production caller or public export. SelectSearchField is reached only by its story; story labels/fixtures remain development content. Image-size options are numerical technical values. CSS, inline SVG paths, attribution URLs, throw/assert diagnostics and console logging are not UI catalog data. The fixed OpenStreetMap legal attribution is retained.

## Actual verification

Run from repository root with working Node 24; package-directory login shells may select broken Node 18. No command below builds a package or starts a server.

```sh
node packages/editors/node_modules/vitest/vitest.mjs run --config packages/editors/vitest.config.ts
node node_modules/typescript/bin/tsc -p packages/editors/tsconfig.source.json
node node_modules/typescript/bin/tsc -p packages/editors/tsconfig.test.json
node node_modules/oxlint/bin/oxlint packages/editors/src packages/editors/test
npm --prefix internal-packages/languages run translations:check
```

- **45 tests pass in 10 files**: 15 new mounted component/boundary tests plus 30 existing editor/helper regressions. Actual public runtime/i18next and actual Tiptap/ProseMirror, react-datetime-picker and dnd-kit are used. Shell/resource fixtures supply editor context; the technical form test uses a real Vault/EditorInstance. The separate-root bridge fixture models Atlas's DOM-root boundary without the canvas renderer. No translation function is faked.
- Checks cover Welsh content under English/Dutch UI, invalid authored tags, Label→Titel through API plain wording, real rich-editor identity/focus/selection/undo, focused plain/incomplete-source drafts, formatting-loss cancellation, date widget accessible copy and invalid feedback, unchanged timestamp, equal-instant date draft retention, actual MIME/dimension mutations, viewing-direction callbacks, layout IDs/geometry, semantic image counts, sorting instructions, controlled-provider inheritance and cross-root draft preservation. A long host-copy pseudo RTL test checks provider direction and accessible controls; it is not a real Arabic translation or visual layout test.
- Source and test no-emit checks **still fail with 44 pre-existing diagnostics**, 30 in this module and 14 in shell. A TS 6.0.3 compiler-host comparison against tracked baseline source under identical local source mappings found **44 before / 44 after, zero introduced file/code/full-message signatures**. TS 7 source/test commands also report 44 diagnostics and no diagnostics in the new tests/bridge/date/i18n files. This is a regression comparison, not a passing project typecheck. No suppression, broad cast or shared-config change was used to claim success.
- Strict Dutch review currently reports **26 catalog/overlay files, 1095 required messages, zero missing, zero unreviewed English matches**. Exact-source Dutch cognate/technical reviews are scoped to editors entries in `unchanged-nl.json`; no wildcard approvals. This count covers the current repository catalogs, not all application UI.
- Oxlint exits 0 with **50 warnings / zero errors**, versus **52 baseline warnings**. A file/rule/message comparison (normalising dependency-list ordering) found zero introduced warning signatures. These are existing source/accessibility/dependency warnings, not a warning-free lint result. Formatting and `git diff --check` pass after manual diff review. The languages package’s **68 tests pass**.
- Publication builds, tarballs, emitted declarations and installed-plugin identity were not verified because builds are forbidden.

The exact unchanged diagnostic families are:

| Source                                           | Existing signature(s)                                                                                                                                |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| BehaviorEditor                                   | TS2322: `RefObject<AccordionItemRef \| null>` is not assignable to `RefObject<AccordionItemRef>` (1).                                                |
| Local RenderAnnotationEditing                    | TS2339: `toolType` missing on `AtlasStore` (1).                                                                                                      |
| RenderContextMenu / RenderCurrentContextMenuItem | TS2550: `toReversed` absent from configured library (2).                                                                                             |
| use-polygon-helper                               | TS2305: shell has no exported `AtlasStoreEvents` (1).                                                                                                |
| use-resize-world-item                            | TS2554 zero-argument refs (3), TS2552/2304 missing `getRatio` (2), TS2322 undefined to string (1).                                                   |
| use-svg-editor                                   | TS2554 zero-argument refs (8), TS2339 missing `lineBoxMode` on `SlowState` (1).                                                                      |
| Metadata                                         | TS2554 zero-argument ref (1); TS2322 undefined/number-or-undefined assigned to number (2).                                                           |
| NavPlaceEditor                                   | TS2554 zero-argument ref (1).                                                                                                                        |
| choice-painting-annotations                      | TS2322 Choice/ContentResource normalized imports (2), annotation import discriminator/motivation mismatch (1), unknown annotation record import (1). |
| useContentResource                               | TS2322 normalized readonly service array versus mutable resource generic (1).                                                                        |
| Module dropdown interop                          | TS2339 `default` on `never` (1).                                                                                                                     |
| Shell Layout / Layout.focused                    | TS2345/2322 Vault3/Vault4 layout-context incompatibilities (13).                                                                                     |
| Shell dropdown interop                           | TS2339 `default` on `never` (1).                                                                                                                     |

## Remaining integrated gates and exact dependency call sites

- **Parent-owned browser integration remains pending.** Run against its already-running port 3000 with `E2E_TARGET=watch`, never local/default Playwright webServer setup. Verify actual canvas/portal contexts, unsaved annotation request, metadata reorder, long-form sizing/focus, calendar popovers, RTL geometry and whole-editor undo under locale/profile switches. JSDOM cannot establish those visual/integrated behaviors.
- Shell metadata/provider integration is concurrent. Reconcile the serialisable `labelMessage`/`summaryMessage` intersections with the final public shell types; test definition labels under locale/profile switches in the integrated host. Do not use a locale/profile React key or spread hook snapshot as a provider instance.
- IIIF Browser UI is reached through `LinkingProperties.tsx` partOf `inlineActions` / `initialData.iiifBrowserOptions` and `IIIFBrowserFromPartOfButton` in LinkingPropertyList, plus `CanvasComposition`'s slot browse action → `CanvasLayout/useAddCanvasImage.ts` → `@manifest-editor/iiif-browser-creator`. The owned launch/action labels are translated. These callers retain their exact history/navigation/placeholder payloads and do not import a speculative adapter. Parent must wire the forthcoming shared Browser dictionary adapter at the creator boundary.
- Media delegates through `InternalRenderCanvas` (`RenderVideoStrategy` with the bridged IIIFMediaPlayer), `NonAtlasStrategyRenderer` and components HTMLEditor in AnnotationBodyEditor. Vidstack spoken units/internal aria and MDX/CodeMirror upstream copy remain the dependency-followup owner's gate; first-party labels do not establish their completion.
- **Additional reachable dependency gap:** `NavPlaceEditor` → `EditControl` constructs Leaflet.draw's `L.Control.Draw`. Leaflet's default zoom buttons and Draw toolbar/edit/draw tooltips remain upstream English. Draw's localization uses global `L.drawLocal`, which cannot safely supply two independent editor locales. No global mutation or DOM translation hack was introduced. A scoped dependency adapter/patch is still needed; map geometry and active drawing state must survive locale changes.
- The exported `AnnotationTargetEditor` also delegates shape controls to `react-iiif-vault`'s `RenderSvgEditorControls`; inspect upstream copy/localization before whole-viewer completion. Owned tools and resize handles are translated, but that does not prove all dependency-generated shape UI is translated.

## Acceptance evidence

- [x] Welsh language maps/tags remain intact under English/Dutch interface and plain wording changes (mounted tests).
- [x] Label→Title/Titel changes display metadata without changing property IDs or serialized content.
- [x] Focused real rich editor preserves instance, document, selection/history and drafts through UI changes.
- [x] Real date-picker accessible names, calendar navigation and validation are translated; Date callbacks/storage semantics are preserved.
- [x] Strict full English/Dutch editor catalogs and plain overlays pass review, with whole plural messages.
- [ ] Integrated browser, full upstream map/viewer/dependency accessibility copy and publication verification. Do not mark whole module/application UI complete until these gates pass.
