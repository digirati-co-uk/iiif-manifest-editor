# Phase 2 — Authoring workflows

Start from the accepted Phase 1 integration commit. Run all four tasks in parallel.

| Task                                                                   | Primary ownership                                             | Depends on     |
| ---------------------------------------------------------------------- | ------------------------------------------------------------- | -------------- |
| [2.1 Slide list lifecycle](./01-slide-list-lifecycle.md)               | Exhibition left lists, sortable views, delete/reselect helper | Phase 1.4      |
| [2.2 Scroll creator parity](./02-scroll-creator-parity.md)             | Exhibition creator registrations and browser slide output     | Phase 1.2, 1.3 |
| [2.3 Manifest and splash editing](./03-manifest-and-splash-editing.md) | Manifest panel and exhibition right-panel editors             | Phase 1.1      |
| [2.4 Info-box editor](./04-info-box-editor.md)                         | Info-box panel/editor and shared rich-text image subform      | Phase 1.2      |

The four primary areas are deliberately separate. If task 2.1 needs to change a creator definition or task 2.2 needs to change left-panel list code, stop and coordinate because that indicates the root cause was assigned incorrectly.

When all task branches are ready, merge them and complete [REVIEW.md](./REVIEW.md). Do not begin Phase 3 before that review passes.
