# 1.1 Preview and template extension API

## Objective

Let a host render a useful Preview button without configuring an external manifest-preview service, let it supply extra preview actions with click handlers, and let it replace or filter the exhibition template list. Align exhibition copy and show which template is current.

## Why this is one task

The preview menu and onboarding both consume `MappedApp.preset`. Designing these independently would create two competing host APIs and duplicate template filtering in the exhibition preset.

## Owned files/areas

- `packages/shell/src/AppContext/AppContext.tsx`
- `packages/shell/src/PresetOnboarding/PresetOnboarding.tsx`
- `packages/shell/src/PreviewButton/PreviewButton.tsx`
- `packages/shell/src/PreviewContext/*` only if the existing actions cannot express the result
- `packages/shell/src/helpers.ts` and preset tests
- `presets/exhibition-preset/src/exhibition-onboarding.tsx`
- The host composition in `apps/web/src/components/exhibition-editor/ExhibitionEditor.tsx` only for an example/verification of the public API

Do not add a Leeds-specific conditional to generic shell code.

## Proposed smallest contract

1. Resolve the template list once at app composition time. Support an explicit list and a predicate/filter without teaching onboarding about client names.
2. Keep `PresetOnboarding` and `usePresetTemplateSelection()` on the same resolved list so a hidden template cannot remain selectable.
3. Extend the preset preview-button render context with optional host actions, or add a small generic preview-button option type. Each custom action needs a stable id, label, optional status/disabled state, and `onClick`; do not force it through `PreviewHandler` when it does not create a preview service.
4. Permit a main Preview action even when `external-manifest-preview` configs are absent. The action may open an internal panel, switch preset UI, or invoke a host handler.
5. Preserve the current service-backed behavior by default.

Names above are guidance, not a demand for new abstractions. Reuse `PresetDefinition`, `PresetPreviewButtonRenderContext`, and `renderPreviewButton` if they cover the contract with fewer changes.

## Implementation steps

1. Add failing shell tests for replacing/filtering templates and for resolving a selected id that becomes hidden.
2. Add a focused component/helper test for zero external preview configs plus a custom main action. Confirm no “Preview not available” dead end is rendered when the custom action exists.
3. Implement the smallest typed host contract and document it with an inline example.
4. Update exhibition onboarding and the preview menu to consume only the passed/resolved templates; remove direct dependence on the module-level `exhibitionTemplates` from menu filtering where that bypasses host customization.
5. Rename “Change preset” to “Change exhibition format,” including the onboarding hint.
6. Keep the current template in the list and give it a clear current/selected affordance (`aria-current`, checked/selected status, or equivalent). Selecting the already-current template should still open its preview rather than mutate the manifest.
7. Verify the normal web host can pass a reduced Leeds-only list without forking the preset.

## Automated checks

- Extend `packages/shell/src/__tests__/preset-onboarding.test.ts` for list replacement/filtering and selected-template fallback.
- Add the narrowest feasible preview-menu test for custom actions and no external service.
- Run `pnpm --filter @manifest-editor/shell typecheck`.
- Run only the shell tests touched by this task; do not build packages.

## Browser checks at localhost:3000

1. Import the Leeds test manifest and open the exhibition editor.
2. Open the Preview dropdown. Confirm “Change exhibition format” is shown and the current “Slideshow” or scroll template is visibly identified while remaining available.
3. Exercise a host configuration with no external preview-service application: the Preview main action and exhibition-format switching must still work.
4. Exercise a Leeds-only template filter: Delft templates are absent from onboarding and Preview; Leeds templates remain.
5. Add one custom host action and confirm its click handler fires once and does not create/delete preview-service state.
6. Keyboard-open the menu and activate the custom and format actions.

## Acceptance criteria

- Absence of an external preview service does not disable all preview/preset functionality.
- Hosts can supply custom preview menu actions without implementing a preview handler.
- Hosts can replace or filter templates through a generic typed API.
- Onboarding, selected-template resolution, behavior updates, and preview menu all use the same resolved templates.
- The menu says “Change exhibition format.”
- The active template appears and is identified as current.
- Existing service-backed Preview behavior remains unchanged when no new options are passed.

## Commit guidance

Good slices are `feat(shell): allow host preview and template options` followed by `fix(exhibition): clarify current exhibition format`. Commit each only after its focused checks pass and keep unrelated exhibition creator changes unstaged.
