# P2–P3 — Editor fidelity and ergonomics

## Objective

Close editor-side fidelity gaps without making the editor a second exhibition viewer. The viewer remains the canonical renderer; the editor should reuse its persisted behaviour rules and render safe small previews.

This plan covers:

- P2: scroll cover sidebar preview differs from the viewer and renders HTML incorrectly.
- P2: tour-step text should become editable when clicked.
- P2: unwrap values whose only HTML is `<p>` and/or `<br>` into plaintext.
- P3: restore Cover text content (manifest label/summary editing).

The P3 required-statement placement and empty-value fallback are viewer changes. Cropped thumbnails and IIIF Browser multi-up/Choice support have explicit handoffs below.

## Work items

### 1. Make the compact scroll preview match the viewer's content contract

**Owned areas:** `components/ExhibitionPreviewList.tsx`, `components/SlideshowSlidePreview.tsx` only if shared thumbnail rules fit, `right-panels/summary-html.ts`, and focused preview tests.

1. Compare `ScrollPreview` to `exhibition-viewer/src/components/scroll/ScrollImageBlock.tsx` using the same canvas fixtures: uncropped/cover image, label only, HTML summary, split/floating layouts, and splash.
2. Share or mirror only the small data decisions: `cover`/`image-cover` behaviour, image aspect ratio, and whether a label/summary exists. Do not import the viewer or recreate its layout engine in the editor.
3. Render the preview summary through the existing safe HTML pathway. Clamp visual output in CSS, but do not display markup as text or strip semantic formatting before persistence.
4. Keep the card preview intentionally compact. Document any intentional visual difference (for example, no interactive Atlas viewer) in the test/fixture rather than attempting a pixel-for-pixel viewer clone.

**Acceptance:** cover cases use the same fit decision as the viewer, HTML summary is rendered safely, and splash/ordinary cards retain their existing selection and click behaviour.

### 2. Edit tour text directly from its text content

**Owned areas:** `TourNormalAnnotationEditor.tsx`, `TourPaintingAnnotationEditor.tsx`, `TourStepHtmlForm.tsx`, and tour-editor interaction tests.

1. Make the displayed label/summary region keyboard-accessible and activate the existing `isOpen` state on click/Enter/Space. Stop propagation only where required so the surrounding workbench selection still works.
2. Reuse the existing Finish/Save operations; do not introduce autosave, a second form, or separate label and summary modals.
3. Ensure one click selects the relevant tour step in the workbench and opens the form; click-through controls such as Delete, alignment, and annotation editing keep their current meaning.
4. Test normal textual bodies and painting-annotation label/summary separately, including empty optional labels from P0–P1.

**Acceptance:** clicking or keyboard-activating text enters the same editor as the existing Edit button, preserves focus, and saves exactly through the established path.

### 3. Save trivial rich text as text, without flattening real HTML

**Owned areas:** `right-panels/summary-html.ts` and the related editor normalisation call sites/tests.

1. Add a pure helper that recognises values made only of paragraph wrappers and line breaks. Decode text/HTML entities and join meaningful lines deterministically; whitespace-only content becomes empty.
2. Apply it only when the complete sanitized value is structurally trivial. Leave links, images, headings, lists, emphasis, attributes, or mixed inline/block markup as HTML.
3. Use the same helper for summary-capable editor saves (canvas/manifest summary and painting tour summary) so the behaviour is predictable. Do not apply it to arbitrary annotation bodies or IIIF image HTML.
4. Add fixtures for `<p>Plain text</p>`, `Plain<br>text`, nested trivial wrappers, empty paragraphs, entity decoding, and HTML that must remain HTML.

**Acceptance:** plain text does not accumulate meaningless `<p>`/`<br>` wrappers, while semantic rich text and IIIF image markup still round-trip unchanged.

### 4. Restore Cover text-content editing as manifest editing

**Owned areas:** `right-panels/ExhibitionCanvasEditor.tsx`, `ExhibitionSummaryEditor.tsx`, `right-panels/opening-splash.ts`, `components/ExhibitionPreviewList.tsx`, and opening-splash tests.

1. Start from the existing opening-splash predicate rather than adding a generic canvas “Cover” field.
2. When the first selected splash/cover canvas is active, show the Text content tab with manifest label and summary controls. Bind through `useManifestEditor()` so it edits Manifest data, not duplicate Canvas fields.
3. Hide the tab/fields immediately when the canvas is no longer the first splash, is removed, or is an ordinary cover image. Retain normal canvas summary editing for non-splash content.
4. Verify sidebar and remote preview update from the manifest values, then reload/export to prove the fields were persisted on the Manifest.

**Acceptance:** Cover exposes the requested manifest title/summary workflow again, with no duplicated or stale canvas text fields.

## Cross-repository handoffs

| Report | Owning implementation | Editor responsibility |
| --- | --- | --- |
| Required-statement caption, empty black overlay, and lower placement | `exhibition-viewer` P0–P3 plans | Render the source fields faithfully in small splash previews; do not add separate caption metadata. |
| Cropped-image thumbnails | Manifest Editor's existing Phase 3.3 and `exhibition-viewer` P2–P3 plan | Reuse canonical Image API selector data; do not store a thumbnail derivative. |
| Crop cancel/UI, multi-up crops, Choice/multispectral | `iiif-browser` P2–P3 plan | Consume its canonical Canvas/Image Service selection output in creators; no editor-only selector format. |

## Verification

Run focused helper/component tests and targeted preset typechecks. At port 3000, use a disposable scroll exhibition to compare card and viewer cover behaviour, edit tour text by clicking it, save plain and rich summaries, and move the opening splash to verify Cover fields appear/disappear. Do not run a build or manage the development server.
