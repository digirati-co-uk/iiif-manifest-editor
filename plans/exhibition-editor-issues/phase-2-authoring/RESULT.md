# Phase 2 result

## Decision

Phase 2 implementation is assembled but is not yet accepted. The corrective integration work restores the manifest overview flow, preserves each format's presentation while reordering, and routes the inherited list view through the exhibition deletion rule. The browser/reload matrix has not been completed.

## Task histories

| Task | Commits | Result |
| --- | --- | --- |
| 2.1 Slide list lifecycle | `f0dee3a4`, `794b3726`, `fe5e68ad` | Pure neighbour selection and format-specific sortable surfaces are present. Sortable, centre-panel, and inherited list-view deletion now preserve a non-active selection and apply next-else-previous to an active deletion. |
| 2.2 Scroll creator parity | `c5da7635`, `9d0630b8` | The exhibition Browser creator owns Canvas creation, delegates to the established exhibition slide creator, shares the generic Browser `configKey`, and leaves the generic Browser nested at Annotation level. |
| 2.3 Manifest and splash editing | `1bd9e92e`, `bd42e4d4` | Opening-splash manifest fields are derived from current order/behaviour. The review correction restores the inherited manifest overview and forces manifest descriptive properties open on the right. |
| 2.4 Info-box and IIIF rich text | `ea2bd712`, `430b2ae5` | MDXEditor 4 and the Browser image plugin are shared by info-box and tour-step HTML editors; external value changes now resynchronise the wrapper. |

Supporting shared-package type corrections are in `a7573eed`.

## Automated evidence

- `pnpm --filter @manifest-editor/exhibition-preset exec vitest run src/helpers/slide-selection.test.ts src/right-panels/opening-splash.test.ts src/components/tour-step-html.test.ts src/html-editor-conversion.test.ts`: 4 files, 10 tests passed.
- `pnpm --filter @manifest-editor/exhibition-preset typecheck`: passed.
- `pnpm --filter @manifest-editor/components typecheck`: passed.
- `pnpm --filter manifest-editor typecheck`: passed.
- `pnpm list @mdxeditor/editor --depth 0 -r`: both direct consumers resolve `4.0.4`.
- `curl http://localhost:3000`: development server responded `200`.
- Source inspection confirms one `iiifBrowserPlugin`, no direct MDX `imagePlugin`, no snippet plugin, and no Browser history-key override in the shared editor.

The creator regression suites do not currently collect because `react-timeago@8.3.0` imports extensionless `es6/dateParser` under Vitest. This is an environment/dependency test-harness failure before the creator tests run, not a creator assertion failure.

The manifest-preset typecheck reaches a pre-existing error in `src/plugins/remote-inference.tsx:1680`, where the OCR provider union is compared with `"palette"`. Exhibition, components, and the application package typechecks pass.

## Integration corrections

- The original 2.3 plan said to remove the exhibition manifest overview. User review showed that this removed the thumbnail grid and made centre/right-panel transitions inconsistent. The accepted direction is now to retain the overview and reliably open manifest descriptive properties alongside it.
- Reorder mode now uses the existing grid, slideshow, or scroll preview surface rather than replacing slideshow/scroll cards with a generic grid.
- The inherited `CanvasListView` now accepts an optional post-delete callback. Exhibition supplies its id-based neighbour rule; the generic manifest preset retains its existing fallback behaviour.
- The generic Browser creator is restricted to nested Annotation creation so it cannot compete with the exhibition Canvas wrapper.

## Acceptance gaps

1. Task 2.4 has a committed HTML round-trip regression, but no committed interaction tests proving new/existing label visibility, Back/Escape without mutation, validation recovery, or exactly-one update after successful insertion.
2. Interactive checks across full-page, slideshow, and scroll could not be automated because both preview status and preview open reported that no automation host was available. Reorder/delete, manifest overview transitions, image-plugin cancellation, reload, and export therefore remain unverified.
3. The known IIIF Browser Canvas-selection defect remains tracked in `../deferred/D1-browser-select-availability.md` until a replacement Browser package is supplied. It can block the creator and rich-text Browser acceptance paths even when the host integration is correct.

Do not record a Phase 3 kickoff commit until the Phase 2 browser/reload matrix has been reviewed.
