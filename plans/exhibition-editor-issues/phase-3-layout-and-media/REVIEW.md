# Phase 3 integration and final review

Run after tasks 3.1–3.4 are complete and committed, based on the accepted Phase 2 integration commit.

## Merge preparation

1. Confirm the four branches stay within behaviour controls, Browser rotation, thumbnail rendering, and tour labels respectively.
2. Merge one at a time. Pay particular attention to selector-shape conflicts between rotation and cropped-thumbnail tests.
3. Inspect `git diff --check`, `git status --short`, and the full manifest-fixture diff.
4. Commit any integration fix only once its combined regression passes.

## Automated review

- Run all focused Phase 3 tests plus the relevant Phase 1 creator/Browser tests.
- Run targeted typechecks for the exhibition preset and Browser creator adapter.
- Confirm behaviour transform tests preserve unknown values.
- Confirm selector fixtures cover crop-only, rotation-only, and crop-plus-rotation.
- Confirm the tour-label test includes save and rehydration.
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

## Whole-program smoke review

1. Repeat onboarding, format switching, Preview, blank-slide selection, Add media, reorder, and delete once.
2. Open manifest/splash properties and an info box to catch panel-stack regressions.
3. Check browser console for new errors throughout both sample manifests.
4. Verify keyboard access for changed menus, reorder controls, image form, and behaviour controls.
5. Review all new user-facing strings for obvious inconsistency while leaving the full terminology pass deferred.

## Deferred handoff

For D1–D4, confirm each brief still states the unresolved evidence/decision. If Phase 3 work resolved a prerequisite, update the deferred brief but do not quietly expand this phase to implement it.

## Final decision

- [ ] All Phase 3 task commits are focused and reviewed.
- [ ] Targeted automated checks pass, or pre-existing failures are evidenced.
- [ ] Both sample manifests pass the browser and JSON checks.
- [ ] The whole-program smoke review passes.
- [ ] Integration changes are committed after confidence is established.
- [ ] Deferred items have named next evidence/owners for triage.

The accepted commit is the program handoff point. Record checks, known limitations, and the four deferred decisions in its PR or release notes.
