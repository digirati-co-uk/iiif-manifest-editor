# Manifest Editor Storybook

Run from the repository root:

```sh
pnpm install
pnpm --filter @manifest-editor/storybook dev
```

Storybook runs at http://localhost:6006, alongside the development app on port 3000. It reads workspace source files through Vite aliases, so no package build is needed. `pnpm --filter @manifest-editor/storybook typecheck` checks the stories. `build-storybook` is available for deployment when a build is wanted.

The five story sections separate presentational components, components inside the real headless shell, creator forms with JSON results, editing panels with live JSON, and complete presets. See [STORIES.md](STORIES.md) for the implementation checklist.

Stories use a white, 32px toolbar with descriptions behind About. Editors and viewers fill the remaining viewport. The manager starts with a narrow sidebar and collapsed addon panel; reopen Controls when needed.

Each creator opens with editable example values and immediately runs the real creator API to populate its JSON panel. Reset restores the example in a fresh Vault. Creator forms match the production modal’s 896px maximum width, 16px base text, body padding and scrolling limit; JSON stacks below when there is insufficient space alongside.

Use `HeadlessEditor` for real App / Plugin / Vault / Shell providers without rendering Layout. Pass a remote resource URL and render children inside it. Every mount owns its Vault; reset remounts the story. Creator JSON should come from the actual creator API and editor JSON from Vault serialization.

Resources come from the [IIIF Cookbook](https://iiif.io/api/cookbook/) and [TU Delft Academic Heritage](https://heritage.tudelft.nl/iiif/collection.json). Network access and host CORS policies affect remote examples; failures are surfaced with retry, never silently replaced with fixtures. Edits only affect the in-memory Vault. Storybook controls document configurable story inputs.

## Coverage and validation

The workbench contains **100 stories**: 22 presentational components, 12 components with context, 25 creators, 26 editor panels/configurations, 14 complete presets/workflows and the introduction. All 24 default registered creators and all 16 default editor definitions have a story; the optional manifest browser and fallback annotation editor are registered explicitly in their own examples. [STORIES.md](STORIES.md) links every case and lists remaining coverage gaps.

All stories were opened in the collaborative browser, including the original 40 and this expansion's 60. Checks covered seeded creation and JSON, creator resubmission/reset, selection, modal save, overflow menus, toast undo/queue/reset, remote text/HTML, thumbnail crops, provider selection, audio/video playback/reset, live image and partOf editing, annotation targets, real range trees and maps. The inline annotation page includes the real Canvas viewer for drawing requests. Complete presets include Delft's 3,262-item collection, book ranges, A/V chapters and canvas annotations.

Reusable Storybook `play` assertions cover tooltip portal styling and Escape dismissal, seeded creators and JSON/reset, image/rights/annotation-target edits, A/V range creation/reset and annotation-page creation/reset. These run in the story canvas; the Vitest script runs the separate unit regressions. Loader tests cover HTTP errors, invalid roots, canonical IDs and isolated Vaults; editor target tests cover nested parent context and selection failures. A real Vault regression checks that creating an internal Canvas link preserves its dimensions and painting resources.

Storybook typecheck, scoped lint, formatting and all 13 unit tests pass. Package builds were deliberately not run. The broader creators package has pre-existing Vault type mismatches in InternalCanvas/IIIFBrowserCreator/ManifestBrowserCreator and a VideoPlayer ref mismatch.

## Production findings and boundaries

Tooltip portals now carry the editor style scope even when mounted under `document.body`. The internal Canvas browser opens the in-memory Manifest directly, offers Canvas selection and preserves existing content when linking it. Creator forms that previously ignored initial data now use it for editable seeded examples; thumbnail resubmission uses the selected preview URL.

The new stories also expose existing production limitations: PanelSideMenuItem handles mouse-down without keyboard activation; resource list rows use press handlers on non-focusable list items; the media player's visible Play label can remain stale while the actual media plays. Range trees produce existing drag-handle accessibility warnings. These are documented findings, not behaviors hidden by the stories.

Remote resources and map tiles require network access and host CORS support. The provider example's remote UCLA logo was slow/pending during validation; its links and selection worked. The image service form performs its own preview fetch, whose error handling belongs to the production form. Workbench creation errors remain visible. OCR/translation services, persisted task recovery and full keyboard/screen-reader journeys need the further pass listed in the checklist.
