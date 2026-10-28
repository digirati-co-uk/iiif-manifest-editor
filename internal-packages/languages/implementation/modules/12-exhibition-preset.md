# Exhibition presets and terminology

Status: Pending consumer integration. Module: [`presets/exhibition-preset`](../../../../presets/exhibition-preset).

Localise slideshow/scrolling exhibitions with deliberate slide and tour terminology.

## Prerequisites

- [Manifest preset workflows](10-manifest-preset.md).

Namespace ownership: **exhibition plus editors overlays**. [Source inventory](../inventories/12-exhibition-preset.md)

## Files and surfaces to inspect

- `presets/exhibition-preset/src/presets`
- `presets/exhibition-preset/src/exhibition-onboarding.tsx`
- `presets/exhibition-preset/src/left-panels`
- `presets/exhibition-preset/src/right-panels`
- `presets/exhibition-preset/src/center-panels`
- `presets/exhibition-preset/src/canvas-editors`
- `presets/exhibition-preset/src/creators`
- `presets/exhibition-preset/src/notebook-config.ts`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Declare each exhibition preset's inherited required namespaces, policy and overlay IDs, including the parent manifest preset's enabled plugins.

2. Convert static template/onboarding/notebook/preview metadata to deferred references and migrate theme, slideshow, image, crop, behaviour and tour-step panels.

3. Use exhibition messages for genuinely different actions; use the editors overlay only for shared canvas actions whose UI meaning is Slide.

4. Populate the plain-profile intersection so inherited shared messages use Slide rather than accidentally falling back to Page. Rewrite whole explanations for simplified terminology.

5. Preserve exhibition template labels stored as authored content, theme tokens, layout/configuration IDs, HTML structure and export behaviour.

6. Review video/YouTube/editor dependencies, ratio warnings, rich message fragments and iframe/preview language configuration.

## Acceptance checks

- [ ] Slideshow and scrolling presets both pass their own required-namespace coverage.
- [ ] Standard/plain profiles retain Slide terminology where intended and changes affect confirmations/ARIA too.
- [ ] Theme values, tour targets, crop coordinates and generated exhibition data are identical after a UI switch.

## Boundaries

A blanket Canvas-to-Slide substitution changes semantics in technical controls; review each action.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
