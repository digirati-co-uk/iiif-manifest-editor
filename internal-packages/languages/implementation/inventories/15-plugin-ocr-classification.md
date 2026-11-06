# OCR classification plugin source inventory

Module: `plugins/ocr-classification`. Revision: `66de064a5d217b7847db924db925b092b36a0eed`. [Implementation task](../modules/15-plugin-ocr-classification.md).

Default application-source scan: **38 occurrences** in **6 files** (9 files scanned). Expanded JS/TS scan including tests/stories/tutorials/examples: **49 occurrences**.

These are syntactic candidates, not final message IDs or verified active UI. Scans use git's tracked/unignored files and exclude generated, public and vendor assets. Supporting-source strings are usually fixtures or assertions, not catalog entries. Markdown/MDX/JSON/CSS and third-party UI are not included. Review authored defaults and developer errors before extraction. Mixed JSX may be fragments of one whole message. Text below is shortened to 180 characters; follow the source link for the original.

## Default application source files

| File | Candidate occurrences |
| --- | ---: |
| [plugins/ocr-classification/src/results.tsx](../../../../plugins/ocr-classification/src/results.tsx) | 24 |
| [plugins/ocr-classification/src/background-action.ts](../../../../plugins/ocr-classification/src/background-action.ts) | 4 |
| [plugins/ocr-classification/src/ocr-difficulty.ts](../../../../plugins/ocr-classification/src/ocr-difficulty.ts) | 4 |
| [plugins/ocr-classification/src/onnx-classifier.ts](../../../../plugins/ocr-classification/src/onnx-classifier.ts) | 3 |
| [plugins/ocr-classification/src/plugin.ts](../../../../plugins/ocr-classification/src/plugin.ts) | 2 |
| [plugins/ocr-classification/src/canvas-image.ts](../../../../plugins/ocr-classification/src/canvas-image.ts) | 1 |

## Expanded review list

### plugins/ocr-classification/src/results.tsx

- [ ] Review [source](../../../../plugins/ocr-classification/src/results.tsx) and classify its 24 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [65](../../../../plugins/ocr-classification/src/results.tsx#L65) | jsx-attribute | OCR classification results | mixed-jsx |
| [68](../../../../plugins/ocr-classification/src/results.tsx#L68) | jsx-text | No result data is available for this run. | — |
| [74](../../../../plugins/ocr-classification/src/results.tsx#L74) | jsx-text | Task complete | — |
| [75](../../../../plugins/ocr-classification/src/results.tsx#L75) | jsx-text | Classified | mixed-jsx |
| [76](../../../../plugins/ocr-classification/src/results.tsx#L76) | jsx-text | of | mixed-jsx |
| [76](../../../../plugins/ocr-classification/src/results.tsx#L76) | jsx-text | canvases | mixed-jsx, terminology |
| [80](../../../../plugins/ocr-classification/src/results.tsx#L80) | jsx-expression | {{expression1}} {{expression2}} skipped. Review the skipped list below before rerunning. | interpolation, mixed-jsx |
| [81](../../../../plugins/ocr-classification/src/results.tsx#L81) | jsx-expression | Every canvas was classified and tagged. | mixed-jsx, terminology |
| [88](../../../../plugins/ocr-classification/src/results.tsx#L88) | jsx-text | Coverage | — |
| [132](../../../../plugins/ocr-classification/src/results.tsx#L132) | jsx-attribute | Total canvases | terminology |
| [133](../../../../plugins/ocr-classification/src/results.tsx#L133) | jsx-attribute | Classified | — |
| [134](../../../../plugins/ocr-classification/src/results.tsx#L134) | jsx-attribute | Skipped | — |
| [135](../../../../plugins/ocr-classification/src/results.tsx#L135) | jsx-attribute | Tags applied | — |
| [149](../../../../plugins/ocr-classification/src/results.tsx#L149) | jsx-text | of classified canvases | mixed-jsx, terminology |
| [158](../../../../plugins/ocr-classification/src/results.tsx#L158) | jsx-text | Classified canvases | terminology |
| [159](../../../../plugins/ocr-classification/src/results.tsx#L159) | jsx-text | Showing all | mixed-jsx |
| [160](../../../../plugins/ocr-classification/src/results.tsx#L160) | jsx-text | classified results | mixed-jsx |
| [168](../../../../plugins/ocr-classification/src/results.tsx#L168) | jsx-text | Canvas | terminology |
| [169](../../../../plugins/ocr-classification/src/results.tsx#L169) | jsx-text | Result | — |
| [170](../../../../plugins/ocr-classification/src/results.tsx#L170) | jsx-text | Confidence | — |
| [171](../../../../plugins/ocr-classification/src/results.tsx#L171) | jsx-text | Scores | — |
| [203](../../../../plugins/ocr-classification/src/results.tsx#L203) | jsx-text | No canvases were classified. Check the skipped canvases and task logs for details. | terminology |
| [210](../../../../plugins/ocr-classification/src/results.tsx#L210) | jsx-text | Skipped canvases ( | mixed-jsx, terminology |
| [254](../../../../plugins/ocr-classification/src/results.tsx#L254) | jsx-expression | class-{{expression1}} | interpolation, mixed-jsx |

### plugins/ocr-classification/src/background-action.test.ts

- [ ] Review [source](../../../../plugins/ocr-classification/src/background-action.test.ts) and classify its 7 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [21](../../../../plugins/ocr-classification/src/background-action.test.ts#L21) | object-field | Manifest | module-definition, terminology |
| [99](../../../../plugins/ocr-classification/src/background-action.test.ts#L99) | object-field | OCR Easy | — |
| [128](../../../../plugins/ocr-classification/src/background-action.test.ts#L128) | object-field | OCR Medium | — |
| [135](../../../../plugins/ocr-classification/src/background-action.test.ts#L135) | object-field | OCR Difficult | — |
| [171](../../../../plugins/ocr-classification/src/background-action.test.ts#L171) | message-call | Unable to decode image | user-or-developer-message-review |
| [245](../../../../plugins/ocr-classification/src/background-action.test.ts#L245) | object-field | OCR Medium | — |
| [339](../../../../plugins/ocr-classification/src/background-action.test.ts#L339) | object-field | OCR Medium | — |

### plugins/ocr-classification/src/background-action.ts

- [ ] Review [source](../../../../plugins/ocr-classification/src/background-action.ts) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [69](../../../../plugins/ocr-classification/src/background-action.ts#L69) | object-field | Classify OCR difficulty | — |
| [70](../../../../plugins/ocr-classification/src/background-action.ts#L70) | object-field | Tag each canvas by OCR difficulty | terminology |
| [193](../../../../plugins/ocr-classification/src/background-action.ts#L193) | object-field | Classification complete | — |
| [285](../../../../plugins/ocr-classification/src/background-action.ts#L285) | message-call | OCR classification cancelled. | user-or-developer-message-review |

### plugins/ocr-classification/src/ocr-difficulty.test.ts

- [ ] Review [source](../../../../plugins/ocr-classification/src/ocr-difficulty.test.ts) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [13](../../../../plugins/ocr-classification/src/ocr-difficulty.test.ts#L13) | object-field | OCR Easy | — |
| [19](../../../../plugins/ocr-classification/src/ocr-difficulty.test.ts#L19) | object-field | OCR Medium | — |
| [25](../../../../plugins/ocr-classification/src/ocr-difficulty.test.ts#L25) | object-field | OCR Difficult | — |
| [36](../../../../plugins/ocr-classification/src/ocr-difficulty.test.ts#L36) | object-field | OCR Difficult | — |

### plugins/ocr-classification/src/ocr-difficulty.ts

- [ ] Review [source](../../../../plugins/ocr-classification/src/ocr-difficulty.ts) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [29](../../../../plugins/ocr-classification/src/ocr-difficulty.ts#L29) | object-field | OCR Easy | module-definition |
| [36](../../../../plugins/ocr-classification/src/ocr-difficulty.ts#L36) | object-field | OCR Medium | module-definition |
| [43](../../../../plugins/ocr-classification/src/ocr-difficulty.ts#L43) | object-field | OCR Difficult | module-definition |
| [51](../../../../plugins/ocr-classification/src/ocr-difficulty.ts#L51) | message-call | OCR classifier returned no scores. | user-or-developer-message-review |

### plugins/ocr-classification/src/onnx-classifier.ts

- [ ] Review [source](../../../../plugins/ocr-classification/src/onnx-classifier.ts) and classify its 3 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [58](../../../../plugins/ocr-classification/src/onnx-classifier.ts#L58) | message-call | Model output "{{expression1}}" was not returned. | interpolation, user-or-developer-message-review |
| [111](../../../../plugins/ocr-classification/src/onnx-classifier.ts#L111) | message-call | Unable to decode the canvas image. | terminology, user-or-developer-message-review |
| [162](../../../../plugins/ocr-classification/src/onnx-classifier.ts#L162) | message-call | Could not acquire a 2D canvas context for image preprocessing. | terminology, user-or-developer-message-review |

### plugins/ocr-classification/src/plugin.ts

- [ ] Review [source](../../../../plugins/ocr-classification/src/plugin.ts) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [5](../../../../plugins/ocr-classification/src/plugin.ts#L5) | object-field | OCR Classification | module-definition |
| [6](../../../../plugins/ocr-classification/src/plugin.ts#L6) | object-field | Classify canvases by OCR difficulty and apply canvas tags. | module-definition, terminology |

### plugins/ocr-classification/src/canvas-image.ts

- [ ] Review [source](../../../../plugins/ocr-classification/src/canvas-image.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [40](../../../../plugins/ocr-classification/src/canvas-image.ts#L40) | message-call | Unable to fetch canvas image ({{expression1}}). | interpolation, terminology, user-or-developer-message-review |

## Formatting and content-language review points

| Source | Review kind | Code |
| --- | --- | --- |
| [plugins/ocr-classification/src/results.tsx:275](../../../../plugins/ocr-classification/src/results.tsx#L275) | formatting-review | new Intl.NumberFormat() |
