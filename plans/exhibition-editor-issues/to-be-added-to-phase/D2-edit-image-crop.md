# D2 Edit an existing image crop

## Why deferred

This is a valuable feature rather than a bounded regression. It spans annotation selection, a modal editing lifecycle, IIIF body selectors, crop-plus-rotation composition, cancellation semantics, and viewer refresh. Those choices should be confirmed with a human interaction pass before parallel implementation.

## Desired experience

When the selected painting annotation uses a cropped IIIF image, show “Edit crop.” It opens a modal with the full source canvas/image and a resizable selector initialized to the current region. Saving updates the existing annotation through `requestAnnotation()` and closes the modal; cancelling leaves the manifest untouched.

## Decisions required

1. Whether `requestAnnotation()` can edit the selected painting annotation in place or needs an extension to express the modal transaction.
  A: No. Request annotation just sets the state for the editing interface of the annotation editing. You need to specify what the bounds of the crop are and pass that in when you make a request. The viewer inside the modal that will be used will have a context linked to that requestAnnotation() and will, when set up, display the full source image and allow the user to select a crop region by essentially "editing" the region selector. There is a popup API for inline floating controls.
2. Whether the crop UI uses the Browser's selector, an existing editor selector, or a small dedicated region component.
  A: A new dedicated region component will be used (see above).
3. Canonical representation when an `ImageApiSelector` contains both `region` and `rotation`.
  A: When both `region` and `rotation` are present, the `region` is applied first, followed by the `rotation`.
4. Minimum crop size, keyboard adjustment, aspect-ratio behaviour, and reset-to-full-image action.
  A: No, simple case for now.
5. Behaviour when the source image service is unavailable or lacks dimensions.
  A: Don't show the crop UI, show an error message instead.
6. Which annotation types qualify: painting image only, and whether multi-image compositions are in scope.
  A: Only painting image annotations are supported, and multi-image choices are not in scope. Howeever having multiple anotations on a canvas and allowingyou to edit the crop on each of them IS in scope. Also keep in mind that if you have only a single image on the canvas and you crop it, there may need to be a side effect to update the parent canvas dimensions. There may also already be a side-effect we can reuse for this.

## Design/prototype plan

1. Create static fixtures for crop-only, rotation-only, crop-plus-rotation, malformed selector, and inaccessible service.
2. Prototype the modal against one fixture without writing manifest state. Review focus trapping, selector handles, mobile sizing, and cancel/back behaviour with a human.
3. Define a pure old-selector + edited-region -> new-selector transform and test that unrelated body/annotation fields survive.
4. Confirm the annotation request closes only after a successful write and reports failures without losing the draft crop.
5. Split the accepted design into implementation tasks: selector transform/data, modal interaction, and editor integration. Assign overlapping files sequentially.

## Evidence needed to promote

- Approved modal interaction and accessibility behaviour.
- Confirmed `requestAnnotation()` transaction contract.
- Fixtures and canonical selector representation.

## Future acceptance criteria

- Edit Crop is offered only for supported cropped IIIF painting images.
- The modal starts at the persisted crop and shows the whole source image.
- Save updates the existing annotation exactly once; Cancel updates nothing.
- Crop composes with rotation and survives export/reload.
