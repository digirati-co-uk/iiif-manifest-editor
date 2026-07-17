# Phase 3 result

## Outcome

All five Phase 3 implementation tasks are committed and integrated:

- layout changes preserve image, cover, tour, and unknown behaviours;
- image-cover controls follow the formats supported by the exhibition viewer;
- IIIF Browser crop and rotation cross the creator boundary together;
- cropped and rotated images use the complex exhibition-grid thumbnail path;
- cleared tour-step labels survive save and rehydration;
- eligible existing IIIF crops have an isolated full-image crop editor with transactional save/cancel behaviour;
- annotation Media panels have 0°, 90°, 180°, and 270° rotation controls, collapsed initially at zero.

The integration review found and fixed issues that were hidden by isolated mocks:

- normalized `SpecificResource` bodies are inline within `Annotation.body`, so crop saves now replace that body in one Vault batch;
- new Image resources and thumbnails are imported through Vault entity actions and verified through a real export;
- rotation is applied to thumbnail Image API URLs and 90/270-degree derived dimensions;
- the `top` layout option remains available;
- an explicit empty heading distinguishes a cleared tour label from a heading-first summary;
- transformed `SpecificResource` bodies remain embedded when their source is already present in Vault;
- project writes sharing an ETag are serialized so a later media edit cannot be overwritten by an overlapping save.

## Commits

- `0baf3ac3` — cropped grid thumbnails
- `5357009d` — cleared tour-label rehydration regression
- `d92999df`, `faa40cf0`, `87e55412`, `a356cf34` — crop editor
- `df9c1785` — Browser rotation
- `1ba32637` — behaviour controls
- `35b77ed6` — cross-task integration fixes
- `0d5d14b1` — fixed IIIF Browser package update
- `91004721` — preserve transformed SpecificResources at the creator boundary
- `6ead963d` — annotation image-rotation controls
- `559508ee` — serialized local project saves

## Automated evidence

- Phase 3 focused tests: 77/77 pass across eleven suites.
- The rotation suite includes a real Vault export of an uncropped image and verifies selector, source URL, and rotated dimensions.
- Creator API, shell, exhibition preset, components, manifest editor, and web typechecks: pass.
- Creators typecheck reaches one pre-existing error in
  `packages/ui/ui/VideoPlayer/VideoPlayer.tsx:35`; there are no Phase 3
  diagnostics.
- `git diff --check`: pass.
- The UI-coupled `SlideBehaviours.test.ts` suite cannot collect because
  `react-timeago@8.3.0` imports its extensionless `es6/dateParser` module.
  Equivalent pure behaviour transforms are covered and pass.

The crop transaction suite uses a real `@iiif/helpers` Vault and verifies that
the changed region, preserved rotation, and new source URL survive
`toPresentation3()`.

## Localhost review

Interactive review completed at `http://localhost:3000` with disposable Delft
and Leeds projects:

- layout, cover, crop editing, cropped thumbnails, and cleared tour labels
  persisted in the Delft project;
- direct Canvas navigation and checkbox selection worked in the updated IIIF
  Browser against the Leeds source;
- the Media tab displayed all four rotation controls and exposed the selected
  value after reload;
- a 90° full-image edit survived reload and Preview → Raw Manifest exported a
  `SpecificResource` with `ImageApiSelector.rotation: "90"`, `/90/` source and
  thumbnail requests, and rotated canvas dimensions;
- a clean reproduction after the save-queue fix produced no new ETag mismatch.

The embedded viewer at `localhost:5174` was unavailable and was not started.
Acceptance used the editor Preview and Raw Manifest paths at port 3000.

## Known boundary

The exhibition creator intentionally produces a single-image slide. The
generic creator's older transformed-Canvas path still uses the first painting
annotation when a source Canvas contains a multi-image composition. Applying a
single Browser crop/rotation to an entire composition needs an explicit data
model decision; the Phase 3 single-image exhibition flow does not broaden that
behaviour.

## Deferred handoff

- D1 is resolved by Browser commit `07a09e1`, installed here by `0d5d14b1`,
  and the direct-navigation/checkbox selection rerun.
- D4 remains gated on an approved format-specific terminology glossary.
