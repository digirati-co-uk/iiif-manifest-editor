# Exhibition editor follow-up plans

These are planning documents only. They turn the supplied P0–P3 list into two implementation batches for the Manifest Editor. They supplement, rather than replace, `plans/exhibition-editor-issues`: where an earlier task has the same root cause, implement the earlier task's contract and extend its regression coverage instead of adding a parallel fix.

| Plan | Priorities | Outcome |
| --- | --- | --- |
| [01 — Preview, themes, and authoring correctness](./01-p0-p1-preview-and-authoring.md) | P0–P1 | Live iframe previews, real themes, splash-aware defaults, durable optional tour headings, and a stable editor selection state. |
| [02 — Editor fidelity and ergonomics](./02-p2-p3-editor-fidelity.md) | P2–P3 | Faithful scroll side previews, direct tour editing, minimal HTML normalisation, and explicit viewer/Browser handoffs. |

## Boundaries

- This repository owns IIIF editing, serialized manifest values, the embedded preview bridge, and the sidebar previews. It does not duplicate rendering or image-selection logic owned by `exhibition-viewer` or `iiif-browser`.
- The first plan must precede the second where it changes shared tour-step parsing or preview state.
- Keep the running development server at port 3000 untouched. Use focused checks only; do not run a repository build.
- The existing Phase 1 Browser-selection defect in `plans/exhibition-editor-issues/deferred/D1-browser-select-availability.md` remains a prerequisite for any modal scenario that needs a Browser selection.

## Cross-repository contract

The editor persists standards-based data only: theme service data on the Manifest, `behavior` values, annotation labels/summaries or textual bodies, and canonical Image API selectors. The viewer plans define how those values render; the Browser plans define how selections and crops are produced. Do not persist a second preview-only format to work around either dependency.
