# 1.4 Creator completion and selection contract

## Objective

Make post-create navigation explicit and consistent: a newly created slide/canvas is selected by default, while content added inside an existing slide can opt out of opening the new annotation and remain in the workbench's Edit mode.

## Owned files/areas

- `packages/shell/src/BaseCreator/BaseCreator.tsx`
- `packages/shell/src/BaseCreator/BaseCreator.hooks.tsx` only if the option belongs in the hook contract
- `packages/creator-api/src/types.ts` only if a typed creator option is necessary; coordinate with Task 1.3 before touching it
- Focused BaseCreator/selection tests
- Minimal exhibition call sites that set the option; do not change list/delete behavior owned by Task 2.1

## Baseline facts

- `RenderCreator` normally edits the first created reference after closing the creator modal.
- `props.resource.initialData.skipEditingOnCreate` already suppresses that edit and is excluded from creator matching.
- The slideshow workbench already passes `{ skipEditingOnCreate: true }` for “Add content.”

The smallest correct solution may therefore be tests plus missing call-site coverage, not a new core option.

## Behavior matrix

| Action                                                | Expected result                                                                                                            |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Add empty/blank slide from grid/list/empty exhibition | New Canvas is selected and its Canvas editor opens                                                                         |
| Add an image/browser/video/info slide                 | New Canvas is selected after creation                                                                                      |
| Add media/content to an existing slide                | Existing Canvas remains selected; creator closes; workbench is in Edit, not Preview; new Annotation tab is not forced open |
| Creator returns several canvases                      | Select the first created Canvas deterministically unless an existing documented rule says otherwise                        |
| Creation fails/cancels                                | Keep current selection; do not close into a stale editor                                                                   |

## Implementation steps

1. Add focused tests around `RenderCreator` completion for default selection, opt-out, empty return, array return, and error.
2. Verify `@manifest-editor/empty-canvas` follows the default path. Fix only the shared completion path if it does not.
3. Inventory exhibition “Add media/content” call sites. Pass the existing opt-out through `initialData` where the action augments the current canvas.
4. Where a workbench has Edit/Preview state, explicitly return it to Edit when opening the add-content flow or on successful completion. Do not infer this globally in BaseCreator.
5. Remove any view-specific timeout or post-create reselect workaround made redundant by the contract.

## Automated checks

- Add the narrowest BaseCreator completion tests feasible with existing test utilities.
- Test that `skipEditingOnCreate` is control data and does not filter out creators lacking `supports.initialData`.
- Run `pnpm --filter @manifest-editor/shell typecheck` and the focused tests.
- Run the exhibition preset tests if a call site changes.
- Do not build packages.

## Browser checks at localhost:3000

Using both supplied manifests, check every accessible add-canvas route:

1. Empty exhibition prompt.
2. Left-panel top Add action.
3. Left-panel bottom Create action.
4. Grid/list insertion after a selected slide.
5. Empty canvas/blank slide creator.
6. IIIF Browser slide creator.
7. Slideshow workbench Add new slide.

For Add media/content, verify the creator closes to the same slide, the center is in Edit, and the right panel does not jump to the new annotation.

## Acceptance criteria

- All new slide/canvas paths select the created Canvas by default.
- Augmenting an existing slide can use the existing opt-out without a core hack.
- “Add media” returns to Edit and does not force the annotation editor open.
- Failure and cancellation leave selection stable.
- The contract has a focused regression test.

## Commit guidance

Commit the shared test/contract first if it changes core, then the exhibition call-site adjustments. Example: `fix(shell): make creator completion selection explicit` and `fix(exhibition): keep add-content on the current slide`.
