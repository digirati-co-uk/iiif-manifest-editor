# Phase 1 integration review

Run this review after tasks 1.1–1.4 are individually complete and committed. Use a clean integration branch based on the Phase 1 starting commit.

## Merge preparation

1. Confirm each task branch contains only its declared ownership area or clearly documented coordinated changes.
2. Preserve the pre-existing local changes listed in the program README; never discard or absorb them accidentally.
3. Merge task commits one at a time. Resolve integration changes deliberately and commit the resolution once the combined checks pass.
4. Inspect `git diff --check`, the dependency/lockfile diff, and `git status --short` before testing.

## Automated review

- Run the focused tests named by all four task briefs.
- Run targeted typechecks for shell, exhibition preset, and creator packages touched by the merge.
- Confirm the Browser dependency resolves to c69b412 and only the required base/MDX style entry points are imported.
- Confirm existing creator settings without `configKey` still resolve by creator id.
- Do not build packages and do not start, stop, or kill the development server.

Record commands and outcomes in the integration commit/PR notes.

## Browser review at localhost:3000

Use both sample manifests from the program README.

1. Open Preview with and without an external preview-service configuration.
2. Verify custom preview actions, filtered template lists, “Change exhibition format,” and the current-format affordance with mouse and keyboard.
3. Open the updated IIIF Browser; check its layout, buttons, dialogs, and any host CSS collisions at narrow and desktop widths.
4. Verify a forked creator shares settings through `configKey` while unrelated creators remain independent.
5. Add a blank slide through every visible entry point and confirm it is selected.
6. Use “Add media” from a populated slide and confirm the result returns to Edit without auto-opening annotation editing.
7. Reload after each creator flow to ensure selection behaviour is not dependent on transient state.

## Regression review

- Normal service-backed Preview still opens the configured viewer.
- Onboarding and Preview expose the same permitted formats.
- A filtered-out current template has a deterministic fallback and cannot be selected through a stale menu.
- Browser history/settings survive the package upgrade.
- Core creator completion retains its previous default when `skipEditingOnCreate` is not requested.

## Phase decision

- [ ] All four task commits are present and focused.
- [ ] Automated checks pass, or every pre-existing failure is recorded with evidence.
- [ ] Both manifests pass the browser matrix.
- [ ] Accessibility/keyboard paths were checked for the changed menus and Browser.
- [ ] Integration fixes are committed after review.
- [ ] The accepted integration commit is recorded in the Phase 2 kickoff.

If any item fails, fix it within the owning Phase 1 task and repeat this review. Do not carry known Phase 1 breakage into Phase 2.
