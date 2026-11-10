# Canvas label generator plugin source inventory

Module: `plugins/canvas-label-generator`. Revision: `66de064a5d217b7847db924db925b092b36a0eed`. [Implementation task](../modules/14-plugin-canvas-label-generator.md).

Default application-source scan: **67 occurrences** in **5 files** (5 files scanned). Expanded JS/TS scan including tests/stories/tutorials/examples: **69 occurrences**.

These are syntactic candidates, not final message IDs or verified active UI. Scans use git's tracked/unignored files and exclude generated, public and vendor assets. Supporting-source strings are usually fixtures or assertions, not catalog entries. Markdown/MDX/JSON/CSS and third-party UI are not included. Review authored defaults and developer errors before extraction. Mixed JSX may be fragments of one whole message. Text below is shortened to 180 characters; follow the source link for the original.

## Default application source files

| File | Candidate occurrences |
| --- | ---: |
| [plugins/canvas-label-generator/src/config-modal.tsx](../../../../plugins/canvas-label-generator/src/config-modal.tsx) | 37 |
| [plugins/canvas-label-generator/src/results.tsx](../../../../plugins/canvas-label-generator/src/results.tsx) | 10 |
| [plugins/canvas-label-generator/src/index.ts](../../../../plugins/canvas-label-generator/src/index.ts) | 9 |
| [plugins/canvas-label-generator/src/generator.ts](../../../../plugins/canvas-label-generator/src/generator.ts) | 6 |
| [plugins/canvas-label-generator/src/background-action.tsx](../../../../plugins/canvas-label-generator/src/background-action.tsx) | 5 |

## Expanded review list

### plugins/canvas-label-generator/src/config-modal.tsx

- [ ] Review [source](../../../../plugins/canvas-label-generator/src/config-modal.tsx) and classify its 37 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [118](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L118) | jsx-attribute | Generate canvas labels | mixed-jsx, terminology |
| [128](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L128) | jsx-text | Cancel | — |
| [136](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L136) | jsx-text | Apply to | mixed-jsx |
| [137](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L137) | jsx-text | canvas | mixed-jsx, terminology |
| [137](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L137) | jsx-expression | es | mixed-jsx |
| [148](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L148) | jsx-text | Format | — |
| [172](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L172) | jsx-text | Custom | — |
| [182](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L182) | jsx-attribute | e.g. Page {n} | — |
| [204](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L204) | jsx-text | Numbering | — |
| [207](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L207) | jsx-text | Start | — |
| [216](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L216) | jsx-text | Step | — |
| [225](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L225) | jsx-text | Pad zeros | — |
| [245](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L245) | jsx-text | 1, 2, 3 (Arabic) | — |
| [246](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L246) | jsx-text | I, II, III (Roman uppercase) | — |
| [247](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L247) | jsx-text | i, ii, iii (Roman lowercase) | — |
| [248](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L248) | jsx-text | A, B, C (Uppercase) | — |
| [249](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L249) | jsx-text | a, b, c (Lowercase) | — |
| [250](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L250) | jsx-text | 1r, 1v, 2r (Folio) | — |
| [253](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L253) | jsx-attribute | Restart numbering per range | terminology |
| [263](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L263) | jsx-text | Filename clean-up | — |
| [266](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L266) | jsx-attribute | URL-decode filenames | — |
| [273](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L273) | jsx-attribute | Strip file extensions | — |
| [280](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L280) | jsx-attribute | Replace — and _ with spaces | — |
| [290](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L290) | jsx-attribute | Collapse extra whitespace | — |
| [300](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L300) | jsx-attribute | Title case | — |
| [312](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L312) | jsx-text | Settings | — |
| [314](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L314) | jsx-text | Language tag | — |
| [318](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L318) | jsx-attribute | en | — |
| [323](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L323) | jsx-attribute | Only update untitled canvases | terminology |
| [335](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L335) | jsx-text | Current label | — |
| [336](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L336) | jsx-text | New label | — |
| [352](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L352) | jsx-text | Untitled | — |
| [360](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L360) | jsx-expression | No change | mixed-jsx |
| [410](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L410) | jsx-text | of | mixed-jsx |
| [410](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L410) | jsx-text | will change | mixed-jsx |
| [414](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L414) | jsx-text | warning | mixed-jsx |
| [414](../../../../plugins/canvas-label-generator/src/config-modal.tsx#L414) | jsx-expression | s | mixed-jsx |

### plugins/canvas-label-generator/src/results.tsx

- [ ] Review [source](../../../../plugins/canvas-label-generator/src/results.tsx) and classify its 10 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [51](../../../../plugins/canvas-label-generator/src/results.tsx#L51) | jsx-attribute | Canvas label results | mixed-jsx, terminology |
| [54](../../../../plugins/canvas-label-generator/src/results.tsx#L54) | jsx-attribute | Previewed | — |
| [55](../../../../plugins/canvas-label-generator/src/results.tsx#L55) | jsx-attribute | Applied | — |
| [56](../../../../plugins/canvas-label-generator/src/results.tsx#L56) | jsx-attribute | Unchanged | — |
| [57](../../../../plugins/canvas-label-generator/src/results.tsx#L57) | jsx-attribute | Skipped | — |
| [58](../../../../plugins/canvas-label-generator/src/results.tsx#L58) | jsx-attribute | Warnings | — |
| [63](../../../../plugins/canvas-label-generator/src/results.tsx#L63) | jsx-text | Updated labels | — |
| [72](../../../../plugins/canvas-label-generator/src/results.tsx#L72) | jsx-expression | Untitled canvas | mixed-jsx, terminology |
| [83](../../../../plugins/canvas-label-generator/src/results.tsx#L83) | jsx-text | Skipped canvases | terminology |
| [97](../../../../plugins/canvas-label-generator/src/results.tsx#L97) | jsx-text | Warnings | — |

### plugins/canvas-label-generator/src/index.ts

- [ ] Review [source](../../../../plugins/canvas-label-generator/src/index.ts) and classify its 9 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [14](../../../../plugins/canvas-label-generator/src/index.ts#L14) | object-field | Canvas Label Generator | module-definition, terminology |
| [15](../../../../plugins/canvas-label-generator/src/index.ts#L15) | object-field | Generate or normalise canvas labels from patterns, filenames, existing labels, and ranges. | module-definition, terminology |
| [37](../../../../plugins/canvas-label-generator/src/index.ts#L37) | object-field | Default language | module-definition |
| [39](../../../../plugins/canvas-label-generator/src/index.ts#L39) | object-field | Language key used when generated labels are written. | module-definition |
| [40](../../../../plugins/canvas-label-generator/src/index.ts#L40) | object-field | en | module-definition |
| [44](../../../../plugins/canvas-label-generator/src/index.ts#L44) | object-field | Default pattern | module-definition |
| [46](../../../../plugins/canvas-label-generator/src/index.ts#L46) | object-field | Starting pattern used when opening the label generator. | module-definition |
| [54](../../../../plugins/canvas-label-generator/src/index.ts#L54) | object-field | Only update untitled canvases | module-definition, terminology |
| [56](../../../../plugins/canvas-label-generator/src/index.ts#L56) | object-field | Start the action in protected mode for missing or placeholder labels. | module-definition |

### plugins/canvas-label-generator/src/generator.ts

- [ ] Review [source](../../../../plugins/canvas-label-generator/src/generator.ts) and classify its 6 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [4](../../../../plugins/canvas-label-generator/src/generator.ts#L4) | object-field | Page {n} | module-definition |
| [5](../../../../plugins/canvas-label-generator/src/generator.ts#L5) | object-field | Plate {n} | module-definition |
| [6](../../../../plugins/canvas-label-generator/src/generator.ts#L6) | object-field | Image {n} | module-definition |
| [7](../../../../plugins/canvas-label-generator/src/generator.ts#L7) | object-field | Source filename | module-definition |
| [8](../../../../plugins/canvas-label-generator/src/generator.ts#L8) | object-field | Imported IIIF label | module-definition |
| [9](../../../../plugins/canvas-label-generator/src/generator.ts#L9) | object-field | Range/chapter prefix | module-definition, terminology |

### plugins/canvas-label-generator/src/background-action.tsx

- [ ] Review [source](../../../../plugins/canvas-label-generator/src/background-action.tsx) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [89](../../../../plugins/canvas-label-generator/src/background-action.tsx#L89) | object-field | Generate canvas labels | terminology |
| [90](../../../../plugins/canvas-label-generator/src/background-action.tsx#L90) | object-field | Generate or normalise canvas labels from a pattern | terminology |
| [128](../../../../plugins/canvas-label-generator/src/background-action.tsx#L128) | object-field | No changes | — |
| [227](../../../../plugins/canvas-label-generator/src/background-action.tsx#L227) | object-field | Labels complete | — |
| [253](../../../../plugins/canvas-label-generator/src/background-action.tsx#L253) | object-field | Canvas | terminology |

### plugins/canvas-label-generator/src/background-action.test.ts

- [ ] Review [source](../../../../plugins/canvas-label-generator/src/background-action.test.ts) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [21](../../../../plugins/canvas-label-generator/src/background-action.test.ts#L21) | object-field | Manifest | module-definition, terminology |
| [287](../../../../plugins/canvas-label-generator/src/background-action.test.ts#L287) | message-call | Timed out waiting for predicate | user-or-developer-message-review |

## Formatting and content-language review points

| Source | Review kind | Code |
| --- | --- | --- |
| [plugins/canvas-label-generator/src/index.ts:30](../../../../plugins/canvas-label-generator/src/index.ts#L30) | content-language-config | defaultLanguage: defaultRunOptions.language |
