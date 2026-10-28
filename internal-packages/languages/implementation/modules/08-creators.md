# Resource creator forms

Status: **Consumer migration implemented and interaction-tested; parent browser integration and publication checks remain pending.** Based on parent `c43037ee735d6b8913fd0012a41f8b9fb36ebeb2` (28 October 2026).

Module: `packages/creators`. Own namespace: **creators**; reuse **common** actions/status, **editor-api** property/resource labels, and the existing **editors**, **components**, **ui** dependency adapters. No shared runtime, shell, component, root index, generated inventory or publication configuration was changed.

## Completed integration

All 24 entries in `allCreators`, the separately exported manifest browser creator, and the unregistered example definition have deferred label/summary references. The highlight action and browser metadata-copy checkbox have deferred references too. Shell06 resolves them at display time. Legacy English fields, IDs, tags, configuration IDs/defaults, supports/probes and resource fields remain intact. Range/provider labels reuse editor-api resource/property references; field labels use editor-api wording, including Title/Titel in plain mode.

All forms resolve visible first-party instructions, actions, placeholders, validation help, accessibility names, media failure headings, preview alternatives and loading/error feedback at render time. English and real Dutch standard/plain catalogs are supplied: **103 creators base messages and 25 English/Dutch plain overrides**. This is declared catalog coverage, not an upstream whole-product claim. No fallback/defaultValue or blanket English-copy exemption is used as Dutch evidence. Four added exact-source reviews cover only HTML, Video, YouTube and the pixels dimension message. Translator notes explain terminology, formatted dimensions, caption language and external diagnostics.

The three direct browsers (`Canvas/InternalCanvas/index.tsx`, `Manifest/ManifestBrowserCreator/manifest-browser-form.lazy.tsx`, `ContentResource/IIIFBrowserCreator/iiif-browser-form.lazy.tsx`) use `LocalizedIIIFBrowser`. The maintained browser dependency captures its output descriptors at mount. Creator-owned output descriptors therefore expose display-time label getters, resolving through the live instance-bound translator, so locale/profile changes do not replace browser stores or freeze labels. The real-browser tests cover history object/location identity, selected IDs, an open search query/input, translated navigation/actions, untouched Vault content, and callback IDs/output resources. Both public lazy-form initial-data interfaces additionally accept an optional `actionLabelMessage` reference for caller-owned wording. No lookup is applied to fetched resource labels.

`notebook.canvasActionLabel` remains a literal host-authored compatibility fallback. A host needing localized custom wording can pass `initialData.actionLabelMessage`; the parent owns adding a shell/preset notebook message-reference contract or forwarding one in its own scope. No implicit English-string translation or alteration of custom host copy was introduced.

Image-service and thumbnail requests now retain form-owned loading/failure state across locale/profile changes, display localized status and recoverable fetch feedback, and handle rejected requests instead of leaving unhandled promises. Thumbnail size labels use locale-formatted numbers in a whole message; request URLs and callback dimensions remain machine values. Known VTT/browser creation failures map to serializable `validationErrorMessage` descriptors, preserving thrown errors and creation behavior. Unknown errors retain shell handling. External media diagnostics stay verbatim under a translated friendly message and technical-details heading.

## Whole-module review and exemptions

Reviewed all 60 pre-existing source files (including CSS and the existing service regression test), plus the two new helpers, beyond the heuristic inventory:

- **Agent/ProviderCreator:** picker definition, controlled provider/homepage/logo/ID fields, identifier explanation and submit action migrated. Authored labels, homepage label fallback `{ en: ["Homepage"] }`, logo/homepage URLs and existing homepage payload construction are unchanged.
- **Annotation:** all definitions under AudioAnnotation, VideoAnnotation, CaptionedImageAnnotation, HTMLAnnotation, ImageServiceAnnotation, ImageUrlAnnotation, ImageUrlListAnnotation and NoBodyAnnotation migrated. Audio/video fields and friendly failure UI, image-caption placeholder/action, HTML action, and shared service/image/list renderers migrated. Rich/media editor internals delegate to modules04/05/07. Existing shared caption/HTML draft state, authored body maps, language choices, motivation, targets, selectors, media duration/dimensions and generated IDs are untouched. Existing English authored defaults (including `Untitled HTML canvas`) remain content, not UI translations. `Unsupported target type` is an unchanged developer guard, not UI copy.
- **AnnotationPage:** EmptyAnnotationPage definition; VttAnnotationPage definition/form/help/URL and language-code titles/action and known validation descriptors migrated. WebVTT protocol, `text/vtt`, `supplementing`, target and authored `Captions in WebVTT format`/`en` defaults remain unchanged. UI locale never chooses caption language.
- **Canvas:** EmptyCanvas definition migrated; actual layout form delegates to migrated editors07. InternalCanvas browser/action migrated. Empty labels, Canvas/layout IDs, default dimensions and embedding unchanged. `Manifest is not loaded` / `Selected Canvas is not loaded` remain developer guards for the existing-context-only picker.
- **ContentResource:** all HTMLBodyCreator, IIIFBrowserCreator, ImageServiceCreator, ImageUrlCreator, ImageUrlListCreator, PlaintextCreator, ThumbnailCreator, WebPageCreator and YouTubeCreator definitions/forms reviewed and migrated. HTML/editor widgets inherit their own adapters. Authored `View as text`, empty labels, `Untitled canvas`, `Untitled YouTube canvas`, text language defaults, platform names, URL examples, service data, `info.json`, MIME types, protocol request segments and YouTube parsing/output remain unchanged. Thumbnail helper math/request serialization and image-service compaction configuration are data-only. No textual counts were found outside the browser adapter's own semantic count messages.
- **Manifest/ManifestBrowserCreator:** separately exported definition, lazy browser and caller action migrated; known missing-resource errors map to descriptors. Fetched manifests/collections, labels, summaries, thumbnails and callback IDs retain their existing behavior. No resource-loading policy changes.
- **Range:** both RangeWithItems and TopLevelRangeCreator definitions/forms migrated. Shared range terminology and complete standard/plain sentences are used. IDs, item references, authored `Untitled range` / `Table of Contents` defaults and grouping behavior remain unchanged.
- **ExampleCreator:** unregistered example label/summary migrated; example content/defaults and registration status unchanged.
- **`index.ts`, `index.css`, `resource-probes.ts`, `ContentResource/image-service-options.ts`, `ContentResource/IIIFBrowserCreator/iiif-browser-output.ts`, `ContentResource/ThumbnailCreator/thumbnail-helpers.ts`, all four `side-effects/*.ts`:** exports/styles, probes, transport, URL/selector/size math and vault mutations reviewed as non-display data. No localization or behavior changes in these data paths. The index adds type-only exports for the two browser initial-data interfaces without eagerly importing either lazy form. Existing service-output regression test retained.
- **New helpers:** `use-service-request.ts` owns transient request status only; `validation-messages.ts` recognizes first-party error strings and returns UI descriptors only. No worker, IIIF payload, undo history, ID or authored language changes.

## Acceptance evidence

- [x] Real runtime and real creator form interaction tests pass in English/Dutch and plain wording. Language-field DOM/draft identity, original Welsh/French InternationalString values, URL list callbacks, VTT language/label/IDs, range item IDs and numeric thumbnail dimensions/URLs are asserted.
- [x] In-flight thumbnail/service requests survive locale changes without another fetch or draft reset. Retained failures retranslate. Successful thumbnail loading, size selection and later locale switching retain the same preview DOM/URL and original service payload.
- [x] All three real browser forms retain navigation/history, search drafts, selection and Vault content; action labels and navigation update live; callback IDs remain unchanged. Separate tests verify caller-owned action references in both lazy-form implementations. Shell hooks supply isolated fixtures; translators, forms, browser stores/rendering, property editors and Vault are real. No browser or translator mock is used.
- [x] **17 Vitest tests pass** (14 interaction/catalog-reference tests plus 3 existing service-output regressions). **38 catalog parity/review tests pass.** Strict Dutch check: **1662 required messages, zero missing/unreviewed English copies** across the combined checkout.
- [x] Source no-emit check compared against the original parent source using the same local alias configuration: **69 diagnostics before and after, identical file/code/message signatures** after ignoring shifted line/column positions. **No creators source or test diagnostics** in the final test-inclusive check. The check remains nonzero due to unchanged dependency errors; this is not a clean full-source typecheck claim.
- [x] Targeted oxlint exits successfully; only two portable `<img>` Next-specific warnings remain. Formatting is checked for changed TS/TSX/config files. `git diff --check` passes.
- [ ] Parent owns live/integrated browser testing on its running port3000 checkout, actual playback/crop/keyboard behavior, and the unresolved parent Turbopack `gapcursor` SSR problem. This isolated checkout did not test against the parent's server.
- [ ] Independent notebook commands, Leaflet/Draw and vault shape controls remain upstream gaps documented by module04. Internal browser tests also emit upstream React Aria accessible-name warnings; no claim that the upstream browser is free of all accessibility defects is made.
- [ ] Publication/tarball/RSC/declaration behavior remains module29's release check. Existing creators dependency/externalization of public `@manifest-editor/i18n` is retained. No package build, dev/predev hook, server operation, browser webServer setup, push, PR or delegation was run.

## Reproducible no-build checks

Run from repository root with Node24 (package-directory login shells can select a broken Node18):

```sh
pnpm install --ignore-scripts --frozen-lockfile
node packages/creators/node_modules/vitest/vitest.mjs run --config packages/creators/vitest.config.ts --maxWorkers 1
node node_modules/typescript/bin/tsc --noEmit -p packages/creators/tsconfig.source.json
node node_modules/typescript/bin/tsc --noEmit -p packages/creators/tsconfig.test.json
node node_modules/oxlint/bin/oxlint packages/creators/src packages/creators/test packages/creators/vitest.config.ts
npm --prefix internal-packages/languages run translations:check
node --test internal-packages/languages/test/nl-parity.test.mjs internal-packages/languages/test/translation-review.test.mjs
```

Both local no-emit configs contain source aliases only for verification; publishing/watch tsconfig is unchanged. Frozen installation used lifecycle scripts disabled. The creators package now declares the existing workspace jsdom26.1.0 test dependency explicitly; its importer is the only lockfile change, with no new resolution/snapshot or publication dependency changes. The initial unconstrained Vitest worker run exited without results; all reported acceptance results use the explicit single-worker command above. Builds were not used to resolve dependent-source diagnostics.
