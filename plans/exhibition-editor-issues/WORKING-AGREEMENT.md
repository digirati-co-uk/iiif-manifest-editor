# Working agreement for every task

## Before editing

- Read the task and the phase `README.md` completely.
- Run `git status --short`. Existing changes belong to someone else unless the task explicitly says otherwise.
- Record the phase-start commit. Use a dedicated branch/worktree so parallel owners do not write to the same checkout.
- Reproduce the issue or prove the missing contract before changing code. If the report is already fixed, add the smallest regression check and document the verified behavior instead of rewriting it.
- Follow the existing code path end to end. Prefer one shared root-cause fix over several view-specific guards.

## Scope and coordination

- Treat the task's “Owned files/areas” as the expected boundary. A nearby test or export file is fine; a change in another task's owned area requires coordination at the phase review.
- Do not refactor unrelated code, rename public APIs casually, or add a dependency unless the task requires it.
- Preserve IIIF data on round-trip. Never silently remove existing behaviors, selectors, metadata, history, or annotations.
- Keep core behavior opt-in when the requirement is exhibition-specific. Core is stable; do not encode exhibition names into generic packages.

## Testing

- The development server is already running at `http://localhost:3000`. Do not start, stop, kill, or rebuild it.
- Use the task's focused unit tests and package typecheck where practical. Do not run `pnpm build` or any package build.
- Run the named browser scenario in the current phase using a disposable import of the supplied manifests.
- Check normal, empty, and failure states relevant to the change. Use keyboard interaction for menus, dialogs, and reorder controls where applicable.
- Inspect exported Presentation 3 JSON when a task mutates manifest data; visual success alone is not persistence.

## Commits

- Commit after a coherent slice is understood and its focused checks pass. Do not wait until the whole phase if the task naturally has two independently safe slices.
- Use a narrow message such as `fix(exhibition): preserve browser rotation` or `feat(shell): share creator configuration`.
- Stage explicit files. Check `git diff --cached` before every commit and exclude unrelated or pre-existing changes.
- Do not amend or rewrite another owner's commits. Do not merge the phase yourself unless you are the phase integrator.
- In the task handoff, list commits, checks run, browser scenarios run, known limitations, and any follow-up for the review gate.

## Definition of done

- Acceptance criteria in the task are met.
- Focused automated checks pass or a concrete pre-existing failure is recorded.
- The `localhost:3000` scenario is exercised when the task has a UI surface.
- No unrelated file is changed.
- Changes are committed once the owner is confident.
- The owner supplies enough evidence for the phase reviewer to retest without rediscovery.
