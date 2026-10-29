# Editor API display metadata source inventory

Module: `packages/editor-api`. Revision: `66de064a5d217b7847db924db925b092b36a0eed`. [Implementation task](../modules/02-editor-api.md).

Default application-source scan: **80 occurrences** in **7 files** (43 files scanned). Expanded JS/TS scan including tests/stories/tutorials/examples: **81 occurrences**.

These are syntactic candidates, not final message IDs or verified active UI. Scans use git's tracked/unignored files and exclude generated, public and vendor assets. Supporting-source strings are usually fixtures or assertions, not catalog entries. Markdown/MDX/JSON/CSS and third-party UI are not included. Review authored defaults and developer errors before extraction. Mixed JSX may be fragments of one whole message. Text below is shortened to 180 characters; follow the source link for the original.

## Default application source files

| File | Candidate occurrences |
| --- | ---: |
| [packages/editor-api/src/meta/documentation.ts](../../../../packages/editor-api/src/meta/documentation.ts) | 42 |
| [packages/editor-api/src/canvas-layout/geometry.ts](../../../../packages/editor-api/src/canvas-layout/geometry.ts) | 18 |
| [packages/editor-api/src/meta/rights.ts](../../../../packages/editor-api/src/meta/rights.ts) | 14 |
| [packages/editor-api/src/BaseReferenceListEditor.ts](../../../../packages/editor-api/src/BaseReferenceListEditor.ts) | 3 |
| [packages/editor-api/src/canvas-layout/layout.ts](../../../../packages/editor-api/src/canvas-layout/layout.ts) | 1 |
| [packages/editor-api/src/EditorInstance.ts](../../../../packages/editor-api/src/EditorInstance.ts) | 1 |
| [packages/editor-api/src/ReadonlyProperty.ts](../../../../packages/editor-api/src/ReadonlyProperty.ts) | 1 |

## Expanded review list

### packages/editor-api/src/meta/documentation.ts

- [ ] Review [source](../../../../packages/editor-api/src/meta/documentation.ts) and classify its 42 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [35](../../../../packages/editor-api/src/meta/documentation.ts#L35) | object-field | An ordered list of Manifests, and/or further Collections. Collections allow Manifests and child Collections to be grouped in a hierarchical structure for presentation, which can be | module-definition, terminology |
| [39](../../../../packages/editor-api/src/meta/documentation.ts#L39) | object-field | A description of the structure and properties of the compound object. It carries information needed for the client to present the content to the user, such as a title and other des | module-definition, terminology |
| [43](../../../../packages/editor-api/src/meta/documentation.ts#L43) | object-field | A virtual container that represents a particular view of the object and has content resources associated with it or with parts of it. The Canvas provides a frame of reference for t | module-definition, terminology |
| [47](../../../../packages/editor-api/src/meta/documentation.ts#L47) | object-field | An ordered list of Canvases, and/or further Ranges. Ranges allow Canvases, or parts thereof, to be grouped together in some way. This could be for content-based reasons, such as mi | module-definition, terminology |
| [51](../../../../packages/editor-api/src/meta/documentation.ts#L51) | object-field | An ordered list of Annotations that is typically associated with a Canvas but may be referenced from other types of resource as well. Annotation Pages collect and order lists of An | module-definition, terminology |
| [55](../../../../packages/editor-api/src/meta/documentation.ts#L55) | object-field | Annotations associate content resources with Canvases. The same mechanism is used for the visible and/or audible resources as is used for transcriptions, commentary, tags and other | module-definition, terminology |
| [59](../../../../packages/editor-api/src/meta/documentation.ts#L59) | object-field | Web resources such as images, audio, video, or text which are associated with a Canvas via an Annotation, or provide a representation of any resource. | module-definition, terminology |
| [63](../../../../packages/editor-api/src/meta/documentation.ts#L63) | object-field | An ordered list of Annotation Pages. Annotation Collections allow higher level groupings of Annotations to be recorded. For example, all of the English translation Annotations of a | module-definition, terminology |
| [70](../../../../packages/editor-api/src/meta/documentation.ts#L70) | object-field | A human readable label, name or title. The label property is intended to be displayed as a short, textual surrogate for the resource if a human needs to make a distinction between | module-definition |
| [74](../../../../packages/editor-api/src/meta/documentation.ts#L74) | object-field | An ordered list of descriptions to be displayed to the user when they interact with the resource, given as pairs of human readable label and value entries. The content of these ent | module-definition |
| [78](../../../../packages/editor-api/src/meta/documentation.ts#L78) | object-field | A short textual summary intended to be conveyed to the user when the metadata entries for the resource are not being displayed. This could be used as a brief description for item l | module-definition |
| [82](../../../../packages/editor-api/src/meta/documentation.ts#L82) | object-field | Text that must be displayed when the resource is displayed or used. For example, the requiredStatement property could be used to present copyright or ownership statements, an ackno | module-definition |
| [86](../../../../packages/editor-api/src/meta/documentation.ts#L86) | object-field | A string that identifies a license or rights statement that applies to the content of the resource, such as the JSON of a Manifest or the pixels of an image. The value must be draw | module-definition, terminology |
| [90](../../../../packages/editor-api/src/meta/documentation.ts#L90) | object-field | An organization or person that contributed to providing the content of the resource. Clients can then display this information to the user to acknowledge the provider's contributio | module-definition |
| [94](../../../../packages/editor-api/src/meta/documentation.ts#L94) | object-field | A content resource, such as a small image or short audio clip, that represents the resource that has the thumbnail property. A resource may have multiple thumbnail resources that h | module-definition |
| [98](../../../../packages/editor-api/src/meta/documentation.ts#L98) | object-field | A date that clients may use for navigation purposes when presenting the resource to the user in a date-based user interface, such as a calendar or timeline. More descriptive date r | module-definition, terminology |
| [102](../../../../packages/editor-api/src/meta/documentation.ts#L102) | object-field | A single Canvas that provides additional content for use before the main content of the resource that has the placeholderCanvas property is rendered, or as an advertisement or stan | module-definition, terminology |
| [106](../../../../packages/editor-api/src/meta/documentation.ts#L106) | object-field | A single Canvas that provides additional content for use while rendering the resource that has the accompanyingCanvas property. Examples include an image to show while a duration-o | module-definition, terminology |
| [110](../../../../packages/editor-api/src/meta/documentation.ts#L110) | object-field | The language or languages used in the content of this external resource. This property is already available from the Web Annotation model for content resources that are the body or | module-definition |
| [117](../../../../packages/editor-api/src/meta/documentation.ts#L117) | object-field | The URI that identifies the resource. If the resource is only available embedded within another resource, such as a Range within a Manifest, then the URI may be the URI of the embe | module-definition, terminology |
| [121](../../../../packages/editor-api/src/meta/documentation.ts#L121) | object-field | The type or class of the resource. For classes defined for this specification | module-definition |
| [125](../../../../packages/editor-api/src/meta/documentation.ts#L125) | object-field | The specific media type (often called a MIME type) for a content resource, for example image/jpeg. This is important for distinguishing different formats of the same overall type o | module-definition |
| [129](../../../../packages/editor-api/src/meta/documentation.ts#L129) | object-field | A schema or named set of functionality available from the resource. The profile can further clarify the type and/or format of an external resource or service, allowing clients to c | module-definition |
| [133](../../../../packages/editor-api/src/meta/documentation.ts#L133) | object-field | The height of the Canvas or external content resource. For content resources, the value is in pixels. For Canvases, the value does not have a unit. In combination with the width, i | module-definition, terminology |
| [137](../../../../packages/editor-api/src/meta/documentation.ts#L137) | object-field | The width of the Canvas or external content resource. For content resources, the value is in pixels. For Canvases, the value does not have a unit. In combination with the height, i | module-definition, terminology |
| [141](../../../../packages/editor-api/src/meta/documentation.ts#L141) | object-field | The duration of the Canvas or external content resource, given in seconds. | module-definition, terminology |
| [145](../../../../packages/editor-api/src/meta/documentation.ts#L145) | object-field | The direction in which a set of Canvases should be displayed to the user. This specification defines four direction values in the table below. Others may be defined externally as a | module-definition, terminology |
| [149](../../../../packages/editor-api/src/meta/documentation.ts#L149) | object-field | A set of user experience features that the publisher of the content would prefer the client to use when presenting the resource. This specification defines the values in the table | module-definition |
| [153](../../../../packages/editor-api/src/meta/documentation.ts#L153) | object-field | A mode associated with an Annotation that is to be applied to the rendering of any time-based media, or otherwise could be considered to have a duration, used as a body resource of | module-definition |
| [157](../../../../packages/editor-api/src/meta/documentation.ts#L157) | object-field | This specification defines two values for the Web Annotation property of motivation, or purpose when used on a Specific Resource or Textual Body. Resources associated with a Canvas | module-definition, terminology |
| [165](../../../../packages/editor-api/src/meta/documentation.ts#L165) | object-field | A web page that is about the object represented by the resource that has the homepage property. The web page is usually published by the organization responsible for the object, an | module-definition |
| [169](../../../../packages/editor-api/src/meta/documentation.ts#L169) | object-field | A small image resource that represents the Agent resource it is associated with. The logo must be clearly rendered when the resource is displayed or used, without cropping, rotatin | module-definition |
| [173](../../../../packages/editor-api/src/meta/documentation.ts#L173) | object-field | A resource that is an alternative, non-IIIF representation of the resource that has the rendering property. Such representations typically cannot be painted onto a single Canvas, a | module-definition, terminology |
| [177](../../../../packages/editor-api/src/meta/documentation.ts#L177) | object-field | A service that the client might interact with directly and gain additional information or functionality for using the resource that has the service property, such as from an Image | module-definition |
| [181](../../../../packages/editor-api/src/meta/documentation.ts#L181) | object-field | A list of one or more service definitions on the top-most resource of the document, that are typically shared by more than one subsequent resource. This allows for these shared ser | module-definition |
| [185](../../../../packages/editor-api/src/meta/documentation.ts#L185) | object-field | A machine-readable resource such as an XML or RDF description that is related to the current resource that has the seeAlso property. Properties of the resource should be given to h | module-definition, terminology |
| [190](../../../../packages/editor-api/src/meta/documentation.ts#L190) | object-field | A containing resource that includes the resource that has the partOf property. When a client encounters the partOf property, it might retrieve the referenced containing resource, i | module-definition, terminology |
| [194](../../../../packages/editor-api/src/meta/documentation.ts#L194) | object-field | A Canvas, or part of a Canvas, which the client should show on initialization for the resource that has the start property. The reference to part of a Canvas is handled in the same | module-definition, terminology |
| [198](../../../../packages/editor-api/src/meta/documentation.ts#L198) | object-field | A link from this Range to an Annotation Collection that includes the supplementing Annotations of content resources for the Range. Clients might use this to present additional cont | module-definition, terminology |
| [205](../../../../packages/editor-api/src/meta/documentation.ts#L205) | object-field | Much of the functionality of the IIIF Presentation API is simply recording the order in which child resources occur within a parent resource, such as Collections or Manifests withi | module-definition, terminology |
| [209](../../../../packages/editor-api/src/meta/documentation.ts#L209) | object-field | The structure of an object represented as a Manifest can be described using a hierarchy of Ranges. Ranges can be used to describe the “table of contents” of the object or other str | module-definition, terminology |
| [213](../../../../packages/editor-api/src/meta/documentation.ts#L213) | object-field | An ordered list of Annotation Pages that contain commentary or other Annotations about this resource, separate from the Annotations that are used to paint content on to a Canvas. T | module-definition, terminology |

### packages/editor-api/src/canvas-layout/geometry.ts

- [ ] Review [source](../../../../packages/editor-api/src/canvas-layout/geometry.ts) and classify its 18 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [61](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L61) | object-field | Side by side | module-definition |
| [62](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L62) | object-field | Three columns | module-definition |
| [65](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L65) | object-field | Feature left | module-definition |
| [70](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L70) | object-field | Feature above | module-definition |
| [73](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L73) | object-field | Four images | module-definition |
| [74](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L74) | object-field | Six images | module-definition |
| [75](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L75) | object-field | Hero + inset | module-definition |
| [76](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L76) | object-field | Offset pair | module-definition |
| [79](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L79) | object-field | Cascade | module-definition |
| [89](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L89) | object-field | Stacked | module-definition |
| [99](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L99) | object-field | Scatter | module-definition |
| [110](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L110) | object-field | Gallery wall | module-definition |
| [120](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L120) | object-field | Blank canvas | module-definition, terminology |
| [123](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L123) | object-field | 12 × 8 · Landscape | module-definition |
| [124](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L124) | object-field | 12 × 6 · Wide | module-definition |
| [125](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L125) | object-field | 12 × 12 · Square | module-definition |
| [126](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L126) | object-field | 8 × 12 · Portrait | module-definition |
| [144](../../../../packages/editor-api/src/canvas-layout/geometry.ts#L144) | message-call | Image and placeholder dimensions must be positive finite numbers | user-or-developer-message-review |

### packages/editor-api/src/meta/rights.ts

- [ ] Review [source](../../../../packages/editor-api/src/meta/rights.ts) and classify its 14 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [23](../../../../packages/editor-api/src/meta/rights.ts#L23) | object-field | Public Domain | module-definition |
| [26](../../../../packages/editor-api/src/meta/rights.ts#L26) | object-field | The person who associated a work with this deed has dedicated the work to the public domain by waiving all of his or her rights to the work worldwide under copyright law, including | module-definition |
| [33](../../../../packages/editor-api/src/meta/rights.ts#L33) | object-field | Attribution | module-definition |
| [36](../../../../packages/editor-api/src/meta/rights.ts#L36) | object-field | This license lets others distribute, remix, adapt, and build upon your work, even commercially, as long as they credit you for the original creation. This is the most accommodating | module-definition |
| [43](../../../../packages/editor-api/src/meta/rights.ts#L43) | object-field | Attribution-ShareAlike | module-definition |
| [46](../../../../packages/editor-api/src/meta/rights.ts#L46) | object-field | This license lets others remix, adapt, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. | module-definition |
| [53](../../../../packages/editor-api/src/meta/rights.ts#L53) | object-field | Attribution-NoDerivs | module-definition |
| [56](../../../../packages/editor-api/src/meta/rights.ts#L56) | object-field | This license lets others reuse the work for any purpose, including commercially; however, it cannot be shared with others in adapted form, and credit must be provided to you. | module-definition |
| [63](../../../../packages/editor-api/src/meta/rights.ts#L63) | object-field | Attribution-NonCommercial | module-definition |
| [66](../../../../packages/editor-api/src/meta/rights.ts#L66) | object-field | This license lets others remix, adapt, and build upon your work non-commercially, and although their new works must also acknowledge you and be non-commercial, they don’t have to l | module-definition |
| [73](../../../../packages/editor-api/src/meta/rights.ts#L73) | object-field | Attribution-NonCommercial-ShareAlike | module-definition |
| [76](../../../../packages/editor-api/src/meta/rights.ts#L76) | object-field | This license lets others remix, adapt, and build upon your work non-commercially, as long as they credit you and license their new creations under the identical terms. | module-definition |
| [83](../../../../packages/editor-api/src/meta/rights.ts#L83) | object-field | Attribution-NonCommercial-NoDerivs | module-definition |
| [86](../../../../packages/editor-api/src/meta/rights.ts#L86) | object-field | This license is the most restrictive of our six main licenses, only allowing others to download your works and share them with others as long as they credit you, but they can’t cha | module-definition |

### packages/editor-api/src/BaseReferenceListEditor.ts

- [ ] Review [source](../../../../packages/editor-api/src/BaseReferenceListEditor.ts) and classify its 3 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [55](../../../../packages/editor-api/src/BaseReferenceListEditor.ts#L55) | message-call | Cannot set directly | user-or-developer-message-review |
| [266](../../../../packages/editor-api/src/BaseReferenceListEditor.ts#L266) | message-call | Not implemented | user-or-developer-message-review |
| [308](../../../../packages/editor-api/src/BaseReferenceListEditor.ts#L308) | message-call | Not yet implemented | user-or-developer-message-review |

### packages/editor-api/src/canvas-layout/layout.ts

- [ ] Review [source](../../../../packages/editor-api/src/canvas-layout/layout.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [119](../../../../packages/editor-api/src/canvas-layout/layout.ts#L119) | message-call | This layout does not have enough image positions | user-or-developer-message-review |

### packages/editor-api/src/EditorInstance.ts

- [ ] Review [source](../../../../packages/editor-api/src/EditorInstance.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [136](../../../../packages/editor-api/src/EditorInstance.ts#L136) | object-field | Validation error: {{expression1}} | interpolation |

### packages/editor-api/src/ReadonlyProperty.ts

- [ ] Review [source](../../../../packages/editor-api/src/ReadonlyProperty.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [5](../../../../packages/editor-api/src/ReadonlyProperty.ts#L5) | message-call | Read only | user-or-developer-message-review |

### packages/editor-api/tests/canvas-layout.test.ts

- [ ] Review [source](../../../../packages/editor-api/tests/canvas-layout.test.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [282](../../../../packages/editor-api/tests/canvas-layout.test.ts#L282) | object-field | Image | — |
