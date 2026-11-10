# Storybook localisation coverage source inventory

Module: `packages/storybook`. Revision: `66de064a5d217b7847db924db925b092b36a0eed`. [Implementation task](../modules/22-storybook.md).

Default application-source scan: **0 occurrences** in **0 files** (0 files scanned). Expanded JS/TS scan including tests/stories/tutorials/examples: **320 occurrences**.

These are syntactic candidates, not final message IDs or verified active UI. Scans use git's tracked/unignored files and exclude generated, public and vendor assets. Supporting-source strings are usually fixtures or assertions, not catalog entries. Markdown/MDX/JSON/CSS and third-party UI are not included. Review authored defaults and developer errors before extraction. Mixed JSX may be fragments of one whole message. Text below is shortened to 180 characters; follow the source link for the original.

## Default application source files

| File | Candidate occurrences |
| --- | ---: |

## Expanded review list

### packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx) and classify its 36 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [28](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L28) | object-field | Editors/Specialized panels | module-definition |
| [31](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L31) | object-field | Image resource | module-definition |
| [33](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L33) | object-field | Edit the original image body from the Cookbook's simplest Manifest. Width, height and format changes serialize back to this image resource. | module-definition, terminology |
| [59](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L59) | object-field | Adds the production Canvas viewer, including annotation drawing tools. | module-definition, terminology |
| [94](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L94) | object-field | Image resource with a IIIF service | module-definition |
| [96](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L96) | object-field | The image editor uses the real Cookbook image-service body and thumbnail. Image dimensions and format remain editable; the source service is preserved in the JSON. | module-definition |
| [103](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L103) | object-field | Image painting annotation | module-definition |
| [105](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L105) | object-field | The Media editor operates on the painting annotation, its image body, image-service information and target. Edit the body format or dimensions and inspect the complete annotation J | module-definition |
| [114](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L114) | object-field | Audio painting annotation | module-definition |
| [116](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L116) | object-field | Edit the Cookbook audio annotation and Sound body: descriptive fields, duration, format and target. The source media stays remote. | module-definition |
| [125](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L125) | object-field | Video painting annotation | module-definition |
| [127](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L127) | object-field | Edit the Cookbook Video body's dimensions, duration and format inside its real painting annotation. Expand Target to inspect canvas placement. | module-definition, terminology |
| [136](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L136) | object-field | Choice of image bodies | module-definition |
| [138](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L138) | object-field | The original Cookbook Choice offers natural-light and x-ray images. Edit option labels, reorder options, add media or unwrap the choice into individual painting annotations. | module-definition |
| [147](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L147) | object-field | HTML annotation body | module-definition |
| [149](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L149) | object-field | Edit the original German HTML comment from the Cookbook. The production rich-text editor writes the TextualBody's value and language into the annotation JSON. | module-definition |
| [158](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L158) | object-field | Canvas detail with multiple images | module-definition, terminology |
| [160](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L160) | object-field | The Cookbook composition has two painting annotations on one Canvas. The Detail editor shows its label and painting layers; select a layer to navigate the real editing stack. | module-definition, terminology |
| [169](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L169) | object-field | Top-level range structure | module-definition, terminology |
| [171](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L171) | object-field | Explore the Cookbook book's actual table of contents. Reorder child ranges, select one to edit, or add a range with the real creator. JSON shows the selected range. | module-definition, terminology |
| [180](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L180) | object-field | Nested range with Canvas references | module-definition, terminology |
| [182](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L182) | object-field | This real chapter range contains two Canvas references instead of further ranges. Edit its members while the parent Manifest remains available for reference creation. | module-definition, terminology |
| [191](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L191) | object-field | Inline annotation page | module-definition |
| [193](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L193) | object-field | The Cookbook's embedded comment page opens the Annotations editor. Its original Canvas is shown above the panel, so Create annotation can request a box in the real Atlas viewer. | module-definition, terminology |
| [203](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L203) | object-field | Part-of collection reference | module-definition, terminology |
| [205](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L205) | object-field | Augmentation: the Cookbook volume omits its inverse collection link. This story reads its real Collection and adds only that partOf reference in memory. The app enables Collection | module-definition, terminology |
| [215](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L215) | object-field | Manifest structure with ranges | module-definition, terminology |
| [217](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L217) | object-field | The production Structure panel lists the real book's Canvases and table of contents. Reorder, remove or add resources through the normal creator and editing stack. | module-definition, terminology |
| [226](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L226) | object-field | Canvas painting and annotation structure | module-definition, terminology |
| [228](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L228) | object-field | The real HTML-annotation Canvas has a painting page and a separate comment page. Inspect painting resources, captions and annotation pages, with live Canvas JSON. | module-definition, terminology |
| [237](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L237) | object-field | NavPlace with a real location | module-definition |
| [239](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L239) | object-field | The Cookbook geographic example provides the Laocoön Bronze's original GeoJSON point. Use the production map drawing and edit tools; geometry changes appear in navPlace. Map tiles | module-definition |
| [248](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L248) | object-field | Add geographic context | module-definition |
| [250](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L250) | object-field | The simplest image Manifest has no navPlace. Draw a marker, polygon, rectangle or circle to create GeoJSON with the production map editor, then inspect the live Manifest JSON. | module-definition, terminology |
| [258](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L258) | object-field | Fallback annotation target | module-definition |
| [260](../../../../packages/storybook/src/stories/editors/SpecializedEditors.stories.tsx#L260) | object-field | This story explicitly opts the production fallback editor into the preset because allEditors normally omits it. The Cookbook's plain-text comment targets the whole Canvas; Change c | module-definition, terminology |

### packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx) and classify its 27 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [43](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L43) | object-field | Creators/More creators | module-definition |
| [53](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L53) | object-field | IIIF image service painting annotation | module-definition |
| [56](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L56) | object-field | Create a painting annotation with an embedded remote ImageService3 and a Canvas target. | module-definition, terminology |
| [64](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L64) | object-field | HTML annotation | module-definition |
| [67](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L67) | object-field | Create a commenting annotation with an HTML TextualBody using the real rich text form. | module-definition |
| [74](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L74) | object-field | Browse IIIF canvas | module-definition, terminology |
| [78](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L78) | object-field | Browse the remote Cookbook manifest and import a selected canvas as a painting annotation. The initial example uses the same browser output API. | module-definition, terminology |
| [94](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L94) | object-field | Empty annotation page | module-definition |
| [98](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L98) | object-field | Add an empty page to Canvas annotations. This definition has no built-in form, so a label control calls its real API. | module-definition, terminology |
| [105](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L105) | object-field | WebVTT caption page | module-definition |
| [108](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L108) | object-field | Link the Cookbook's real WebVTT file to a video Canvas as supplementing annotations. | module-definition, terminology |
| [120](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L120) | object-field | Annotation without a body | module-definition |
| [123](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L123) | object-field | Create a highlighting annotation with a target and motivation. This definition has no built-in form. | module-definition |
| [130](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L130) | object-field | Internal canvas link | module-definition, terminology |
| [134](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L134) | object-field | Choose an existing Canvas from this manifest as its start Canvas. Linking preserves the Canvas's painting resources and dimensions. | module-definition, terminology |
| [153](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L153) | object-field | Captioned image annotation | module-definition |
| [156](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L156) | object-field | Create a commenting annotation with a remote image and an HTML caption body. | module-definition |
| [168](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L168) | object-field | Image URL list | module-definition |
| [171](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L171) | object-field | Create two real remote Image resources from the multiline URL form. | module-definition |
| [179](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L179) | object-field | Image list painting annotations | module-definition |
| [182](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L182) | object-field | Create one painting annotation for each image URL and inspect the resulting array. | module-definition |
| [190](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L190) | object-field | Thumbnail from image service | module-definition |
| [193](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L193) | object-field | Create a 400-pixel thumbnail from the real Cookbook Image API service. | module-definition |
| [216](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L216) | object-field | Range with canvas items | module-definition, terminology |
| [219](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L219) | object-field | Create a nested Range containing a real Canvas reference from this manifest. | module-definition, terminology |
| [230](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L230) | object-field | Browse a manifest reference | module-definition, terminology |
| [234](../../../../packages/storybook/src/stories/creators/AdditionalCreators.stories.tsx#L234) | object-field | Browse remote manifests and create a reference in this manifest's partOf. The creator is registered locally for this story. | module-definition, terminology |

### packages/storybook/src/stories/creators/Creators.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx) and classify its 26 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [28](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L28) | object-field | Creators | module-definition |
| [38](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L38) | object-field | Plain text body | module-definition |
| [42](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L42) | object-field | Use the built-in text link form, then inspect its created Text resource. This creator attaches to seeAlso or rendering. | module-definition |
| [52](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L52) | message-call | Plain text URL input was not rendered | user-or-developer-message-review |
| [67](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L67) | object-field | Web page body | module-definition |
| [70](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L70) | object-field | Create an HTML link using the production multilingual label and URL form. | module-definition |
| [79](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L79) | object-field | Image URL body | module-definition |
| [83](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L83) | object-field | Create an Image body from the Cookbook fixture. Image dimensions and format are resolved from the remote resource. | module-definition |
| [91](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L91) | object-field | IIIF image service body | module-definition |
| [95](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L95) | object-field | Preview and create an image with an embedded IIIF Image API service using the production service form. The service must permit browser requests. | module-definition |
| [112](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L112) | object-field | HTML body | module-definition |
| [117](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L117) | object-field | Write rich text in the actual editor. Create serializes a TextualBody with language, HTML format and value. | module-definition |
| [123](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L123) | object-field | YouTube body | module-definition |
| [126](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L126) | object-field | Create the editor's YouTube Video resource and its service descriptions from a video link. | module-definition |
| [134](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L134) | object-field | Empty canvas | module-definition, terminology |
| [139](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L139) | object-field | This creator has no built-in form. These label and dimension fields call its real API and create a Canvas with an empty AnnotationPage. | module-definition, terminology |
| [145](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L145) | object-field | Provider / Agent | module-definition |
| [149](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L149) | object-field | Create an Agent with a multilingual label, optional logo and homepage using the production provider form. | module-definition |
| [161](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L161) | object-field | Image URL painting annotation | module-definition |
| [165](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L165) | object-field | Create a painting Annotation targeting the sandbox Canvas. The built-in creator also runs its canvas sizing side effects. | module-definition, terminology |
| [173](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L173) | object-field | Audio painting annotation | module-definition |
| [177](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L177) | object-field | Preview the Cookbook audio, edit its label and detected duration, then create a Sound painting annotation. Remote media loading can take a moment. | module-definition |
| [185](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L185) | object-field | Video painting annotation | module-definition |
| [189](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L189) | object-field | Preview the Cookbook video with the production player, then create a Video painting annotation using its dimensions and duration. | module-definition |
| [217](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L217) | object-field | Top-level range | module-definition, terminology |
| [221](../../../../packages/storybook/src/stories/creators/Creators.stories.tsx#L221) | object-field | Use the built-in multilingual label form to add a top-level Range to the sandbox manifest's structures. | module-definition, terminology |

### packages/storybook/src/stories/editors/Editors.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx) and classify its 20 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [10](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L10) | object-field | Editors/Resource panels | module-definition |
| [13](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L13) | object-field | Manifest descriptive properties | module-definition, terminology |
| [15](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L15) | object-field | Edit a real Cookbook Manifest using the production editor panel. Every change appears in the serialized JSON; Reset loads a fresh resource. | module-definition, terminology |
| [21](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L21) | object-field | Remote IIIF Presentation 3 resource URL. | module-definition |
| [44](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L44) | object-field | Multilingual labels and summaries | module-definition |
| [46](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L46) | object-field | The Cookbook language example keeps its original language maps. Add languages or values and inspect the resulting IIIF JSON. | module-definition |
| [60](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L60) | object-field | Metadata entries | module-definition |
| [62](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L62) | object-field | Add, edit, delete and reorder metadata on a real multipage Cookbook book. Labels and values retain their language maps. | module-definition |
| [70](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L70) | object-field | Rights and required statement | module-definition |
| [72](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L72) | object-field | Edit the rights URI and attribution on the loaded Manifest. Add a required statement if the source has none; these changes stay in this story. | module-definition, terminology |
| [92](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L92) | object-field | Technical properties and behavior | module-definition |
| [94](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L94) | object-field | Explore viewing direction and behavior on the multipage book. Switch the target control to canvas for dimensions and duration. | module-definition, terminology |
| [102](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L102) | object-field | Linking properties | module-definition |
| [104](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L104) | object-field | Inspect and edit seeAlso, rendering, homepage, partOf and start links. Add actions open the real creator dialog, and nested resources use the editor stack. | module-definition |
| [112](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L112) | object-field | Canvas descriptive properties | module-definition, terminology |
| [114](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L114) | object-field | Edit the first Canvas in the Cookbook book, with the parent Manifest context available. The JSON panel shows this Canvas rather than the whole book. | module-definition, terminology |
| [122](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L122) | object-field | Restricted property configuration | module-definition |
| [124](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L124) | object-field | The production Overview editor is configured to expose label, summary, rights and required statement. The original source properties remain in the live JSON. | module-definition |
| [140](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L140) | object-field | Single-tab editor configuration | module-definition |
| [142](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L142) | object-field | The real BaseEditor uses singleTab and onlyTabs to show descriptive properties without its normal tab strip. Change config in Controls to compare configurations. | module-definition |

### packages/storybook/src/stories/components/CreatorGrid.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx) and classify its 16 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [17](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L17) | object-field | Plain text | — |
| [17](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L17) | object-field | A textual annotation body | — |
| [18](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L18) | object-field | Image | — |
| [18](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L18) | object-field | A remotely hosted image | — |
| [19](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L19) | object-field | HTML | — |
| [19](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L19) | object-field | Rich textual content | — |
| [20](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L20) | object-field | Audio | — |
| [20](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L20) | object-field | A sound recording | — |
| [21](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L21) | object-field | Empty canvas | terminology |
| [21](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L21) | object-field | A new presentation surface | — |
| [25](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L25) | jsx-attribute | Creator building blocks | mixed-jsx |
| [26](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L26) | jsx-attribute | The real creator selection grid. Activate a card with the mouse or keyboard to choose a building block. | mixed-jsx |
| [35](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L35) | jsx-attribute | Choose a building block | — |
| [39](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L39) | jsx-expression | Selected: {{expression1}} | interpolation, mixed-jsx |
| [39](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L39) | jsx-expression | Choose a building block. | mixed-jsx |
| [44](../../../../packages/storybook/src/stories/components/CreatorGrid.stories.tsx#L44) | object-field | Components/Creator grid | module-definition |

### packages/storybook/src/stories/components/Notifications.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx) and classify its 15 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [20](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx#L20) | object-field | {{expression1}}{{expression2}} notification | interpolation |
| [21](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx#L21) | object-field | A production toast with its matching icon and color. | — |
| [26](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx#L26) | jsx-text | Show | mixed-jsx |
| [39](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx#L39) | object-field | Canvas removed from this example | terminology |
| [40](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx#L40) | object-field | Undo restores the local selection. | — |
| [41](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx#L41) | object-field | Undo removal | — |
| [46](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx#L46) | jsx-text | Remove example canvas | terminology |
| [49](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx#L49) | jsx-attribute | Local state | — |
| [58](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx#L58) | object-field | Queued notification {{expression1}} | interpolation |
| [59](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx#L59) | object-field | Only two notifications are visible at once. Dismiss one to show the next. | — |
| [64](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx#L64) | jsx-text | Queue five notifications | — |
| [82](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx#L82) | jsx-attribute | Notifications | mixed-jsx |
| [83](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx#L83) | jsx-attribute | The shell's actual ToastProvider and ToastRegion handle variants, actions, queueing and dismissal. Reset removes the queue and local state. | mixed-jsx |
| [93](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx#L93) | object-field | Components/Notifications | module-definition |
| [100](../../../../packages/storybook/src/stories/components/Notifications.stories.tsx#L100) | object-field | Milliseconds; zero leaves notifications open until dismissed. | module-definition |

### packages/storybook/src/stories/components/Navigation.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/components/Navigation.stories.tsx) and classify its 14 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [17](../../../../packages/storybook/src/stories/components/Navigation.stories.tsx#L17) | object-field | Description | module-definition |
| [17](../../../../packages/storybook/src/stories/components/Navigation.stories.tsx#L17) | object-field | Labels, summaries and descriptive metadata belong in this panel. | module-definition |
| [18](../../../../packages/storybook/src/stories/components/Navigation.stories.tsx#L18) | object-field | Technical | module-definition |
| [18](../../../../packages/storybook/src/stories/components/Navigation.stories.tsx#L18) | object-field | Dimensions, duration and behavior settings belong in this panel. | module-definition |
| [19](../../../../packages/storybook/src/stories/components/Navigation.stories.tsx#L19) | object-field | Linking | module-definition |
| [19](../../../../packages/storybook/src/stories/components/Navigation.stories.tsx#L19) | object-field | Related resources, homepages and services belong in this panel. | module-definition |
| [20](../../../../packages/storybook/src/stories/components/Navigation.stories.tsx#L20) | object-field | Structure | module-definition |
| [20](../../../../packages/storybook/src/stories/components/Navigation.stories.tsx#L20) | object-field | Canvases, ranges and annotation pages belong in this panel. | module-definition, terminology |
| [36](../../../../packages/storybook/src/stories/components/Navigation.stories.tsx#L36) | jsx-attribute | Navigation | mixed-jsx |
| [37](../../../../packages/storybook/src/stories/components/Navigation.stories.tsx#L37) | jsx-attribute | Select a panel using the editor's accessible navigation primitives. Tab lists also support arrow keys. | mixed-jsx |
| [63](../../../../packages/storybook/src/stories/components/Navigation.stories.tsx#L63) | jsx-attribute | Resource properties | mixed-jsx |
| [69](../../../../packages/storybook/src/stories/components/Navigation.stories.tsx#L69) | jsx-attribute | Property groups | mixed-jsx |
| [84](../../../../packages/storybook/src/stories/components/Navigation.stories.tsx#L84) | jsx-text | Selected panel: | mixed-jsx |
| [90](../../../../packages/storybook/src/stories/components/Navigation.stories.tsx#L90) | object-field | Components/Navigation | module-definition |

### packages/storybook/src/stories/components/Dialogs.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/components/Dialogs.stories.tsx) and classify its 13 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [13](../../../../packages/storybook/src/stories/components/Dialogs.stories.tsx#L13) | jsx-attribute | Modal dialogs | mixed-jsx |
| [14](../../../../packages/storybook/src/stories/components/Dialogs.stories.tsx#L14) | jsx-attribute | Open the modal, change a title and confirm or cancel. Escape and the close button dismiss it; focus returns to the trigger. | mixed-jsx |
| [17](../../../../packages/storybook/src/stories/components/Dialogs.stories.tsx#L17) | message-call | Untitled manifest | terminology, user-or-developer-message-review |
| [22](../../../../packages/storybook/src/stories/components/Dialogs.stories.tsx#L22) | jsx-text | Edit title | — |
| [25](../../../../packages/storybook/src/stories/components/Dialogs.stories.tsx#L25) | jsx-attribute | Confirmed result | — |
| [28](../../../../packages/storybook/src/stories/components/Dialogs.stories.tsx#L28) | jsx-attribute | Edit manifest title | mixed-jsx, terminology |
| [34](../../../../packages/storybook/src/stories/components/Dialogs.stories.tsx#L34) | jsx-text | Cancel | — |
| [41](../../../../packages/storybook/src/stories/components/Dialogs.stories.tsx#L41) | jsx-text | Save title | — |
| [48](../../../../packages/storybook/src/stories/components/Dialogs.stories.tsx#L48) | jsx-text | Manifest title | terminology |
| [57](../../../../packages/storybook/src/stories/components/Dialogs.stories.tsx#L57) | jsx-text | Section | mixed-jsx |
| [58](../../../../packages/storybook/src/stories/components/Dialogs.stories.tsx#L58) | jsx-text | : the dialog body scrolls while its title and confirmation actions remain available. | mixed-jsx |
| [62](../../../../packages/storybook/src/stories/components/Dialogs.stories.tsx#L62) | jsx-text | This local example does not modify a IIIF resource. | — |
| [70](../../../../packages/storybook/src/stories/components/Dialogs.stories.tsx#L70) | object-field | Components/Dialogs | module-definition |

### packages/storybook/src/support/CreatorWorkbench.tsx

- [ ] Review [source](../../../../packages/storybook/src/support/CreatorWorkbench.tsx) and classify its 13 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [240](../../../../packages/storybook/src/support/CreatorWorkbench.tsx#L240) | jsx-attribute | Creator form | mixed-jsx |
| [242](../../../../packages/storybook/src/support/CreatorWorkbench.tsx#L242) | jsx-text | Example link: | mixed-jsx |
| [254](../../../../packages/storybook/src/support/CreatorWorkbench.tsx#L254) | jsx-text | Loading creator… | — |
| [258](../../../../packages/storybook/src/support/CreatorWorkbench.tsx#L258) | jsx-text | Creating resource… | — |
| [260](../../../../packages/storybook/src/support/CreatorWorkbench.tsx#L260) | jsx-text | Created. | — |
| [262](../../../../packages/storybook/src/support/CreatorWorkbench.tsx#L262) | jsx-attribute | Created resource JSON | — |
| [288](../../../../packages/storybook/src/support/CreatorWorkbench.tsx#L288) | jsx-attribute | Label | — |
| [295](../../../../packages/storybook/src/support/CreatorWorkbench.tsx#L295) | jsx-text | Motivation | — |
| [305](../../../../packages/storybook/src/support/CreatorWorkbench.tsx#L305) | jsx-expression | Create annotation page | mixed-jsx |
| [328](../../../../packages/storybook/src/support/CreatorWorkbench.tsx#L328) | jsx-text | Canvas label | terminology |
| [332](../../../../packages/storybook/src/support/CreatorWorkbench.tsx#L332) | jsx-text | Width | — |
| [344](../../../../packages/storybook/src/support/CreatorWorkbench.tsx#L344) | jsx-text | Height | — |
| [355](../../../../packages/storybook/src/support/CreatorWorkbench.tsx#L355) | jsx-text | Create canvas | terminology |

### packages/storybook/src/stories/components/Sidebar.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/components/Sidebar.stories.tsx) and classify its 11 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [14](../../../../packages/storybook/src/stories/components/Sidebar.stories.tsx#L14) | object-field | Canvas properties | terminology |
| [18](../../../../packages/storybook/src/stories/components/Sidebar.stories.tsx#L18) | jsx-attribute | Sidebar layout | mixed-jsx |
| [19](../../../../packages/storybook/src/stories/components/Sidebar.stories.tsx#L19) | jsx-attribute | Header actions, scrollable content and padded containers, without an editor shell. | mixed-jsx |
| [20](../../../../packages/storybook/src/stories/components/Sidebar.stories.tsx#L20) | message-call | Choose a header action to try the sidebar. | user-or-developer-message-review |
| [28](../../../../packages/storybook/src/stories/components/Sidebar.stories.tsx#L28) | object-field | Add a property | — |
| [30](../../../../packages/storybook/src/stories/components/Sidebar.stories.tsx#L30) | message-call | Add property action selected. | user-or-developer-message-review |
| [33](../../../../packages/storybook/src/stories/components/Sidebar.stories.tsx#L33) | object-field | About this panel | — |
| [35](../../../../packages/storybook/src/stories/components/Sidebar.stories.tsx#L35) | message-call | This is the editor's reusable sidebar layout. | user-or-developer-message-review |
| [41](../../../../packages/storybook/src/stories/components/Sidebar.stories.tsx#L41) | jsx-text | No properties to display. | — |
| [52](../../../../packages/storybook/src/stories/components/Sidebar.stories.tsx#L52) | object-field | Components/Sidebar | module-definition |
| [54](../../../../packages/storybook/src/stories/components/Sidebar.stories.tsx#L54) | object-field | Canvas properties | module-definition, terminology |

### packages/storybook/src/stories/components/Forms.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/components/Forms.stories.tsx) and classify its 10 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [8](../../../../packages/storybook/src/stories/components/Forms.stories.tsx#L8) | object-field | A new resource | — |
| [8](../../../../packages/storybook/src/stories/components/Forms.stories.tsx#L8) | object-field | Describe this resource. | — |
| [12](../../../../packages/storybook/src/stories/components/Forms.stories.tsx#L12) | jsx-attribute | Form controls | mixed-jsx |
| [13](../../../../packages/storybook/src/stories/components/Forms.stories.tsx#L13) | jsx-attribute | The editor's input, textarea and radio selection controls, with their values alongside. | mixed-jsx |
| [19](../../../../packages/storybook/src/stories/components/Forms.stories.tsx#L19) | jsx-text | Label | — |
| [28](../../../../packages/storybook/src/stories/components/Forms.stories.tsx#L28) | jsx-text | Summary | — |
| [40](../../../../packages/storybook/src/stories/components/Forms.stories.tsx#L40) | jsx-attribute | Visibility | mixed-jsx |
| [45](../../../../packages/storybook/src/stories/components/Forms.stories.tsx#L45) | jsx-text | Visibility | — |
| [56](../../../../packages/storybook/src/stories/components/Forms.stories.tsx#L56) | jsx-attribute | Form values | — |
| [62](../../../../packages/storybook/src/stories/components/Forms.stories.tsx#L62) | object-field | Components/Form controls | module-definition |

### packages/storybook/src/stories/context/ResourceBuildingBlocks.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/context/ResourceBuildingBlocks.stories.tsx) and classify its 10 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [21](../../../../packages/storybook/src/stories/context/ResourceBuildingBlocks.stories.tsx#L21) | jsx-attribute | Selected provider | — |
| [29](../../../../packages/storybook/src/stories/context/ResourceBuildingBlocks.stories.tsx#L29) | jsx-text | No canvas available. | terminology |
| [37](../../../../packages/storybook/src/stories/context/ResourceBuildingBlocks.stories.tsx#L37) | jsx-text | Whole canvas | terminology |
| [43](../../../../packages/storybook/src/stories/context/ResourceBuildingBlocks.stories.tsx#L43) | jsx-text | Selected 1100 × 1100 region | — |
| [67](../../../../packages/storybook/src/stories/context/ResourceBuildingBlocks.stories.tsx#L67) | jsx-attribute | Resource building blocks | mixed-jsx |
| [68](../../../../packages/storybook/src/stories/context/ResourceBuildingBlocks.stories.tsx#L68) | jsx-attribute | These list items, provider cards and image thumbnails resolve their resources from the real headless editor Vault. | mixed-jsx |
| [84](../../../../packages/storybook/src/stories/context/ResourceBuildingBlocks.stories.tsx#L84) | jsx-attribute | Resources | mixed-jsx |
| [91](../../../../packages/storybook/src/stories/context/ResourceBuildingBlocks.stories.tsx#L91) | jsx-expression | Resource activated | mixed-jsx |
| [91](../../../../packages/storybook/src/stories/context/ResourceBuildingBlocks.stories.tsx#L91) | jsx-expression | Choose the resource row | mixed-jsx |
| [100](../../../../packages/storybook/src/stories/context/ResourceBuildingBlocks.stories.tsx#L100) | object-field | Components with context/Resource building blocks | module-definition |

### packages/storybook/src/stories/Introduction.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/Introduction.stories.tsx) and classify its 10 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [4](../../../../packages/storybook/src/stories/Introduction.stories.tsx#L4) | object-field | Introduction | module-definition |
| [9](../../../../packages/storybook/src/stories/Introduction.stories.tsx#L9) | jsx-attribute | Manifest Editor workbench | mixed-jsx, terminology |
| [10](../../../../packages/storybook/src/stories/Introduction.stories.tsx#L10) | jsx-attribute | Explore the building blocks, then compose a complete editor. | mixed-jsx |
| [13](../../../../packages/storybook/src/stories/Introduction.stories.tsx#L13) | jsx-text | Choose a section in the sidebar. Components need no IIIF context; Components with context use the real headless shell. | — |
| [17](../../../../packages/storybook/src/stories/Introduction.stories.tsx#L17) | jsx-text | Creators let you fill in a real form and inspect the resulting IIIF JSON. Editors show a live resource alongside its editing panel. Presets compose the complete editor. | — |
| [21](../../../../packages/storybook/src/stories/Introduction.stories.tsx#L21) | jsx-text | Examples load remote resources from the | mixed-jsx |
| [23](../../../../packages/storybook/src/stories/Introduction.stories.tsx#L23) | jsx-text | IIIF Cookbook | — |
| [25](../../../../packages/storybook/src/stories/Introduction.stories.tsx#L25) | jsx-text | and | mixed-jsx |
| [27](../../../../packages/storybook/src/stories/Introduction.stories.tsx#L27) | jsx-text | TU Delft Academic Heritage | — |
| [32](../../../../packages/storybook/src/stories/Introduction.stories.tsx#L32) | jsx-text | Use Storybook’s Controls panel to explore available configurations. Remote content requires a network connection; errors include a retry action. | — |

### packages/storybook/src/stories/components/Buttons.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/components/Buttons.stories.tsx) and classify its 9 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [10](../../../../packages/storybook/src/stories/components/Buttons.stories.tsx#L10) | jsx-attribute | Buttons | mixed-jsx |
| [11](../../../../packages/storybook/src/stories/components/Buttons.stories.tsx#L11) | jsx-attribute | The editor's action, control and icon buttons, without IIIF providers. | mixed-jsx |
| [15](../../../../packages/storybook/src/stories/components/Buttons.stories.tsx#L15) | jsx-text | Create resource | — |
| [18](../../../../packages/storybook/src/stories/components/Buttons.stories.tsx#L18) | jsx-text | Cancel | — |
| [21](../../../../packages/storybook/src/stories/components/Buttons.stories.tsx#L21) | jsx-text | Unavailable | — |
| [24](../../../../packages/storybook/src/stories/components/Buttons.stories.tsx#L24) | jsx-text | Add property | — |
| [25](../../../../packages/storybook/src/stories/components/Buttons.stories.tsx#L25) | jsx-attribute | Add resource | mixed-jsx |
| [28](../../../../packages/storybook/src/stories/components/Buttons.stories.tsx#L28) | jsx-attribute | Reset action | mixed-jsx |
| [37](../../../../packages/storybook/src/stories/components/Buttons.stories.tsx#L37) | object-field | Components/Buttons | module-definition |

### packages/storybook/src/stories/components/Selection.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/components/Selection.stories.tsx) and classify its 9 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [8](../../../../packages/storybook/src/stories/components/Selection.stories.tsx#L8) | object-field | Front cover | module-definition |
| [9](../../../../packages/storybook/src/stories/components/Selection.stories.tsx#L9) | object-field | Title page | module-definition |
| [10](../../../../packages/storybook/src/stories/components/Selection.stories.tsx#L10) | object-field | First chapter | module-definition |
| [23](../../../../packages/storybook/src/stories/components/Selection.stories.tsx#L23) | jsx-attribute | Resource selection | mixed-jsx |
| [24](../../../../packages/storybook/src/stories/components/Selection.stories.tsx#L24) | jsx-attribute | The editor's selection checkbox participates in React Aria list selection. Choose rows, then confirm the selected resource IDs. | mixed-jsx |
| [33](../../../../packages/storybook/src/stories/components/Selection.stories.tsx#L33) | jsx-attribute | Canvases | mixed-jsx, terminology |
| [54](../../../../packages/storybook/src/stories/components/Selection.stories.tsx#L54) | jsx-text | Confirm selection | — |
| [58](../../../../packages/storybook/src/stories/components/Selection.stories.tsx#L58) | jsx-attribute | Confirmed IDs | — |
| [65](../../../../packages/storybook/src/stories/components/Selection.stories.tsx#L65) | object-field | Components/Selection | module-definition |

### packages/storybook/src/stories/components/Feedback.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/components/Feedback.stories.tsx) and classify its 8 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [7](../../../../packages/storybook/src/stories/components/Feedback.stories.tsx#L7) | jsx-attribute | Feedback | mixed-jsx |
| [7](../../../../packages/storybook/src/stories/components/Feedback.stories.tsx#L7) | jsx-attribute | Empty, loading and message states used throughout the editor. | mixed-jsx |
| [9](../../../../packages/storybook/src/stories/components/Feedback.stories.tsx#L9) | jsx-text | No canvases yet. Add a canvas to begin. | terminology |
| [10](../../../../packages/storybook/src/stories/components/Feedback.stories.tsx#L10) | jsx-text | Changes are stored in this editing session. | — |
| [11](../../../../packages/storybook/src/stories/components/Feedback.stories.tsx#L11) | jsx-text | This resource has no rights statement. | — |
| [12](../../../../packages/storybook/src/stories/components/Feedback.stories.tsx#L12) | jsx-text | The remote resource could not be loaded. | — |
| [14](../../../../packages/storybook/src/stories/components/Feedback.stories.tsx#L14) | jsx-text | Loading resource… | mixed-jsx |
| [21](../../../../packages/storybook/src/stories/components/Feedback.stories.tsx#L21) | object-field | Components/Feedback | module-definition |

### packages/storybook/src/stories/components/MoreActions.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/components/MoreActions.stories.tsx) and classify its 8 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [11](../../../../packages/storybook/src/stories/components/MoreActions.stories.tsx#L11) | jsx-attribute | More actions menu | mixed-jsx |
| [12](../../../../packages/storybook/src/stories/components/MoreActions.stories.tsx#L12) | jsx-attribute | The production MoreMenuButton opens a keyboard accessible resource action menu. These actions only update the local outcome. | mixed-jsx |
| [16](../../../../packages/storybook/src/stories/components/MoreActions.stories.tsx#L16) | jsx-text | Untitled canvas | terminology |
| [21](../../../../packages/storybook/src/stories/components/MoreActions.stories.tsx#L21) | jsx-attribute | Resource actions | mixed-jsx |
| [25](../../../../packages/storybook/src/stories/components/MoreActions.stories.tsx#L25) | jsx-text | Duplicate canvas | terminology |
| [28](../../../../packages/storybook/src/stories/components/MoreActions.stories.tsx#L28) | jsx-text | Copy resource ID | — |
| [31](../../../../packages/storybook/src/stories/components/MoreActions.stories.tsx#L31) | jsx-text | Inspect resource | — |
| [42](../../../../packages/storybook/src/stories/components/MoreActions.stories.tsx#L42) | object-field | Components/More actions | module-definition |

### packages/storybook/src/stories/context/Atlas.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/context/Atlas.stories.tsx) and classify its 6 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [16](../../../../packages/storybook/src/stories/context/Atlas.stories.tsx#L16) | jsx-text | No canvases in this manifest. | terminology |
| [20](../../../../packages/storybook/src/stories/context/Atlas.stories.tsx#L20) | jsx-text | Canvas | terminology |
| [27](../../../../packages/storybook/src/stories/context/Atlas.stories.tsx#L27) | jsx-expression | Canvas {{expression1}} | interpolation, mixed-jsx, terminology |
| [52](../../../../packages/storybook/src/stories/context/Atlas.stories.tsx#L52) | jsx-attribute | Atlas viewer | mixed-jsx |
| [53](../../../../packages/storybook/src/stories/context/Atlas.stories.tsx#L53) | jsx-attribute | The editor's Atlas canvas viewer inside the headless shell. Pan, zoom and select a canvas; Reset reloads a fresh session. | mixed-jsx, terminology |
| [65](../../../../packages/storybook/src/stories/context/Atlas.stories.tsx#L65) | object-field | Components with context/Atlas | module-definition |

### packages/storybook/src/stories/context/Metadata.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/context/Metadata.stories.tsx) and classify its 6 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [26](../../../../packages/storybook/src/stories/context/Metadata.stories.tsx#L26) | jsx-text | This manifest has no metadata entries. | terminology |
| [35](../../../../packages/storybook/src/stories/context/Metadata.stories.tsx#L35) | jsx-text | Rights statement ↗ | — |
| [42](../../../../packages/storybook/src/stories/context/Metadata.stories.tsx#L42) | jsx-attribute | Descriptive properties | — |
| [59](../../../../packages/storybook/src/stories/context/Metadata.stories.tsx#L59) | jsx-attribute | Resource label and metadata | mixed-jsx |
| [60](../../../../packages/storybook/src/stories/context/Metadata.stories.tsx#L60) | jsx-attribute | LocaleString and the editor's metadata containers display the descriptive properties of a real manifest. | mixed-jsx, terminology |
| [72](../../../../packages/storybook/src/stories/context/Metadata.stories.tsx#L72) | object-field | Components with context/Descriptive metadata | module-definition |

### packages/storybook/src/support/StoryFrame.tsx

- [ ] Review [source](../../../../packages/storybook/src/support/StoryFrame.tsx) and classify its 6 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [27](../../../../packages/storybook/src/support/StoryFrame.tsx#L27) | jsx-text | About | — |
| [32](../../../../packages/storybook/src/support/StoryFrame.tsx#L32) | jsx-text | View source | mixed-jsx |
| [33](../../../../packages/storybook/src/support/StoryFrame.tsx#L33) | jsx-text | of | mixed-jsx |
| [33](../../../../packages/storybook/src/support/StoryFrame.tsx#L33) | jsx-text | (opens in new tab) | mixed-jsx |
| [38](../../../../packages/storybook/src/support/StoryFrame.tsx#L38) | jsx-text | Reset | — |
| [63](../../../../packages/storybook/src/support/StoryFrame.tsx#L63) | object-field | JSON | — |

### packages/storybook/src/stories/components/EmptyOverview.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/components/EmptyOverview.stories.tsx) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [10](../../../../packages/storybook/src/stories/components/EmptyOverview.stories.tsx#L10) | jsx-attribute | Empty manifest overview | mixed-jsx, terminology |
| [11](../../../../packages/storybook/src/stories/components/EmptyOverview.stories.tsx#L11) | jsx-attribute | The editor's introductory state includes its interactive Card3D surface and content creation action. Read-only configuration retains the guidance. | mixed-jsx |
| [18](../../../../packages/storybook/src/stories/components/EmptyOverview.stories.tsx#L18) | jsx-expression | Creation requested {{expression1}} time{{expression2}}. | interpolation, mixed-jsx |
| [18](../../../../packages/storybook/src/stories/components/EmptyOverview.stories.tsx#L18) | jsx-expression | No creation requested. | mixed-jsx |
| [23](../../../../packages/storybook/src/stories/components/EmptyOverview.stories.tsx#L23) | object-field | Components/Empty overview | module-definition |

### packages/storybook/src/stories/components/Tooltip.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/components/Tooltip.stories.tsx) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [9](../../../../packages/storybook/src/stories/components/Tooltip.stories.tsx#L9) | jsx-attribute | Tooltip portal | mixed-jsx |
| [10](../../../../packages/storybook/src/stories/components/Tooltip.stories.tsx#L10) | jsx-attribute | Hover or focus the trigger. Portal content keeps editor styles even outside the editor root; Escape dismisses it. | mixed-jsx |
| [14](../../../../packages/storybook/src/stories/components/Tooltip.stories.tsx#L14) | jsx-text | Resource information | — |
| [15](../../../../packages/storybook/src/stories/components/Tooltip.stories.tsx#L15) | jsx-text | View this resource’s IIIF properties | — |
| [25](../../../../packages/storybook/src/stories/components/Tooltip.stories.tsx#L25) | object-field | Components/Tooltip | module-definition |

### packages/storybook/src/stories/context/MediaPlayback.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/context/MediaPlayback.stories.tsx) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [13](../../../../packages/storybook/src/stories/context/MediaPlayback.stories.tsx#L13) | jsx-text | Resolving media strategy… | — |
| [25](../../../../packages/storybook/src/stories/context/MediaPlayback.stories.tsx#L25) | jsx-attribute | Resolved media | — |
| [58](../../../../packages/storybook/src/stories/context/MediaPlayback.stories.tsx#L58) | jsx-attribute | IIIF media playback | mixed-jsx |
| [59](../../../../packages/storybook/src/stories/context/MediaPlayback.stories.tsx#L59) | jsx-attribute | The production media player resolves the actual Cookbook painting annotation. Playback starts only when you press Play; Reset starts a fresh player. | mixed-jsx |
| [71](../../../../packages/storybook/src/stories/context/MediaPlayback.stories.tsx#L71) | object-field | Components with context/Media playback | module-definition |

### packages/storybook/src/stories/context/TextAnnotations.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/context/TextAnnotations.stories.tsx) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [20](../../../../packages/storybook/src/stories/context/TextAnnotations.stories.tsx#L20) | jsx-text | No textual annotation available. | — |
| [28](../../../../packages/storybook/src/stories/context/TextAnnotations.stories.tsx#L28) | jsx-attribute | Source annotation | — |
| [38](../../../../packages/storybook/src/stories/context/TextAnnotations.stories.tsx#L38) | jsx-attribute | Textual annotation bodies | mixed-jsx |
| [39](../../../../packages/storybook/src/stories/context/TextAnnotations.stories.tsx#L39) | jsx-attribute | The real annotation body renderer reads a remote Cookbook annotation, including HTML links and images when the body is HTML. | mixed-jsx |
| [50](../../../../packages/storybook/src/stories/context/TextAnnotations.stories.tsx#L50) | object-field | Components with context/Text annotations | module-definition |

### packages/storybook/src/stories/context/Thumbnails.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/context/Thumbnails.stories.tsx) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [15](../../../../packages/storybook/src/stories/context/Thumbnails.stories.tsx#L15) | jsx-attribute | Selected canvas | terminology |
| [30](../../../../packages/storybook/src/stories/context/Thumbnails.stories.tsx#L30) | jsx-text | No canvases in this manifest. | terminology |
| [67](../../../../packages/storybook/src/stories/context/Thumbnails.stories.tsx#L67) | jsx-attribute | Canvas thumbnails | mixed-jsx, terminology |
| [68](../../../../packages/storybook/src/stories/context/Thumbnails.stories.tsx#L68) | jsx-attribute | Real canvas thumbnails from a remote manifest. Choose a canvas to inspect its label and dimensions. | mixed-jsx, terminology |
| [80](../../../../packages/storybook/src/stories/context/Thumbnails.stories.tsx#L80) | object-field | Components with context/Canvas thumbnails | module-definition, terminology |

### packages/storybook/src/stories/presets/Workflows.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/presets/Workflows.stories.tsx) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [41](../../../../packages/storybook/src/stories/presets/Workflows.stories.tsx#L41) | jsx-attribute | A/V chapter workbench | mixed-jsx |
| [43](../../../../packages/storybook/src/stories/presets/Workflows.stories.tsx#L43) | jsx-attribute | Range workbench | mixed-jsx, terminology |
| [44](../../../../packages/storybook/src/stories/presets/Workflows.stories.tsx#L44) | jsx-attribute | Canvas annotations | mixed-jsx, terminology |
| [46](../../../../packages/storybook/src/stories/presets/Workflows.stories.tsx#L46) | jsx-attribute | The complete manifest preset opens directly in this workflow, using remote content and real plugin panels. Reset discards local edits. | mixed-jsx, terminology |
| [64](../../../../packages/storybook/src/stories/presets/Workflows.stories.tsx#L64) | object-field | Presets/Workflows | module-definition |

### packages/storybook/src/support/EditorWorkbench.tsx

- [ ] Review [source](../../../../packages/storybook/src/support/EditorWorkbench.tsx) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [67](../../../../packages/storybook/src/support/EditorWorkbench.tsx#L67) | jsx-attribute | Resource editor | mixed-jsx |
| [84](../../../../packages/storybook/src/support/EditorWorkbench.tsx#L84) | jsx-text | Open editor | — |
| [90](../../../../packages/storybook/src/support/EditorWorkbench.tsx#L90) | jsx-attribute | Live resource JSON | — |
| [130](../../../../packages/storybook/src/support/EditorWorkbench.tsx#L130) | jsx-text | Choose another source or use Reset to retry. | mixed-jsx |
| [131](../../../../packages/storybook/src/support/EditorWorkbench.tsx#L131) | jsx-text | Preparing editor resource… | — |

### packages/storybook/src/stories/presets/Presets.stories.tsx

- [ ] Review [source](../../../../packages/storybook/src/stories/presets/Presets.stories.tsx) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [32](../../../../packages/storybook/src/stories/presets/Presets.stories.tsx#L32) | jsx-attribute | {{expression1}} preset | interpolation, mixed-jsx |
| [35](../../../../packages/storybook/src/stories/presets/Presets.stories.tsx#L35) | jsx-attribute | Focused layout with the Overview editor limited to label, summary and required statement. Changes stay in this story’s Vault. | mixed-jsx |
| [36](../../../../packages/storybook/src/stories/presets/Presets.stories.tsx#L36) | jsx-attribute | A complete editor using a remote IIIF resource. Changes stay in this story’s Vault. | mixed-jsx |
| [55](../../../../packages/storybook/src/stories/presets/Presets.stories.tsx#L55) | object-field | Presets/Complete editor | module-definition |

### packages/storybook/src/support/HeadlessEditor.tsx

- [ ] Review [source](../../../../packages/storybook/src/support/HeadlessEditor.tsx) and classify its 3 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [41](../../../../packages/storybook/src/support/HeadlessEditor.tsx#L41) | jsx-text | Open source | — |
| [44](../../../../packages/storybook/src/support/HeadlessEditor.tsx#L44) | jsx-text | Retry | — |
| [51](../../../../packages/storybook/src/support/HeadlessEditor.tsx#L51) | jsx-text | Loading IIIF resource… | — |

### packages/storybook/src/stories/editors/editor-targets.ts

- [ ] Review [source](../../../../packages/storybook/src/stories/editors/editor-targets.ts) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [37](../../../../packages/storybook/src/stories/editors/editor-targets.ts#L37) | message-call | The source has no {{expression1}} resource to edit. | interpolation, user-or-developer-message-review |
| [55](../../../../packages/storybook/src/stories/editors/editor-targets.ts#L55) | message-call | This editor target needs a Manifest source. | terminology, user-or-developer-message-review |

### packages/storybook/src/support/load-resource.ts

- [ ] Review [source](../../../../packages/storybook/src/support/load-resource.ts) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [12](../../../../packages/storybook/src/support/load-resource.ts#L12) | message-call | Resource request failed ({{expression1}}) | interpolation, user-or-developer-message-review |
| [15](../../../../packages/storybook/src/support/load-resource.ts#L15) | message-call | Expected a IIIF Presentation 3 Manifest or Collection. | terminology, user-or-developer-message-review |

### packages/storybook/src/support/StoryFrame.test.tsx

- [ ] Review [source](../../../../packages/storybook/src/support/StoryFrame.test.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [7](../../../../packages/storybook/src/support/StoryFrame.test.tsx#L7) | object-field | Canvas | terminology |

## Formatting and content-language review points

| Source | Review kind | Code |
| --- | --- | --- |
| [packages/storybook/src/stories/editors/Editors.stories.tsx:50](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L50) | content-language-config | defaultLanguage: "en" |
| [packages/storybook/src/stories/editors/Editors.stories.tsx:51](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L51) | content-language-config | availableLanguages: ["en", "nl", "fr", "de", "ja", "zh"] |
| [packages/storybook/src/stories/editors/Editors.stories.tsx:52](../../../../packages/storybook/src/stories/editors/Editors.stories.tsx#L52) | content-language-config | advancedLanguageMode: true |
