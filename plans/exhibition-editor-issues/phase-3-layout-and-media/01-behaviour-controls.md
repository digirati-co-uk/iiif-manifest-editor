# 3.1 Behaviour and image-cover controls

## Objective

Make annotation position changes preserve image behaviour, make scroll-tour behaviour coherent, and expose image cover wherever the active exhibition format supports it.

## Why these issues stay together

All three are serialized by `SlideBehaviours`. Splitting them between parallel branches would invite conflicting edits and inconsistent rules for the same behaviour array.

## Owned files/areas

- `presets/exhibition-preset/src/SlideBehaviours.tsx`
- Its behaviour parsing/serialization helpers and tests
- Exhibition format capability metadata if it already owns feature support

Use `/Users/stephen/github.com/digirati-co-uk/exhibition-viewer` as a read-only reference for supported semantics. Do not change the viewer in this task.

## Behaviour invariants

1. Changing annotations left/right/top/bottom replaces only mutually exclusive layout values; it preserves `image`, `cover`, tour, and unknown behaviours.
2. Selecting an image-oriented scroll-tour option does not require an unrelated left/right toggle to restore `image` behaviour.
3. Controls derive their state from the current behavior array after every update rather than retaining a divergent local copy.
4. “Image cover” is shown for any non-splash image slide supported by the selected format, not only the opening splash.
5. Opening splash cover remains governed by its existing, distinct rule.
6. Unsupported formats do not get a control that emits behaviour the viewer ignores.

## Implementation steps

1. Record viewer-supported combinations for full-page, slideshow, and scroll. Express the result as existing template capabilities if possible, not template-id conditionals.
2. Extract or tighten pure behaviour-array transforms: replace layout group, toggle image, and toggle cover. Preserve order where practical and never drop unknown values.
3. Add failing tests for `image + left -> right`, scroll tour without a layout value, cover on a non-splash supported slide, and an unknown behaviour round trip.
4. Wire the UI to the tested transforms. Remove state duplication if props already contain the canonical behaviour array.
5. Confirm the cover control's visibility is capability-driven and independent of “is first canvas” except for splash-only UI.

## Automated checks

- Extend the existing `SlideBehaviours` tests with a table of behaviour combinations.
- Run the focused exhibition preset tests and targeted typecheck; do not build packages.

## Browser checks at localhost:3000

1. On a scroll-tour slide containing an image, toggle annotations left/right several times. Preview must retain the image each time.
2. Reload and inspect exported JSON to confirm `image` remains in `behavior`.
3. On supported non-splash image slides in each format, enable/disable image cover and verify preview plus exported behaviour.
4. Confirm the splash cover control still works and no duplicate cover control appears.
5. Import a slide with an extra/unknown behaviour and verify ordinary position edits do not erase it.

## Acceptance criteria

- Position edits are non-destructive outside their mutually exclusive group.
- Scroll tours do not depend on an incidental left/right action to retain image behaviour.
- Image cover appears exactly where viewer capabilities support it.
- Behaviour transformations have focused regression tests.

## Commit guidance

Commit the pure transformations/tests first if useful, then the visibility wiring. Suggested final message: `fix(exhibition): preserve image behaviour across layout changes`.
