# Story checklist

100 implemented stories. Checked means implemented; browser and interaction validation is described in [README.md](README.md). This is UI coverage, not automated line coverage.

Every story uses a fresh in-memory Vault when it needs IIIF state. Remote resources remain remote, with source links, loading/error feedback and reset. Creators start with editable example data and actual created JSON. All 24 default registered creators have stories, plus the optional manifest browser. All 16 default editor definitions have stories, plus the opt-in fallback annotation editor.

## Introduction (1)

- [x] [Workbench](src/stories/Introduction.stories.tsx)

## Components (22)

- [x] [Buttons — Actions](src/stories/components/Buttons.stories.tsx)
- [x] [Creator grid — Building Block Selection](src/stories/components/CreatorGrid.stories.tsx)
- [x] [Feedback — States](src/stories/components/Feedback.stories.tsx)
- [x] [Form controls — Input Textarea And Selection](src/stories/components/Forms.stories.tsx)
- [x] [Sidebar — Header And Layout](src/stories/components/Sidebar.stories.tsx)
- [x] [Dialogs — Confirm Changes](src/stories/components/Dialogs.stories.tsx)
- [x] [Dialogs — Scrollable Content](src/stories/components/Dialogs.stories.tsx)
- [x] [Navigation — Tabs Selection](src/stories/components/Navigation.stories.tsx)
- [x] [Navigation — Vertical Tabs](src/stories/components/Navigation.stories.tsx)
- [x] [Navigation — Sidebar Tab Selection](src/stories/components/Navigation.stories.tsx)
- [x] [Navigation — Sidebar Overflow](src/stories/components/Navigation.stories.tsx)
- [x] [Navigation — Panel Navigation](src/stories/components/Navigation.stories.tsx)
- [x] [Selection — Multiple Resources](src/stories/components/Selection.stories.tsx)
- [x] [Selection — Single Resource](src/stories/components/Selection.stories.tsx)
- [x] [Empty overview — Start Creating](src/stories/components/EmptyOverview.stories.tsx)
- [x] [Empty overview — Read Only Guidance](src/stories/components/EmptyOverview.stories.tsx)
- [x] [More actions — Resource Menu](src/stories/components/MoreActions.stories.tsx)
- [x] [Tooltip — Default Portal](src/stories/components/Tooltip.stories.tsx)
- [x] [Tooltip — Explicit Body Portal](src/stories/components/Tooltip.stories.tsx)
- [x] [Notifications — Variants](src/stories/components/Notifications.stories.tsx)
- [x] [Notifications — Undo Action](src/stories/components/Notifications.stories.tsx)
- [x] [Notifications — Queue And Dismissal](src/stories/components/Notifications.stories.tsx)

## Components with context (12)

- [x] [Atlas — Cookbook Image Service](src/stories/context/Atlas.stories.tsx)
- [x] [Atlas — Delft Heritage](src/stories/context/Atlas.stories.tsx)
- [x] [Descriptive metadata — Resource Label And Metadata](src/stories/context/Metadata.stories.tsx)
- [x] [Canvas thumbnails — Manifest Canvas Selection](src/stories/context/Thumbnails.stories.tsx)
- [x] [Media playback — Cookbook Audio](src/stories/context/MediaPlayback.stories.tsx)
- [x] [Media playback — Cookbook Video](src/stories/context/MediaPlayback.stories.tsx)
- [x] [Text annotations — Plain Text Body](src/stories/context/TextAnnotations.stories.tsx)
- [x] [Text annotations — HTML Body With Links](src/stories/context/TextAnnotations.stories.tsx)
- [x] [Resource building blocks — Manifest Row](src/stories/context/ResourceBuildingBlocks.stories.tsx)
- [x] [Resource building blocks — Collection Row](src/stories/context/ResourceBuildingBlocks.stories.tsx)
- [x] [Resource building blocks — Provider Links And Logo](src/stories/context/ResourceBuildingBlocks.stories.tsx)
- [x] [Resource building blocks — Thumbnail Regions And Cover](src/stories/context/ResourceBuildingBlocks.stories.tsx)

## Creators (25)

- [x] [Plain Text Body](src/stories/creators/Creators.stories.tsx)
- [x] [Web Page Body](src/stories/creators/Creators.stories.tsx)
- [x] [Image Url Body](src/stories/creators/Creators.stories.tsx)
- [x] [Image Service Body](src/stories/creators/Creators.stories.tsx)
- [x] [Html Body](src/stories/creators/Creators.stories.tsx)
- [x] [You Tube Body](src/stories/creators/Creators.stories.tsx)
- [x] [Empty Canvas](src/stories/creators/Creators.stories.tsx)
- [x] [Provider Agent](src/stories/creators/Creators.stories.tsx)
- [x] [Image Painting Annotation](src/stories/creators/Creators.stories.tsx)
- [x] [Audio Painting Annotation](src/stories/creators/Creators.stories.tsx)
- [x] [Video Painting Annotation](src/stories/creators/Creators.stories.tsx)
- [x] [Top Level Range](src/stories/creators/Creators.stories.tsx)
- [x] [More creators — Image Service Painting Annotation](src/stories/creators/AdditionalCreators.stories.tsx)
- [x] [More creators — Html Annotation](src/stories/creators/AdditionalCreators.stories.tsx)
- [x] [More creators — Browse Iiif Canvas](src/stories/creators/AdditionalCreators.stories.tsx)
- [x] [More creators — Empty Annotation Page](src/stories/creators/AdditionalCreators.stories.tsx)
- [x] [More creators — Web Vtt Captions](src/stories/creators/AdditionalCreators.stories.tsx)
- [x] [More creators — Annotation Without Body](src/stories/creators/AdditionalCreators.stories.tsx)
- [x] [More creators — Internal Canvas Link](src/stories/creators/AdditionalCreators.stories.tsx)
- [x] [More creators — Captioned Image Annotation](src/stories/creators/AdditionalCreators.stories.tsx)
- [x] [More creators — Image Url List](src/stories/creators/AdditionalCreators.stories.tsx)
- [x] [More creators — Image List Painting Annotations](src/stories/creators/AdditionalCreators.stories.tsx)
- [x] [More creators — Thumbnail From Service](src/stories/creators/AdditionalCreators.stories.tsx)
- [x] [More creators — Range With Items](src/stories/creators/AdditionalCreators.stories.tsx)
- [x] [More creators — Browse Manifest](src/stories/creators/AdditionalCreators.stories.tsx)

## Editors (26)

- [x] [Resource panels — Manifest Descriptive Properties](src/stories/editors/Editors.stories.tsx)
- [x] [Resource panels — Multilingual Labels And Summaries](src/stories/editors/Editors.stories.tsx)
- [x] [Resource panels — Metadata Entries](src/stories/editors/Editors.stories.tsx)
- [x] [Resource panels — Rights And Required Statement](src/stories/editors/Editors.stories.tsx)
- [x] [Resource panels — Technical Properties And Behavior](src/stories/editors/Editors.stories.tsx)
- [x] [Resource panels — Linking Properties](src/stories/editors/Editors.stories.tsx)
- [x] [Resource panels — Canvas Descriptive Properties](src/stories/editors/Editors.stories.tsx)
- [x] [Resource panels — Restricted Property Configuration](src/stories/editors/Editors.stories.tsx)
- [x] [Resource panels — Single Tab Editor Configuration](src/stories/editors/Editors.stories.tsx)
- [x] [Specialized panels — Image Resource](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Image Service Resource](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Image Painting Annotation](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Audio Painting Annotation](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Video Painting Annotation](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Choice Painting Annotation](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Html Annotation Body](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Canvas Composition Detail](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Top Level Range Structure](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Nested Range With Canvases](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Inline Annotation Page](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Part Of Reference](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Manifest Structure](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Canvas Structure](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Nav Place Map](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Empty Nav Place Map](src/stories/editors/SpecializedEditors.stories.tsx)
- [x] [Specialized panels — Fallback Annotation Target](src/stories/editors/SpecializedEditors.stories.tsx)

## Presets (14)

- [x] [Complete editor — Cookbook Image](src/stories/presets/Presets.stories.tsx)
- [x] [Complete editor — Multipage Book](src/stories/presets/Presets.stories.tsx)
- [x] [Complete editor — Audio](src/stories/presets/Presets.stories.tsx)
- [x] [Complete editor — Video](src/stories/presets/Presets.stories.tsx)
- [x] [Complete editor — Delft Heritage Object](src/stories/presets/Presets.stories.tsx)
- [x] [Complete editor — Cookbook Collection](src/stories/presets/Presets.stories.tsx)
- [x] [Complete editor — Delft Academic Heritage](src/stories/presets/Presets.stories.tsx)
- [x] [Complete editor — Exhibition](src/stories/presets/Presets.stories.tsx)
- [x] [Complete editor — Focused And Restricted](src/stories/presets/Presets.stories.tsx)
- [x] [Workflows — Book Table Of Contents](src/stories/presets/Workflows.stories.tsx)
- [x] [Workflows — Audio Chapters](src/stories/presets/Workflows.stories.tsx)
- [x] [Workflows — Video Table Of Contents](src/stories/presets/Workflows.stories.tsx)
- [x] [Workflows — Create Canvas Annotations](src/stories/presets/Workflows.stories.tsx)
- [x] [Workflows — Existing Canvas Annotations](src/stories/presets/Workflows.stories.tsx)

## Validation and defaults

- [x] Minimal white chrome; 32px toolbar and viewport-filling content.
- [x] Creator forms use production modal sizing and scrolling.
- [x] Syntax-highlighted JSON with independent scrolling and full-height dividers.
- [x] Tooltip default/body portals retain the editor style scope; hover and Escape assertions.
- [x] Real A/V chapter creation and reset, and annotation-page creation and reset.
- [x] Loader validation and isolation tests; nested editor selection tests.

## Further coverage

These need a separate focused pass; they are not represented by successful stubs.

- [ ] Background task progress, cancellation, retry and persisted task recovery.
- [ ] Canvas label generation and bulk thumbnail builder end-to-end workflows.
- [ ] OCR classification, Docling and translation plugin configurations, results and service failures.
- [ ] Annotation import from external pages, including partial failures and cancellation.
- [ ] Complete keyboard and screen-reader journeys, including range/tree drag-and-drop.

Icon exports, hooks and API utilities are exercised through their consuming UI; they do not each get a separate visual story. The partOf editor explicitly adds an inverse reference to its real remote collection; creator target containers are small local fixtures with real remote media.
