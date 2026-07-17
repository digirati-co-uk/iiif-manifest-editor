# 2.2 Scroll creator parity

## Objective

Make the IIIF Browser creator available and reliable in Leeds scroll exhibitions, including when adding a second slide, without adding a client-specific repair after creation.

## Owned files/areas

- Exhibition and scrolling preset creator registrations
- `presets/exhibition-preset/src/creators/image-browser-slide-creator.tsx`
- `presets/exhibition-preset/src/creators/image-service-slide-creator.tsx` only where the output contract is shared
- Creator tags/filters and focused creator tests

Do not change the generic IIIF Browser dialog in this task unless a failing isolated test proves the defect is there. Rotation persistence belongs to task 3.2.

## Root-cause questions

Before implementation, answer these in the task notes or tests:

- Is the creator omitted by preset registration, resolved creator filtering, or tags?
- Is the first/second-slide difference caused by creator availability changing after the manifest is non-empty?
- Does the created canvas lack exhibition behaviour, painting annotations, or only the editor tab metadata used to choose a panel?
- Is the local uncommitted image-service creator work already addressing part of this issue?

## Implementation steps

1. Reproduce with the Leeds scroll manifest and the reported medieval scroll manifest `https://iiif.library.leeds.ac.uk/presentation/cc/nb5fj4k4`.
2. Add a regression test around resolved creator availability for an empty and non-empty scroll exhibition.
3. Capture and compare the first and second created canvas JSON. Assert the semantic fields the exhibition editor needs instead of snapshotting the entire manifest.
4. Fix creator registration/filtering at its source. Do not detect Leeds ids, canvas position, or missing tabs after creation.
5. Ensure the browser output passes through the established exhibition slide creator path so behaviour and editor support are applied once.
6. Confirm creator configuration uses the Phase 1 `configKey` contract where this is a fork of an existing creator.

## Automated checks

- Add focused tests for creator visibility in the scroll preset before and after the first slide exists.
- Add a creator-output test asserting painting content and required exhibition behaviour for the second slide.
- Run the affected preset's targeted tests and typecheck; do not build packages.

## Browser checks at localhost:3000

1. Import the Leeds example manifest and switch to its scroll format.
2. Confirm the IIIF Browser appears among the add-slide options when the exhibition is empty and non-empty.
3. Add `nb5fj4k4` as the second slide through the Browser.
4. Confirm the slide is selected, has the expected editing tabs, renders in Preview, and has the same behaviour controls as a first slide.
5. Reload the editor and repeat on the newly added slide to rule out transient in-memory metadata.
6. Confirm creator settings are not duplicated for the forked Browser creator.

## Acceptance criteria

- The IIIF Browser creator is consistently available for Leeds scroll exhibitions.
- A second Browser-created slide has valid painting content, exhibition behaviour, and editor panels.
- The result survives reload and export; it does not depend on in-memory repair code.
- No Leeds-specific identifier or array-position conditional is introduced.

## Commit guidance

Commit once the creator-availability and output regressions both pass. Suggested commit: `fix(exhibition): keep browser slide creation available in scroll format`.
