# D1 IIIF Browser canvas selection — upstream fix handoff

## Status

The failure is deterministic in local IIIF Browser commit `c69b412`. It is not caused by the Leeds service, network timing, the manifest-editor adapter, or the canvas checkbox. Directly checking a canvas in the manifest grid works; navigating into that canvas selects it briefly and then replaces it with its parent Manifest.

This remains deferred only because this repository needs a newly published Browser version before the Phase 1 acceptance matrix can be rerun.

## Reproduction and event trace

1. Run the IIIF Browser demo at `c69b412` with output actions enabled.
2. Open `https://iiif.library.leeds.ac.uk/presentation/cc/bvfhzdgw`.
3. Click the first canvas row to navigate into the Canvas view.
4. Observe that the URL and content show the Canvas while the footer's selected resource is the parent Manifest.

The emitter sequence is:

1. `manifest.change` -> `resource.change` selects the parent Manifest.
2. `canvas.change` selects the requested Canvas.
3. A second `manifest.change` -> `resource.change` selects the parent Manifest again.

In the exhibition host, Manifest output is disabled, so that final selection produces “No actions available.” Navigating next/back can take a different cached route whose final event is the Canvas, which explains the originally intermittent appearance.

## Root cause

In `/Users/stephen/github.com/digirati-co-uk/iiif-browser/src/stores/browser-store.ts`, the cached-parent branch of `resolve(canvasId, { parent: manifestId })` loads `fullResource` as the parent Manifest, pushes Canvas history, and then calls:

```ts
browserSuccess(url, fullResource, viewSource, parent);
```

The adjacent comment says success is for the Canvas, but `fullResource` is the Manifest. `history.push(...)` has already emitted the correct Canvas event. Passing the Manifest into `browserSuccess()` emits the late duplicate Manifest/resource change.

The overwrite is visible in `/Users/stephen/github.com/digirati-co-uk/iiif-browser/src/stores/output-store.ts`: `canvas.change` selects the Canvas, while the later generic `resource.change` replaces it with the Manifest.

## Upstream fix brief

1. Correct the cached-parent Canvas resolution branch so it does not pass the parent Manifest as the successful Canvas resource.
2. Prefer the smallest correction consistent with Browser cache semantics: either pass the actual Canvas or let `browserSuccess(url)` mark loading complete without emitting a duplicate resource change after `history.push`.
3. Do not add a timeout, retry, host-specific filter, or network workaround.
4. Add a Browser-level regression using one emitter for the browser and output stores: seed a loaded parent Manifest containing a Canvas, resolve the Canvas with `{ parent }`, and assert the final/default selected resource is that Canvas and its Canvas action is available.
5. Keep a direct manifest-grid checkbox assertion so the working multi-select path does not regress.

## Promotion gate

- The upstream regression passes and a new IIIF Browser package/version is supplied.
- Install that version in this repository and reload the existing development server through the normal human-owned workflow.
- Rerun the Phase 1 selection matrix: direct Canvas navigation, checkbox selection, next/back, crop, rotation, multi-select, narrow layout, and both supplied manifests.
- Accept Phase 1 only after those checks pass.
