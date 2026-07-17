# D1 Intermittent IIIF Browser Select availability

## Why deferred

The reported “No options available”/missing Select action is intermittent and appears sensitive to navigation and network conditions. Implementing against a single successful localhost run risks masking an upstream Browser race with editor-specific state.

This needs a short human-assisted reproduction session or a deterministic failing Browser test before it enters a parallel implementation phase.

## Reported reproduction

- Open `https://iiif.library.leeds.ac.uk/presentation/cc/bvfhzdgw` in the IIIF Browser.
- Tick or open a canvas.
- Sometimes Select is absent and “No options available” is shown.
- Navigate to the next canvas and back; Select may then appear.

## Investigation plan

1. Reproduce on reliable and throttled/offline-flapping network profiles while recording Browser state changes.
2. Capture the manifest/canvas load result, selected ids, creator option calculation, and React errors when the action is absent.
3. Repeat in `/Users/stephen/github.com/digirati-co-uk/iiif-browser` at commit c69b412 to determine whether the host editor is involved.
4. Add a deterministic upstream test for delayed canvas/resource loading and direct canvas navigation.
5. Decide ownership:
   - Browser fix if option calculation does not rerun after async resource load.
   - Editor adapter fix if stable Browser output/options are filtered incorrectly.
   - User-facing retry/error state if the manifest request genuinely fails.
6. Promote the fix into a future phase with explicit file ownership and acceptance tests.

## Evidence needed to promote

- A saved trace or minimal automated reproduction.
- Exact ownership boundary (Browser versus editor adapter).
- Expected UI for loading, no selectable content, and network error as three distinct states.

## Acceptance criteria for the future task

- Select appears as soon as the active canvas is selectable without navigating away and back.
- Loading and network failure do not masquerade as “No options available.”
- Direct canvas navigation, ticking from the list, and next/back navigation behave identically.
