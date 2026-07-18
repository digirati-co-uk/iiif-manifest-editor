# Phase 3 integration and final review

Run after tasks 3.1–3.5 are complete and committed, based on the accepted Phase 2 integration commit.

## Merge preparation

1. Confirm the five branches stay within behaviour controls, Browser rotation, thumbnail rendering, tour labels, and crop editing respectively.
2. Merge one at a time. Pay particular attention to selector-shape conflicts between rotation and cropped-thumbnail tests.
3. Inspect `git diff --check`, `git status --short`, and the full manifest-fixture diff.
4. Commit any integration fix only once its combined regression passes.

## Automated review

- Run all focused Phase 3 tests plus the relevant Phase 1 creator/Browser tests.
- Run targeted typechecks for the exhibition preset and Browser creator adapter.
- Confirm behaviour transform tests preserve unknown values.
- Confirm selector fixtures cover crop-only, rotation-only, and crop-plus-rotation.
- Confirm the tour-label test includes save and rehydration.
- Confirm crop-edit eligibility excludes `Choice` bodies and uncropped/non-painting annotations.
- Confirm crop Save writes once, every cancellation path writes zero times, and a service error disables Save.
- Confirm a single-image crop updates derived dimensions/thumbnail while a multi-annotation composition keeps its canvas dimensions.
- Do not build packages or manage the development server.

## Browser review at localhost:3000

Use both sample manifests and inspect exported manifest JSON after each group.

1. On a scroll tour, change annotation layout left/right repeatedly. Confirm the image remains in edit, Preview, and `behavior` after reload.
2. Toggle image cover on every supported non-splash format and verify unsupported formats do not offer a dead control.
3. Add a rotated Browser image; reload and confirm rotation in the painting body and Preview.
4. Add a cropped-and-rotated image; confirm both transforms coexist.
5. View that slide in the exhibition grid and confirm its thumbnail uses the crop.
6. Compare an uncropped slide to ensure its thumbnail path and loading performance remain normal.
7. Create a full-image tour step, clear “New step,” navigate away, reload, and confirm it remains empty.
8. Edit an existing crop in the modal; verify its saved region is initially selected against the full source image.
9. Save crop-only and crop-plus-rotation edits, then verify edit view, Preview, grid thumbnail, and exported JSON.
10. Cancel through the visible action and Escape, then exercise an unavailable service and confirm all three paths leave the original body unchanged.
11. Edit one of several painting annotations and confirm only that body changes and the composition dimensions remain stable.

## Whole-program smoke review

1. Repeat onboarding, format switching, Preview, blank-slide selection, Add media, reorder, and delete once.
2. Open manifest/splash properties and an info box to catch panel-stack regressions.
3. Check browser console for new errors throughout both sample manifests.
4. Verify keyboard access for changed menus, reorder controls, image form, and behaviour controls.
5. Review all new user-facing strings for obvious inconsistency while leaving the full terminology pass deferred.

## Review evidence

- The Delft disposable project passed layout, cover, crop editing, cropped thumbnail, and cleared tour-step persistence checks.
- The Leeds disposable project passed direct Canvas and checkbox Browser selection after the Browser update.
- The annotation Media tab exposes 0°, 90°, 180°, and 270° rotation controls. Zero starts collapsed; a non-zero saved value is selected after reload.
- Preview → Raw Manifest confirmed a 90° full-image edit as a `SpecificResource` with an `ImageApiSelector`, `/90/` source and thumbnail requests, and 4000 × 6000 derived canvas dimensions.
- An immediate refresh before the debounce elapsed retained the latest edit after the attempted save-queue rewrite was reverted.
- The embedded viewer expected at `localhost:5174` was unavailable and was not started. Port 3000 editor Preview and Raw Manifest paths were used for acceptance.

## Deferred handoff

D1 is resolved by the updated Browser package and selection-matrix rerun. D4 remains gated on a product terminology decision. D2 and D3 were promoted into tasks 3.5 and 2.4 after their questions were answered.

## Final decision

- [x] All Phase 3 task commits are focused and reviewed.
- [x] Targeted automated checks pass, or pre-existing failures are evidenced.
- [x] Both sample manifests pass the browser and JSON checks.
- [x] The whole-program smoke review passes, with the unavailable external viewer boundary recorded above.
- [x] Integration changes are committed after confidence is established.
- [x] Deferred items have named next evidence/owners for triage.

The accepted commit is the program handoff point. Record checks, known limitations, and the remaining D4 handoff in its PR or release notes.

See [RESULT.md](./RESULT.md) for the completed automated and browser review.
