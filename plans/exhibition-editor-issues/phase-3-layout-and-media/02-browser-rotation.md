# 3.2 Persist IIIF Browser rotation

## Objective

Carry rotation chosen in the IIIF Browser into the created exhibition painting resource and preserve it through export, reload, and preview.

## Owned files/areas

- The generic IIIF Browser creator form/output adapter
- `presets/exhibition-preset/src/creators/image-browser-slide-creator.tsx`
- Creator payload types and focused output tests

Do not solve this by rotating a thumbnail URL or by storing UI-only metadata.

## Data contract

The Browser result can include rotation. Persist it on the IIIF image body using the same `ImageApiSelector` representation used by the Browser/content-state contract. If a crop region also exists, combine region and rotation in the body selector without moving either value onto the canvas target. Treat a zero/default rotation consistently with existing serializer conventions.

## Implementation steps

1. Add a failing adapter test showing the current Browser result retains resource and selector but loses rotation.
2. Confirm the exact output shape from the installed c69b412 Browser types rather than redefining it loosely.
3. Extend the narrow creator payload type and formatter to carry rotation.
4. Update the exhibition slide creator to serialize rotation on the painting body. Reuse existing `SpecificResource`/`ImageApiSelector` construction used for crop regions.
5. Cover rotation-only, crop-only, crop-plus-rotation, and no-transform inputs.
6. Verify reopening the Browser or editor can read the persisted transform where that path supports existing crops.

## Automated checks

- Add focused unit tests for Browser output -> IIIF body transformation.
- Assert rotation is absent/default for an unrotated selection and retained for the Browser's supported rotation values.
- Assert crop coordinates are unchanged when rotation is added.
- Run affected creator tests and targeted typechecks; do not build packages.

## Browser checks at localhost:3000

1. Add an image through the IIIF Browser, rotate it, and select it.
2. Confirm the new slide renders rotated in edit and Preview.
3. Export/reload the manifest and inspect the painting body selector for rotation.
4. Repeat with a cropped and rotated selection; confirm both transforms survive.
5. Add an unrotated image and confirm no spurious transform is written.

## Acceptance criteria

- Browser rotation crosses the creator boundary and is represented in exported IIIF.
- Rotation survives reload and is honoured by the exhibition viewer.
- Crop and rotation compose without changing the canvas target.
- The implementation uses typed Browser output from the Phase 1 dependency.

## Commit guidance

Commit only after the exported JSON and preview both demonstrate persistence. Suggested commit: `fix(exhibition): persist browser image rotation`.
