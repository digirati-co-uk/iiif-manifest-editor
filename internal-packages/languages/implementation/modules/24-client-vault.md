# Client vault language boundary

Status: **Language-neutral source and caller review complete; integrated UI acceptance pending with host owners.** Reviewed 28 October 2026 against foundation `288a0405b96989f88a42055f9ef00fb9ac0683f5` and checkout `97a816dd`.

Module: [`packages/client-vault`](../../../../packages/client-vault). Namespace ownership: **none**. [Source inventory](../inventories/24-client-vault.md).

## Completed scope and decision

Reviewed all five source files, the public exports, README, package manifest, TypeScript configuration and tsdown configuration. No source/API/dependency changes are needed for localisation. This package contains no components, labels, display fallbacks, message descriptors or locale settings. Zero new message keys means no English/Dutch catalogs or wording-profile overlays are required here. This does not establish Dutch coverage for its hosts.

The [public runtime](01-public-runtime.md) is a prerequisite for host presentation, not for this completed transport classification. Do not add React, i18next, `@manifest-editor/i18n` or private catalog dependencies to manufacture a UI contract.

## Source evidence and exempted strings

- [`src/index.ts`](../../../../packages/client-vault/src/index.ts) exports `ClientVault`, `MessagePortClientVault`, protocol types and `createClientVault`. The factory waits for readiness and returns the vault; it does not format or display failures. `RemoteClientVault` is the internal base, not an explicit public entry-point export.
- [`src/client-vault.ts`](../../../../packages/client-vault/src/client-vault.ts) forwards WebSocket messages to the base handler and sends strings unchanged. Open requests initial state; close clears readiness. Browser WebSocket construction/send failures remain native exceptions. The existing `onopen` plus `addEventListener("open", ...)` registration is unchanged; this localisation review does not alter connection lifecycle.
- [`src/message-port-client-vault.ts`](../../../../packages/client-vault/src/message-port-client-vault.ts) starts the port and requests initial state. It forwards received data unchanged; `messageerror` clears readiness. `destroy()` removes listeners, clears readiness and closes the port. There is no worker-specific translation path or display string; retain MessagePort/worker-compatible data transport.
- [`src/protocol.ts`](../../../../packages/client-vault/src/protocol.ts) describes wire envelopes, not messages for people. Preserve `_type`, `_id`, `_lastActionId`, `action`, `data`, all discriminants (`init-request`, `init-response`, `vault-action`, `vault-action-confirmation`, `vault-action-rejection`, `empty-vault-response`) and the `@genesis` chain sentinel in the base class. Identifiers and the rejection/confirmation `action` string are opaque protocol data, never translation keys.
- [`src/remote-client-vault.ts`](../../../../packages/client-vault/src/remote-client-vault.ts) owns the sole heuristic inventory candidate, `Error("Vault not yet ready")` in `dispatch`. It is a developer/operational guard, not directly displayed by this package. The resetting branch queues first, so initial loading and rejection recovery normally queue actions rather than throw. After close on an already initialised vault, `isReady` is false while `isResetting` can remain false, allowing this guard to throw. Preserve its exact message, error class and synchronous behavior for compatibility. No repository caller was found translating or directly rendering this specific exception. No public code/context addition is justified by a demonstrated UI consumer.

## Readiness, rejection and data contracts

`waitUntilReady()` polls every 100 ms, resolves when ready, and has no timeout, cancellation or rejection path. Transport close only sets `isReady = false`; it does not reject a waiting promise or surface a reason. `empty-vault-response` only sets `isEmpty`, without making the vault ready. Hosts must not assume these paths already provide a translatable error result.

Parsing accepts JSON strings, Blob text and non-null objects; falsy/unsupported input is ignored. JSON parse, inherited Vault operations and native send/postMessage errors are not converted into localised messages. Async handler failures are not caught by these adapters; MessagePort invokes the async handler with `void`. A loading-promise catch is therefore not a catch for all transport failures.

An init response installs the supplied store, clears resetting, marks ready and dispatches queued actions. Remote actions use the inherited dispatch and update `lastActionId`. Confirmation deletes a matching pending entry. Rejection requests initial state, marks resetting/not-ready, queues pending work and clears pending tracking; it is a resynchronisation instruction with no human-readable reason. The current code can queue the rejected action both explicitly and through the pending-order slice. The WebSocket server also sends a fresh envelope `_id` with the original action ID in `action`, whereas the client matches pending work by `_id`; the shell bridge uses the incoming action ID as `_id`. These existing recovery/correlation behaviors warrant a separate transport review, not a localisation change or an unverified assertion of successful recovery.

Local dispatch wraps the original action with generated IDs and chain state, applies it optimistically, records pending order and serialises it. This review leaves order, queue/replay semantics, caches, inherited editing/undo behavior, errors and wire format untouched. Initial IIIF stores, InternationalString maps, resource IDs and action payloads remain authored data. No UI locale, wording profile or content-language selection is read, added to cache keys, persisted or transmitted by this package.

## Presentation owners and exact follow-ups

Reviewed repository imports/re-exports and these significant callers:

- **Projects:** [`storage/WebsocketLoader.ts`](../../../../packages/projects/src/storage/WebsocketLoader.ts) constructs `ClientVault` and returns `waitUntilReady()`. Its unsupported create/delete/getStorage errors belong to projects, not client-vault. [`useProjectLoader`](../../../../packages/projects/src/ProjectContext.hooks.ts) catches loader-promise errors into raw `e.message`; [`ProjectProvider`](../../../../packages/projects/src/ProjectContext.internal.tsx) exposes this through `ProjectLoadingReactContext` and renders its own `Loading...`. No in-repository `useProjectLoading` consumer rendering that error was found. Projects owns any translated loading/failure presentation and should retain structured failure information if such a UI is added. A transport close currently cannot reach that promise catch as a rejection.
- **Shell:** [`src/index.ts`](../../../../packages/shell/src/index.ts) re-exports `MessagePortClientVault`, `RemoteVaultAction` and `RemoteVaultClientMessage` (not the WebSocket factory). [`createIframeVaultBridge`](../../../../packages/shell/src/PreviewVault/vault-message-bridge.ts) sends initial stores and mirrored actions; it deliberately rejects preview mutations without human-facing text. Keep this read-only protocol behavior. Shell owns any future preview connection/action notification, resolved using the host editor instance. Its separate [`create-preview-vault.ts`](../../../../packages/shell/src/PreviewVault/create-preview-vault.ts) creates `label: { en: ["Recent items"] }` in IIIF content; this is outside client-vault and must not be rewritten on UI locale changes.
- **Web:** [`IframePreviewRoute.tsx`](../../../../apps/web/src/components/iframe-preview/IframePreviewRoute.tsx) creates/destroys the MessagePort adapter and passes it to `VaultProvider`. Web owns the four actual UI messages: `Waiting for preview connection...`, `Iframe preview supports manifests.`, `Loading manifest...`, and `No canvas available.` Translate whole messages with real Dutch in that module. The route sets a connection before vault readiness and has no explicit disconnect/rejection UI. It must own any added failure feedback and preview locale/profile policy without deriving locale from the manifest's content languages or remounting editing state solely for a locale switch.
- **Server counterpart:** [`server-vault.ts`](../../../../packages/server-vault/src/server-vault.ts) sends state/action envelopes and confirmation/rejection IDs, not translated reasons. See [server-vault review](25-server-vault.md). Do not change protocol discriminants or invent translated transport strings to cover host UI gaps.

If a host later requires a stable public error code/context, coordinate an additive compatibility design with that consumer and transport owners. Preserve existing `Error.message` and rejection behavior; do not infer a code by translating or matching arbitrary native exception text. Connection timeout/cancellation, malformed-message recovery and replay/correlation fixes are separate transport work.

## Acceptance evidence and validation

- [x] Entire module and important presentation callers reviewed; the inventory's single candidate is classified above, without modifying generated inventories.
- [x] Source inspection confirms no locale/profile/configuration path into persisted stores, cache keys, identifiers or wire messages. This commit changes only this guide; authored data and all executable behavior are unchanged.
- [x] User-facing text has concrete projects/shell/web ownership; no directly rendered client-vault text requires a catalog or new public error contract.
- [ ] Integrated load/mutation/export comparison across UI locales, unsaved-state/undo preservation and host error presentation remain with parent/host owners. Source review and an unchanged implementation are not a claim that these browser checks passed.

Actual checks from repository root on Node `v24.21.0`:

- `pnpm install --ignore-scripts --frozen-lockfile` failed with `ERR_PNPM_OUTDATED_LOCKFILE`: the foundation's `internal-packages/languages/package.json` adds `typescript@catalog:` absent from the lockfile. No lifecycle scripts ran; manifests/lockfile were not changed.
- Used existing installed binaries at `/Users/stephen/.t3/worktrees/iiif-manifest-editor/t3-4ab5a019/node_modules/.bin/` because this checkout has no installed dependencies.
- `oxlint packages/client-vault/src packages/client-vault/tsdown.config.ts --deny-warnings` **passed**.
- `tsc --noEmit --project packages/client-vault/tsconfig.json` **blocked/failed** by unresolved `@iiif/helpers/vault`, `@iiif/helpers/vault/actions`, `@repo/typescript-config/library.json` and `tsdown`, with consequent missing-base-type/implicit-any diagnostics. This is not a successful typecheck or evidence of a new code regression.
- `oxfmt --check internal-packages/languages/implementation/modules/24-client-vault.md` and `git diff --check` **passed**.
- No new tests that mirror unchanged code were added. Existing `packages/shell/src/PreviewVault/vault-message-bridge.test.ts` was inspected: it checks mirroring additions/reorders/deletions into a plain Vault, not client readiness/rejection or locale invariance; it was not run as proof of those contracts.
- The first commit attempt invoked the pre-commit `pnpm lint:staged` hook, whose pnpm invocation started an automatic install. Stopped that install and commit; used `git -c core.hooksPath=/dev/null commit` for this documentation-only change. No tracked install changes were present.
- No build, dev server operation, browser/E2E run, generated `next-env.d.ts`, shared catalog/index/inventory edit or dependency/lockfile edit was performed. Parent owns integrated browser tests; an existing server requires `E2E_TARGET=watch`.

Self-review: checked the complete guide diff against all source files and traced callers. The module handoff is a documentation-only boundary decision, with no runtime or public declaration changes. The unchecked integrated acceptance gate and host/transport follow-ups above remain explicit.

Parent integration review: the source/caller classification was checked independently, and `tsc --noEmit -p packages/client-vault/tsconfig.json` passed in the primary checkout with normal workspace dependency resolution. This closes the isolated-checkout typecheck limitation; integrated UI locale/state checks still belong to the host acceptance matrix.
