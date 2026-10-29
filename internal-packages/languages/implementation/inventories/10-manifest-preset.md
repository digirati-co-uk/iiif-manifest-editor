# Manifest preset workflows source inventory

Module: `presets/manifest-preset`. Revision: `66de064a5d217b7847db924db925b092b36a0eed`. [Implementation task](../modules/10-manifest-preset.md).

Default application-source scan: **440 occurrences** in **35 files** (45 files scanned). Expanded JS/TS scan including tests/stories/tutorials/examples: **445 occurrences**.

These are syntactic candidates, not final message IDs or verified active UI. Scans use git's tracked/unignored files and exclude generated, public and vendor assets. Supporting-source strings are usually fixtures or assertions, not catalog entries. Markdown/MDX/JSON/CSS and third-party UI are not included. Review authored defaults and developer errors before extraction. Mixed JSX may be fragments of one whole message. Text below is shortened to 180 characters; follow the source link for the original.

## Default application source files

| File | Candidate occurrences |
| --- | ---: |
| [presets/manifest-preset/src/plugins/remote-inference.tsx](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx) | 79 |
| [presets/manifest-preset/src/background-actions.tsx](../../../../presets/manifest-preset/src/background-actions.tsx) | 53 |
| [presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx) | 48 |
| [presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx) | 36 |
| [presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx) | 25 |
| [presets/manifest-preset/src/plugins/manifest-quality-checks.tsx](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx) | 24 |
| [presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx) | 16 |
| [presets/manifest-preset/src/left-panels/tags.tsx](../../../../presets/manifest-preset/src/left-panels/tags.tsx) | 15 |
| [presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx) | 14 |
| [presets/manifest-preset/src/center-panels/range-workbench.tsx](../../../../presets/manifest-preset/src/center-panels/range-workbench.tsx) | 13 |
| [presets/manifest-preset/src/context-menus.tsx](../../../../presets/manifest-preset/src/context-menus.tsx) | 12 |
| [presets/manifest-preset/src/av-ranges/av-temporal-range-creator.tsx](../../../../presets/manifest-preset/src/av-ranges/av-temporal-range-creator.tsx) | 11 |
| [presets/manifest-preset/src/left-panels/canvas-listing.tsx](../../../../presets/manifest-preset/src/left-panels/canvas-listing.tsx) | 11 |
| [presets/manifest-preset/src/left-panels/components/RangeCardView.tsx](../../../../presets/manifest-preset/src/left-panels/components/RangeCardView.tsx) | 9 |
| [presets/manifest-preset/src/left-panels/manifest.tsx](../../../../presets/manifest-preset/src/left-panels/manifest.tsx) | 8 |
| [presets/manifest-preset/src/left-panels/range-listing.tsx](../../../../presets/manifest-preset/src/left-panels/range-listing.tsx) | 8 |
| [presets/manifest-preset/src/av-ranges/temporal-range-utils.ts](../../../../presets/manifest-preset/src/av-ranges/temporal-range-utils.ts) | 5 |
| [presets/manifest-preset/src/center-panels/manifest-overview.tsx](../../../../presets/manifest-preset/src/center-panels/manifest-overview.tsx) | 5 |
| [presets/manifest-preset/src/left-panels/components/TreeRangeItem.tsx](../../../../presets/manifest-preset/src/left-panels/components/TreeRangeItem.tsx) | 5 |
| [presets/manifest-preset/src/left-panels/components/VirtualRangeSidebar.tsx](../../../../presets/manifest-preset/src/left-panels/components/VirtualRangeSidebar.tsx) | 5 |
| [presets/manifest-preset/src/center-panels/components/BulkActionsWorkbench.tsx](../../../../presets/manifest-preset/src/center-panels/components/BulkActionsWorkbench.tsx) | 4 |
| [presets/manifest-preset/src/left-panels/components/RangesCreateEmpty.tsx](../../../../presets/manifest-preset/src/left-panels/components/RangesCreateEmpty.tsx) | 4 |
| [presets/manifest-preset/src/plugins/remote-inference-models.ts](../../../../presets/manifest-preset/src/plugins/remote-inference-models.ts) | 4 |
| [presets/manifest-preset/src/center-panels/components/EmptyRangeMessage.tsx](../../../../presets/manifest-preset/src/center-panels/components/EmptyRangeMessage.tsx) | 3 |
| [presets/manifest-preset/src/center-panels/components/RangeWorkbenchCanvas.tsx](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchCanvas.tsx) | 3 |
| [presets/manifest-preset/src/index.tsx](../../../../presets/manifest-preset/src/index.tsx) | 3 |
| [presets/manifest-preset/src/left-panels/components/RangeSplittingPreview.tsx](../../../../presets/manifest-preset/src/left-panels/components/RangeSplittingPreview.tsx) | 3 |
| [presets/manifest-preset/src/left-panels/overview.tsx](../../../../presets/manifest-preset/src/left-panels/overview.tsx) | 3 |
| [presets/manifest-preset/src/plugins/av-ranges.tsx](../../../../presets/manifest-preset/src/plugins/av-ranges.tsx) | 3 |
| [presets/manifest-preset/src/left-panels/components/RangeTree.tsx](../../../../presets/manifest-preset/src/left-panels/components/RangeTree.tsx) | 2 |
| [presets/manifest-preset/src/left-panels/components/TreeCanvasItem.tsx](../../../../presets/manifest-preset/src/left-panels/components/TreeCanvasItem.tsx) | 2 |
| [presets/manifest-preset/src/av-ranges/av-media-utils.ts](../../../../presets/manifest-preset/src/av-ranges/av-media-utils.ts) | 1 |
| [presets/manifest-preset/src/center-panels/components/RangeGridThumbnail.tsx](../../../../presets/manifest-preset/src/center-panels/components/RangeGridThumbnail.tsx) | 1 |
| [presets/manifest-preset/src/left-panels/components/OrphanedTreeCanvasItem.tsx](../../../../presets/manifest-preset/src/left-panels/components/OrphanedTreeCanvasItem.tsx) | 1 |
| [presets/manifest-preset/src/query-string.tsx](../../../../presets/manifest-preset/src/query-string.tsx) | 1 |

## Expanded review list

### presets/manifest-preset/src/plugins/remote-inference.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx) and classify its 79 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [29](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L29) | object-field | Remote Inference | module-definition |
| [30](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L30) | object-field | Run remote OCR/HTR inference jobs against a configurable server | module-definition |
| [76](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L76) | jsx-text | Key | — |
| [77](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L77) | jsx-text | Label | — |
| [78](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L78) | jsx-text | Actions | — |
| [88](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L88) | jsx-attribute | {{expression1}} key | interpolation |
| [94](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L94) | jsx-attribute | {{expression1}} label | interpolation |
| [100](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L100) | jsx-text | Built in | — |
| [111](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L111) | jsx-text | Remove | — |
| [120](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L120) | jsx-attribute | Custom model key | — |
| [123](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L123) | jsx-attribute | model-key | — |
| [127](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L127) | jsx-attribute | Custom model label | — |
| [130](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L130) | jsx-attribute | Model label | — |
| [145](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L145) | jsx-text | Add | — |
| [150](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L150) | jsx-text | Model keys must be unique. | — |
| [783](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L783) | jsx-attribute | Run Remote Inference | mixed-jsx |
| [792](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L792) | jsx-text | Cancel | — |
| [806](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L806) | jsx-text | Run | — |
| [814](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L814) | jsx-text | Server URL | — |
| [827](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L827) | jsx-text | POST requests will be sent to | mixed-jsx |
| [833](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L833) | jsx-text | API key | — |
| [839](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L839) | jsx-attribute | Optional | — |
| [847](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L847) | jsx-text | When provided, requests include | mixed-jsx |
| [848](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L848) | jsx-text | X-API-KEY | — |
| [853](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L853) | jsx-text | Model | — |
| [873](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L873) | jsx-text | Image size | — |
| [886](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L886) | jsx-text | px long edge | mixed-jsx |
| [893](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L893) | jsx-text | Canvases | terminology |
| [900](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L900) | jsx-text | All canvases ( | mixed-jsx, terminology |
| [909](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L909) | jsx-text | Selected canvas | mixed-jsx, terminology |
| [911](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L911) | jsx-expression | ({{expression1}}) | interpolation, mixed-jsx |
| [927](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L927) | jsx-text | Only canvases with tag | terminology |
| [961](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L961) | jsx-text | Skip canvases with existing annotations | terminology |
| [962](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L962) | jsx-text | Do not run inference on canvases where a canvas annotation page already contains an annotation. | terminology |
| [969](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L969) | jsx-text | canvas | mixed-jsx, terminology |
| [969](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L969) | jsx-expression | es | mixed-jsx |
| [969](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L969) | jsx-text | will run remote inference. | mixed-jsx |
| [973](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L973) | jsx-text | canvas | mixed-jsx, terminology |
| [974](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L974) | jsx-expression | es | mixed-jsx |
| [974](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L974) | jsx-text | will be skipped because they already have annotations. | mixed-jsx |
| [1118](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1118) | jsx-attribute | Run Structured Output | mixed-jsx |
| [1127](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1127) | jsx-text | Cancel | — |
| [1146](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1146) | jsx-text | Run | — |
| [1154](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1154) | jsx-text | Server URL | — |
| [1167](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1167) | jsx-text | POST requests will be sent to | mixed-jsx |
| [1173](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1173) | jsx-text | API key | — |
| [1179](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1179) | jsx-attribute | Optional | — |
| [1187](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1187) | jsx-text | When provided, requests include | mixed-jsx |
| [1188](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1188) | jsx-text | X-API-KEY | — |
| [1193](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1193) | jsx-text | Canvases | terminology |
| [1200](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1200) | jsx-text | All canvases ( | mixed-jsx, terminology |
| [1209](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1209) | jsx-text | Selected canvas | mixed-jsx, terminology |
| [1211](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1211) | jsx-expression | ({{expression1}}) | interpolation, mixed-jsx |
| [1227](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1227) | jsx-text | Only canvases with tag | terminology |
| [1249](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1249) | jsx-text | Structured fields | — |
| [1253](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1253) | jsx-text | Field | mixed-jsx |
| [1264](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1264) | jsx-text | Remove | — |
| [1272](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1272) | jsx-attribute | Label, e.g. Title | — |
| [1278](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1278) | jsx-attribute | Description or extraction instructions | — |
| [1292](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1292) | jsx-text | Add field | — |
| [1298](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1298) | jsx-text | canvas | mixed-jsx, terminology |
| [1298](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1298) | jsx-expression | es | mixed-jsx |
| [1298](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1298) | jsx-text | will run structured output. Existing annotations will be kept. | mixed-jsx |
| [1359](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1359) | jsx-attribute | Remote inference results | mixed-jsx |
| [1362](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1362) | jsx-attribute | Selected | — |
| [1363](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1363) | jsx-attribute | Processed | — |
| [1364](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1364) | jsx-attribute | Annotations | — |
| [1365](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1365) | jsx-attribute | Skipped | — |
| [1369](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1369) | jsx-text | Processed canvases | terminology |
| [1412](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1412) | jsx-text | Skipped canvases | terminology |
| [1640](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1640) | message-call | Remote inference cancelled. | user-or-developer-message-review |
| [1659](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1659) | object-field | Run remote inference | module-definition |
| [1660](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1660) | object-field | Run remote inference on canvas images via a configurable server | module-definition, terminology |
| [1827](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1827) | object-field | Found {{expression1}} colours | interpolation |
| [1827](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1827) | object-field | No palette colours returned | — |
| [1908](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1908) | object-field | Inference complete | — |
| [1917](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1917) | object-field | Run structured output | module-definition |
| [1918](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L1918) | object-field | Extract configured structured fields from canvas images | module-definition, terminology |
| [2147](../../../../presets/manifest-preset/src/plugins/remote-inference.tsx#L2147) | object-field | Structured output complete | — |

### presets/manifest-preset/src/background-actions.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/background-actions.tsx) and classify its 53 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [31](../../../../presets/manifest-preset/src/background-actions.tsx#L31) | message-call | Action cancelled | user-or-developer-message-review |
| [96](../../../../presets/manifest-preset/src/background-actions.tsx#L96) | jsx-text | This is rendered by the action&amp;apos;s always-mounted component, not by the menu. | — |
| [172](../../../../presets/manifest-preset/src/background-actions.tsx#L172) | object-field | Generate canvas labels... | module-definition, terminology |
| [173](../../../../presets/manifest-preset/src/background-actions.tsx#L173) | object-field | Demo: simulates a manifest-wide label pass | module-definition, terminology |
| [182](../../../../presets/manifest-preset/src/background-actions.tsx#L182) | object-field | Scanning canvases | terminology |
| [183](../../../../presets/manifest-preset/src/background-actions.tsx#L183) | object-field | Generating labels | — |
| [184](../../../../presets/manifest-preset/src/background-actions.tsx#L184) | object-field | Checking suggestions | — |
| [211](../../../../presets/manifest-preset/src/background-actions.tsx#L211) | object-field | Run local OCR | module-definition |
| [212](../../../../presets/manifest-preset/src/background-actions.tsx#L212) | object-field | Demo: completes after a short delay | module-definition |
| [219](../../../../presets/manifest-preset/src/background-actions.tsx#L219) | message-call | pending | user-or-developer-message-review |
| [221](../../../../presets/manifest-preset/src/background-actions.tsx#L221) | object-field | Preparing image | — |
| [222](../../../../presets/manifest-preset/src/background-actions.tsx#L222) | object-field | Recognising text | — |
| [223](../../../../presets/manifest-preset/src/background-actions.tsx#L223) | object-field | Packaging annotations | — |
| [225](../../../../presets/manifest-preset/src/background-actions.tsx#L225) | message-call | done | user-or-developer-message-review |
| [237](../../../../presets/manifest-preset/src/background-actions.tsx#L237) | object-field | Run remote OCR... | module-definition |
| [238](../../../../presets/manifest-preset/src/background-actions.tsx#L238) | object-field | Demo: randomly fails to exercise error state | module-definition |
| [246](../../../../presets/manifest-preset/src/background-actions.tsx#L246) | object-field | Uploading sample payload | — |
| [247](../../../../presets/manifest-preset/src/background-actions.tsx#L247) | object-field | Waiting for remote worker | — |
| [251](../../../../presets/manifest-preset/src/background-actions.tsx#L251) | message-call | Remote OCR service returned a demo failure | user-or-developer-message-review |
| [254](../../../../presets/manifest-preset/src/background-actions.tsx#L254) | object-field | Collecting OCR output | — |
| [269](../../../../presets/manifest-preset/src/background-actions.tsx#L269) | object-field | Run segmentation | module-definition |
| [270](../../../../presets/manifest-preset/src/background-actions.tsx#L270) | object-field | Demo: long-running canvas action | module-definition, terminology |
| [277](../../../../presets/manifest-preset/src/background-actions.tsx#L277) | message-call | pending | user-or-developer-message-review |
| [279](../../../../presets/manifest-preset/src/background-actions.tsx#L279) | object-field | Loading canvas pixels | terminology |
| [280](../../../../presets/manifest-preset/src/background-actions.tsx#L280) | object-field | Finding regions | — |
| [281](../../../../presets/manifest-preset/src/background-actions.tsx#L281) | object-field | Merging candidates | — |
| [282](../../../../presets/manifest-preset/src/background-actions.tsx#L282) | object-field | Finalising regions | — |
| [284](../../../../presets/manifest-preset/src/background-actions.tsx#L284) | message-call | done | user-or-developer-message-review |
| [296](../../../../presets/manifest-preset/src/background-actions.tsx#L296) | object-field | Bulk edit labels... | module-definition |
| [297](../../../../presets/manifest-preset/src/background-actions.tsx#L297) | object-field | Demo: opens a confirmation modal before running | module-definition |
| [304](../../../../presets/manifest-preset/src/background-actions.tsx#L304) | object-field | Bulk edit labels | — |
| [306](../../../../presets/manifest-preset/src/background-actions.tsx#L306) | object-field | This prepare step is rendered by the action's mounted component. Continue to simulate a bulk label edit. | — |
| [307](../../../../presets/manifest-preset/src/background-actions.tsx#L307) | object-field | Run demo | — |
| [308](../../../../presets/manifest-preset/src/background-actions.tsx#L308) | object-field | Cancel | — |
| [314](../../../../presets/manifest-preset/src/background-actions.tsx#L314) | object-field | Collecting existing labels | — |
| [315](../../../../presets/manifest-preset/src/background-actions.tsx#L315) | object-field | Applying label rules | — |
| [316](../../../../presets/manifest-preset/src/background-actions.tsx#L316) | object-field | Preparing preview | — |
| [329](../../../../presets/manifest-preset/src/background-actions.tsx#L329) | object-field | Audit manifest structure | module-definition, terminology |
| [330](../../../../presets/manifest-preset/src/background-actions.tsx#L330) | object-field | Demo: only appears when the manifest has canvases | module-definition, terminology |
| [343](../../../../presets/manifest-preset/src/background-actions.tsx#L343) | object-field | Checking canvas order | terminology |
| [344](../../../../presets/manifest-preset/src/background-actions.tsx#L344) | object-field | Checking ranges | terminology |
| [345](../../../../presets/manifest-preset/src/background-actions.tsx#L345) | object-field | Checking annotation pages | — |
| [360](../../../../presets/manifest-preset/src/background-actions.tsx#L360) | object-field | Create action report | module-definition |
| [361](../../../../presets/manifest-preset/src/background-actions.tsx#L361) | object-field | Demo: manually marks results available without returning a value | module-definition |
| [369](../../../../presets/manifest-preset/src/background-actions.tsx#L369) | object-field | Reading manifest state | terminology |
| [370](../../../../presets/manifest-preset/src/background-actions.tsx#L370) | object-field | Formatting report | — |
| [385](../../../../presets/manifest-preset/src/background-actions.tsx#L385) | object-field | Validate current canvas | module-definition, terminology |
| [386](../../../../presets/manifest-preset/src/background-actions.tsx#L386) | object-field | Demo: sets an error through lifecycle helpers | module-definition |
| [393](../../../../presets/manifest-preset/src/background-actions.tsx#L393) | message-call | pending | user-or-developer-message-review |
| [395](../../../../presets/manifest-preset/src/background-actions.tsx#L395) | object-field | Checking dimensions | — |
| [396](../../../../presets/manifest-preset/src/background-actions.tsx#L396) | object-field | Checking painting annotations | — |
| [398](../../../../presets/manifest-preset/src/background-actions.tsx#L398) | message-call | done | user-or-developer-message-review |
| [400](../../../../presets/manifest-preset/src/background-actions.tsx#L400) | message-call | Demo validation failed: canvas is missing OCR annotations | terminology, user-or-developer-message-review |

### presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx) and classify its 48 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [168](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L168) | object-field | Bulk Thumbnail Builder | — |
| [169](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L169) | object-field | Generate missing manifest and canvas thumbnails from painting annotations | terminology |
| [215](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L215) | object-field | No thumbnails | — |
| [330](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L330) | object-field | Thumbnails complete | — |
| [350](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L350) | object-field | Manifest thumbnail | terminology |
| [354](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L354) | object-field | Manifest | terminology |
| [374](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L374) | object-field | Canvas thumbnail | terminology |
| [378](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L378) | object-field | Canvas | terminology |
| [458](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L458) | object-field | No IIIF image service found in the painting annotations. | — |
| [467](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L467) | object-field | The first IIIF image service has no id. | — |
| [476](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L476) | object-field | The first IIIF image service could not be resolved. | — |
| [498](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L498) | object-field | Unable to load info.json ({{expression1}}). | interpolation |
| [519](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L519) | object-field | Unable to load info.json. | — |
| [1097](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1097) | object-field | {{expression1}}px | interpolation |
| [1105](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1105) | object-field | {{expression1}} x {{expression2}} | interpolation |
| [1105](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1105) | object-field | {{expression1}}px | interpolation |
| [1363](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1363) | jsx-attribute | Bulk Thumbnail Builder | mixed-jsx |
| [1370](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1370) | jsx-expression | All thumbnails up to date | mixed-jsx |
| [1371](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1371) | jsx-expression | {{expression1}} thumbnail{{expression2}} to {{expression3}} | interpolation, mixed-jsx |
| [1377](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1377) | jsx-text | Cancel | — |
| [1385](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1385) | jsx-text | Build thumbnails | — |
| [1396](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1396) | jsx-text | canvas | mixed-jsx, terminology |
| [1396](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1396) | jsx-expression | es | mixed-jsx |
| [1400](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1400) | jsx-text | Sizes from image service · | mixed-jsx |
| [1400](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1400) | jsx-text | px | mixed-jsx |
| [1402](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1402) | jsx-expression | Using standard sizes — no image service detected | mixed-jsx |
| [1408](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1408) | jsx-text | Thumbnail size | — |
| [1433](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1433) | jsx-text | Replace existing | — |
| [1438](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1438) | jsx-text | Multi-image canvases | terminology |
| [1446](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1446) | jsx-text | First image | — |
| [1447](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1447) | jsx-text | Full composite | — |
| [1448](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1448) | jsx-text | Specific layer | — |
| [1455](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1455) | jsx-text | Layer | — |
| [1464](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1464) | jsx-text | Layer | mixed-jsx |
| [1476](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1476) | jsx-text | Canvas preview | terminology |
| [1479](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1479) | jsx-text | will be built | mixed-jsx |
| [1481](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1481) | jsx-expression | All up to date | mixed-jsx |
| [1547](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1547) | jsx-expression | Replace | mixed-jsx |
| [1547](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1547) | jsx-expression | Add | mixed-jsx |
| [1564](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1564) | jsx-text | No image | — |
| [1624](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1624) | jsx-attribute | Thumbnail results | mixed-jsx |
| [1630](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1630) | jsx-text | Added | — |
| [1635](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1635) | jsx-text | Skipped | — |
| [1641](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1641) | jsx-text | Failed | — |
| [1645](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1645) | jsx-expression | {{expression1}} verified | interpolation, mixed-jsx |
| [1652](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1652) | jsx-text | Added thumbnails | — |
| [1665](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1665) | jsx-expression | {{expression1}}{{expression2}} | interpolation, mixed-jsx |
| [1674](../../../../presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx#L1674) | jsx-text | Skipped | — |

### presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx) and classify its 36 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [36](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L36) | object-field | A/V Range Workbench | module-definition, terminology |
| [211](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L211) | object-field | Untitled range | terminology |
| [395](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L395) | jsx-text | No audio or video canvases are available for temporal range editing. | terminology |
| [417](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L417) | jsx-expression | Video | mixed-jsx |
| [417](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L417) | jsx-expression | Audio | mixed-jsx |
| [424](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L424) | jsx-text | Mark in: | mixed-jsx |
| [425](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L425) | jsx-text | · press | mixed-jsx |
| [425](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L425) | jsx-text | O | — |
| [425](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L425) | jsx-text | to mark end | mixed-jsx |
| [458](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L458) | jsx-attribute | Captions | — |
| [486](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L486) | jsx-attribute | Captions | — |
| [549](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L549) | jsx-text | Play selection | mixed-jsx |
| [553](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L553) | jsx-text | Split at playhead | mixed-jsx |
| [557](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L557) | jsx-text | Delete range | mixed-jsx, terminology |
| [563](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L563) | jsx-expression | Hide captions | mixed-jsx |
| [563](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L563) | jsx-expression | Show captions | mixed-jsx |
| [615](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L615) | jsx-expression | Pause | mixed-jsx |
| [615](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L615) | jsx-expression | Play | mixed-jsx |
| [620](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L620) | jsx-text | -5s | — |
| [624](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L624) | jsx-text | +5s | — |
| [634](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L634) | jsx-text | Speed | — |
| [644](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L644) | jsx-text | x | mixed-jsx |
| [652](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L652) | jsx-attribute | Volume | — |
| [666](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L666) | jsx-text | Mark in | mixed-jsx |
| [673](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L673) | jsx-text | Mark out | mixed-jsx |
| [682](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L682) | jsx-text | Play selection | mixed-jsx |
| [693](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L693) | jsx-text | Loop | mixed-jsx |
| [887](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L887) | jsx-text | Zoom | mixed-jsx |
| [890](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L890) | jsx-attribute | Timeline zoom | — |
| [898](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L898) | jsx-text | x | mixed-jsx |
| [912](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L912) | jsx-text | Overview | — |
| [940](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L940) | jsx-text | Ranges | terminology |
| [1065](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L1065) | jsx-attribute | Create range from gap {{expression1}} to {{expression2}} | interpolation, terminology |
| [1110](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L1110) | jsx-attribute | {{expression1}}: {{expression2}} to {{expression3}} | interpolation, mixed-jsx |
| [1173](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L1173) | jsx-text | Create | — |
| [1373](../../../../presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx#L1373) | jsx-text | Transcript could not be loaded. | — |

### presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx) and classify its 25 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [34](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L34) | object-field | A/V Ranges | module-definition, terminology |
| [135](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L135) | jsx-attribute | A/V Ranges | terminology |
| [141](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L141) | object-field | New range | terminology |
| [150](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L150) | jsx-text | No audio or video canvases are available for temporal range editing. | terminology |
| [159](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L159) | jsx-text | Canvas | terminology |
| [178](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L178) | jsx-text | Draft range | terminology |
| [182](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L182) | jsx-attribute | Discard draft | mixed-jsx |
| [198](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L198) | jsx-text | Create range from selection | terminology |
| [216](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L216) | jsx-text | Create the first range by dragging on the timeline, using Mark in/out, or pressing New range. | terminology |
| [228](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L228) | jsx-attribute | Search ranges… | terminology |
| [230](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L230) | jsx-attribute | Search ranges | terminology |
| [311](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L311) | object-field | Enter readable start and end times. | — |
| [346](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L346) | jsx-text | Edit range | terminology |
| [354](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L354) | jsx-text | Deselect | mixed-jsx |
| [361](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L361) | jsx-text | Title | — |
| [370](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L370) | jsx-text | Start | — |
| [378](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L378) | jsx-text | End | — |
| [386](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L386) | jsx-text | Duration: | mixed-jsx |
| [396](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L396) | jsx-expression | Range is invalid. | mixed-jsx, terminology |
| [401](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L401) | jsx-text | Save | — |
| [410](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L410) | jsx-text | Delete | — |
| [424](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L424) | jsx-text | ← Merge with previous | — |
| [435](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L435) | jsx-text | Merge with next → | — |
| [447](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L447) | jsx-text | Advanced options | mixed-jsx |
| [456](../../../../presets/manifest-preset/src/av-ranges/av-ranges-panel.tsx#L456) | jsx-text | Hidden from navigation | mixed-jsx |

### presets/manifest-preset/src/plugins/manifest-quality-checks.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx) and classify its 24 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [25](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L25) | object-field | Manifest Quality Checks | module-definition, terminology |
| [26](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L26) | object-field | Review common IIIF completeness and presentation issues before publishing. | module-definition |
| [39](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L39) | object-field | Quality | module-definition |
| [87](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L87) | jsx-attribute | Quality checks | — |
| [90](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L90) | jsx-attribute | Errors | — |
| [91](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L91) | jsx-attribute | Warnings | — |
| [92](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L92) | jsx-attribute | Info | — |
| [96](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L96) | jsx-text | Manifest coverage | terminology |
| [98](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L98) | jsx-text | canvas | mixed-jsx, terminology |
| [98](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L98) | jsx-expression | es | mixed-jsx |
| [98](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L98) | jsx-text | and | mixed-jsx |
| [98](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L98) | jsx-text | painting annotation | mixed-jsx |
| [99](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L99) | jsx-expression | s | mixed-jsx |
| [99](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L99) | jsx-text | checked. | mixed-jsx |
| [110](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L110) | jsx-text | No common publishing issues found. | — |
| [161](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L161) | jsx-text | Open | mixed-jsx |
| [192](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L192) | object-field | Manifest label is missing | terminology |
| [202](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L202) | object-field | No canvases | terminology |
| [212](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L212) | object-field | Required statement is missing | — |
| [222](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L222) | object-field | Rights statement is missing | — |
| [237](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L237) | object-field | Canvas label is missing | terminology |
| [248](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L248) | object-field | Canvas dimensions or duration are missing | terminology |
| [262](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L262) | object-field | Canvas has no painting content | terminology |
| [275](../../../../presets/manifest-preset/src/plugins/manifest-quality-checks.tsx#L275) | object-field | Painting annotation has no body | — |

### presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx) and classify its 16 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [9](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L9) | object-field | Working with IIIF ranges | module-definition, terminology |
| [11](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L11) | object-field | IIIF uses Ranges to represent logical structure in a digitised object. The range or Table of Contents can then aid users in navigating that content. This short tour shows you the m | module-definition, terminology |
| [16](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L16) | object-field | Range structure | module-definition, terminology |
| [18](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L18) | object-field | Browse and navigate your range. Use Edit mode to add more range items, drag to reorder or use the ••• menu to insert empty range items or to delete from the range. | module-definition, terminology |
| [23](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L23) | object-field | Split a range | module-definition, terminology |
| [25](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L25) | object-field | Using the splittling mode, you can build and manage the contents of your range. Hover over a canvas to preview, then click to create a new range with canvases from that point onwar | module-definition, terminology |
| [29](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L29) | object-field | Edit or reorder ranges | module-definition, terminology |
| [31](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L31) | object-field | Toggle Edit to reveal the ••• menu and drag handles for each item in range. Insert an empty range, expand or collapse the structure or delete items. Drag to reorder or move content | module-definition, terminology |
| [35](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L35) | object-field | Switch view | module-definition |
| [37](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L37) | object-field | Card view provides a simple visual overview of the range. Tree view shows the full hierarchy and allows precise drag and drop options. | module-definition, terminology |
| [41](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L41) | object-field | Adjust grid size | module-definition |
| [42](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L42) | object-field | Change the canvas thumbnail size to suit your workflow. | module-definition, terminology |
| [46](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L46) | object-field | That’s it! | module-definition |
| [48](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L48) | jsx-text | Now you know the basics of working with ranges. You can restart this tour anytime from the Help menu. Alternatively, you can view the | mixed-jsx, terminology |
| [56](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L56) | jsx-text | Creating Ranges guide | terminology |
| [70](../../../../presets/manifest-preset/src/center-panels/components/RangeOnboarding.tsx#L70) | jsx-attribute | Range help | mixed-jsx, terminology |

### presets/manifest-preset/src/left-panels/tags.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/left-panels/tags.tsx) and classify its 15 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [21](../../../../presets/manifest-preset/src/left-panels/tags.tsx#L21) | object-field | Tags | module-definition |
| [84](../../../../presets/manifest-preset/src/left-panels/tags.tsx#L84) | message-call | Delete {{expression1}} from {{expression2}}? {{expression3}} | interpolation, user-or-developer-message-review |
| [120](../../../../presets/manifest-preset/src/left-panels/tags.tsx#L120) | message-call | Delete all {{expression1}} from {{expression2}}? | interpolation, user-or-developer-message-review |
| [136](../../../../presets/manifest-preset/src/left-panels/tags.tsx#L136) | jsx-attribute | Tags | — |
| [140](../../../../presets/manifest-preset/src/left-panels/tags.tsx#L140) | object-field | Delete all tags | — |
| [153](../../../../presets/manifest-preset/src/left-panels/tags.tsx#L153) | jsx-attribute | No canvases | terminology |
| [153](../../../../presets/manifest-preset/src/left-panels/tags.tsx#L153) | jsx-attribute | Canvas tags will appear here after canvases are added. | terminology |
| [155](../../../../presets/manifest-preset/src/left-panels/tags.tsx#L155) | jsx-attribute | No canvas tags | terminology |
| [155](../../../../presets/manifest-preset/src/left-panels/tags.tsx#L155) | jsx-attribute | Canvas tags added by editor tools and background actions will appear here. | terminology |
| [188](../../../../presets/manifest-preset/src/left-panels/tags.tsx#L188) | jsx-text | Delete selected ( | mixed-jsx |
| [208](../../../../presets/manifest-preset/src/left-panels/tags.tsx#L208) | jsx-text | Tag applications | — |
| [212](../../../../presets/manifest-preset/src/left-panels/tags.tsx#L212) | jsx-text | Tagged canvases | terminology |
| [250](../../../../presets/manifest-preset/src/left-panels/tags.tsx#L250) | jsx-text | on | mixed-jsx |
| [256](../../../../presets/manifest-preset/src/left-panels/tags.tsx#L256) | jsx-attribute | Delete {{expression1}} tags | interpolation, mixed-jsx |
| [257](../../../../presets/manifest-preset/src/left-panels/tags.tsx#L257) | jsx-attribute | Delete {{expression1}} tags | interpolation, mixed-jsx |

### presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx) and classify its 14 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [168](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx#L168) | jsx-attribute | {{expression1}} {{expression2}} | interpolation, mixed-jsx |
| [184](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx#L184) | jsx-expression | Untitled range | mixed-jsx, terminology |
| [197](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx#L197) | jsx-attribute | Actions for {{expression1}} | interpolation, mixed-jsx |
| [206](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx#L206) | jsx-text | Edit range label | mixed-jsx, terminology |
| [222](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx#L222) | jsx-text | Edit range metadata | mixed-jsx, terminology |
| [230](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx#L230) | jsx-text | Empty contents into | mixed-jsx |
| [241](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx#L241) | jsx-text | Empty contents into | mixed-jsx |
| [257](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx#L257) | jsx-text | Merge into | mixed-jsx |
| [272](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx#L272) | jsx-text | Merge into | mixed-jsx |
| [283](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx#L283) | jsx-expression | View range item | mixed-jsx, terminology |
| [283](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx#L283) | jsx-expression | Edit range item | mixed-jsx, terminology |
| [332](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx#L332) | jsx-expression | Untitled range | mixed-jsx, terminology |
| [357](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx#L357) | object-field | Preview {{expression1}} | interpolation |
| [378](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchSection.tsx#L378) | jsx-text | Load more | — |

### presets/manifest-preset/src/center-panels/range-workbench.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/center-panels/range-workbench.tsx) and classify its 13 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [30](../../../../presets/manifest-preset/src/center-panels/range-workbench.tsx#L30) | object-field | Range Workbench | module-definition, terminology |
| [395](../../../../presets/manifest-preset/src/center-panels/range-workbench.tsx#L395) | jsx-attribute | Go to parent range | mixed-jsx, terminology |
| [406](../../../../presets/manifest-preset/src/center-panels/range-workbench.tsx#L406) | jsx-attribute | Untitled range | mixed-jsx, terminology |
| [413](../../../../presets/manifest-preset/src/center-panels/range-workbench.tsx#L413) | jsx-attribute | Range actions | mixed-jsx, terminology |
| [422](../../../../presets/manifest-preset/src/center-panels/range-workbench.tsx#L422) | jsx-text | Edit range label | mixed-jsx, terminology |
| [430](../../../../presets/manifest-preset/src/center-panels/range-workbench.tsx#L430) | jsx-text | Split range | mixed-jsx, terminology |
| [442](../../../../presets/manifest-preset/src/center-panels/range-workbench.tsx#L442) | jsx-text | Splitting range, click to confirm the the new range item | mixed-jsx, terminology |
| [444](../../../../presets/manifest-preset/src/center-panels/range-workbench.tsx#L444) | jsx-text | Exit splitting mode | — |
| [451](../../../../presets/manifest-preset/src/center-panels/range-workbench.tsx#L451) | jsx-attribute | Back to range | mixed-jsx, terminology |
| [466](../../../../presets/manifest-preset/src/center-panels/range-workbench.tsx#L466) | jsx-attribute | Range actions | mixed-jsx, terminology |
| [475](../../../../presets/manifest-preset/src/center-panels/range-workbench.tsx#L475) | jsx-text | Edit range label | mixed-jsx, terminology |
| [544](../../../../presets/manifest-preset/src/center-panels/range-workbench.tsx#L544) | jsx-text | Scroll to top | mixed-jsx |
| [548](../../../../presets/manifest-preset/src/center-panels/range-workbench.tsx#L548) | jsx-text | Scroll to bottom | mixed-jsx |

### presets/manifest-preset/src/context-menus.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/context-menus.tsx) and classify its 12 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [22](../../../../presets/manifest-preset/src/context-menus.tsx#L22) | object-field | Context menus | module-definition |
| [58](../../../../presets/manifest-preset/src/context-menus.tsx#L58) | object-field | Edit metadata | — |
| [65](../../../../presets/manifest-preset/src/context-menus.tsx#L65) | object-field | Add media... | — |
| [76](../../../../presets/manifest-preset/src/context-menus.tsx#L76) | object-field | Add from IIIF Browser | — |
| [127](../../../../presets/manifest-preset/src/context-menus.tsx#L127) | object-field | Edit | — |
| [137](../../../../presets/manifest-preset/src/context-menus.tsx#L137) | object-field | Bring to front | — |
| [150](../../../../presets/manifest-preset/src/context-menus.tsx#L150) | object-field | Send to back | — |
| [194](../../../../presets/manifest-preset/src/context-menus.tsx#L194) | object-field | Edit metadata | — |
| [202](../../../../presets/manifest-preset/src/context-menus.tsx#L202) | object-field | Save changes | — |
| [210](../../../../presets/manifest-preset/src/context-menus.tsx#L210) | object-field | Discard changes | — |
| [218](../../../../presets/manifest-preset/src/context-menus.tsx#L218) | object-field | Edit position | — |
| [236](../../../../presets/manifest-preset/src/context-menus.tsx#L236) | object-field | Target whole canvas | terminology |

### presets/manifest-preset/src/av-ranges/av-temporal-range-creator.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/av-ranges/av-temporal-range-creator.tsx) and classify its 11 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [192](../../../../presets/manifest-preset/src/av-ranges/av-temporal-range-creator.tsx#L192) | jsx-text | Create A/V range | terminology |
| [226](../../../../presets/manifest-preset/src/av-ranges/av-temporal-range-creator.tsx#L226) | jsx-text | Title | — |
| [236](../../../../presets/manifest-preset/src/av-ranges/av-temporal-range-creator.tsx#L236) | jsx-text | Start | — |
| [244](../../../../presets/manifest-preset/src/av-ranges/av-temporal-range-creator.tsx#L244) | jsx-text | End | — |
| [254](../../../../presets/manifest-preset/src/av-ranges/av-temporal-range-creator.tsx#L254) | jsx-text | Duration: | mixed-jsx |
| [258](../../../../presets/manifest-preset/src/av-ranges/av-temporal-range-creator.tsx#L258) | jsx-expression | Invalid | mixed-jsx |
| [260](../../../../presets/manifest-preset/src/av-ranges/av-temporal-range-creator.tsx#L260) | jsx-text | Preview selection | — |
| [270](../../../../presets/manifest-preset/src/av-ranges/av-temporal-range-creator.tsx#L270) | jsx-text | Hidden from navigation | mixed-jsx |
| [278](../../../../presets/manifest-preset/src/av-ranges/av-temporal-range-creator.tsx#L278) | jsx-text | Create range | terminology |
| [288](../../../../presets/manifest-preset/src/av-ranges/av-temporal-range-creator.tsx#L288) | object-field | A/V temporal range | module-definition, terminology |
| [289](../../../../presets/manifest-preset/src/av-ranges/av-temporal-range-creator.tsx#L289) | object-field | Create a temporal range on an audio or video canvas | module-definition, terminology |

### presets/manifest-preset/src/left-panels/canvas-listing.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/left-panels/canvas-listing.tsx) and classify its 11 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [66](../../../../presets/manifest-preset/src/left-panels/canvas-listing.tsx#L66) | object-field | Canvases | module-definition, terminology |
| [118](../../../../presets/manifest-preset/src/left-panels/canvas-listing.tsx#L118) | jsx-attribute | Canvases | terminology |
| [130](../../../../presets/manifest-preset/src/left-panels/canvas-listing.tsx#L130) | object-field | List view | — |
| [130](../../../../presets/manifest-preset/src/left-panels/canvas-listing.tsx#L130) | object-field | Grid view | — |
| [137](../../../../presets/manifest-preset/src/left-panels/canvas-listing.tsx#L137) | object-field | Edit canvases | terminology |
| [143](../../../../presets/manifest-preset/src/left-panels/canvas-listing.tsx#L143) | object-field | IIIF Browser | — |
| [150](../../../../presets/manifest-preset/src/left-panels/canvas-listing.tsx#L150) | object-field | Add new canvas | terminology |
| [347](../../../../presets/manifest-preset/src/left-panels/canvas-listing.tsx#L347) | jsx-attribute | Remove flag | mixed-jsx |
| [347](../../../../presets/manifest-preset/src/left-panels/canvas-listing.tsx#L347) | jsx-attribute | Flag canvas | mixed-jsx, terminology |
| [349](../../../../presets/manifest-preset/src/left-panels/canvas-listing.tsx#L349) | jsx-attribute | Remove flag | mixed-jsx |
| [349](../../../../presets/manifest-preset/src/left-panels/canvas-listing.tsx#L349) | jsx-attribute | Flag canvas | mixed-jsx, terminology |

### presets/manifest-preset/src/left-panels/components/RangeCardView.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/left-panels/components/RangeCardView.tsx) and classify its 9 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [84](../../../../presets/manifest-preset/src/left-panels/components/RangeCardView.tsx#L84) | jsx-text | items | mixed-jsx |
| [280](../../../../presets/manifest-preset/src/left-panels/components/RangeCardView.tsx#L280) | jsx-attribute | Back to parent range | mixed-jsx, terminology |
| [293](../../../../presets/manifest-preset/src/left-panels/components/RangeCardView.tsx#L293) | jsx-text | This Range only contains canvases. | terminology |
| [302](../../../../presets/manifest-preset/src/left-panels/components/RangeCardView.tsx#L302) | jsx-text | No ranges found | terminology |
| [328](../../../../presets/manifest-preset/src/left-panels/components/RangeCardView.tsx#L328) | jsx-expression | Canvases | mixed-jsx, terminology |
| [328](../../../../presets/manifest-preset/src/left-panels/components/RangeCardView.tsx#L328) | jsx-expression | Ranges | mixed-jsx, terminology |
| [334](../../../../presets/manifest-preset/src/left-panels/components/RangeCardView.tsx#L334) | jsx-attribute | Actions for {{expression1}} | interpolation, mixed-jsx |
| [343](../../../../presets/manifest-preset/src/left-panels/components/RangeCardView.tsx#L343) | jsx-text | Delete range item | mixed-jsx, terminology |
| [348](../../../../presets/manifest-preset/src/left-panels/components/RangeCardView.tsx#L348) | jsx-attribute | Reorder {{expression1}} | interpolation, mixed-jsx |

### presets/manifest-preset/src/left-panels/manifest.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/left-panels/manifest.tsx) and classify its 8 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [45](../../../../presets/manifest-preset/src/left-panels/manifest.tsx#L45) | object-field | Manifest summary | module-definition, terminology |
| [90](../../../../presets/manifest-preset/src/left-panels/manifest.tsx#L90) | jsx-attribute | Manifest summary | terminology |
| [98](../../../../presets/manifest-preset/src/left-panels/manifest.tsx#L98) | object-field | Finish editing | — |
| [98](../../../../presets/manifest-preset/src/left-panels/manifest.tsx#L98) | object-field | Edit metadata | — |
| [118](../../../../presets/manifest-preset/src/left-panels/manifest.tsx#L118) | jsx-attribute | Add an exhibition title | mixed-jsx |
| [131](../../../../presets/manifest-preset/src/left-panels/manifest.tsx#L131) | jsx-attribute | Add an exhibition summary | mixed-jsx |
| [163](../../../../presets/manifest-preset/src/left-panels/manifest.tsx#L163) | jsx-text | You can add some descriptive metadata for this manifest using the editing panel on the right | terminology |
| [174](../../../../presets/manifest-preset/src/left-panels/manifest.tsx#L174) | object-field | font-bold text-black w-full text-sm font-semibold mb-1 | — |

### presets/manifest-preset/src/left-panels/range-listing.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/left-panels/range-listing.tsx) and classify its 8 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [31](../../../../presets/manifest-preset/src/left-panels/range-listing.tsx#L31) | object-field | Ranges | module-definition, terminology |
| [94](../../../../presets/manifest-preset/src/left-panels/range-listing.tsx#L94) | jsx-attribute | Untitled range | terminology |
| [98](../../../../presets/manifest-preset/src/left-panels/range-listing.tsx#L98) | object-field | Tree view | — |
| [98](../../../../presets/manifest-preset/src/left-panels/range-listing.tsx#L98) | object-field | Card view | — |
| [110](../../../../presets/manifest-preset/src/left-panels/range-listing.tsx#L110) | object-field | Edit range | terminology |
| [118](../../../../presets/manifest-preset/src/left-panels/range-listing.tsx#L118) | object-field | Split range | terminology |
| [134](../../../../presets/manifest-preset/src/left-panels/range-listing.tsx#L134) | jsx-text | Back to Range List | mixed-jsx, terminology |
| [148](../../../../presets/manifest-preset/src/left-panels/range-listing.tsx#L148) | jsx-text | Warning: Non-contiguous range | terminology |

### presets/manifest-preset/src/av-ranges/temporal-range-utils.ts

- [ ] Review [source](../../../../presets/manifest-preset/src/av-ranges/temporal-range-utils.ts) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [190](../../../../presets/manifest-preset/src/av-ranges/temporal-range-utils.ts#L190) | object-field | End time must be after start time. | — |
| [197](../../../../presets/manifest-preset/src/av-ranges/temporal-range-utils.ts#L197) | object-field | Range must stay within the canvas duration. | terminology |
| [204](../../../../presets/manifest-preset/src/av-ranges/temporal-range-utils.ts#L204) | object-field | Title is required. | — |
| [216](../../../../presets/manifest-preset/src/av-ranges/temporal-range-utils.ts#L216) | object-field | Ranges cannot overlap. | terminology |
| [343](../../../../presets/manifest-preset/src/av-ranges/temporal-range-utils.ts#L343) | object-field | Untitled range | terminology |

### presets/manifest-preset/src/center-panels/manifest-overview.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/center-panels/manifest-overview.tsx) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [61](../../../../presets/manifest-preset/src/center-panels/manifest-overview.tsx#L61) | object-field | Overview | module-definition |
| [154](../../../../presets/manifest-preset/src/center-panels/manifest-overview.tsx#L154) | jsx-text | Show only flagged | mixed-jsx |
| [158](../../../../presets/manifest-preset/src/center-panels/manifest-overview.tsx#L158) | jsx-text | Add new canvas | mixed-jsx, terminology |
| [160](../../../../presets/manifest-preset/src/center-panels/manifest-overview.tsx#L160) | jsx-attribute | Browse IIIF resources | mixed-jsx |
| [167](../../../../presets/manifest-preset/src/center-panels/manifest-overview.tsx#L167) | jsx-text | No flagged canvases | terminology |

### presets/manifest-preset/src/left-panels/components/TreeRangeItem.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/left-panels/components/TreeRangeItem.tsx) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [238](../../../../presets/manifest-preset/src/left-panels/components/TreeRangeItem.tsx#L238) | jsx-expression | Untitled range | mixed-jsx, terminology |
| [260](../../../../presets/manifest-preset/src/left-panels/components/TreeRangeItem.tsx#L260) | jsx-text | Insert empty range | mixed-jsx, terminology |
| [266](../../../../presets/manifest-preset/src/left-panels/components/TreeRangeItem.tsx#L266) | jsx-text | Expand all | mixed-jsx |
| [272](../../../../presets/manifest-preset/src/left-panels/components/TreeRangeItem.tsx#L272) | jsx-text | Collapse all | mixed-jsx |
| [281](../../../../presets/manifest-preset/src/left-panels/components/TreeRangeItem.tsx#L281) | jsx-text | Delete range item | mixed-jsx, terminology |

### presets/manifest-preset/src/left-panels/components/VirtualRangeSidebar.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/left-panels/components/VirtualRangeSidebar.tsx) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [73](../../../../presets/manifest-preset/src/left-panels/components/VirtualRangeSidebar.tsx#L73) | jsx-text | This manifests contains multiple top-level ranges. You can either merge them together into a single range or select a range to edit. | terminology |
| [78](../../../../presets/manifest-preset/src/left-panels/components/VirtualRangeSidebar.tsx#L78) | jsx-text | Choose an option | — |
| [82](../../../../presets/manifest-preset/src/left-panels/components/VirtualRangeSidebar.tsx#L82) | jsx-text | Combine into single range | mixed-jsx, terminology |
| [88](../../../../presets/manifest-preset/src/left-panels/components/VirtualRangeSidebar.tsx#L88) | jsx-text | Delete ranges and start again | mixed-jsx, terminology |
| [94](../../../../presets/manifest-preset/src/left-panels/components/VirtualRangeSidebar.tsx#L94) | jsx-text | Choose a range to edit | terminology |

### presets/manifest-preset/src/center-panels/components/BulkActionsWorkbench.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/center-panels/components/BulkActionsWorkbench.tsx) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [33](../../../../presets/manifest-preset/src/center-panels/components/BulkActionsWorkbench.tsx#L33) | jsx-text | Canvases at this level | terminology |
| [36](../../../../presets/manifest-preset/src/center-panels/components/BulkActionsWorkbench.tsx#L36) | jsx-expression | canvases | mixed-jsx, terminology |
| [36](../../../../presets/manifest-preset/src/center-panels/components/BulkActionsWorkbench.tsx#L36) | jsx-expression | canvas | mixed-jsx, terminology |
| [85](../../../../presets/manifest-preset/src/center-panels/components/BulkActionsWorkbench.tsx#L85) | jsx-text | Move into new sub-range | terminology |

### presets/manifest-preset/src/left-panels/components/RangesCreateEmpty.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/left-panels/components/RangesCreateEmpty.tsx) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [43](../../../../presets/manifest-preset/src/left-panels/components/RangesCreateEmpty.tsx#L43) | jsx-attribute | Ranges | terminology |
| [47](../../../../presets/manifest-preset/src/left-panels/components/RangesCreateEmpty.tsx#L47) | object-field | Add range | terminology |
| [55](../../../../presets/manifest-preset/src/left-panels/components/RangesCreateEmpty.tsx#L55) | jsx-text | This manifest does not yet have a range(s). If you want to offer navigation, such as a table of contents, you can create a range. | terminology |
| [61](../../../../presets/manifest-preset/src/left-panels/components/RangesCreateEmpty.tsx#L61) | jsx-text | Create new range | mixed-jsx, terminology |

### presets/manifest-preset/src/plugins/remote-inference-models.ts

- [ ] Review [source](../../../../presets/manifest-preset/src/plugins/remote-inference-models.ts) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [7](../../../../presets/manifest-preset/src/plugins/remote-inference-models.ts#L7) | object-field | GLM OCR (1B) | module-definition |
| [9](../../../../presets/manifest-preset/src/plugins/remote-inference-models.ts#L9) | object-field | Qwen 3.6 (9B) | module-definition |
| [10](../../../../presets/manifest-preset/src/plugins/remote-inference-models.ts#L10) | object-field | Gemma 4 (31B) | module-definition |
| [11](../../../../presets/manifest-preset/src/plugins/remote-inference-models.ts#L11) | object-field | Qwen 3.6 (35B) | module-definition |

### presets/manifest-preset/src/center-panels/components/EmptyRangeMessage.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/center-panels/components/EmptyRangeMessage.tsx) and classify its 3 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [16](../../../../presets/manifest-preset/src/center-panels/components/EmptyRangeMessage.tsx#L16) | jsx-text | Empty range | terminology |
| [17](../../../../presets/manifest-preset/src/center-panels/components/EmptyRangeMessage.tsx#L17) | jsx-text | This range does not yet have any canvases. | mixed-jsx, terminology |
| [18](../../../../presets/manifest-preset/src/center-panels/components/EmptyRangeMessage.tsx#L18) | jsx-text | If you want to offer navigation to canvases, you can edit the range and add content. | mixed-jsx, terminology |

### presets/manifest-preset/src/center-panels/components/RangeWorkbenchCanvas.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchCanvas.tsx) and classify its 3 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [51](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchCanvas.tsx#L51) | jsx-text | No canvas preview available | terminology |
| [90](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchCanvas.tsx#L90) | jsx-text | Previous | — |
| [101](../../../../presets/manifest-preset/src/center-panels/components/RangeWorkbenchCanvas.tsx#L101) | jsx-text | Next | — |

### presets/manifest-preset/src/index.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/index.tsx) and classify its 3 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [32](../../../../presets/manifest-preset/src/index.tsx#L32) | object-field | Manifest Editor | module-definition, terminology |
| [43](../../../../presets/manifest-preset/src/index.tsx#L43) | object-field | Current canvas | module-definition, terminology |
| [57](../../../../presets/manifest-preset/src/index.tsx#L57) | object-field | Notebook | module-definition |

### presets/manifest-preset/src/left-panels/components/RangeSplittingPreview.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/left-panels/components/RangeSplittingPreview.tsx) and classify its 3 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [10](../../../../presets/manifest-preset/src/left-panels/components/RangeSplittingPreview.tsx#L10) | jsx-text | Exit splitting mode | — |
| [15](../../../../presets/manifest-preset/src/left-panels/components/RangeSplittingPreview.tsx#L15) | jsx-text | Hover over the Canvases to select where you want to add a new range item. Click to select that Canvas. Note the first canvas can’t be split. | terminology |
| [32](../../../../presets/manifest-preset/src/left-panels/components/RangeSplittingPreview.tsx#L32) | jsx-text | Creating your first range adds one range called “Range 1” that contains every canvas. You can rename it, split it, or move canvases into sub-ranges. | mixed-jsx, terminology |

### presets/manifest-preset/src/left-panels/overview.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/left-panels/overview.tsx) and classify its 3 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [16](../../../../presets/manifest-preset/src/left-panels/overview.tsx#L16) | object-field | Overview | module-definition |
| [37](../../../../presets/manifest-preset/src/left-panels/overview.tsx#L37) | jsx-text | Overview | — |
| [38](../../../../presets/manifest-preset/src/left-panels/overview.tsx#L38) | jsx-text | This is the overview page for the manifest editor. | terminology |

### presets/manifest-preset/src/plugins/av-ranges.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/plugins/av-ranges.tsx) and classify its 3 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [15](../../../../presets/manifest-preset/src/plugins/av-ranges.tsx#L15) | object-field | A/V Ranges | module-definition, terminology |
| [16](../../../../presets/manifest-preset/src/plugins/av-ranges.tsx#L16) | object-field | Create and edit temporal ranges for audio and video canvases. | module-definition, terminology |
| [54](../../../../presets/manifest-preset/src/plugins/av-ranges.tsx#L54) | object-field | A/V ranges plugin sync | module-definition, terminology |

### presets/manifest-preset/src/av-ranges/temporal-range-utils.test.ts

- [ ] Review [source](../../../../presets/manifest-preset/src/av-ranges/temporal-range-utils.test.ts) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [101](../../../../presets/manifest-preset/src/av-ranges/temporal-range-utils.test.ts#L101) | object-field | One | — |
| [103](../../../../presets/manifest-preset/src/av-ranges/temporal-range-utils.test.ts#L103) | object-field | Bad | — |

### presets/manifest-preset/src/left-panels/components/RangeTree.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/left-panels/components/RangeTree.tsx) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [147](../../../../presets/manifest-preset/src/left-panels/components/RangeTree.tsx#L147) | jsx-text | items | mixed-jsx |
| [428](../../../../presets/manifest-preset/src/left-panels/components/RangeTree.tsx#L428) | jsx-text | Canvases without a range | mixed-jsx, terminology |

### presets/manifest-preset/src/left-panels/components/TreeCanvasItem.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/left-panels/components/TreeCanvasItem.tsx) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [98](../../../../presets/manifest-preset/src/left-panels/components/TreeCanvasItem.tsx#L98) | jsx-text | Untitled canvas | terminology |
| [117](../../../../presets/manifest-preset/src/left-panels/components/TreeCanvasItem.tsx#L117) | jsx-text | Remove canvas | mixed-jsx, terminology |

### presets/manifest-preset/src/plugins/av-ranges.test.ts

- [ ] Review [source](../../../../presets/manifest-preset/src/plugins/av-ranges.test.ts) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [27](../../../../presets/manifest-preset/src/plugins/av-ranges.test.ts#L27) | object-field | Manifest Editor | module-definition, terminology |
| [40](../../../../presets/manifest-preset/src/plugins/av-ranges.test.ts#L40) | object-field | Collection Editor | module-definition, terminology |

### presets/manifest-preset/src/av-ranges/av-media-utils.ts

- [ ] Review [source](../../../../presets/manifest-preset/src/av-ranges/av-media-utils.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [50](../../../../presets/manifest-preset/src/av-ranges/av-media-utils.ts#L50) | object-field | Untitled canvas | terminology |

### presets/manifest-preset/src/center-panels/components/RangeGridThumbnail.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/center-panels/components/RangeGridThumbnail.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [42](../../../../presets/manifest-preset/src/center-panels/components/RangeGridThumbnail.tsx#L42) | jsx-text | EMPTY | — |

### presets/manifest-preset/src/left-panels/components/OrphanedTreeCanvasItem.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/left-panels/components/OrphanedTreeCanvasItem.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [28](../../../../presets/manifest-preset/src/left-panels/components/OrphanedTreeCanvasItem.tsx#L28) | jsx-text | Untitled canvas | terminology |

### presets/manifest-preset/src/left-panels/tags.test.ts

- [ ] Review [source](../../../../presets/manifest-preset/src/left-panels/tags.test.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [14](../../../../presets/manifest-preset/src/left-panels/tags.test.ts#L14) | object-field | Review | module-definition |

### presets/manifest-preset/src/query-string.tsx

- [ ] Review [source](../../../../presets/manifest-preset/src/query-string.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [21](../../../../presets/manifest-preset/src/query-string.tsx#L21) | object-field | Query string | module-definition |

## Formatting and content-language review points

| Source | Review kind | Code |
| --- | --- | --- |
| [presets/manifest-preset/src/av-ranges/temporal-range-utils.ts:62](../../../../presets/manifest-preset/src/av-ranges/temporal-range-utils.ts#L62) | formatting-review | rounded.toFixed(3) |
