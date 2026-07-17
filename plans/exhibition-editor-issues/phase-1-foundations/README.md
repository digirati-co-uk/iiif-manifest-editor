# Phase 1 — Foundations

Run all four tasks in parallel from the same phase-start commit.

| Task                                                                                 | Primary ownership                                        | Depends on |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------- | ---------- |
| [1.1 Preview and template extension API](./01-preview-and-template-extension-api.md) | Shell preview/preset types and exhibition onboarding     | None       |
| [1.2 IIIF Browser upgrade](./02-iiif-browser-upgrade.md)                             | Workspace dependency, IIIF Browser creator shell, styles | None       |
| [1.3 Shared creator configuration](./03-shared-creator-configuration.md)             | Creator API/runtime and creator settings UI              | None       |
| [1.4 Creator completion and selection](./04-creator-completion-selection.md)         | Generic creator completion flow and focused tests        | None       |

Expected parallel conflicts are limited to package lockfile integration. Task 1.2 owns the IIIF Browser lockfile update. Other tasks should not run a general install.

When all task branches are ready, merge them and complete [REVIEW.md](./REVIEW.md). Do not begin Phase 2 before that review passes.
