# Variations Timeliner

An optional manifest-preset plugin using Vault as its document state and the Manifest
Editor APIs for descriptive editing and standard editor navigation.

The layout and bubble curve draw on https://github.com/IUBLibTech/timeliner.
Reference revision: `3b010235d6619b06398a23c959551f1cb8244037` (upstream main).
The upstream MIT notice is retained in NOTICE. The integration intentionally reuses
Manifest Editor controls and the existing A/V canvas and temporal selector helpers,
rather than bringing in Timeliner's Redux, persistence, Material UI, and application shell.

`model.ts` projects the IIIF hierarchy, derives group extents, and implements synchronous
batched edits. It reads fragment references after Vault normalization, guards recursive
range cycles, keeps grouping within contiguous siblings, and preserves additional targets
by restricting split and boundary operations to simple leaves. Markers use Timeliner's
PointSelector annotation representation.

Verification: run the manifest-preset Vitest config for `model.test.ts` and
`test/variations-timeliner.test.tsx`. These exercise real Vault normalization,
serialization, nested editing, markers, shared boundaries, and React plugin integration.

## Panels

- `SectionsSidebar` (left): the nested list of sections, or a prompt to create the first one.
- `VariationsTimeliner` + `BubbleTimeline` + `TransportControls` (centre): the bubble viewport, scrubber,
  transport and details. The SVG is drawn at real pixel size (no `viewBox` scaling) so zooming never
  stretches text. Bubbles, the scrubber rail, the playhead line and the pointer guide all live in one
  `.vt-surface` and use the same `x(time)` mapping (`PAD + t / duration * width`), so they stay aligned
  when zoomed or scrolled. The playhead, thumb and rail fill are positioned imperatively from one
  function, driven by `requestAnimationFrame` during playback rather than 4Hz `timeupdate` events.
- `SectionPanel` (right): the section editor, driven by `useGenericEditor` and the normal
  `LanguageFieldEditor`.
- `TimelinerSync` (background): opens the centre panel with the sidebar, and the section editor
  when a section is selected.

`store.ts` holds the selection, the playhead published by the centre panel, and the preferences that are
persisted to local storage (theme, viewport height, per-canvas zoom, speed, volume, mute, loop;
`themes.ts` adapts the original palettes).

Markers are point-selector annotations kept in a single annotation page: `addMarker` reuses a page that
already has point selectors for the canvas, otherwise creates `<manifest>/markers`, and
`consolidateMarkerPages` merges marker-only pages left by earlier versions. Custom bubble colours are written to the Range's
`metadata` as well as `tl:backgroundColour`, because the IIIF serializer drops unknown Range properties.
