# Phase 1 review result — 17 July 2026

## Decision

The four Phase 1 implementation tasks are integrated on `feature/Q3-2026`.
The host/editor work is ready, but the phase review is not fully green: the
existing IIIF Browser Select-availability problem in
[D1](../deferred/D1-browser-select-availability.md) was reproduced and blocks
the selection-dependent parts of the Browser upgrade acceptance matrix.

Do not treat crop, rotation-control, multi-select, or narrow Browser modal
behaviour as signed off from this review. The dependency, base styling,
navigation, manifest loading, and existing history were verified.

## Integrated commits

- `88cafc54` — update IIIF Browser to `c69b412`
- `87195347` — add shared creator configuration
- `007b89a0` — reuse IIIF Browser creator settings in exhibitions
- `63de11ed` — make creator completion selection explicit
- `18ed599b` — keep exhibition Add media on the current slide
- `618d51ed` — add host preview actions and template filtering/replacement
- `2bd3daad` — clarify and identify the current exhibition format

All commits are focused. The unrelated pre-existing working-tree changes named
in the programme README remain uncommitted and were not absorbed.

## Automated review

Passed:

- 23 focused shell tests:
  - creator completion: 6
  - shared creator configuration: 4
  - preview button: 3
  - preset onboarding: 10
- 5 focused exhibition tests:
  - slideshow creator positioning: 1
  - exhibition template resolution: 4
- `@manifest-editor/creator-api` typecheck
- `@manifest-editor/shell` typecheck
- exhibition preset typecheck in the isolated task worktree
- `git diff --check d25704a6..HEAD`

Recorded unrelated baseline failures in the main working tree:

- Exhibition typecheck reaches the pre-existing untracked
  `image-service-slide-creator.test.ts`; line 57 infers the test service
  `type` as `string`.
- Creators typecheck reaches the unchanged
  `packages/ui/ui/VideoPlayer/VideoPlayer.tsx`; line 35 passes an
  audio-or-video ref where a video ref is required.

No package build was run and the existing development server was not started,
stopped, or killed.

## Browser review

Verified at `localhost:3000` with a disposable exhibition:

- Preview exposes “Change exhibition format.”
- The active format is included and marked “(current).”
- Template selection and the Preview menu use the same allowed formats.
- Keyboard opening of the Preview menu works.
- A newly created blank slide is selected and opens its editor.
- Add media returns to Edit, retains the current slide, and does not
  auto-open annotation editing.
- IIIF Browser `c69b412` opens with its base styling and existing history.
- Direct Leeds manifest navigation, thumbnails, pagination, and history load.
- The editor switches to its narrow responsive layout without CSS overflow.

Not passed:

- On `https://iiif.library.leeds.ac.uk/presentation/cc/bvfhzdgw`, clicking the
  first canvas row, its checkbox, its image, and activating it with the
  keyboard all leave the row unselected and the action area at
  “No actions available.”
- Because selection does not become active, whole-canvas selection, crop,
  rotation controls, and multi-select could not be verified.
- Resizing across the editor breakpoint remounted/closed the open Browser
  modal, so the Browser's narrow-width modal layout was not signed off.

This matches the separately deferred D1 report closely enough that it should be
investigated there with a deterministic Browser-level reproduction rather than
patched in the editor adapter speculatively.

## Phase gate

- [x] All four task implementations are present as focused commits.
- [x] Automated checks pass or unrelated baseline failures are recorded.
- [x] Preview/template, creator configuration, and completion-selection flows
      passed integrated review.
- [ ] IIIF Browser selection-dependent acceptance passes.
- [ ] Both supplied manifests complete the full Browser matrix.
- [ ] Phase 1 is accepted for Phase 2 kickoff.
