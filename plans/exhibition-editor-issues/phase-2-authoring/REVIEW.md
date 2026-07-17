# Phase 2 integration review

Run this review after tasks 2.1–2.4 are complete and committed, using the accepted Phase 1 integration commit as the common base.

## Merge preparation

1. Check each branch against its declared ownership. A creator change in 2.1 or list-lifecycle change in 2.2 needs an explicit explanation before merge.
2. Merge the four branches one at a time and inspect conflict resolutions for duplicated selection, panel, or creator logic.
3. Run `git diff --check` and inspect `git status --short` before tests.
4. Commit integration-only fixes only after the combined behaviour below passes.

## Automated review

- Run every focused regression added by tasks 2.1–2.4.
- Run targeted typechecks for the exhibition preset and any shared rich-text/manifest package changed.
- Confirm deletion neighbour selection is tested as a pure rule and every UI entry point uses it.
- Confirm creator availability is tested for empty and non-empty scroll exhibitions.
- Confirm Back/Cancel in the image form dispatches no manifest mutation.
- Confirm the MDXEditor upgrade has one resolved version, only the Browser image plugin is registered, and plugin CSS is not loaded by the base Browser.
- Confirm no custom Browser history key was introduced and existing HTML round trips without a data-format migration.
- Do not build packages and do not alter the running development server.

## Browser matrix at localhost:3000

Use the Delft and Leeds sample manifests. Exercise full-page, slideshow, and scroll formats.

### Lists and deletion

1. Add three slides, reorder the active middle slide, and verify it remains active.
2. Delete active first/middle/last slides and verify next-else-previous selection.
3. Delete a non-active slide and then the only remaining slide.
4. Confirm each format exposes its reorder/edit controls and the empty prompt is reachable.

### Creator parity

1. Add the reported medieval scroll manifest through the IIIF Browser as a second slide.
2. Confirm tabs, behaviour controls, content, selection, and Preview before and after reload.
3. Confirm creator settings are shared rather than duplicated.

### Manifest, splash, and info box

1. Click the exhibition title and verify manifest properties open on the right without the overview detour.
2. Edit manifest label/summary from the first splash; move it away from first and confirm the controls disappear.
3. Open new and existing info boxes, edit their labels, cancel IIIF image insertion, and successfully insert an image.
4. Insert an IIIF image in a tour-step summary and confirm both surfaces reuse the existing Browser history.
5. Reload and inspect manifest JSON for the correct resource targets and serialized HTML.

## Cross-task regression review

- Adding content and deleting it never leaves a stale annotation or right panel.
- The scroll creator output participates in the same reorder/delete flow as blank slides.
- Manifest-level splash fields do not overwrite canvas label/summary.
- Rich-text image cancellation preserves unsaved surrounding text.
- Existing HTML content survives the editor upgrade and the snippet plugin is absent.
- Preview/template behaviour accepted in Phase 1 still works.

## Phase decision

- [ ] Four focused task histories are present.
- [ ] Automated checks pass, or pre-existing failures are documented.
- [ ] All three exhibition formats pass the authoring matrix.
- [ ] Reload/export checks prove changes are persisted, not UI-only.
- [ ] Integration fixes are committed after review.
- [ ] The accepted integration commit is recorded in the Phase 3 kickoff.

Do not begin Phase 3 with unresolved stale-selection, malformed creator-output, or data-targeting defects.
