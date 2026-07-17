# 2.4 Info-box editor

## Objective

Keep the info-box label in the main editing panel and make the rich-text image flow navigable, cancellable, and predictable.

## Owned files/areas

- The exhibition `InfoBoxPanel` and info-block editor
- The shared Tiptap/rich-text image insertion subform used by that editor
- Focused rich-text and info-box tests

The label already appears in the current panel in some paths. Treat that as behaviour to preserve and test, not a reason to duplicate it.

## Implementation steps

1. Reproduce both creating and reopening an info box. Identify which state/path loses or relocates the label.
2. Add a focused test that the label control is in the primary info-box panel in both paths.
3. Model image insertion as two small UI states: rich-text editor and image form. Add a visible Back/Cancel action and support Escape where consistent with other forms.
4. Back/Cancel must make no manifest mutation, restore the previous rich-text draft, and return focus to the image-trigger/editor control.
5. Successful Insert must add exactly one image, return to the editor, and retain the surrounding text and selection as far as Tiptap supports it.
6. Reuse the existing form/button primitives and image validation. Do not replace the rich-text editor or add a routing framework.

## Automated checks

- Test label visibility for new and existing info boxes.
- Test image-form open -> cancel, open -> Escape, validation failure, and successful insert.
- Assert cancel does not dispatch a manifest update and insert dispatches once.
- Run focused tests and targeted typechecks for the affected packages; do not build packages.

## Browser checks at localhost:3000

1. Open an existing info box in each sample manifest and confirm its label is immediately editable in the main panel.
2. Add an image, use Back, and confirm text and draft fields are unchanged.
3. Repeat with Escape.
4. Add a valid image and confirm the editor returns, the image is visible, and saving/reloading preserves it.
5. Try an invalid/empty image value and confirm the user can recover without closing the whole slide editor.

## Acceptance criteria

- Info-box label is consistently in the main editor panel.
- Image insertion has an obvious non-destructive way back.
- Cancel and validation errors do not lose the rich-text draft.
- Successful insertion does not strand the user in the image form.

## Commit guidance

Commit after both cancellation and insertion tests pass. Suggested commit: `fix(exhibition): make info-box image editing reversible`.
