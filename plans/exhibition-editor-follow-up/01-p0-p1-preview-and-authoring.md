# P0–P1 — Preview, themes, and authoring correctness

## Objective

Make the Exhibition Editor preview reflect canvas mutations, make the preview configuration accurately represent viewer themes, and repair authoring/persistence failures before changing lower-priority presentation details.

This plan covers:

- P0: preview does not react when a canvas is added.
- P0: replace preview-panel “Preset” terminology/behaviour with “Themes”.
- P0: do not offer inappropriate “Apply defaults” for a splash canvas.
- P0: remove forced “New step”, preserve an intentionally empty label, and parse optional headings safely.
- P0: repair the tour-step `+ IIIF image` insertion path.
- P1: prevent the exhibition modal from entering a no-selection state.

The viewer-required-statement and attribution work belongs to the viewer P0–P1 plan. Browser-history work belongs to the Browser P0–P1 plan.

## Existing work to reuse

- The iframe bridge is already in `components/ExhibitionPreviewPanel.tsx`; `createIframeVaultBridge` is the single synchronization boundary.
- Theme persistence already uses the manifest theme service in `left-panels/ExhibitionTheme.tsx` and `theme/theme-service.ts`.
- Template/format selection has a typed shell contract in `exhibition-onboarding.tsx`, `helpers/exhibition-template.ts`, and the shell onboarding tests.
- Tour text already has one parser/serializer in `components/tour-step-html.ts`; both normal and painting tour forms consume it.

Do not create a second bridge, theme field, tour-text format, or Browser history key.

## Work items

### 1. Synchronize structural canvas additions into the remote preview

**Owned areas:** `components/ExhibitionPreviewPanel.tsx`, the smallest required `packages/shell/src/PreviewVault/*` bridge helper, and a focused bridge/preview test.

1. Reproduce the failure by adding a canvas while the remote preview is connected, then inspect the iframe bridge's vault event and entity graph updates. Check both an appended canvas and a newly selected canvas.
2. Keep one bridge for the current root resource. If a root-resource identity change or bridge subscription gap is the cause, reconnect/update that bridge after the structural mutation; do not reload the iframe or poll it.
3. Keep selection messages independent of vault synchronization: an added canvas must appear even when `focusSelectedCanvas={false}` in the remote preview panel.
4. Add a regression that starts from a manifest, connects the bridge, adds an item/canvas, and proves the receiving vault sees the new item. Add a component-level assertion that the iframe is not recreated solely for the mutation.

**Acceptance:** adding, moving, or deleting a canvas updates the currently connected preview without manually reopening Preview, while the existing selected-canvas focus behaviour continues to work.

### 2. Make viewer themes first-class in the preview panel
3.
(removed - skip)

**Acceptance:** users see Theme choices, only supported visual themes appear, format remains a separate choice, and no theme change loses unrelated format settings or writes a non-IIIF side channel.

### 3. Make “Apply defaults” splash-aware and idempotent

**Owned areas:** `components/ExhibitionItemConversion.tsx`, its parent/eligibility call site, and a narrow helper test.

1. Trace the condition that renders `ExhibitionItemConversion`; extract a tiny pure `needsExhibitionDefaults(canvas)` predicate if there is not already a shared equivalent.
2. Treat an existing `splash` behaviour as an exhibition-specific configuration, so that canvas does not show the conversion prompt merely because it lacks grid width/height behaviours.
3. When applying defaults to a normal canvas, build a new behaviour array instead of mutating the current one. Preserve unrelated behaviours, prevent duplicate `w-*`/`h-*` entries, and retain a pre-existing splash behaviour if the action is reachable through an edge path.
4. Preserve the current summary convention: seed it only when empty, and never replace non-empty HTML or multilingual values.

**Acceptance:** an opening splash does not invite an irrelevant conversion; a normal imported canvas receives one valid default layout; repeated clicks are a no-op; export/reload retains all non-layout behaviours.

### 4. Store tour headings only when authors supply one

**Owned areas:** `components/tour-step-html.ts`, `TourStepHtmlForm.tsx`, `PendingTourStepAnnotation.tsx`, `TourNormalAnnotationEditor.tsx`, `TourPaintingAnnotationEditor.tsx`, and tour-step tests.

1. Change the parser result to distinguish no heading from an empty heading. Parse a leading heading only when it is a top-level first meaningful element; preserve later headings and all other HTML as summary content.
2. Change serialization so a non-empty label emits an escaped `<h2>`, while an empty label emits summary HTML without a heading. The default description remains a creation-time aid, not a save-time fallback.
3. Stop initialising new normal tour annotations with `DEFAULT_TOUR_STEP_HTML`/`New step`. Use an optional label and the existing description field instead. Preserve the requested default only where a distinct creation flow explicitly needs it and test that behaviour.
4. Make the two editing directions equivalent: a normal textual body may have or omit a leading `<h2>`; a painting annotation may have an empty `label` and an HTML `summary`. Empty values must survive save, reopen, navigation, and full vault rehydration.
5. Strengthen sanitisation as part of the single serializer: do not use regex stripping as the primary browser path, retain allowed summary HTML, and keep the server/no-DOM fallback conservative.

**Acceptance:** no newly created step is forced to display “New step”; clearing a label persists; existing heading-bearing bodies still render correctly; heading-free bodies round-trip byte-for-byte in meaning; later `<h2>` content is not accidentally promoted to a label.

### 5. Repair `+ IIIF image` in tour summaries

**Owned areas:** `packages/components/src/MDXEditor.tsx`, `HTMLEditor.tsx`, `right-panels/summary-html.ts`, `html-editor-conversion.ts`, and the focused HTML/tour tests.

1. Reproduce insertion in both a normal textual-body tour step and a painting annotation summary. Cover open -> Back/Escape, valid insertion, and reopen/save.
2. Keep the existing `iiifBrowserPlugin` and `InsertIIIFBrowser`; diagnose the failure at the shared HTML boundary rather than adding another plugin or Browser instance.
3. Permit the plugin's safe `data-iiif-image` marker on `img` in the summary sanitizer, while retaining the existing `src` protocol checks and allowed attributes. Make the fallback sanitizer enforce the same rule.
4. Verify HTML -> Markdown -> HTML preserves the generated image, escaped alternative text, image URL, and marker. Cancel must not dispatch a manifest update; successful insertion must dispatch exactly one.
5. The modal flow relies on Browser selection. Run this only after the upstream D1 selection regression is fixed or record D1 as the sole blocked verification, not as an editor workaround.

**Acceptance:** the toolbar action inserts one persisted IIIF image in either tour form; reopening shows it; cancellation is non-destructive; normal image/link sanitisation remains intact.

### 6. Never leave the exhibition modal without a valid selection

**Owned areas:** `exhibition-onboarding.tsx`, `helpers/exhibition-template.ts`, and `packages/shell/src/PresetOnboarding/*` only if the generic selection contract is faulty.

1. Reproduce opening and dismissing the exhibition-format modal without choosing a card, including a previously selected template that becomes unavailable after filtering.
2. Resolve a selected template in one place: use the manifest's current template when valid, otherwise the first permitted template, otherwise render a recoverable empty state with no Start/Apply action. Do not allow a null selection into code that expects a format.
3. Make click and keyboard card activation use the same selection/close sequence. Dismissing without a click must retain or establish the resolved fallback rather than creating a “funky” partially open editor state.
4. Extend the existing onboarding/template tests for no selection, filtered-out selection, Escape/dismiss, pointer selection, and keyboard selection.

**Acceptance:** every supported modal exit leaves a deterministic selected format or an explicit recoverable no-template state; creators and preview never receive an undefined format.

## Verification order

1. Run the focused parser, theme-service, onboarding, and preview-bridge tests plus targeted typechecks.
2. At the existing port 3000 server, create a disposable exhibition: add a canvas while Preview is open; set a theme; inspect the exported theme service; exercise splash/default eligibility; create/edit/reopen normal and painting tour steps.
3. After D1 is fixed, repeat the IIIF-image cancellation and insertion flows and inspect exported Presentation 3 JSON.

Do not build packages or start, stop, or kill the development server.
