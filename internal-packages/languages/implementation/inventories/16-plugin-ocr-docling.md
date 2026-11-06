# Docling OCR plugin source inventory

Module: `plugins/ocr-docling`. Revision: `66de064a5d217b7847db924db925b092b36a0eed`. [Implementation task](../modules/16-plugin-ocr-docling.md).

Default application-source scan: **55 occurrences** in **10 files** (20 files scanned). Expanded JS/TS scan including tests/stories/tutorials/examples: **66 occurrences**.

These are syntactic candidates, not final message IDs or verified active UI. Scans use git's tracked/unignored files and exclude generated, public and vendor assets. Supporting-source strings are usually fixtures or assertions, not catalog entries. Markdown/MDX/JSON/CSS and third-party UI are not included. Review authored defaults and developer errors before extraction. Mixed JSX may be fragments of one whole message. Text below is shortened to 180 characters; follow the source link for the original.

## Default application source files

| File | Candidate occurrences |
| --- | ---: |
| [plugins/ocr-docling/src/config-modal.tsx](../../../../plugins/ocr-docling/src/config-modal.tsx) | 26 |
| [plugins/ocr-docling/src/plugin.ts](../../../../plugins/ocr-docling/src/plugin.ts) | 9 |
| [plugins/ocr-docling/src/results.tsx](../../../../plugins/ocr-docling/src/results.tsx) | 6 |
| [plugins/ocr-docling/src/background-action.tsx](../../../../plugins/ocr-docling/src/background-action.tsx) | 4 |
| [plugins/ocr-docling/src/docling/browser/client.ts](../../../../plugins/ocr-docling/src/docling/browser/client.ts) | 4 |
| [plugins/ocr-docling/src/docling/parser.ts](../../../../plugins/ocr-docling/src/docling/parser.ts) | 2 |
| [plugins/ocr-docling/src/annotations.ts](../../../../plugins/ocr-docling/src/annotations.ts) | 1 |
| [plugins/ocr-docling/src/canvas-image.ts](../../../../plugins/ocr-docling/src/canvas-image.ts) | 1 |
| [plugins/ocr-docling/src/docling/worker/entry.ts](../../../../plugins/ocr-docling/src/docling/worker/entry.ts) | 1 |
| [plugins/ocr-docling/src/docling/worker/runtime.ts](../../../../plugins/ocr-docling/src/docling/worker/runtime.ts) | 1 |

## Expanded review list

### plugins/ocr-docling/src/config-modal.tsx

- [ ] Review [source](../../../../plugins/ocr-docling/src/config-modal.tsx) and classify its 26 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [154](../../../../plugins/ocr-docling/src/config-modal.tsx#L154) | jsx-attribute | Run OCR with Docling | mixed-jsx |
| [163](../../../../plugins/ocr-docling/src/config-modal.tsx#L163) | jsx-text | Cancel | — |
| [171](../../../../plugins/ocr-docling/src/config-modal.tsx#L171) | jsx-text | Run OCR | — |
| [180](../../../../plugins/ocr-docling/src/config-modal.tsx#L180) | jsx-text | Model: | — |
| [184](../../../../plugins/ocr-docling/src/config-modal.tsx#L184) | jsx-text | Runtime: | — |
| [186](../../../../plugins/ocr-docling/src/config-modal.tsx#L186) | jsx-expression | WebGPU available | mixed-jsx |
| [187](../../../../plugins/ocr-docling/src/config-modal.tsx#L187) | jsx-expression | WebGPU unavailable | mixed-jsx |
| [190](../../../../plugins/ocr-docling/src/config-modal.tsx#L190) | jsx-text | Cache: | — |
| [192](../../../../plugins/ocr-docling/src/config-modal.tsx#L192) | jsx-expression | Browser Cache API available | mixed-jsx |
| [193](../../../../plugins/ocr-docling/src/config-modal.tsx#L193) | jsx-expression | Browser Cache API unavailable | mixed-jsx |
| [198](../../../../plugins/ocr-docling/src/config-modal.tsx#L198) | jsx-text | Prompt | — |
| [212](../../../../plugins/ocr-docling/src/config-modal.tsx#L212) | jsx-text | Image size | — |
| [225](../../../../plugins/ocr-docling/src/config-modal.tsx#L225) | jsx-text | px long edge | mixed-jsx |
| [232](../../../../plugins/ocr-docling/src/config-modal.tsx#L232) | jsx-text | Canvases | terminology |
| [241](../../../../plugins/ocr-docling/src/config-modal.tsx#L241) | jsx-text | All canvases ( | mixed-jsx, terminology |
| [252](../../../../plugins/ocr-docling/src/config-modal.tsx#L252) | jsx-text | Selected canvas | mixed-jsx, terminology |
| [255](../../../../plugins/ocr-docling/src/config-modal.tsx#L255) | jsx-expression | ({{expression1}}) | interpolation, mixed-jsx |
| [272](../../../../plugins/ocr-docling/src/config-modal.tsx#L272) | jsx-text | Only canvases with tag | terminology |
| [306](../../../../plugins/ocr-docling/src/config-modal.tsx#L306) | jsx-text | Skip canvases with existing annotations | terminology |
| [309](../../../../plugins/ocr-docling/src/config-modal.tsx#L309) | jsx-text | Do not run OCR on canvases where a canvas annotation page already contains an annotation. | terminology |
| [317](../../../../plugins/ocr-docling/src/config-modal.tsx#L317) | jsx-text | canvas | mixed-jsx, terminology |
| [317](../../../../plugins/ocr-docling/src/config-modal.tsx#L317) | jsx-expression | es | mixed-jsx |
| [317](../../../../plugins/ocr-docling/src/config-modal.tsx#L317) | jsx-text | will run OCR. | mixed-jsx |
| [321](../../../../plugins/ocr-docling/src/config-modal.tsx#L321) | jsx-text | canvas | mixed-jsx, terminology |
| [322](../../../../plugins/ocr-docling/src/config-modal.tsx#L322) | jsx-expression | es | mixed-jsx |
| [322](../../../../plugins/ocr-docling/src/config-modal.tsx#L322) | jsx-text | will be skipped because they already have annotations. | mixed-jsx |

### plugins/ocr-docling/src/plugin.ts

- [ ] Review [source](../../../../plugins/ocr-docling/src/plugin.ts) and classify its 9 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [11](../../../../plugins/ocr-docling/src/plugin.ts#L11) | object-field | Local OCR | module-definition |
| [12](../../../../plugins/ocr-docling/src/plugin.ts#L12) | object-field | Run Granite Docling OCR on manifest canvases and write text annotations. (500MB download) | module-definition, terminology |
| [31](../../../../plugins/ocr-docling/src/plugin.ts#L31) | object-field | Default prompt | module-definition |
| [33](../../../../plugins/ocr-docling/src/plugin.ts#L33) | object-field | Used as the starting prompt when running Docling OCR. | module-definition |
| [37](../../../../plugins/ocr-docling/src/plugin.ts#L37) | object-field | Default image size | module-definition |
| [39](../../../../plugins/ocr-docling/src/plugin.ts#L39) | object-field | Controls the long edge size sent to the OCR model. | module-definition |
| [41](../../../../plugins/ocr-docling/src/plugin.ts#L41) | object-field | {{expression1}}px long edge | interpolation |
| [47](../../../../plugins/ocr-docling/src/plugin.ts#L47) | object-field | Worker URL | module-definition |
| [49](../../../../plugins/ocr-docling/src/plugin.ts#L49) | object-field | Optional public URL for the Docling OCR worker when the package is consumed through another bundled package. | module-definition |

### plugins/ocr-docling/src/results.tsx

- [ ] Review [source](../../../../plugins/ocr-docling/src/results.tsx) and classify its 6 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [47](../../../../plugins/ocr-docling/src/results.tsx#L47) | jsx-attribute | Docling OCR results | mixed-jsx |
| [50](../../../../plugins/ocr-docling/src/results.tsx#L50) | jsx-attribute | Selected | — |
| [51](../../../../plugins/ocr-docling/src/results.tsx#L51) | jsx-attribute | Processed | — |
| [52](../../../../plugins/ocr-docling/src/results.tsx#L52) | jsx-attribute | Annotations | — |
| [53](../../../../plugins/ocr-docling/src/results.tsx#L53) | jsx-attribute | Skipped | — |
| [57](../../../../plugins/ocr-docling/src/results.tsx#L57) | jsx-text | Skipped canvases | terminology |

### plugins/ocr-docling/src/docling/__tests__/layout.test.ts

- [ ] Review [source](../../../../plugins/ocr-docling/src/docling/__tests__/layout.test.ts) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [19](../../../../plugins/ocr-docling/src/docling/__tests__/layout.test.ts#L19) | object-field | Quarterly report | — |
| [29](../../../../plugins/ocr-docling/src/docling/__tests__/layout.test.ts#L29) | object-field | Hello world | — |
| [48](../../../../plugins/ocr-docling/src/docling/__tests__/layout.test.ts#L48) | object-field | Preview | — |
| [58](../../../../plugins/ocr-docling/src/docling/__tests__/layout.test.ts#L58) | object-field | Head Value | — |
| [103](../../../../plugins/ocr-docling/src/docling/__tests__/layout.test.ts#L103) | object-field | Hello world | — |

### plugins/ocr-docling/src/background-action.test.ts

- [ ] Review [source](../../../../plugins/ocr-docling/src/background-action.test.ts) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [29](../../../../plugins/ocr-docling/src/background-action.test.ts#L29) | object-field | Manifest | module-definition, terminology |
| [36](../../../../plugins/ocr-docling/src/background-action.test.ts#L36) | object-field | Review | module-definition |
| [516](../../../../plugins/ocr-docling/src/background-action.test.ts#L516) | message-call | terminated | user-or-developer-message-review |
| [678](../../../../plugins/ocr-docling/src/background-action.test.ts#L678) | message-call | Timed out waiting for predicate | user-or-developer-message-review |

### plugins/ocr-docling/src/background-action.tsx

- [ ] Review [source](../../../../plugins/ocr-docling/src/background-action.tsx) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [154](../../../../plugins/ocr-docling/src/background-action.tsx#L154) | object-field | Run OCR with Docling | — |
| [155](../../../../plugins/ocr-docling/src/background-action.tsx#L155) | object-field | Transcribe canvas text into annotations | terminology |
| [374](../../../../plugins/ocr-docling/src/background-action.tsx#L374) | object-field | OCR complete | — |
| [653](../../../../plugins/ocr-docling/src/background-action.tsx#L653) | message-call | Docling OCR cancelled. | user-or-developer-message-review |

### plugins/ocr-docling/src/docling/browser/client.ts

- [ ] Review [source](../../../../plugins/ocr-docling/src/docling/browser/client.ts) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [82](../../../../plugins/ocr-docling/src/docling/browser/client.ts#L82) | message-call | The Docling worker crashed. | user-or-developer-message-review |
| [95](../../../../plugins/ocr-docling/src/docling/browser/client.ts#L95) | message-call | The Docling worker client has been terminated. | user-or-developer-message-review |
| [142](../../../../plugins/ocr-docling/src/docling/browser/client.ts#L142) | message-call | The Docling worker client has been terminated. | user-or-developer-message-review |
| [155](../../../../plugins/ocr-docling/src/docling/browser/client.ts#L155) | message-call | Unable to start the Docling OCR worker. If you are using @manifest-editor/ocr-docling from a bundled package, provide a public workerUrl or pass a Worker instance. {{expression1}} | interpolation, terminology, user-or-developer-message-review |

### plugins/ocr-docling/src/docling/__tests__/protocol.test.ts

- [ ] Review [source](../../../../plugins/ocr-docling/src/docling/__tests__/protocol.test.ts) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [73](../../../../plugins/ocr-docling/src/docling/__tests__/protocol.test.ts#L73) | object-field | Already running. | — |
| [82](../../../../plugins/ocr-docling/src/docling/__tests__/protocol.test.ts#L82) | object-field | Already running. | — |

### plugins/ocr-docling/src/docling/parser.ts

- [ ] Review [source](../../../../plugins/ocr-docling/src/docling/parser.ts) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [17](../../../../plugins/ocr-docling/src/docling/parser.ts#L17) | object-field | p | module-definition |
| [19](../../../../plugins/ocr-docling/src/docling/parser.ts#L19) | object-field | h1 | module-definition |

### plugins/ocr-docling/src/annotations.ts

- [ ] Review [source](../../../../plugins/ocr-docling/src/annotations.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [28](../../../../plugins/ocr-docling/src/annotations.ts#L28) | message-call | Canvas dimensions unavailable | terminology, user-or-developer-message-review |

### plugins/ocr-docling/src/canvas-image.ts

- [ ] Review [source](../../../../plugins/ocr-docling/src/canvas-image.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [41](../../../../plugins/ocr-docling/src/canvas-image.ts#L41) | message-call | Unable to fetch canvas image ({{expression1}}). | interpolation, terminology, user-or-developer-message-review |

### plugins/ocr-docling/src/docling/worker/entry.ts

- [ ] Review [source](../../../../plugins/ocr-docling/src/docling/worker/entry.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [60](../../../../plugins/ocr-docling/src/docling/worker/entry.ts#L60) | object-field | The Docling worker failed unexpectedly. | — |

### plugins/ocr-docling/src/docling/worker/runtime.ts

- [ ] Review [source](../../../../plugins/ocr-docling/src/docling/worker/runtime.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [92](../../../../plugins/ocr-docling/src/docling/worker/runtime.ts#L92) | message-call | Failed to fetch "{{expression1}}" ({{expression2}}). | interpolation, user-or-developer-message-review |
