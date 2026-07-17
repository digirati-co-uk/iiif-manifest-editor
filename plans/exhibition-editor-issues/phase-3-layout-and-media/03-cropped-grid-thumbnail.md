# 3.3 Cropped single-image grid thumbnails

## Objective

Render the selected IIIF crop in the exhibition grid when a slide has one painting image targeting the whole canvas.

## Owned files/areas

- The exhibition `LazyThumbnail`/grid thumbnail renderer
- Existing image-service region helpers
- Focused thumbnail decision and URL/render tests

Do not add stored thumbnail derivatives to the manifest; the crop is already described by the painting body selector.

## Known root cause

The current thumbnail path uses the complex renderer for multiple images or an explicit canvas target region. A single painting body with an `ImageApiSelector` falls through to the ordinary canvas thumbnail and therefore shows the full image.

## Implementation steps

1. Add a minimal fixture with one painting annotation, a whole-canvas target, and an image body `SpecificResource` containing an `ImageApiSelector` region.
2. Add a failing test proving the ordinary thumbnail path is chosen today.
3. Make the renderer decision include meaningful body crops/transforms. Reuse the existing region extraction and complex composition path rather than duplicating IIIF Image API URL building.
4. Keep the fast ordinary path for a single uncropped image.
5. Confirm invalid or unsupported selectors fall back safely instead of blanking the grid.

## Automated checks

- Test single uncropped, single cropped, multiple images, explicit target region, and malformed selector cases.
- Assert a cropped case requests/renders the selected region rather than merely snapshotting component markup.
- Run focused component/helper tests and targeted typecheck; do not build packages.

## Browser checks at localhost:3000

1. Add a whole-canvas image with a crop through the Browser.
2. Confirm the exhibition grid thumbnail shows the crop, while the uncropped source remains available to the viewer/editor.
3. Reload and switch between full-page, slideshow, and supported grid/list presentations.
4. Confirm ordinary single-image slides still load via the simple thumbnail path and do not regress in size or loading state.

## Acceptance criteria

- A single cropped painting produces a cropped grid thumbnail.
- Uncropped single-image thumbnails retain the current efficient path.
- The implementation reads canonical selector data and writes no redundant thumbnail state.
- Invalid selector data degrades to the existing fallback.

## Commit guidance

Commit the fixture and fix together after visual confirmation. Suggested commit: `fix(exhibition): render image crops in grid thumbnails`.
