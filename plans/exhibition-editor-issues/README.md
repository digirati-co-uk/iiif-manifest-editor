# Exhibition editor issue programme

This folder turns the supplied issue list into three implementation phases. Tasks inside one phase are designed to run in parallel; finish and review the whole phase before starting the next one.

## How to run the programme

1. Read [WORKING-AGREEMENT.md](./WORKING-AGREEMENT.md).
2. Create one branch or worktree per task from the same phase-start commit.
3. Assign one owner per task. Do not share a worktree between task owners.
4. Run the narrow automated checks and the `localhost:3000` scenarios in the task.
5. Commit a coherent change once it is understood and its checks pass. Keep unrelated working-tree changes out of every commit.
6. Merge all phase branches, resolve integration conflicts, and complete that phase's `REVIEW.md`.
7. Start the next phase only after the review is accepted.

Do not start, stop, kill, or rebuild the development server. It is already running at `http://localhost:3000`. Package-level tests and typechecks are allowed where a task names them; do not run the repository build.

## Phase map

| Phase                                                        | Parallel tasks       | Outcome                                                                                                                              |
| ------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [1 — Foundations](./phase-1-foundations/README.md)           | 4                    | Stable host extension APIs, the requested IIIF Browser version, shared creator settings, and explicit post-create selection behavior |
| [2 — Authoring](./phase-2-authoring/README.md)               | 4                    | Consistent slide lifecycle, creator parity, manifest/splash editing, and repaired info-box editing                                   |
| [3 — Layout and media](./phase-3-layout-and-media/README.md) | 5                    | Consistent layout controls, rotation persistence, crop editing/rendering, and clearable tour-step labels                              |
| [Deferred](./deferred/README.md)                             | 1 follow-up package  | The product terminology decision                                                                                                      |

## Test manifests

- Delft/full-page and mixed behavior coverage: `https://manifest-editor-preview.digirati.workers.dev/api/iiif/p3/9c86c4c2ec6521106045bb068eb1ed68/1784292427431`
- Leeds/scroll, splash, tours, and text box coverage: `https://manifest-editor-preview.digirati.workers.dev/api/iiif/p3/1c63ad0de6ad0eea26213b57eda1ff79/1784292447358`
- Leeds IIIF Browser regression source: `https://iiif.library.leeds.ac.uk/presentation/cc/nb5fj4k4`
- Intermittent IIIF Browser selection source: `https://iiif.library.leeds.ac.uk/presentation/cc/bvfhzdgw`

Import a URL from the home screen, then use “Open in Exhibition Editor.” Do not overwrite an existing saved project merely to obtain a fixture; create a disposable local project when mutation is required.

## Issue coverage

| Original issue                                                                          | Plan                                                                  |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Preview button without an external preview service; custom preview options and handlers | [1.1](./phase-1-foundations/01-preview-and-template-extension-api.md) |
| Custom or filtered preset/onboarding list                                               | [1.1](./phase-1-foundations/01-preview-and-template-extension-api.md) |
| Update IIIF Browser and verify styling                                                  | [1.2](./phase-1-foundations/02-iiif-browser-upgrade.md)               |
| Select a newly added blank slide                                                        | [1.4](./phase-1-foundations/04-creator-completion-selection.md)       |
| Do not auto-open an annotation after “Add media”; return to edit mode                   | [1.4](./phase-1-foundations/04-creator-completion-selection.md)       |
| Annotation left/right removes image behavior or is unnecessary for scroll               | [3.1](./phase-3-layout-and-media/01-behaviour-controls.md)            |
| Add IIIF Browser MDX editor plugin without splitting history                            | [2.4](./phase-2-authoring/04-info-box-editor.md)                      |
| Manifest title opens manifest properties; remove manifest overview                      | [2.3](./phase-2-authoring/03-manifest-and-splash-editing.md)          |
| Info-box label belongs in the main panel                                                | [2.4](./phase-2-authoring/04-info-box-editor.md)                      |
| Info-box image editing is buggy and has no back action                                  | [2.4](./phase-2-authoring/04-info-box-editor.md)                      |
| Splash slide edits manifest label and summary in the right panel                        | [2.3](./phase-2-authoring/03-manifest-and-splash-editing.md)          |
| Rename “Change presets” to “Change exhibition format”                                   | [1.1](./phase-1-foundations/01-preview-and-template-extension-api.md) |
| Show and identify the currently selected preview template                               | [1.1](./phase-1-foundations/01-preview-and-template-extension-api.md) |
| Reorder/edit in every exhibition left-side presentation                                 | [2.1](./phase-2-authoring/01-slide-list-lifecycle.md)                 |
| Leeds scroll: second browser slide lacks tabs/behavior                                  | [2.2](./phase-2-authoring/02-scroll-creator-parity.md)                |
| Deleting a slide selects a neighbor or returns to the empty state                       | [2.1](./phase-2-authoring/01-slide-list-lifecycle.md)                 |
| IIIF Browser creator missing from scroll                                                | [2.2](./phase-2-authoring/02-scroll-creator-parity.md)                |
| IIIF Browser intermittently shows “No options available” or no Select action            | [D.1](./deferred/D1-browser-select-availability.md)                   |
| IIIF Browser rotation is not persisted                                                  | [3.2](./phase-3-layout-and-media/02-browser-rotation.md)              |
| Image cover is offered only on the splash slide                                         | [3.1](./phase-3-layout-and-media/01-behaviour-controls.md)            |
| Grid thumbnail ignores a single-image crop                                              | [3.3](./phase-3-layout-and-media/03-cropped-grid-thumbnail.md)        |
| Edit an existing crop through `requestAnnotation()`                                     | [3.5](./phase-3-layout-and-media/05-edit-image-crop.md)               |
| “New step” cannot be cleared for full-image tour steps                                  | [3.4](./phase-3-layout-and-media/04-clear-tour-step-label.md)         |
| Make slide/canvas/section terminology consistent                                        | [D.4](./deferred/D4-exhibition-terminology.md)                        |
| Forked creators duplicate settings; add a shared configuration key                      | [1.3](./phase-1-foundations/03-shared-creator-configuration.md)       |

## Known baseline observations

- The worktree already had unrelated uncommitted changes in `presets/exhibition-preset/src/index.tsx`, `presets/exhibition-preset/src/creators/image-service-slide-creator.tsx`, and its new test when this plan was written. Preserve them and never sweep them into a task commit.
- `skipEditingOnCreate` already exists in `RenderCreator` and is used by the slideshow “Add content” path. Task 1.4 should test and complete that contract, not introduce a competing mechanism.
- The live preview menu already contains the active template, but it does not identify it as current; its action still says “Change preset.”
- The requested IIIF Browser source is now local `iiif-browser` commit `07a09e1`, installed by repository commit `0d5d14b1`.
- Browser selection failure D.1 is resolved; direct Canvas and checkbox selection passed the localhost matrix.
- The embedded exhibition viewer tried `localhost:5174` during inspection and was unavailable. Editor behavior at port 3000 is still testable. A task requiring live viewer behavior must record whether it used the remote preview URL or a separately available viewer; it must not start or kill that viewer itself.
