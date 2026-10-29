# Shell configuration and definition integration source inventory

Module: `packages/shell`. Revision: `66de064a5d217b7847db924db925b092b36a0eed`. [Implementation task](../modules/06-shell.md).

Default application-source scan: **208 occurrences** in **30 files** (96 files scanned). Expanded JS/TS scan including tests/stories/tutorials/examples: **291 occurrences**.

These are syntactic candidates, not final message IDs or verified active UI. Scans use git's tracked/unignored files and exclude generated, public and vendor assets. Supporting-source strings are usually fixtures or assertions, not catalog entries. Markdown/MDX/JSON/CSS and third-party UI are not included. Review authored defaults and developer errors before extraction. Mixed JSX may be fragments of one whole message. Text below is shortened to 180 characters; follow the source link for the original.

## Default application source files

| File | Candidate occurrences |
| --- | ---: |
| [packages/shell/src/BackgroundTasks/BackgroundActions.tsx](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx) | 30 |
| [packages/shell/src/PluginContext/PluginManager.tsx](../../../../packages/shell/src/PluginContext/PluginManager.tsx) | 29 |
| [packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts) | 25 |
| [packages/shell/src/ConfigContext/ConfigEditor.tsx](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx) | 15 |
| [packages/shell/src/BaseCreator/BaseCreator.tsx](../../../../packages/shell/src/BaseCreator/BaseCreator.tsx) | 13 |
| [packages/shell/src/BackgroundTasks/BackgroundTasksStore.ts](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.ts) | 9 |
| [packages/shell/src/ExportPanel/ExportPanel.tsx](../../../../packages/shell/src/ExportPanel/ExportPanel.tsx) | 9 |
| [packages/shell/src/Layout/components/HandleControls.tsx](../../../../packages/shell/src/Layout/components/HandleControls.tsx) | 9 |
| [packages/shell/src/ConfigContext/IIIFOptions.tsx](../../../../packages/shell/src/ConfigContext/IIIFOptions.tsx) | 8 |
| [packages/shell/src/Notebook/ProjectNotebook.tsx](../../../../packages/shell/src/Notebook/ProjectNotebook.tsx) | 8 |
| [packages/shell/src/ManifestPaginationNavigation.tsx](../../../../packages/shell/src/ManifestPaginationNavigation.tsx) | 6 |
| [packages/shell/src/BackgroundTasks/BackgroundActionToasts.helpers.ts](../../../../packages/shell/src/BackgroundTasks/BackgroundActionToasts.helpers.ts) | 5 |
| [packages/shell/src/BaseCreator/CreatorResourceInput.tsx](../../../../packages/shell/src/BaseCreator/CreatorResourceInput.tsx) | 5 |
| [packages/shell/src/Layout/components/ModularPanel.tsx](../../../../packages/shell/src/Layout/components/ModularPanel.tsx) | 5 |
| [packages/shell/src/Layout/Layout.focused.tsx](../../../../packages/shell/src/Layout/Layout.focused.tsx) | 4 |
| [packages/shell/src/PreviewButton/PreviewButton.tsx](../../../../packages/shell/src/PreviewButton/PreviewButton.tsx) | 4 |
| [packages/shell/src/ShellContext/ShellContext.tsx](../../../../packages/shell/src/ShellContext/ShellContext.tsx) | 4 |
| [packages/shell/src/CanvasProgress.tsx](../../../../packages/shell/src/CanvasProgress.tsx) | 3 |
| [packages/shell/src/PresetOnboarding/PresetOnboarding.tsx](../../../../packages/shell/src/PresetOnboarding/PresetOnboarding.tsx) | 3 |
| [packages/shell/src/BaseCreator/BaseAnnotationCreator.tsx](../../../../packages/shell/src/BaseCreator/BaseAnnotationCreator.tsx) | 2 |
| [packages/shell/src/BaseEditor/BaseEditor.tsx](../../../../packages/shell/src/BaseEditor/BaseEditor.tsx) | 2 |
| [packages/shell/src/Layout/Layout.tsx](../../../../packages/shell/src/Layout/Layout.tsx) | 2 |
| [packages/shell/src/BaseCreator/index.tsx](../../../../packages/shell/src/BaseCreator/index.tsx) | 1 |
| [packages/shell/src/BaseEditor/index.tsx](../../../../packages/shell/src/BaseEditor/index.tsx) | 1 |
| [packages/shell/src/ConfigContext/CreatorSettings.tsx](../../../../packages/shell/src/ConfigContext/CreatorSettings.tsx) | 1 |
| [packages/shell/src/ContextMenu/ContextMenuContext.tsx](../../../../packages/shell/src/ContextMenu/ContextMenuContext.tsx) | 1 |
| [packages/shell/src/Layout/components/PanelError.tsx](../../../../packages/shell/src/Layout/components/PanelError.tsx) | 1 |
| [packages/shell/src/PluginContext/PluginContext.tsx](../../../../packages/shell/src/PluginContext/PluginContext.tsx) | 1 |
| [packages/shell/src/Tags.tsx](../../../../packages/shell/src/Tags.tsx) | 1 |
| [packages/shell/src/Toast/ToastContext.tsx](../../../../packages/shell/src/Toast/ToastContext.tsx) | 1 |

## Expanded review list

### packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts

- [ ] Review [source](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts) and classify its 33 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [23](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L23) | object-field | Manifest | module-definition, terminology |
| [30](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L30) | object-field | Current canvas | module-definition, terminology |
| [51](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L51) | object-field | Test action | — |
| [88](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L88) | object-field | Base action | — |
| [89](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L89) | object-field | Override action | — |
| [90](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L90) | object-field | Added action | — |
| [170](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L170) | message-call | aborted | user-or-developer-message-review |
| [280](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L280) | message-call | boom | user-or-developer-message-review |
| [323](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L323) | object-field | Preparing request | — |
| [324](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L324) | object-field | Remote warning | — |
| [334](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L334) | object-field | Half way | — |
| [340](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L340) | object-field | Half way | — |
| [343](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L343) | object-field | Too far | — |
| [348](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L348) | object-field | Too far | — |
| [359](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L359) | object-field | Half way | — |
| [369](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L369) | object-field | Half way | — |
| [392](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L392) | object-field | Latest only | — |
| [397](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L397) | object-field | Latest only | — |
| [461](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L461) | object-field | One | — |
| [462](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L462) | object-field | Two | — |
| [510](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L510) | object-field | One | — |
| [511](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L511) | object-field | Two | — |
| [512](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L512) | object-field | Three | — |
| [574](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L574) | object-field | One | — |
| [578](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L578) | message-call | aborted | user-or-developer-message-review |
| [653](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L653) | object-field | Done | — |
| [654](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L654) | object-field | Pending | — |
| [716](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L716) | object-field | Done | — |
| [717](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L717) | object-field | Pending | — |
| [765](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L765) | object-field | One | — |
| [767](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L767) | object-field | Latest | — |
| [774](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L774) | object-field | Latest | — |
| [800](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.test.ts#L800) | message-call | pending | user-or-developer-message-review |

### packages/shell/src/BackgroundTasks/BackgroundActions.tsx

- [ ] Review [source](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx) and classify its 30 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [62](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L62) | object-field | Current canvas | terminology |
| [312](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L312) | object-field | DBG | module-definition |
| [313](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L313) | object-field | VRB | module-definition |
| [314](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L314) | object-field | INF | module-definition |
| [315](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L315) | object-field | LOG | module-definition |
| [316](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L316) | object-field | WRN | module-definition |
| [317](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L317) | object-field | WRN | module-definition |
| [318](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L318) | object-field | ERR | module-definition |
| [324](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L324) | object-field | LOG | — |
| [383](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L383) | object-field | Overview | — |
| [384](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L384) | object-field | Logs | — |
| [433](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L433) | jsx-attribute | Target | — |
| [434](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L434) | jsx-attribute | Run ID | — |
| [435](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L435) | jsx-attribute | Started | — |
| [436](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L436) | jsx-attribute | Finished | — |
| [437](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L437) | jsx-attribute | Duration | — |
| [440](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L440) | jsx-attribute | Progress | — |
| [451](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L451) | jsx-attribute | Background action progress | — |
| [455](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L455) | jsx-text | of | mixed-jsx |
| [455](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L455) | jsx-text | items | mixed-jsx |
| [465](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L465) | jsx-text | Error | — |
| [481](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L481) | jsx-text | Key events | — |
| [507](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L507) | jsx-text | No logs recorded. | — |
| [518](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L518) | jsx-expression | entry | mixed-jsx |
| [518](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L518) | jsx-expression | entries | mixed-jsx |
| [584](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L584) | jsx-attribute | Actions menu | — |
| [616](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L616) | jsx-attribute | Cancel {{expression1}} | interpolation, mixed-jsx |
| [616](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L616) | jsx-attribute | Run {{expression1}} | interpolation, mixed-jsx |
| [668](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L668) | jsx-text | Results | — |
| [674](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L674) | jsx-attribute | View {{expression1}} details | interpolation |

### packages/shell/src/PluginContext/PluginManager.tsx

- [ ] Review [source](../../../../packages/shell/src/PluginContext/PluginManager.tsx) and classify its 29 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [47](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L47) | object-field | Open plugin | — |
| [163](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L163) | message-call | Global plugin settings are not available in this host. | user-or-developer-message-review |
| [196](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L196) | message-call | Cannot enable {{expression1}}: {{expression2}}. | interpolation, user-or-developer-message-review |
| [225](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L225) | jsx-text | Plugins | — |
| [232](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L232) | jsx-expression | Compatible only | mixed-jsx |
| [232](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L232) | jsx-expression | Show all | mixed-jsx |
| [237](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L237) | jsx-attribute | Search plugins | — |
| [240](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L240) | jsx-attribute | Search plugins… | — |
| [292](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L292) | jsx-text | Verified | mixed-jsx |
| [304](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L304) | jsx-attribute | Configure plugin | mixed-jsx |
| [305](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L305) | jsx-attribute | Configure {{expression1}} | interpolation, mixed-jsx |
| [315](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L315) | jsx-attribute | Open {{expression1}} | interpolation, mixed-jsx |
| [316](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L316) | jsx-attribute | Open {{expression1}} | interpolation, mixed-jsx |
| [330](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L330) | jsx-attribute | Disable plugin | mixed-jsx |
| [330](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L330) | jsx-attribute | Enable plugin | mixed-jsx |
| [331](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L331) | jsx-attribute | {{expression1}} {{expression2}} | interpolation, mixed-jsx |
| [346](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L346) | jsx-text | Loading plugin… | — |
| [348](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L348) | jsx-text | Waiting for required dependencies | — |
| [359](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L359) | jsx-text | No plugins found. | — |
| [366](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L366) | jsx-attribute | Configure {{expression1}} | interpolation, mixed-jsx |
| [451](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L451) | jsx-text | Scope: | — |
| [458](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L458) | jsx-text | This workspace | — |
| [467](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L467) | jsx-text | All workspaces | — |
| [496](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L496) | jsx-text | This plugin has no configurable settings. | — |
| [509](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L509) | jsx-text | Reset to defaults | — |
| [513](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L513) | jsx-text | ✓ Saved | — |
| [520](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L520) | jsx-expression | Saving… | mixed-jsx |
| [520](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L520) | jsx-expression | Save {{expression1}} | interpolation, mixed-jsx |
| [604](../../../../packages/shell/src/PluginContext/PluginManager.tsx#L604) | jsx-text | Default | — |

### packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts

- [ ] Review [source](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts) and classify its 25 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [385](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L385) | object-field | No {{expression1}} resources were found for {{expression2}}. | interpolation |
| [403](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L403) | object-field | {{expression1}} is present but is not allowed. | interpolation |
| [404](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L404) | object-field | {{expression1}} is not present. | interpolation |
| [417](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L417) | object-field | {{expression1}} has a value. | interpolation |
| [418](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L418) | object-field | {{expression1}} must be filled in. | interpolation |
| [432](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L432) | object-field | {{expression1}} matches the required value. | interpolation |
| [434](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L434) | object-field | {{expression1}} does not match the required value. | interpolation |
| [435](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L435) | object-field | {{expression1}} must use the required value. | interpolation |
| [461](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L461) | object-field | A canvas contains the required image service. | terminology |
| [463](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L463) | object-field | A canvas must contain one of the required image services: {{expression1}}. | interpolation, terminology |
| [464](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L464) | object-field | A canvas must contain a painting body with an image service. | terminology |
| [489](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L489) | object-field | No {{expression1}} resources were found for thumbnail checks. | interpolation |
| [531](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L531) | object-field | Thumbnail uses the same image service as the painting content. | — |
| [533](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L533) | object-field | No painting image service was found to compare against. | — |
| [535](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L535) | object-field | Thumbnail does not use the same image service as the painting content. | — |
| [536](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L536) | object-field | Thumbnail must be created from the painting image service. | — |
| [576](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L576) | object-field | Rights uses an allowed URI. | — |
| [578](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L578) | object-field | Rights must use an allowed URI. | — |
| [579](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L579) | object-field | Rights is not one of the allowed URIs. | — |
| [624](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L624) | object-field | Required statement is complete. | — |
| [626](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L626) | object-field | Required statement does not match the specification. | — |
| [627](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L627) | object-field | Required statement must be filled in. | — |
| [674](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L674) | object-field | {{expression1}} is present. | interpolation |
| [676](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L676) | object-field | {{expression1}} needs a value. | interpolation |
| [677](../../../../packages/shell/src/SpecificationContext/SpecificationContext.helpers.ts#L677) | object-field | {{expression1}} metadata must be added. | interpolation |

### packages/shell/src/ConfigContext/ConfigEditor.tsx

- [ ] Review [source](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx) and classify its 15 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [54](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L54) | jsx-attribute | Workspace configuration | — |
| [55](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L55) | jsx-text | Changes saved | — |
| [60](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L60) | jsx-text | Default Language | — |
| [70](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L70) | jsx-text | Available Languages | — |
| [86](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L86) | jsx-text | Advanced Language Mode | — |
| [96](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L96) | jsx-text | Enable text granularity | — |
| [106](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L106) | jsx-text | Remember Canvas ID | terminology |
| [116](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L116) | jsx-text | Remember Left panel | — |
| [126](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L126) | jsx-text | Manifest Grid Options | terminology |
| [136](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L136) | jsx-text | Export Presentation 2 | mixed-jsx |
| [136](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L136) | jsx-text | s | mixed-jsx |
| [151](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L151) | jsx-text | Default preview | — |
| [182](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L182) | jsx-expression | Return to Manifest Editor | mixed-jsx, terminology |
| [183](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L183) | jsx-expression | Go to Exhibition Editor | mixed-jsx |
| [190](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L190) | jsx-expression | Save changes | mixed-jsx |

### packages/shell/src/BaseCreator/BaseCreator.tsx

- [ ] Review [source](../../../../packages/shell/src/BaseCreator/BaseCreator.tsx) and classify its 13 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [109](../../../../packages/shell/src/BaseCreator/BaseCreator.tsx#L109) | message-call | Unknown error | user-or-developer-message-review |
| [133](../../../../packages/shell/src/BaseCreator/BaseCreator.tsx#L133) | jsx-text | Loading | — |
| [146](../../../../packages/shell/src/BaseCreator/BaseCreator.tsx#L146) | jsx-expression | Create | mixed-jsx |
| [154](../../../../packages/shell/src/BaseCreator/BaseCreator.tsx#L154) | jsx-text | No options available | — |
| [156](../../../../packages/shell/src/BaseCreator/BaseCreator.tsx#L156) | jsx-expression | Create | mixed-jsx |
| [170](../../../../packages/shell/src/BaseCreator/BaseCreator.tsx#L170) | jsx-attribute | Help for {{expression1}} | interpolation, mixed-jsx |
| [267](../../../../packages/shell/src/BaseCreator/BaseCreator.tsx#L267) | jsx-text | Not currently supported | — |
| [351](../../../../packages/shell/src/BaseCreator/BaseCreator.tsx#L351) | jsx-attribute | Back to Add content options | mixed-jsx |
| [422](../../../../packages/shell/src/BaseCreator/BaseCreator.tsx#L422) | jsx-text | Checking link | — |
| [424](../../../../packages/shell/src/BaseCreator/BaseCreator.tsx#L424) | jsx-text | Choose how to use this link | — |
| [454](../../../../packages/shell/src/BaseCreator/BaseCreator.tsx#L454) | jsx-expression | Show fewer options | mixed-jsx |
| [454](../../../../packages/shell/src/BaseCreator/BaseCreator.tsx#L454) | jsx-expression | Choose a content type instead | mixed-jsx |
| [490](../../../../packages/shell/src/BaseCreator/BaseCreator.tsx#L490) | message-call | Could not load link | user-or-developer-message-review |

### packages/shell/src/__tests__/plugins.test.ts

- [ ] Review [source](../../../../packages/shell/src/__tests__/plugins.test.ts) and classify its 11 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [32](../../../../packages/shell/src/__tests__/plugins.test.ts#L32) | object-field | Manifest Editor | terminology |
| [67](../../../../packages/shell/src/__tests__/plugins.test.ts#L67) | object-field | OCR | — |
| [93](../../../../packages/shell/src/__tests__/plugins.test.ts#L93) | object-field | Lazy | — |
| [143](../../../../packages/shell/src/__tests__/plugins.test.ts#L143) | object-field | Manifest only | terminology |
| [155](../../../../packages/shell/src/__tests__/plugins.test.ts#L155) | object-field | Collection only | terminology |
| [173](../../../../packages/shell/src/__tests__/plugins.test.ts#L173) | object-field | Dependent | — |
| [234](../../../../packages/shell/src/__tests__/plugins.test.ts#L234) | object-field | Default | — |
| [270](../../../../packages/shell/src/__tests__/plugins.test.ts#L270) | object-field | Dependent | — |
| [292](../../../../packages/shell/src/__tests__/plugins.test.ts#L292) | object-field | Lazy | — |
| [316](../../../../packages/shell/src/__tests__/plugins.test.ts#L316) | object-field | Lazy | — |
| [330](../../../../packages/shell/src/__tests__/plugins.test.ts#L330) | object-field | Lazy refreshed | — |

### packages/shell/src/Notebook/notebook.test.ts

- [ ] Review [source](../../../../packages/shell/src/Notebook/notebook.test.ts) and classify its 10 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [18](../../../../packages/shell/src/Notebook/notebook.test.ts#L18) | object-field | Workshop | — |
| [28](../../../../packages/shell/src/Notebook/notebook.test.ts#L28) | object-field | My edited workshop | — |
| [40](../../../../packages/shell/src/Notebook/notebook.test.ts#L40) | object-field | An image | — |
| [65](../../../../packages/shell/src/Notebook/notebook.test.ts#L65) | object-field | Crop | — |
| [74](../../../../packages/shell/src/Notebook/notebook.test.ts#L74) | object-field | Image | — |
| [83](../../../../packages/shell/src/Notebook/notebook.test.ts#L83) | object-field | Custom tutorial | — |
| [86](../../../../packages/shell/src/Notebook/notebook.test.ts#L86) | object-field | Tutorial | — |
| [101](../../../../packages/shell/src/Notebook/notebook.test.ts#L101) | object-field | Renamed manifest | terminology |
| [108](../../../../packages/shell/src/Notebook/notebook.test.ts#L108) | object-field | Workshop | — |
| [129](../../../../packages/shell/src/Notebook/notebook.test.ts#L129) | object-field | Tutorial | — |

### packages/shell/src/__tests__/preset-onboarding.test.ts

- [ ] Review [source](../../../../packages/shell/src/__tests__/preset-onboarding.test.ts) and classify its 9 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [26](../../../../packages/shell/src/__tests__/preset-onboarding.test.ts#L26) | object-field | Manifest Editor | terminology |
| [42](../../../../packages/shell/src/__tests__/preset-onboarding.test.ts#L42) | object-field | Example | — |
| [56](../../../../packages/shell/src/__tests__/preset-onboarding.test.ts#L56) | object-field | Example | — |
| [76](../../../../packages/shell/src/__tests__/preset-onboarding.test.ts#L76) | object-field | Extended | — |
| [93](../../../../packages/shell/src/__tests__/preset-onboarding.test.ts#L93) | object-field | Extended | — |
| [112](../../../../packages/shell/src/__tests__/preset-onboarding.test.ts#L112) | object-field | Extended | — |
| [125](../../../../packages/shell/src/__tests__/preset-onboarding.test.ts#L125) | object-field | Preview | — |
| [129](../../../../packages/shell/src/__tests__/preset-onboarding.test.ts#L129) | object-field | Extended | — |
| [133](../../../../packages/shell/src/__tests__/preset-onboarding.test.ts#L133) | object-field | Host action | — |

### packages/shell/src/BackgroundTasks/BackgroundTasksStore.ts

- [ ] Review [source](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.ts) and classify its 9 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [177](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.ts#L177) | object-field | Background action failed | — |
| [867](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.ts#L867) | message-call | pending | user-or-developer-message-review |
| [869](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.ts#L869) | message-call | queued | user-or-developer-message-review |
| [931](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.ts#L931) | message-call | Background action cancelled. | user-or-developer-message-review |
| [938](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.ts#L938) | message-call | Background action cancelled. | user-or-developer-message-review |
| [951](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.ts#L951) | message-call | pending | user-or-developer-message-review |
| [981](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.ts#L981) | message-call | Background action cancelled. | user-or-developer-message-review |
| [999](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.ts#L999) | message-call | done | user-or-developer-message-review |
| [1956](../../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore.ts#L1956) | message-call | useBackgroundActionsStore must be used within a BackgroundActionsProvider | user-or-developer-message-review |

### packages/shell/src/ExportPanel/ExportPanel.tsx

- [ ] Review [source](../../../../packages/shell/src/ExportPanel/ExportPanel.tsx) and classify its 9 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [31](../../../../packages/shell/src/ExportPanel/ExportPanel.tsx#L31) | jsx-attribute | Export manifest | mixed-jsx, terminology |
| [36](../../../../packages/shell/src/ExportPanel/ExportPanel.tsx#L36) | object-field | Presentation 3 | — |
| [37](../../../../packages/shell/src/ExportPanel/ExportPanel.tsx#L37) | object-field | Download this version by clicking the "Download" button. | — |
| [53](../../../../packages/shell/src/ExportPanel/ExportPanel.tsx#L53) | jsx-text | Copy to clipboard | — |
| [54](../../../../packages/shell/src/ExportPanel/ExportPanel.tsx#L54) | jsx-text | Download | — |
| [60](../../../../packages/shell/src/ExportPanel/ExportPanel.tsx#L60) | object-field | Presentation 2 | — |
| [61](../../../../packages/shell/src/ExportPanel/ExportPanel.tsx#L61) | object-field | Download this version by clicking the "Download" button. | — |
| [75](../../../../packages/shell/src/ExportPanel/ExportPanel.tsx#L75) | jsx-text | Copy to clipboard | — |
| [76](../../../../packages/shell/src/ExportPanel/ExportPanel.tsx#L76) | jsx-text | Download | — |

### packages/shell/src/Layout/components/HandleControls.tsx

- [ ] Review [source](../../../../packages/shell/src/Layout/components/HandleControls.tsx) and classify its 9 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [144](../../../../packages/shell/src/Layout/components/HandleControls.tsx#L144) | jsx-attribute | Open {{expression1}} panel | interpolation, mixed-jsx |
| [151](../../../../packages/shell/src/Layout/components/HandleControls.tsx#L151) | jsx-text | Open | — |
| [161](../../../../packages/shell/src/Layout/components/HandleControls.tsx#L161) | jsx-attribute | Close {{expression1}} panel | interpolation, mixed-jsx |
| [173](../../../../packages/shell/src/Layout/components/HandleControls.tsx#L173) | jsx-text | Close | — |
| [178](../../../../packages/shell/src/Layout/components/HandleControls.tsx#L178) | jsx-attribute | Reset {{expression1}} panel size | interpolation, mixed-jsx |
| [190](../../../../packages/shell/src/Layout/components/HandleControls.tsx#L190) | jsx-text | Reset | — |
| [204](../../../../packages/shell/src/Layout/components/HandleControls.tsx#L204) | jsx-attribute | Resize panel | — |
| [207](../../../../packages/shell/src/Layout/components/HandleControls.tsx#L207) | jsx-text | Resize panel | — |
| [213](../../../../packages/shell/src/Layout/components/HandleControls.tsx#L213) | jsx-text | Resize panel | — |

### packages/shell/src/ConfigContext/IIIFOptions.tsx

- [ ] Review [source](../../../../packages/shell/src/ConfigContext/IIIFOptions.tsx) and classify its 8 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [27](../../../../packages/shell/src/ConfigContext/IIIFOptions.tsx#L27) | jsx-text | IIIF Options | — |
| [29](../../../../packages/shell/src/ConfigContext/IIIFOptions.tsx#L29) | jsx-text | Image services | — |
| [31](../../../../packages/shell/src/ConfigContext/IIIFOptions.tsx#L31) | jsx-text | Compact services | — |
| [38](../../../../packages/shell/src/ConfigContext/IIIFOptions.tsx#L38) | jsx-text | id, type, profile, width, height (default) | — |
| [39](../../../../packages/shell/src/ConfigContext/IIIFOptions.tsx#L39) | jsx-text | id, type, profile (compact) | — |
| [49](../../../../packages/shell/src/ConfigContext/IIIFOptions.tsx#L49) | jsx-text | Include sizes | — |
| [58](../../../../packages/shell/src/ConfigContext/IIIFOptions.tsx#L58) | jsx-text | Include tiles | — |
| [60](../../../../packages/shell/src/ConfigContext/IIIFOptions.tsx#L60) | jsx-text | Applies to newly added images. Thumbnails always include available sizes and tiles. | — |

### packages/shell/src/Notebook/ProjectNotebook.tsx

- [ ] Review [source](../../../../packages/shell/src/Notebook/ProjectNotebook.tsx) and classify its 8 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [90](../../../../packages/shell/src/Notebook/ProjectNotebook.tsx#L90) | jsx-attribute | Notebook: notes and saved links for this project | mixed-jsx |
| [91](../../../../packages/shell/src/Notebook/ProjectNotebook.tsx#L91) | jsx-attribute | Project notebook | mixed-jsx |
| [155](../../../../packages/shell/src/Notebook/ProjectNotebook.tsx#L155) | jsx-text | Notes and saved links for this project | — |
| [198](../../../../packages/shell/src/Notebook/ProjectNotebook.tsx#L198) | jsx-attribute | Saved in your notebook | mixed-jsx |
| [199](../../../../packages/shell/src/Notebook/ProjectNotebook.tsx#L199) | jsx-text | Saved in your notebook | — |
| [210](../../../../packages/shell/src/Notebook/ProjectNotebook.tsx#L210) | jsx-text | View all | mixed-jsx |
| [211](../../../../packages/shell/src/Notebook/ProjectNotebook.tsx#L211) | jsx-text | saved resources in IIIF Browser | mixed-jsx |
| [234](../../../../packages/shell/src/Notebook/ProjectNotebook.tsx#L234) | jsx-expression | · {{expression1}} | interpolation, mixed-jsx |

### packages/shell/src/ManifestPaginationNavigation.tsx

- [ ] Review [source](../../../../packages/shell/src/ManifestPaginationNavigation.tsx) and classify its 6 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [81](../../../../packages/shell/src/ManifestPaginationNavigation.tsx#L81) | jsx-attribute | Manifest pagination | mixed-jsx, terminology |
| [91](../../../../packages/shell/src/ManifestPaginationNavigation.tsx#L91) | jsx-attribute | Previous canvas | mixed-jsx, terminology |
| [101](../../../../packages/shell/src/ManifestPaginationNavigation.tsx#L101) | jsx-attribute | Page {{expression1}} of {{expression2}} | interpolation, mixed-jsx |
| [117](../../../../packages/shell/src/ManifestPaginationNavigation.tsx#L117) | jsx-attribute | Jump to canvas | mixed-jsx, terminology |
| [123](../../../../packages/shell/src/ManifestPaginationNavigation.tsx#L123) | jsx-text | Page | mixed-jsx |
| [131](../../../../packages/shell/src/ManifestPaginationNavigation.tsx#L131) | jsx-attribute | Next canvas | mixed-jsx, terminology |

### packages/shell/src/__tests__/specifications.test.ts

- [ ] Review [source](../../../../packages/shell/src/__tests__/specifications.test.ts) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [94](../../../../packages/shell/src/__tests__/specifications.test.ts#L94) | object-field | Example specification | module-definition |
| [100](../../../../packages/shell/src/__tests__/specifications.test.ts#L100) | object-field | Title | module-definition |
| [148](../../../../packages/shell/src/__tests__/specifications.test.ts#L148) | object-field | Attribution | module-definition |
| [156](../../../../packages/shell/src/__tests__/specifications.test.ts#L156) | object-field | Creator | module-definition |
| [160](../../../../packages/shell/src/__tests__/specifications.test.ts#L160) | object-field | Date | module-definition |

### packages/shell/src/BackgroundTasks/BackgroundActionToasts.helpers.ts

- [ ] Review [source](../../../../packages/shell/src/BackgroundTasks/BackgroundActionToasts.helpers.ts) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [22](../../../../packages/shell/src/BackgroundTasks/BackgroundActionToasts.helpers.ts#L22) | object-field | {{expression1}} complete | interpolation |
| [23](../../../../packages/shell/src/BackgroundTasks/BackgroundActionToasts.helpers.ts#L23) | object-field | Results are ready. | — |
| [27](../../../../packages/shell/src/BackgroundTasks/BackgroundActionToasts.helpers.ts#L27) | object-field | Results | — |
| [37](../../../../packages/shell/src/BackgroundTasks/BackgroundActionToasts.helpers.ts#L37) | object-field | {{expression1}} failed | interpolation |
| [38](../../../../packages/shell/src/BackgroundTasks/BackgroundActionToasts.helpers.ts#L38) | object-field | Action failed | — |

### packages/shell/src/BaseCreator/CreatorResourceInput.tsx

- [ ] Review [source](../../../../packages/shell/src/BaseCreator/CreatorResourceInput.tsx) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [78](../../../../packages/shell/src/BaseCreator/CreatorResourceInput.tsx#L78) | jsx-text | Paste a link | — |
| [113](../../../../packages/shell/src/BaseCreator/CreatorResourceInput.tsx#L113) | jsx-attribute | Open IIIF Browser | mixed-jsx |
| [114](../../../../packages/shell/src/BaseCreator/CreatorResourceInput.tsx#L114) | jsx-attribute | Open IIIF Browser | mixed-jsx |
| [128](../../../../packages/shell/src/BaseCreator/CreatorResourceInput.tsx#L128) | jsx-expression | Checking… | mixed-jsx |
| [128](../../../../packages/shell/src/BaseCreator/CreatorResourceInput.tsx#L128) | jsx-expression | Use link | mixed-jsx |

### packages/shell/src/Layout/components/ModularPanel.tsx

- [ ] Review [source](../../../../packages/shell/src/Layout/components/ModularPanel.tsx) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [253](../../../../packages/shell/src/Layout/components/ModularPanel.tsx#L253) | jsx-attribute | Back | mixed-jsx |
| [259](../../../../packages/shell/src/Layout/components/ModularPanel.tsx#L259) | jsx-attribute | Close panel | mixed-jsx |
| [279](../../../../packages/shell/src/Layout/components/ModularPanel.tsx#L279) | jsx-text | All panels | — |
| [304](../../../../packages/shell/src/Layout/components/ModularPanel.tsx#L304) | jsx-attribute | Unpin panel | mixed-jsx |
| [309](../../../../packages/shell/src/Layout/components/ModularPanel.tsx#L309) | jsx-attribute | Pin panel | mixed-jsx |

### packages/shell/src/__tests__/tags.test.ts

- [ ] Review [source](../../../../packages/shell/src/__tests__/tags.test.ts) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [26](../../../../packages/shell/src/__tests__/tags.test.ts#L26) | object-field | Review | module-definition |
| [34](../../../../packages/shell/src/__tests__/tags.test.ts#L34) | object-field | Approved | module-definition |
| [42](../../../../packages/shell/src/__tests__/tags.test.ts#L42) | object-field | Handwritten | module-definition |
| [50](../../../../packages/shell/src/__tests__/tags.test.ts#L50) | object-field | Printed | module-definition |

### packages/shell/src/BackgroundTasks/BackgroundActionToasts.helpers.test.ts

- [ ] Review [source](../../../../packages/shell/src/BackgroundTasks/BackgroundActionToasts.helpers.test.ts) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [7](../../../../packages/shell/src/BackgroundTasks/BackgroundActionToasts.helpers.test.ts#L7) | object-field | Test action | module-definition |
| [18](../../../../packages/shell/src/BackgroundTasks/BackgroundActionToasts.helpers.test.ts#L18) | object-field | Manifest | terminology |
| [21](../../../../packages/shell/src/BackgroundTasks/BackgroundActionToasts.helpers.test.ts#L21) | object-field | Test action | — |
| [63](../../../../packages/shell/src/BackgroundTasks/BackgroundActionToasts.helpers.test.ts#L63) | object-field | Remote service failed | — |

### packages/shell/src/Layout/Layout.focused.tsx

- [ ] Review [source](../../../../packages/shell/src/Layout/Layout.focused.tsx) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [309](../../../../packages/shell/src/Layout/Layout.focused.tsx#L309) | jsx-attribute | {{expression1}} panels | interpolation, mixed-jsx |
| [344](../../../../packages/shell/src/Layout/Layout.focused.tsx#L344) | jsx-attribute | Main and left panels | mixed-jsx |
| [346](../../../../packages/shell/src/Layout/Layout.focused.tsx#L346) | jsx-attribute | Main panels | mixed-jsx |
| [373](../../../../packages/shell/src/Layout/Layout.focused.tsx#L373) | jsx-attribute | Left panels | mixed-jsx |

### packages/shell/src/PreviewButton/PreviewButton.tsx

- [ ] Review [source](../../../../packages/shell/src/PreviewButton/PreviewButton.tsx) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [44](../../../../packages/shell/src/PreviewButton/PreviewButton.tsx#L44) | jsx-text | Preview not available | — |
| [53](../../../../packages/shell/src/PreviewButton/PreviewButton.tsx#L53) | jsx-attribute | Download manifest | terminology |
| [88](../../../../packages/shell/src/PreviewButton/PreviewButton.tsx#L88) | jsx-expression | Preview | mixed-jsx |
| [91](../../../../packages/shell/src/PreviewButton/PreviewButton.tsx#L91) | jsx-attribute | Choose preview | mixed-jsx |

### packages/shell/src/ShellContext/ShellContext.tsx

- [ ] Review [source](../../../../packages/shell/src/ShellContext/ShellContext.tsx) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [31](../../../../packages/shell/src/ShellContext/ShellContext.tsx#L31) | object-field | Universal viewer | module-definition |
| [36](../../../../packages/shell/src/ShellContext/ShellContext.tsx#L36) | object-field | Mirador 3 | module-definition |
| [44](../../../../packages/shell/src/ShellContext/ShellContext.tsx#L44) | object-field | Annona | module-definition |
| [53](../../../../packages/shell/src/ShellContext/ShellContext.tsx#L53) | object-field | IIIF Preview | module-definition |

### packages/shell/src/CanvasProgress.tsx

- [ ] Review [source](../../../../packages/shell/src/CanvasProgress.tsx) and classify its 3 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [216](../../../../packages/shell/src/CanvasProgress.tsx#L216) | object-field | Queued | module-definition |
| [222](../../../../packages/shell/src/CanvasProgress.tsx#L222) | object-field | In progress | module-definition |
| [227](../../../../packages/shell/src/CanvasProgress.tsx#L227) | object-field | Done | module-definition |

### packages/shell/src/PresetOnboarding/PresetOnboarding.tsx

- [ ] Review [source](../../../../packages/shell/src/PresetOnboarding/PresetOnboarding.tsx) and classify its 3 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [54](../../../../packages/shell/src/PresetOnboarding/PresetOnboarding.tsx#L54) | jsx-expression | Open guide | mixed-jsx |
| [170](../../../../packages/shell/src/PresetOnboarding/PresetOnboarding.tsx#L170) | jsx-expression | Dismiss | mixed-jsx |
| [173](../../../../packages/shell/src/PresetOnboarding/PresetOnboarding.tsx#L173) | jsx-expression | Continue | mixed-jsx |

### packages/shell/src/__tests__/preview-button.test.ts

- [ ] Review [source](../../../../packages/shell/src/__tests__/preview-button.test.ts) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [10](../../../../packages/shell/src/__tests__/preview-button.test.ts#L10) | object-field | Preview | — |
| [28](../../../../packages/shell/src/__tests__/preview-button.test.ts#L28) | object-field | Host action | — |

### packages/shell/src/BaseCreator/BaseAnnotationCreator.tsx

- [ ] Review [source](../../../../packages/shell/src/BaseCreator/BaseAnnotationCreator.tsx) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [32](../../../../packages/shell/src/BaseCreator/BaseAnnotationCreator.tsx#L32) | jsx-text | No supported creators found | — |
| [39](../../../../packages/shell/src/BaseCreator/BaseAnnotationCreator.tsx#L39) | jsx-attribute | Annotation type | mixed-jsx |

### packages/shell/src/BaseCreator/creator-completion.test.ts

- [ ] Review [source](../../../../packages/shell/src/BaseCreator/creator-completion.test.ts) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [71](../../../../packages/shell/src/BaseCreator/creator-completion.test.ts#L71) | message-call | Creation failed | user-or-developer-message-review |
| [85](../../../../packages/shell/src/BaseCreator/creator-completion.test.ts#L85) | object-field | Empty canvas | terminology |

### packages/shell/src/BaseEditor/BaseEditor.tsx

- [ ] Review [source](../../../../packages/shell/src/BaseEditor/BaseEditor.tsx) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [22](../../../../packages/shell/src/BaseEditor/BaseEditor.tsx#L22) | jsx-attribute | Back | mixed-jsx |
| [38](../../../../packages/shell/src/BaseEditor/BaseEditor.tsx#L38) | jsx-attribute | Close panel | mixed-jsx |

### packages/shell/src/Layout/Layout.tsx

- [ ] Review [source](../../../../packages/shell/src/Layout/Layout.tsx) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [492](../../../../packages/shell/src/Layout/Layout.tsx#L492) | jsx-attribute | Left panel tabs | mixed-jsx |
| [518](../../../../packages/shell/src/Layout/Layout.tsx#L518) | jsx-attribute | Close panels | — |

### packages/shell/src/__tests__/canvas-progress.test.ts

- [ ] Review [source](../../../../packages/shell/src/__tests__/canvas-progress.test.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [53](../../../../packages/shell/src/__tests__/canvas-progress.test.ts#L53) | message-call | done | user-or-developer-message-review |

### packages/shell/src/BaseCreator/index.tsx

- [ ] Review [source](../../../../packages/shell/src/BaseCreator/index.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [7](../../../../packages/shell/src/BaseCreator/index.tsx#L7) | object-field | Add content | module-definition |

### packages/shell/src/BaseEditor/index.tsx

- [ ] Review [source](../../../../packages/shell/src/BaseEditor/index.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [10](../../../../packages/shell/src/BaseEditor/index.tsx#L10) | object-field | Editor | module-definition |

### packages/shell/src/ConfigContext/CreatorSettings.test.ts

- [ ] Review [source](../../../../packages/shell/src/ConfigContext/CreatorSettings.test.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [16](../../../../packages/shell/src/ConfigContext/CreatorSettings.test.ts#L16) | object-field | Enabled | module-definition |

### packages/shell/src/ConfigContext/CreatorSettings.tsx

- [ ] Review [source](../../../../packages/shell/src/ConfigContext/CreatorSettings.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [39](../../../../packages/shell/src/ConfigContext/CreatorSettings.tsx#L39) | jsx-text | No creator settings available | — |

### packages/shell/src/ContextMenu/ContextMenuContext.tsx

- [ ] Review [source](../../../../packages/shell/src/ContextMenu/ContextMenuContext.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [150](../../../../packages/shell/src/ContextMenu/ContextMenuContext.tsx#L150) | message-call | useContextMenuStore must be used within a ContextMenuProvider | user-or-developer-message-review |

### packages/shell/src/Layout/components/PanelError.tsx

- [ ] Review [source](../../../../packages/shell/src/Layout/components/PanelError.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [62](../../../../packages/shell/src/Layout/components/PanelError.tsx#L62) | jsx-text | Try again | — |

### packages/shell/src/Layout/Layout.supports.test.ts

- [ ] Review [source](../../../../packages/shell/src/Layout/Layout.supports.test.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [36](../../../../packages/shell/src/Layout/Layout.supports.test.ts#L36) | message-call | Nope | user-or-developer-message-review |

### packages/shell/src/PluginContext/PluginContext.tsx

- [ ] Review [source](../../../../packages/shell/src/PluginContext/PluginContext.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [98](../../../../packages/shell/src/PluginContext/PluginContext.tsx#L98) | message-call | usePluginStoreApi must be used within &lt;PluginProvider /&gt; | user-or-developer-message-review |

### packages/shell/src/Tags.tsx

- [ ] Review [source](../../../../packages/shell/src/Tags.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [47](../../../../packages/shell/src/Tags.tsx#L47) | object-field | Flag | module-definition |

### packages/shell/src/Toast/ToastContext.tsx

- [ ] Review [source](../../../../packages/shell/src/Toast/ToastContext.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [71](../../../../packages/shell/src/Toast/ToastContext.tsx#L71) | message-call | useToasts must be used within a ToastProvider | user-or-developer-message-review |

## Formatting and content-language review points

| Source | Review kind | Code |
| --- | --- | --- |
| [packages/shell/src/BackgroundTasks/BackgroundActions.tsx:261](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L261) | formatting-review | new Date(value).toLocaleString() |
| [packages/shell/src/BackgroundTasks/BackgroundActions.tsx:266](../../../../packages/shell/src/BackgroundTasks/BackgroundActions.tsx#L266) | formatting-review | new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }) |
| [packages/shell/src/ConfigContext/ConfigContext.tsx:120](../../../../packages/shell/src/ConfigContext/ConfigContext.tsx#L120) | content-language-config | advancedLanguageMode: false |
| [packages/shell/src/ConfigContext/ConfigContext.tsx:121](../../../../packages/shell/src/ConfigContext/ConfigContext.tsx#L121) | content-language-config | availableLanguages: ["en", "cy", "nl", "fr"] |
| [packages/shell/src/ConfigContext/ConfigContext.tsx:122](../../../../packages/shell/src/ConfigContext/ConfigContext.tsx#L122) | content-language-config | defaultLanguage: "en" |
| [packages/shell/src/ConfigContext/ConfigEditor.tsx:24](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L24) | content-language-config | advancedLanguageMode: formValues.get("advancedLanguageMode") === "on" |
| [packages/shell/src/ConfigContext/ConfigEditor.tsx:25](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L25) | content-language-config | availableLanguages: ((formValues.get("availableLanguages") as string) \|\| "") .split(",") .map((t: string) =&gt; t.trim()) |
| [packages/shell/src/ConfigContext/ConfigEditor.tsx:28](../../../../packages/shell/src/ConfigContext/ConfigEditor.tsx#L28) | content-language-config | defaultLanguage: formValues.get("defaultLanguage") as string |
