# Shared property editors and forms

Status: Pending consumer integration. Module: [`packages/editors`](../../../../packages/editors).

Migrate property editing end to end, including content-language controls and dependency accessibility text.

## Prerequisites

- [Shell configuration and definition integration](06-shell.md).

Namespace ownership: **editors and common**. [Source inventory](../inventories/07-editors.md)

## Files and surfaces to inspect

- `packages/editors/src/definitions/DescriptiveProperties`
- `packages/editors/src/definitions/Metadata`
- `packages/editors/src/components/TiptapLanguageFieldEditor`
- `packages/editors/src/components/CanvasCaptions`
- `packages/editors/src/form-elements`
- `packages/editors/src/components/CanvasLayout`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Start with DescriptiveProperties and Metadata: resolve field messages, validation, confirmations, empty states and add/remove actions while preserving IIIF language-map values.

2. Replace English plural suffix concatenation and fragment-built messages with whole plural/interpolated messages. Name placeholders after their domain meaning, not expression1.

3. Localise rich/plain text editor toolbars and the destructive-formatting confirmation. Preserve ProseMirror/Tiptap state and in-progress text when the UI selection changes.

4. Translate calendar/clock labels and provide dependency locale configuration; use UI locale for date display while keeping stored navDate values unchanged.

5. Replace hardcoded English language display names where appropriate with locale-aware DisplayNames and curated fallbacks. Keep content-language lists and selection independent of UI locale availability.

6. Migrate technical/linking/structural/choice/media/annotation forms in file-sized batches from the inventory; validate shared-definition references from editor-api.

7. Run pseudo-locale/RTL and accessible-name checks for long forms, portals and validation errors.

## Acceptance checks

- [ ] A form edits Welsh content under an English/French interface without modifying language tags.
- [ ] Changing profile changes Label to Title where intended, without changing field IDs or serialization.
- [ ] A focused rich-text field survives locale switching with unsaved content and selection intact.
- [ ] Date-picker accessible names and validation are localised.

## Boundaries

IIIF InternationalString is authored data, even when it resembles a UI catalog.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.
