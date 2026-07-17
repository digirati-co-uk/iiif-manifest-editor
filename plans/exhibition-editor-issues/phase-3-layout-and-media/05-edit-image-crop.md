# 3.5 Edit an existing image crop

## Objective

Let a user edit the region of an existing cropped IIIF painting annotation in a modal, using the full source image and the annotation-request interaction model. Save must update the existing painting body once; Cancel must update nothing.

## Owned files/areas

- A new exhibition crop-editor action/modal and dedicated region component
- Painting-annotation eligibility and `ImageApiSelector` parsing/update helpers beside that component
- The narrow `requestAnnotation()` adapter/popup used by this modal
- Reusable canvas-dimension and thumbnail refresh helpers only where needed after an existing annotation changes
- Focused selector, transaction, and eligibility tests

Do not change the generic IIIF Browser output adapter owned by task 3.2 or the grid rendering decision owned by task 3.3. Shared selector fixtures are acceptable, but implementation files must remain separate so all five Phase 3 tasks can run in parallel.

## Confirmed scope and data rules

1. Only painting annotations with one supported IIIF image body are eligible. `Choice`/multi-image bodies are out of scope.
2. A canvas may contain several separate painting annotations; each eligible annotation gets its own Edit crop action.
3. The action edits a crop already represented by an `ImageApiSelector`. Creating a first crop from an uncropped annotation is not required here.
4. When both region and rotation exist, apply region first and rotation second. Editing the region must preserve rotation and every unrelated annotation/body field.
5. No aspect-ratio lock, minimum crop size policy, reset-to-full action, or bespoke keyboard nudge controls are required in this first version.
6. If the image service is unavailable or its dimensions cannot be established, show an error in place of the crop surface and do not permit Save.
7. For a single painting annotation on a non-`multi-image` canvas, a saved crop updates canvas dimensions to the crop width/height. Multiple-annotation canvases retain their composition dimensions.

## Interaction contract

1. “Edit crop” opens a modal containing a viewer for the full source image, not the currently cropped request.
2. Seed `requestAnnotation()` with source-image bounds and the persisted region. The modal viewer and popup controls are scoped to that request.
3. Reuse the existing Confirm/Discard annotation popup semantics. Closing, Escape, Discard, or Cancel resolves as cancellation and leaves the manifest untouched.
4. Keep the edited region as request state until confirmation. Do not mutate the painting body on drag.
5. On confirmation, update the existing body `SpecificResource.selector.region`, regenerate the cropped source request URL, preserve rotation, refresh the derived thumbnail, and close only after the write succeeds.
6. A failed write or service lookup keeps the modal/error visible so the user can cancel without losing the original crop.

## Implementation steps

1. Add fixtures for crop-only, crop-plus-rotation, malformed selector, missing service dimensions, multiple painting annotations, and a `Choice` body.
2. Add a pure eligibility function and a pure old-selector + edited-region transform. Assert that selector aliases (`ImageApiSelector` and `iiif:ImageApiSelector`) and unrelated fields survive.
3. Resolve the full source image/service and dimensions before enabling the modal viewer. Do not infer full dimensions from the cropped canvas.
4. Build the dedicated region component around `requestAnnotation({ type: "box", bounds, selector, annotationPopup })`, initialized from the current region.
5. Commit the body selector/source URL update in one vault batch after confirmation. Ensure cancellation produces zero vault writes.
6. Reuse or extract the existing crop thumbnail and single-image canvas-resize calculations rather than maintaining a second formula. Do not invoke creator-only lifecycle code directly from an edit.
7. Return focus to the Edit crop trigger after close and keep the modal usable at the editor's narrow breakpoint.

## Automated checks

- Eligibility: supported crop, uncropped body, non-painting annotation, `Choice`, unavailable service, and multiple independent annotations.
- Transform: crop-only, crop-plus-rotation, selector alias, integer normalization, and malformed input.
- Transaction: Save writes once; Cancel, Escape, and service failure write zero times.
- Side effects: single-image canvas dimensions and thumbnail update; multi-annotation canvas dimensions remain unchanged.
- Run focused exhibition/editor tests and targeted typechecks; do not build packages.

## Browser checks at localhost:3000

1. Open a cropped painting annotation and choose Edit crop.
2. Confirm the modal shows the full source image with the saved region selected.
3. Resize/move the region, confirm it, and verify edit view, Preview, grid thumbnail, and exported JSON all use the new crop.
4. Repeat with crop plus rotation and confirm rotation is unchanged and applied after the new crop.
5. Cancel with the visible action and Escape; reload and confirm the original selector remains byte-for-byte equivalent.
6. Edit one of several painting annotations on a canvas and confirm only that body changes and canvas composition dimensions remain stable.
7. Exercise a missing/inaccessible service and confirm the error replaces the crop surface and Save is unavailable.

## Acceptance criteria

- Edit crop appears only for eligible cropped IIIF painting bodies.
- The selector starts at the persisted region against the full source image.
- Save updates the existing annotation once; every cancellation path updates nothing.
- Rotation and unrelated IIIF fields survive; export/reload is stable.
- Derived thumbnail and single-image canvas dimensions follow the saved crop without disturbing multi-image compositions.

## Commit guidance

Commit the pure eligibility/transform tests first if useful, then the modal transaction and side effects once browser checks pass. Suggested final commit: `feat(exhibition): edit existing IIIF image crops`.
