# Internationalisation scope audit

Revision: 66de064a5d217b7847db924db925b092b36a0eed. Scopes: apps/web/src, packages, presets, plugins. Tests: false. Docs/tutorials/examples: false.

Candidates require review. Occurrences are edit sites, distinct texts are not final message IDs, and flags overlap. This is a syntactic inventory, not a proof of UI reachability or translation completeness.

| Item | Count |
| --- | ---: |
| filesScanned | 1024 |
| linesScanned | 111934 |
| candidateOccurrences | 2893 |
| distinctCandidateTexts | 2046 |
| filesWithCandidates | 414 |
| legacyOccurrences | 59 |
| nonLegacyOccurrences | 2834 |
| parseErrors | 0 |

## Candidates by workspace

| Item | Count |
| --- | ---: |
| presets/exhibition-preset | 573 |
| presets/manifest-preset | 440 |
| packages/editors | 400 |
| apps/web | 326 |
| plugins/translation | 216 |
| packages/shell | 208 |
| packages/ui | 184 |
| packages/creators | 116 |
| packages/editor-api | 80 |
| plugins/canvas-label-generator | 67 |
| plugins/annotations | 60 |
| plugins/ocr-docling | 55 |
| plugins/ocr-classification | 38 |
| plugins/specifications | 32 |
| presets/collection-preset | 27 |
| packages/manifest-editor | 26 |
| packages/components | 23 |
| packages/projects | 13 |
| packages/creator-api | 8 |
| packages/client-vault | 1 |

## Candidate kinds

| Item | Count |
| --- | ---: |
| jsx-text | 1025 |
| object-field | 869 |
| jsx-attribute | 647 |
| jsx-expression | 185 |
| message-call | 167 |

## Complexity flags

| Item | Count |
| --- | ---: |
| mixed-jsx | 716 |
| module-definition | 585 |
| terminology | 534 |
| user-or-developer-message-review | 167 |
| interpolation | 148 |
| concatenation | 3 |

## Other review points

| Item | Count |
| --- | ---: |
| content-language-config | 32 |
| formatting-review | 10 |

## Top 20 files

| Item | Count |
| --- | ---: |
| presets/exhibition-preset/src/left-panels/ExhibitionTheme.tsx | 129 |
| plugins/translation/src/languages.ts | 100 |
| presets/manifest-preset/src/plugins/remote-inference.tsx | 79 |
| presets/exhibition-preset/src/center-panels/SlideshowCenterPanel.tsx | 64 |
| presets/manifest-preset/src/background-actions.tsx | 53 |
| presets/exhibition-preset/src/right-panels/SlideBehaviours.tsx | 52 |
| plugins/translation/src/sidebar.tsx | 50 |
| apps/web/src/components/browser-editor/BrowserEditor.tsx | 48 |
| presets/manifest-preset/src/bulk-thumbnail-builder/background-action.tsx | 48 |
| packages/editor-api/src/meta/documentation.ts | 42 |
| packages/editors/src/components/TiptapLanguageFieldEditor/TiptapRichTextLanguageField.tsx | 39 |
| plugins/canvas-label-generator/src/config-modal.tsx | 37 |
| presets/manifest-preset/src/av-ranges/av-ranges-workbench.tsx | 36 |
| packages/ui/components/widgets/NewCanvas.tsx | 32 |
| plugins/specifications/src/index.tsx | 32 |
| packages/shell/src/BackgroundTasks/BackgroundActions.tsx | 30 |
| packages/shell/src/PluginContext/PluginManager.tsx | 29 |
| apps/web/src/components/browser-editor/BrowserSettingsPanel.tsx | 26 |
| packages/editors/src/definitions/DescriptiveProperties/DescriptiveProperties.tsx | 26 |
| plugins/ocr-docling/src/config-modal.tsx | 26 |

## Top 20 repeated texts

| Item | Count |
| --- | ---: |
| Label | 19 |
| Preview | 16 |
| x | 16 |
| Cancel | 14 |
| Delete | 12 |
| Edit | 12 |
| Annotations | 11 |
| Canvases | 11 |
| Create | 11 |
| Done | 11 |
| Loading... | 10 |
| s | 10 |
| Skipped | 10 |
| canvas | 9 |
| No thumbnail | 9 |
| Target | 9 |
| es | 8 |
| Open | 8 |
| Tour steps | 8 |
| Add | 7 |

## Limits

Finds JSX text, selected display attributes/object fields, and selected message calls. Excludes comments, imports, types, known translation calls/components, build output, fixtures, and (by default) tests, Storybook, Playwright and tutorial/example files. LegacyManifestEditor is counted separately, but other dormant code may remain. Object labels can contain authored IIIF defaults, protocol values or developer errors. Review these before extracting; do not translate persisted identifiers or existing content. Strings in arbitrary variables, arrays, Markdown/MDX, JSON, CSS generated content, indirect calls and dependency UI can be missed. Mixed JSX and concatenation can produce multiple fragments of one future message. A language switch cannot be inferred from this inventory.
