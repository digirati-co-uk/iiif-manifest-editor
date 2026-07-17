# 2.4 Info-box and shared IIIF rich-text editor

## Objective

Keep the info-box label in the main editing panel and replace the broken rich-text image flow with the IIIF Browser image plugin in the shared HTML editor. The same editor must support IIIF image insertion in info boxes and tour-step summaries without changing their persisted HTML format.

## Owned files/areas

- The exhibition `InfoBoxPanel` and info-block editor
- `presets/exhibition-preset/src/components/TourStepHtmlForm.tsx` only for the shared summary editor
- `packages/components/src/HTMLEditor.tsx`
- `packages/components/src/MDXEditor.tsx`
- A small HTML-language field adapter in `packages/editors` if needed to preserve the info-box language controls
- Direct package manifests, the Phase 2 lockfile update, and MDX plugin CSS imports
- Focused HTML round-trip, rich-text, info-box, and tour-step tests

The label already appears in the current panel in some paths. Treat that as behaviour to preserve and test, not a reason to duplicate it.

This task owns the Phase 2 lockfile. Other Phase 2 tasks must not run a general install. Use `iiif-browser/mdxeditor`; do not install or expose the separate snippet plugin.

## Confirmed architecture

- `HTMLEditor` already wraps MDXEditor while persisting serialized HTML through Showdown/Turndown.
- Info boxes and tour-step summaries currently use `TiptapRichTextLanguageField`; they must use the shared `HTMLEditor` for this feature to reach both requested surfaces.
- The Browser image plugin inserts an escaped `<img>` element. Existing HTML remains HTML; there is no MDX migration and no new manifest field.
- `c69b412` requires MDXEditor 4, while this workspace currently pins MDXEditor 3. Upgrade the direct consumers together and resolve only real v4 API changes.
- Browser history must use the established default key. Do not pass a new `localStorageKey` from the plugin adapter.

## Implementation steps

1. Reproduce both creating and reopening an info box. Identify which state/path loses or relocates the label.
2. Add a focused test that the label control is in the primary info-box panel in both paths.
3. Upgrade the direct MDXEditor consumers to the version required by the Browser plugin. Keep the change limited to compatibility fixes in the existing wrapper.
4. Replace the wrapper's direct `imagePlugin()` registration with `iiifBrowserPlugin` so MDXEditor has only one image plugin, then add `InsertIIIFBrowser` to the existing toolbar. The existing generic URL button may remain if its regression still passes. Import the plugin-only stylesheet beside the MDX editor stylesheet rather than adding it to global Browser CSS.
5. Pass Browser configuration without a history key override. Enable the image action and leave `canvasSnippet` disabled.
6. Make `HTMLEditor` round-trip existing HTML and the plugin's generated `<img>` without losing `src`, escaped `alt`, or `data-iiif-image`. Verify the repository's existing sanitization boundary still applies; do not add a second HTML format.
7. Route info-box bodies and tour-step summaries through `HTMLEditor`. Preserve info-box language selection/removal with one small adapter around the shared editor rather than duplicating it in each surface. A language switch or selected-resource change must remount/reset the editor deliberately rather than showing stale content.
8. Use the plugin's Browser -> image options states for insertion. Back, Escape, and Close must make no manifest mutation and restore focus/draft state; successful insertion adds exactly one image and returns to the editor.
9. Reuse the current label and language controls. Do not add the snippet plugin, a second history store, or a routing framework.

## Automated checks

- Test label visibility for new and existing info boxes.
- Test MDXEditor 4 compatibility and existing HTML -> markdown -> HTML round trips.
- Test generated IIIF `<img>` preservation, including escaped alternative text.
- Test image-form open -> Back, open -> Escape, validation failure, and successful insert.
- Exercise the same IIIF toolbar action once through an info box and once through a tour-step summary.
- Assert cancel does not dispatch a manifest update and insert dispatches once.
- Run focused tests and targeted typechecks for the affected packages; do not build packages.

## Browser checks at localhost:3000

1. Open an existing info box in each sample manifest and confirm its label is immediately editable in the main panel.
2. Add an IIIF image, use Back, and confirm text and draft fields are unchanged.
3. Repeat with Escape.
4. Add a valid IIIF image and confirm the editor returns, the image is visible, and saving/reloading preserves serialized HTML.
5. Try an invalid/empty image value and confirm the user can recover without closing the whole slide editor.
6. Repeat insertion in a tour-step summary and confirm it uses the same Browser history as the normal Add media Browser.

## Acceptance criteria

- Info-box label is consistently in the main editor panel.
- Info boxes and tour-step summaries expose the IIIF image action through the shared HTML editor.
- Image insertion has an obvious non-destructive way back.
- Cancel and validation errors do not lose the rich-text draft.
- Successful insertion does not strand the user in the image form.
- Existing HTML survives unchanged in meaning and new content remains serialized HTML.
- Browser history is shared under the existing default key, with no duplicate history/settings entry.

## Commit guidance

Commit the dependency/wrapper compatibility separately if useful, then the surface integration once round-trip and cancellation tests pass. Suggested final commit: `feat(exhibition): insert IIIF images in rich text`.
