# Phase 3 result

## Outcome

All five Phase 3 implementation tasks are committed and integrated:

- layout changes preserve image, cover, tour, and unknown behaviours;
- image-cover controls follow the formats supported by the exhibition viewer;
- IIIF Browser crop and rotation cross the creator boundary together;
- cropped and rotated images use the complex exhibition-grid thumbnail path;
- cleared tour-step labels survive save and rehydration;
- eligible existing IIIF crops have an isolated full-image crop editor with transactional save/cancel behaviour.

The integration review found and fixed issues that were hidden by isolated mocks:

- normalized `SpecificResource` bodies are inline within `Annotation.body`, so crop saves now replace that body in one Vault batch;
- new Image resources and thumbnails are imported through Vault entity actions and verified through a real export;
- rotation is applied to thumbnail Image API URLs and 90/270-degree derived dimensions;
- the `top` layout option remains available;
- an explicit empty heading distinguishes a cleared tour label from a heading-first summary.

## Commits

- `0baf3ac3` — cropped grid thumbnails
- `5357009d` — cleared tour-label rehydration regression
- `d92999df`, `faa40cf0`, `87e55412`, `a356cf34` — crop editor
- `df9c1785` — Browser rotation
- `1ba32637` — behaviour controls
- `35b77ed6` — cross-task integration fixes

## Automated evidence

- Phase 3 focused tests: 54/54 pass across six suites.
- Exhibition preset typecheck: pass.
- Components typecheck: pass.
- Manifest editor typecheck: pass.
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

`http://localhost:3000` responds with HTTP 200. Interactive testing could not
be completed in this agent environment: both collaborative preview status/open
returned `NoAvailableHost`, and the bundled browser runtime reported no
available browser.

The pointer/keyboard matrix in `REVIEW.md` therefore remains a human acceptance
step. Browser image selection also retains the separately documented upstream
D1 package gate.

## Known boundary

The exhibition creator intentionally produces a single-image slide. The
generic creator's older transformed-Canvas path still uses the first painting
annotation when a source Canvas contains a multi-image composition. Applying a
single Browser crop/rotation to an entire composition needs an explicit data
model decision; the Phase 3 single-image exhibition flow does not broaden that
behaviour.

## Deferred handoff

- D1 remains gated on a replacement IIIF Browser package and rerunning the
  Browser selection matrix.
- D4 remains gated on an approved format-specific terminology glossary.
