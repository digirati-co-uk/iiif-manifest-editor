# 3.4 Clear full-image tour-step labels

## Objective

Allow the default “New step” label to be cleared for tour annotations that target the full image, and keep it cleared after save and reload.

## Owned files/areas

- `TourStepHtmlForm` and its label/summary serialization helpers
- Focused tour-step form tests

Do not introduce a special sentinel string or hide the label input for whole-image targets.

## Likely failure point

The form currently derives the initial value with a truthy fallback such as `summary || DEFAULT`. That makes an intentional empty value indistinguishable from a missing value during reinitialization or serialization.

## Implementation steps

1. Add a failing test: create a whole-image tour step, clear “New step,” save, reopen, and observe an empty label.
2. Distinguish “missing on first creation” from “present but empty.” Apply the default only to the former.
3. Ensure controlled state does not reset from props after the save mutation completes.
4. Serialize the project's canonical empty multilingual value, or remove the property if that is how other cleared fields behave. Follow the existing field convention rather than inventing one.
5. Verify region-targeted tour steps still receive the default on creation and remain editable.

## Automated checks

- Test missing, defaulted, edited, and intentionally cleared labels for full-image and region targets.
- Include a reopen/rehydration assertion, not only local React state.
- Run focused exhibition tests and targeted typecheck; do not build packages.

## Browser checks at localhost:3000

1. Create a tour step targeting the full image.
2. Clear “New step,” blur/save, navigate away, and return.
3. Reload the page and confirm the label remains empty in both editor and Preview.
4. Create another step and confirm a genuinely new step still gets the helpful default.

## Acceptance criteria

- An explicit empty label is stable across save, navigation, and reload.
- New steps still get the default once.
- Full-image and region annotations use the same field semantics.

## Commit guidance

Commit after the rehydration regression passes. Suggested commit: `fix(exhibition): preserve cleared tour step labels`.
