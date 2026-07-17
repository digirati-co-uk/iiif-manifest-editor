# 2.3 Manifest and splash editing

## Objective

Make the exhibition manifest title open manifest properties in the right sidebar, keep the manifest overview/thumbnail grid reachable and consistent, and expose manifest label and summary while editing the first splash slide.

## Owned files/areas

- Exhibition preset panel composition in `presets/exhibition-preset/src/index.tsx`
- The exhibition manifest entry in the left panel
- `presets/exhibition-preset/src/ExhibitionCanvasEditor.tsx`
- `presets/exhibition-preset/src/ExhibitionSummaryEditor.tsx`
- Generic manifest panel code only if a reusable open-properties action already belongs there

Do not remove the manifest overview from other presets.

## Behaviour rules

1. Clicking the manifest title in the exhibition left sidebar opens the existing manifest properties editor in the right sidebar.
2. Opening the manifest information panel shows the inherited manifest overview/thumbnail grid and opens manifest properties on the right on the first attempt, including when coming from either the exhibition grid or Preview.
3. Manifest label and summary appear in the right panel only when the selected canvas is both the first canvas and has splash behaviour.
4. Those inputs edit manifest fields through `useManifestEditor()`, not duplicate canvas fields.
5. Edits update the live splash preview and survive reload/export.
6. A splash canvas in any later position does not expose manifest label/summary.

## Implementation steps

1. Identify the existing action used by “edit manifest metadata” and route the exhibition title click to it. Avoid inventing a second right-panel identifier.
2. Keep the inherited manifest overview in exhibition preset composition and coordinate its centre/right-panel transition with the manifest information panel.
3. Extract a small predicate for “selected canvas is the opening splash” if it makes the position/behaviour rule testable.
4. In the relevant right-panel editor, obtain the editor through `useManifestEditor()` and bind the established multilingual label and summary controls to manifest state.
5. Remove the old splash exclusion from the summary editor only where the new manifest-level fields replace it; preserve canvas-summary behaviour for ordinary slides.
6. Verify moving/deleting the opening canvas immediately changes field visibility.

## Automated checks

- Test the opening-splash predicate for first splash, later splash, first non-splash, and no selection.
- Add a focused interaction test for manifest title -> manifest properties if the panel harness supports it.
- Test that splash edits target the manifest id and ordinary slide edits target the canvas id.
- Run affected exhibition/manifest preset tests and targeted typechecks; do not build packages.

## Browser checks at localhost:3000

1. Open an exhibition and click its title in the left sidebar. Confirm manifest properties open on the right.
2. From both the exhibition grid and Preview, open the manifest information panel. Confirm the overview/thumbnail grid appears in the centre and manifest properties appear on the right immediately.
3. Select the first splash slide in the Leeds example. Edit manifest label and summary and watch the preview update.
4. Select a normal slide; the splash manifest fields must disappear.
5. Move the splash away from position one or remove its splash behaviour; the fields must disappear immediately.
6. Reload and export to confirm the changes are manifest `label`/`summary`, not canvas metadata.

## Acceptance criteria

- Exhibition title navigation opens the correct right-panel properties.
- The manifest overview/thumbnail grid remains available and its centre/right-panel state is consistent from grid and Preview.
- Opening splash editing exposes live manifest label and summary.
- Visibility is derived from current canvas order and behaviour, with no cached “first slide” flag.

## Commit guidance

The navigation and splash fields may be two commits if independently testable. Suggested messages: `fix(exhibition): open manifest properties from title` and `feat(exhibition): edit manifest copy from opening splash`.
