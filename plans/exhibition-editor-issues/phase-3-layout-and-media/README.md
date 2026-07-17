# Phase 3 — Layout and media fidelity

Start from the accepted Phase 2 integration commit. Run all five tasks in parallel.

| Task                                                           | Primary ownership                                      | Depends on           |
| -------------------------------------------------------------- | ------------------------------------------------------ | -------------------- |
| [3.1 Layout behavior controls](./01-behaviour-controls.md)     | Exhibition behavior control model and tests            | Phase 2.2            |
| [3.2 Browser rotation persistence](./02-browser-rotation.md)   | Generic IIIF Browser output adapter and creator import | Phase 1.2, Phase 2.2 |
| [3.3 Cropped grid thumbnail](./03-cropped-grid-thumbnail.md)   | Shared lazy thumbnail rendering and tests              | Phase 2 review       |
| [3.4 Clearable tour-step label](./04-clear-tour-step-label.md) | Tour-step HTML form/helpers and tests                  | Phase 2 review       |
| [3.5 Edit an existing image crop](./05-edit-image-crop.md)     | Crop modal, selector transaction, edit side effects    | Phase 2 review       |

These tasks should have no implementation-file overlap. Task 3.5 may reuse or extract crop calculations, but it must not change task 3.2's Browser adapter or task 3.3's grid-rendering decision. Shared fixture additions are acceptable; keep each regression test beside its owned logic.

When all task branches are ready, merge them and complete [REVIEW.md](./REVIEW.md).
