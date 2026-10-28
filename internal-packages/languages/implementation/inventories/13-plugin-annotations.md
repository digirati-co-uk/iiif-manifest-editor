# Annotations plugin source inventory

Module: `plugins/annotations`. Revision: `66de064a5d217b7847db924db925b092b36a0eed`. [Implementation task](../modules/13-plugin-annotations.md).

Default application-source scan: **60 occurrences** in **12 files** (15 files scanned). Expanded JS/TS scan including tests/stories/tutorials/examples: **63 occurrences**.

These are syntactic candidates, not final message IDs or verified active UI. Scans use git's tracked/unignored files and exclude generated, public and vendor assets. Supporting-source strings are usually fixtures or assertions, not catalog entries. Markdown/MDX/JSON/CSS and third-party UI are not included. Review authored defaults and developer errors before extraction. Mixed JSX may be fragments of one whole message. Text below is shortened to 180 characters; follow the source link for the original.

## Default application source files

| File | Candidate occurrences |
| --- | ---: |
| [plugins/annotations/src/importer/config-modal.tsx](../../../../plugins/annotations/src/importer/config-modal.tsx) | 17 |
| [plugins/annotations/src/components/AnnotationsListingAnnotations.tsx](../../../../plugins/annotations/src/components/AnnotationsListingAnnotations.tsx) | 8 |
| [plugins/annotations/src/importer/background-action.tsx](../../../../plugins/annotations/src/importer/background-action.tsx) | 8 |
| [plugins/annotations/src/components/AnnotationsSidebarListItem.tsx](../../../../plugins/annotations/src/components/AnnotationsSidebarListItem.tsx) | 6 |
| [plugins/annotations/src/importer/results.tsx](../../../../plugins/annotations/src/importer/results.tsx) | 6 |
| [plugins/annotations/src/components/AnnotationsCreateEmptyPage.tsx](../../../../plugins/annotations/src/components/AnnotationsCreateEmptyPage.tsx) | 4 |
| [plugins/annotations/src/components/AnnotationsOcrActions.tsx](../../../../plugins/annotations/src/components/AnnotationsOcrActions.tsx) | 4 |
| [plugins/annotations/src/annotation-panel.tsx](../../../../plugins/annotations/src/annotation-panel.tsx) | 2 |
| [plugins/annotations/src/index.ts](../../../../plugins/annotations/src/index.ts) | 2 |
| [plugins/annotations/src/canvas-annotations.tsx](../../../../plugins/annotations/src/canvas-annotations.tsx) | 1 |
| [plugins/annotations/src/components/RenderPaintingAnnotationPreview.tsx](../../../../plugins/annotations/src/components/RenderPaintingAnnotationPreview.tsx) | 1 |
| [plugins/annotations/src/routing-background.tsx](../../../../plugins/annotations/src/routing-background.tsx) | 1 |

## Expanded review list

### plugins/annotations/src/importer/config-modal.tsx

- [ ] Review [source](../../../../plugins/annotations/src/importer/config-modal.tsx) and classify its 17 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [159](../../../../plugins/annotations/src/importer/config-modal.tsx#L159) | jsx-attribute | Import External Annotation Pages | mixed-jsx |
| [168](../../../../plugins/annotations/src/importer/config-modal.tsx#L168) | jsx-text | Cancel | — |
| [184](../../../../plugins/annotations/src/importer/config-modal.tsx#L184) | jsx-text | Import pages | — |
| [192](../../../../plugins/annotations/src/importer/config-modal.tsx#L192) | jsx-text | Canvases | terminology |
| [201](../../../../plugins/annotations/src/importer/config-modal.tsx#L201) | jsx-text | All canvases with external annotation pages ( | mixed-jsx, terminology |
| [219](../../../../plugins/annotations/src/importer/config-modal.tsx#L219) | jsx-text | Only canvases with tag | terminology |
| [241](../../../../plugins/annotations/src/importer/config-modal.tsx#L241) | jsx-text | Motivations | — |
| [250](../../../../plugins/annotations/src/importer/config-modal.tsx#L250) | jsx-text | All motivations | — |
| [266](../../../../plugins/annotations/src/importer/config-modal.tsx#L266) | jsx-text | Only selected motivations | — |
| [292](../../../../plugins/annotations/src/importer/config-modal.tsx#L292) | jsx-text | Additional motivations | — |
| [300](../../../../plugins/annotations/src/importer/config-modal.tsx#L300) | jsx-attribute | transcribing, reviewing | — |
| [307](../../../../plugins/annotations/src/importer/config-modal.tsx#L307) | jsx-text | external annotation page | mixed-jsx |
| [308](../../../../plugins/annotations/src/importer/config-modal.tsx#L308) | jsx-expression | s | mixed-jsx |
| [308](../../../../plugins/annotations/src/importer/config-modal.tsx#L308) | jsx-text | selected. | mixed-jsx |
| [312](../../../../plugins/annotations/src/importer/config-modal.tsx#L312) | jsx-text | motivation | mixed-jsx |
| [313](../../../../plugins/annotations/src/importer/config-modal.tsx#L313) | jsx-expression | s | mixed-jsx |
| [313](../../../../plugins/annotations/src/importer/config-modal.tsx#L313) | jsx-text | selected. | mixed-jsx |

### plugins/annotations/src/components/AnnotationsListingAnnotations.tsx

- [ ] Review [source](../../../../plugins/annotations/src/components/AnnotationsListingAnnotations.tsx) and classify its 8 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [28](../../../../plugins/annotations/src/components/AnnotationsListingAnnotations.tsx#L28) | jsx-text | Not supported | — |
| [49](../../../../plugins/annotations/src/components/AnnotationsListingAnnotations.tsx#L49) | jsx-attribute | Annotations | — |
| [53](../../../../plugins/annotations/src/components/AnnotationsListingAnnotations.tsx#L53) | object-field | Add annotation | — |
| [62](../../../../plugins/annotations/src/components/AnnotationsListingAnnotations.tsx#L62) | jsx-attribute | cancel add annotation | — |
| [66](../../../../plugins/annotations/src/components/AnnotationsListingAnnotations.tsx#L66) | jsx-text | Exit edit mode | — |
| [71](../../../../plugins/annotations/src/components/AnnotationsListingAnnotations.tsx#L71) | jsx-text | Draw a box on the canvas | terminology |
| [84](../../../../plugins/annotations/src/components/AnnotationsListingAnnotations.tsx#L84) | jsx-text | This canvas does not yet have any inline annotations. | terminology |
| [94](../../../../plugins/annotations/src/components/AnnotationsListingAnnotations.tsx#L94) | jsx-text | Add annotation | mixed-jsx |

### plugins/annotations/src/importer/background-action.tsx

- [ ] Review [source](../../../../plugins/annotations/src/importer/background-action.tsx) and classify its 8 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [57](../../../../plugins/annotations/src/importer/background-action.tsx#L57) | object-field | Bulk Annotation Page Importer | — |
| [59](../../../../plugins/annotations/src/importer/background-action.tsx#L59) | object-field | Load external Canvas annotation pages and make them editable inline | terminology |
| [123](../../../../plugins/annotations/src/importer/background-action.tsx#L123) | object-field | Loading external annotation pages | — |
| [163](../../../../plugins/annotations/src/importer/background-action.tsx#L163) | object-field | Loading external annotation pages | — |
| [176](../../../../plugins/annotations/src/importer/background-action.tsx#L176) | message-call | External annotation page import failed. | user-or-developer-message-review |
| [184](../../../../plugins/annotations/src/importer/background-action.tsx#L184) | object-field | Writing inline annotations | — |
| [204](../../../../plugins/annotations/src/importer/background-action.tsx#L204) | object-field | Import complete | — |
| [227](../../../../plugins/annotations/src/importer/background-action.tsx#L227) | message-call | Unable to fetch {{expression1}} ({{expression2}}). | interpolation, user-or-developer-message-review |

### plugins/annotations/src/components/AnnotationsSidebarListItem.tsx

- [ ] Review [source](../../../../plugins/annotations/src/components/AnnotationsSidebarListItem.tsx) and classify its 6 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [24](../../../../plugins/annotations/src/components/AnnotationsSidebarListItem.tsx#L24) | jsx-text | This annotation has no body. | — |
| [33](../../../../plugins/annotations/src/components/AnnotationsSidebarListItem.tsx#L33) | jsx-text | Edit painting annotation | — |
| [44](../../../../plugins/annotations/src/components/AnnotationsSidebarListItem.tsx#L44) | jsx-text | Finish editing | mixed-jsx |
| [56](../../../../plugins/annotations/src/components/AnnotationsSidebarListItem.tsx#L56) | jsx-expression | Edit target | mixed-jsx |
| [56](../../../../plugins/annotations/src/components/AnnotationsSidebarListItem.tsx#L56) | jsx-expression | Edit | mixed-jsx |
| [60](../../../../plugins/annotations/src/components/AnnotationsSidebarListItem.tsx#L60) | jsx-text | Delete | mixed-jsx |

### plugins/annotations/src/importer/results.tsx

- [ ] Review [source](../../../../plugins/annotations/src/importer/results.tsx) and classify its 6 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [47](../../../../plugins/annotations/src/importer/results.tsx#L47) | jsx-attribute | External annotation page import results | mixed-jsx |
| [50](../../../../plugins/annotations/src/importer/results.tsx#L50) | jsx-attribute | External pages | — |
| [51](../../../../plugins/annotations/src/importer/results.tsx#L51) | jsx-attribute | Inlined pages | — |
| [52](../../../../plugins/annotations/src/importer/results.tsx#L52) | jsx-attribute | Canvases | terminology |
| [53](../../../../plugins/annotations/src/importer/results.tsx#L53) | jsx-attribute | Annotations | — |
| [66](../../../../plugins/annotations/src/importer/results.tsx#L66) | jsx-text | Skipped external pages | — |

### plugins/annotations/src/components/AnnotationsCreateEmptyPage.tsx

- [ ] Review [source](../../../../plugins/annotations/src/components/AnnotationsCreateEmptyPage.tsx) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [47](../../../../plugins/annotations/src/components/AnnotationsCreateEmptyPage.tsx#L47) | jsx-attribute | Annotations | — |
| [51](../../../../plugins/annotations/src/components/AnnotationsCreateEmptyPage.tsx#L51) | object-field | Add annotation | — |
| [59](../../../../plugins/annotations/src/components/AnnotationsCreateEmptyPage.tsx#L59) | jsx-text | This canvas does not yet have any inline annotations. To add inline annotations, an AnnotationPage is created which will be linked to this canvas, and can then used to add your ann | terminology |
| [71](../../../../plugins/annotations/src/components/AnnotationsCreateEmptyPage.tsx#L71) | jsx-text | Create empty page | mixed-jsx |

### plugins/annotations/src/components/AnnotationsOcrActions.tsx

- [ ] Review [source](../../../../plugins/annotations/src/components/AnnotationsOcrActions.tsx) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [14](../../../../plugins/annotations/src/components/AnnotationsOcrActions.tsx#L14) | object-field | Run Local OCR | module-definition |
| [21](../../../../plugins/annotations/src/components/AnnotationsOcrActions.tsx#L21) | object-field | Run remote OCR | module-definition |
| [28](../../../../plugins/annotations/src/components/AnnotationsOcrActions.tsx#L28) | object-field | Run structured output | module-definition |
| [75](../../../../plugins/annotations/src/components/AnnotationsOcrActions.tsx#L75) | jsx-text | OCR and structured output | — |

### plugins/annotations/src/annotation-panel.tsx

- [ ] Review [source](../../../../plugins/annotations/src/annotation-panel.tsx) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [15](../../../../plugins/annotations/src/annotation-panel.tsx#L15) | object-field | Annotations | module-definition |
| [33](../../../../plugins/annotations/src/annotation-panel.tsx#L33) | jsx-text | Annotations are associated with Canvases in a IIIF Manifest. To view or add annotations, first create a Canvas and then select the Annotations link | terminology |

### plugins/annotations/src/importer/background-action.test.ts

- [ ] Review [source](../../../../plugins/annotations/src/importer/background-action.test.ts) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [19](../../../../plugins/annotations/src/importer/background-action.test.ts#L19) | object-field | Manifest | module-definition, terminology |
| [108](../../../../plugins/annotations/src/importer/background-action.test.ts#L108) | message-call | Not found | user-or-developer-message-review |

### plugins/annotations/src/index.ts

- [ ] Review [source](../../../../plugins/annotations/src/index.ts) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [10](../../../../plugins/annotations/src/index.ts#L10) | object-field | Annotations | module-definition |
| [11](../../../../plugins/annotations/src/index.ts#L11) | object-field | Create, view, and inline external supplemental canvas annotation pages. | module-definition, terminology |

### plugins/annotations/src/canvas-annotations.tsx

- [ ] Review [source](../../../../plugins/annotations/src/canvas-annotations.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [9](../../../../plugins/annotations/src/canvas-annotations.tsx#L9) | object-field | Canvas annotations | module-definition, terminology |

### plugins/annotations/src/components/RenderPaintingAnnotationPreview.tsx

- [ ] Review [source](../../../../plugins/annotations/src/components/RenderPaintingAnnotationPreview.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [19](../../../../plugins/annotations/src/components/RenderPaintingAnnotationPreview.tsx#L19) | jsx-text | Untitled | — |

### plugins/annotations/src/index.test.ts

- [ ] Review [source](../../../../plugins/annotations/src/index.test.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [79](../../../../plugins/annotations/src/index.test.ts#L79) | object-field | Manifest Editor | module-definition, terminology |

### plugins/annotations/src/routing-background.tsx

- [ ] Review [source](../../../../plugins/annotations/src/routing-background.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [16](../../../../plugins/annotations/src/routing-background.tsx#L16) | object-field | Annotation routing | module-definition |
