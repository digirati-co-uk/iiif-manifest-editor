# 2.1 Slide list lifecycle

## Objective

Give every exhibition left-side presentation the same edit/reorder support and make deletion leave the editor in a valid, predictable selection state.

## Owned files/areas

- `presets/exhibition-preset/src/left-panels/ExhibitionGrid.tsx`
- `presets/exhibition-preset/src/components/ExhibitionPreviewList.tsx`
- `presets/exhibition-preset/src/components/SortableExhibitionGrid.tsx`
- `presets/exhibition-preset/src/components/SortableExhibitionItem.tsx`
- `presets/exhibition-preset/src/center-panels/SlideshowCenterPanel.tsx`
- A small exhibition-local selection helper and its tests, if useful

Do not alter creator registrations or core selection semantics in this task.

## Required behaviour

1. Full-page, slideshow, and scroll presentations expose the same understandable way to enter and leave reorder/edit mode.
2. Reordering keeps the same slide selected by id, regardless of its new index.
3. Deleting the active slide selects the next slide when one exists; otherwise it selects the previous slide.
4. Deleting a non-active slide leaves the current selection alone.
5. Deleting the last slide clears stale canvas/annotation state and returns to the existing empty-exhibition prompt for creating a slide.
6. The logic is identical whether deletion starts from the grid, list, or centre-panel controls.

## Implementation steps

1. Inventory the reorder and delete handlers in the owned components. Write down the state transitions before changing JSX.
2. Extract only the pure “selection after deletion” calculation if that removes the current duplication. Keep it exhibition-local unless another preset already needs it.
3. Add focused tests for first, middle, last, non-selected, and only-slide deletion. Use ids rather than array indexes in assertions.
4. Route the existing deletion entry points through the same result. Close annotation editing before selecting the replacement canvas so no deleted annotation remains on the stack.
5. Expose the existing sortable UI in each exhibition left-panel variant. Reuse the current drag handle and controls rather than introducing a second reorder component.
6. Confirm keyboard reordering and focus recovery still work where the sortable component supports them.

## Automated checks

- Run the focused exhibition tests for the new helper and affected list components.
- Run `pnpm --filter @manifest-editor/exhibition-preset typecheck` if that package script exists; otherwise use the repository's existing targeted typecheck command.
- Do not build packages.

## Browser checks at localhost:3000

For full-page, slideshow, and Leeds scroll formats:

1. Add at least three slides, select the middle one, reorder it, and confirm the same slide remains selected.
2. Delete the selected middle slide and confirm its next sibling is selected.
3. Delete the last selected slide and confirm the previous sibling is selected.
4. Delete a non-selected slide and confirm the active editor does not move.
5. Delete every slide and confirm the editor shows the normal empty-exhibition create prompt with no stale right-panel fields.
6. Repeat one reorder with the keyboard if the existing sortable control advertises keyboard support.

## Acceptance criteria

- All exhibition list variants can reorder and edit slides.
- Selection never points to a deleted canvas or one of its annotations.
- The neighbour-selection rule is deterministic and covered by tests.
- Empty exhibitions use the existing empty state rather than a new one-off screen.

## Commit guidance

Commit the pure selection tests/helper separately if useful, then the UI wiring once all three formats pass. Suggested final slice: `fix(exhibition): keep slide selection valid after list edits`.
