# Manifest Editor undo and redo integration plan

**Implementation:** See [Vault history integration](./vault-history.md) for the delivered API, mutation audit, remote protocol and validation boundaries. The sections below preserve the original design plan.

Manifest Editor should use the history engine in the upcoming `@iiif/helpers` 4.0.3 release. ME owns Vault creation policy, user interaction boundaries, UI integration, and network authority. Reducer inversion, conflict lineage, retention, and undo stacks remain in helpers.

Deliver local editor history first, including preview synchronization. Deliver collaborative undo as a separate milestone with authoritative ownership and conflict checks. Keep undo disabled in editable remote clients until that milestone is complete.

## Helpers contract

The local helpers implementation already provides these APIs and behaviours:

| API or behaviour | ME integration consequence |
| --- | --- |
| `new Vault({ history: options })` | Enable history when an owned editing Vault is constructed. An existing Vault cannot be configured through a mutable history option. |
| `vault.undo()`, `vault.redo()` | Use the returned `HistoryResult`; failure leaves the document and stack position unchanged. |
| `vault.history.getState()` and `.subscribe()` | Availability includes conflict checks. Do not derive availability from stack length alone. |
| `vault.interaction(options, scoped => ...)` | Pass the scoped Vault through every participating editor, creator, and side effect. Original Vault references stay independent. |
| `vault.beginInteraction(options)` | Use for event-driven edit sessions; finish the handle on every exit path. Nested interactions through the scope share a group. |
| `finish()` and `cancel()` | Both close the scope and seal applied work. Neither restores previous state. |
| Corrected nested `batch()` | Use for synchronous atomic changes. Reads still see committed state, rather than queued writes. |
| Scoped `asyncBatch()` | Only writes through its callback argument are queued. Use an interaction when later work must read earlier mutations. |
| `subscribeCommits()` | Observe outer batches, direct store dispatches, and undo/redo exactly once. History replay bypasses `Vault.dispatch()` and action-type events. |
| `DispatchOptions` | Preserve `actorId`, `sessionId`, `groupId`, `label`, `history`, and `origin` through adapters. Attribution is not authentication. |
| Loading policy | Ordinary loads are excluded from history. Loads through a recorded interaction are authored work; use an ignored scope for incidental background loading. |
| State replacement | `getStore().setState()` clears history and invalidates open scopes. History is in memory and has no public import/restore API. |

The implementation and its boundaries are documented in [helpers history documentation](/Users/stephen/github.com/iiif-commons/iiif-helpers/docs/vault-history.md), with the public contract in [history types](/Users/stephen/github.com/iiif-commons/iiif-helpers/src/vault/history/types.ts).

## Delivery sequence

| Change | Main packages | Depends on | Completion criterion |
| --- | --- | --- | --- |
| 1. Dependency and history policy | shell, manifest-editor, projects, web | Published helpers artifact | Owned editing Vaults have the agreed policy; initialization creates no undo entry. |
| 2. Commit consumers | shell, web, client-vault | 1 | Previews and persistence receive original edits and replay exactly once. |
| 3. Compound interactions | creator-api, editor-api, editors, presets | 1; 2 before release | Creation and structural commands each undo as one complete operation. |
| 4. Edit sessions and background work | editors, shell, presets, plugins | 3 | Text, gestures, Apply/Discard, and tasks have explicit boundaries and cancellation behaviour. |
| 5. History controls and local release | shell, i18n, manifest-editor, playwright | 2–4 | Local history works across supported entry points and both layouts. |
| 6. Collaborative authority | client-vault, server-vault, projects | Remote authority contract | The server validates each actor's undo and all clients converge. |

The interaction audit accompanies changes 3 and 4. Completion requires testing the user command and its indirect writes, not just wrapping each direct `dispatch()` call.

## 1 Dependency and history policy

Update the workspace catalog and lockfile to helpers 4.0.3 after publication. Verify the published package exports the history types and APIs used here. The supplied helpers checkout still declares 4.0.2, so the npm artifact is the dependency gate; do not assume that the version currently installed in ME contains the new APIs.

Add a shared editing-Vault factory and policy in `packages/shell`, exported for hosts through `packages/manifest-editor`. Projects already depends on shell, so this avoids introducing another dependency cycle. The factory should distinguish editable document Vaults from scratch, preview, recent-item, and analysis Vaults.

Use helpers' initial defaults of 100 groups and 10 MiB of encoded history. Allow runtime overrides for hosts; preserve history across ordinary rerenders, layout changes, locale changes, and saves. Keep one active document history per editing Vault. Switching to another root document must select a separate editing Vault or explicitly end the old document session.

Register these authored metadata namespaces in the default policy:

| Namespace | Source |
| --- | --- |
| `canvas-layout` | `packages/editor-api/src/canvas-layout/layout.ts` |
| `@manifest-editor/tags` | `packages/shell/src/Tags.tsx` |
| `@manifest-editor/canvas-progress` | `packages/shell/src/CanvasProgress.tsx` |

Import the existing constants where dependencies permit; otherwise keep a single documented policy definition. Operational metadata remains excluded. This policy makes selected metadata undoable within the session; it does not add a new metadata persistence format.

Migrate `ManifestEditor`'s fallback Vault, `AbstractVaultLoader`, browser/local editor entry points, and any other owned editing constructors. Keep supplied host Vaults intact: use their existing controller when enabled, and expose history as unavailable when absent. Document the factory for hosts rather than installing a second controller on an existing store. Dispose history only when the owner destroys the Vault, not when one React subtree unmounts.

Loading an existing document should leave history empty. An authored operation that creates entities through `load*()` must use its scoped interaction. A load used only for browsing, inspection, or background enrichment should remain excluded.

Acceptance: two editor instances have independent stacks; initial loads and saves create no entries; tags, progress, and layout round-trip; scratch Vaults have no controls; switching documents invalidates outstanding work for the old document.

## 2 Commit consumers

Replace dispatch monkey patches in both preview bridges:

- `packages/shell/src/PreviewVault/vault-message-bridge.ts`.
- `apps/web/src/components/iframe-preview-plugin/vault-message-bridge.ts`.

Subscribe once per source Vault and fan out committed messages to attached ports. Release subscriptions when their final consumer disconnects. Preserve the read-only policy of preview ports. Subscribe and capture the initialization snapshot at a defined revision so connecting during an edit cannot miss or duplicate that edit.

Use `commit.actions` for flattened, materialized actions rather than `commit.action`, which may retain a dynamic metadata function. Define an explicit wire message; never serialize the entire commit with its store references. Round-trip tagged history patches and the special/absent values they contain. Receive replay through the normal committed mutation pipeline without recording it as a preview user's edit or echoing it to the source.

Update autosave and dirty-state observation to use accepted document commits, including undo/redo. Filter using persisted entities, mappings, and the metadata that each storage backend actually saves. A commit can be a semantic no-op or only update request state, so neither commit count nor `origin` alone proves the document is dirty. Saving does not clear history, and undo does not necessarily mean the document matches its saved version.

Reconcile editing selection after committed entity/reference changes. `EditingStack.tsx` currently relies on a before-`REMOVE_REFERENCE` event; that event does not run during patch-based replay. Ensure undoing creation closes invalid editors and clears invalid selections, while undoing deletion restores content without unexpectedly stealing focus. Audit other action-type listeners for the same assumption. Derived mutation effects must ignore undo/redo origins; view updates, autosave, and previews must still react.

Editable remote clients also need commit-based transport, but that does not make their undo safe yet. Gate their public undo/redo commands as well as the UI until change 6; setting `history: true` must not permit a local-only reversal in a remote document.

Acceptance: a nested batch produces one preview update; undo/redo reaches every open preview; dynamic metadata survives transport; source edits are not echoed; removing the selected entity by undo leaves a valid editing stack; replay triggers normal saving.

## 3 Compound interactions

Make `Creator.create()` run its mutating execution through `vault.interaction()`. Construct `CreatorRuntime`, nested creator instances, and side-effect editors with the callback's scoped Vault. Use the same scope for resource imports, mappings, parent insertion, awaited side effects, and placeholder placement. Keep the current synchronous commit batch inside that interaction.

Allow callers to bind a creator/editor to an existing scoped Vault when creation is part of a larger command. A memoized creator captured from the unscoped React context will otherwise start an independent group. Prefer a small binding API over mutable reassignment of a shared `Creator.vault`.

```ts
// Proposed ME binding API; interaction() itself already exists in helpers.
await vault.interaction({ label: "Move into a new range" }, async (scoped) => {
  const created = await creator.withVault(scoped).create(definition, data, options);
  moveSelectedItems(scoped, created);
});
```

Creation failure seals already committed work so it remains undoable. Cancelling a chooser before any mutation should create no group. In `useAddCanvasImage`, defer creation of a missing annotation page until confirmation, or include it in the confirmed creation scope; opening and cancelling the chooser must not leave an empty page attached to the canvas.

Use this inventory to migrate commands and add an acceptance test for each family:

| Family | Initial entry points | Required boundary |
| --- | --- | --- |
| Resource creation | `Creator.ts`, `CreatorRuntime.ts`, `placeholder-position.ts`, creator side effects | One group through final placement and effects. |
| Range commands | `RangeReferenceListEditor.ts`, `BulkActionsWorkbench.tsx`, `VirtualRangeSidebar.tsx`, range tree/sidebar commands | Include creation, moves, parent attachment, and cleanup. |
| Annotation style | `AnnotationTargetEditor.setBoxStyle()` and `.clearBoxStyle()` | Batch target class and stylesheet together. |
| Reference descriptions | `PartOfReferenceEditor.tsx` | Batch the parent reference and imported resource update. |
| Annotation and Choice commands | `useAnnotationList.ts`, `choice-painting-annotations.ts` | Include entities, mappings, page membership, and prerequisite label changes. |
| Canvas layout and resizing | `canvas-layout/layout.ts`, image placement | Retain synchronous batches; give the complete command a label/group. |
| Temporal ranges and Timeliner | `av-range-mutations.ts`, `variations-timeliner/model.ts`, timeline controls | One split, group, ungroup, marker operation, or boundary move per group. |
| Exhibition commands | Theme, info-block/language, tour, slideshow and crop editors | Put the boundary outside loops when one command affects multiple resources. |

Audit callers of property editors and reference-list methods as well as direct Vault calls. Shared low-level methods should batch intrinsically atomic work; the user-facing command defines the larger interaction. No asynchronous callbacks belong in synchronous `batch()`.

Acceptance: adding an image undoes its parent attachment, entities, mappings, canvas sizing, thumbnail and placement; redo preserves IDs and reruns no external work. Range splits and creation-plus-move commands undo completely. A side effect cannot capture a concurrent independent edit. A rejected side effect leaves any committed creation work available to undo.

## 4 Edit sessions and background work

### Text and gestures

Create a reusable edit-session helper for language maps, metadata fields, annotation bodies, numeric inputs, rich text, and source editors. Start a group on the first actual mutation. Write debounced updates through its scoped Vault and close it on blur, resource/property switch, explicit completion, or unmount. Flush pending writes before closing a scope. Handle IME composition and invalidate outstanding timers when switching documents.

Independent fields use independent sessions. Do not keep an entire sidebar open as one interaction. Preserve the existing text editor's native history while it owns focus; do not intercept its keyboard shortcuts even when its native stack is empty. External document replay must update the editor without generating an echo save or allowing stale local redo to resurrect reverted content.

For dragging, sliders, and timeline handles, prefer component/Atlas preview state followed by one committed batch on release. If live Vault updates are necessary, use `beginInteraction()` for the gesture and write every update through its scope. Remember that `cancel()` seals those writes; it does not implement Escape-to-revert.

### Apply and Discard

Replace the live composition snapshot restoration in `CanvasComposition.tsx` with a draft of the composition fields it owns. Render draft dimensions, targets, layout, and origin while the user edits. Apply validates that those fields still match the captured base and commits them as one batch/interaction. Discard drops the draft and creates no history entry.

This removes the need to blindly restore an old snapshot over newer edits. If owned fields changed meanwhile, preserve the draft and report the conflict. Keep unrelated descriptive fields out of the draft. Treat image creation as its own confirmed interaction rather than trying to discard it through a composition snapshot. Reuse the same pattern for other Apply/Discard flows as their audit requires.

### Background actions

Extend `BackgroundActionRunContext` with an explicit way to run an authored result through a scoped interaction. Pass that scope into plugin writeback code; never infer a group from whichever edit happened most recently. Attribute outputs to the initiating actor/session and retain the task ID as operational correlation data.

Use a completed canvas/result as the initial boundary for OCR, annotation imports, inference, and thumbnail generation. For translation, group a completed writeback across all occurrences updated by that result. An explicit bulk Apply command groups the full prepared selection. If a result is too large for retention, present that outcome; helpers may evict the entire group rather than retaining partial undo.

Do not hold one group open while a model downloads or an entire long job runs. Prepare/fetch first, then validate inputs again and apply each result. Cancellation aborts pending work, invalidates callbacks, and leaves completed result groups undoable. Preserve existing stale-source checks in translation and add equivalent guards where writeback depends on earlier document state.

Acceptance: typing has a useful session boundary despite multiple debounce saves; pointer cancellation creates no edit for preview-only gestures; Discard creates no entry; Apply refuses stale composition fields; cancelled jobs produce no late writes; undo/redo never reruns a model, fetch, or creator side effect.

## 5 History controls and local release

Add a shell history adapter/provider with a backend-neutral command interface. Its first backend delegates to helpers; the remote backend will later call the authority. Expose availability, latest group labels, busy/open state, and undo/redo results. Avoid a second stack or a copy of reducer history in React.

Cache subscription snapshots for React. `history.getState()` constructs a new snapshot on each call, so passing it directly as an uncached `useSyncExternalStore` getter would violate React's snapshot stability requirement. Read once when attaching and update the cached snapshot from `history.subscribe()`. Do not repeatedly simulate large undo groups during rendering.

Add controls to the shared app header and ensure both default and focused layouts expose them. Provide localized button labels, accessible disabled reasons, and concise conflict messages. Translate `disabled`, `empty`, `open`, `busy`, and `conflict` results; map document paths to a resource/property description when possible. Keep blocked entries in place and recheck on command execution.

Route Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, and Ctrl+Y within the active editor instance. Respect input, textarea, contenteditable, CodeMirror, and rich-text history ownership. Flush/finish pending ME sessions before a toolbar undo. Do not install a global handler that operates on another embedded editor, or call undo during commit publication, when helpers returns `busy`.

Publish host and plugin guidance covering construction policy, scoped writes, metadata registration, cancellation, and replay origins. History remains per session; saving/reopening a document does not restore its stack.

Acceptance: keyboard and toolbar commands agree; two mounted editors target the correct Vault; native text undo remains functional; conflicts change nothing; locale/layout changes retain history; large imports and repeated gestures remain responsive within retention limits.

## 6 Collaborative authority

Local helpers history is not a network protocol. It owns one actor/session controller and exposes latest-group undo/redo, not an authoritative service for choosing arbitrary actors/groups. Public snapshots are diagnostics, not an importable history log. `APPLY_HISTORY` supplies value-guarded patches; the local controller supplies lineage and reference validation. Accepting a client-supplied patch is therefore not sufficient authorization or conflict protection.

Specify the reusable authority interface before implementing it. If the server needs new helpers APIs for per-actor group management or conditional replay, add them to helpers rather than duplicating inversion and lineage logic in ME. This is a follow-up dependency for the collaborative milestone, not a blocker for local integration.

Use one versioned protocol definition shared by client and server. Distinguish request IDs, authoritative commit IDs/revisions, actor/session identity, group IDs, and document epochs. The server assigns or validates ownership from the authenticated connection. Add explicit begin/finish group handling for asynchronous interactions, plus disconnect/expiry cleanup that seals accepted work.

Undo/redo requests identify an owned group. The server validates stack position, ownership, group state, lineage, expected values, and surviving references, then broadcasts a single canonical accepted result to every peer, including the requester. Deny arbitrary client history patches. Validate ordinary edits too so all accepted writes participate in the same ordering and conflict model.

Refactor `RemoteClientVault` around a shared transport controller and commit observation. Helpers scopes preserve subclasses through `Object.create()`, so pending queues and revision bookkeeping must belong to the root connection, not diverge on scoped objects. Preserve the new `dispatch(action, options)` signature. Track inbound application separately from `origin`: remote user edits must not be echoed, while local undo commits still need transmission through the authority path.

Resolve existing acknowledgement and rejection handling: correlate using the original request ID, deduplicate retries, avoid queuing the rejected action twice, and synchronize the revision from init and accepted messages. Reconcile optimistic state against authoritative order; local previews are not confirmed history. Either begin with server-confirmed application or define an explicit authoritative-base/pending-edit layer. Do not repeatedly replace the live Vault state and expect helpers history to survive `setState()`.

For the first remote release, disable undo/redo while requests are pending. On a snapshot/epoch reset, cancel sessions, invalidate pending scopes, and clear stale availability. Only reattach history through a defined authority handshake. Keep remote history unavailable with legacy peers/protocols that cannot enforce these rules.

Acceptance: two authenticated actors can undo only their own groups; unrelated foreign edits survive; same-field and changed-back edits block reversal; acquired references block deletion; forged ownership/patch requests fail; retries have one effect; reconnects cannot apply stale history; all clients reach the same state after accepted undo/redo. Exercise both WebSocket and MessagePort adapters without granting write access to read-only previews.

## Verification and release gates

Add focused integration tests in creator-api, editor-api, editors, shell, and the affected plugins. Test observable document changes and group boundaries, rather than reimplementing helpers' reducer coverage. Add transport tests for committed batching, replay, tagging, acknowledgement correlation, and subscription cleanup. Add an authoritative two-client suite before enabling remote history.

Add Playwright coverage for image creation with side effects, structural commands, Timeliner edits, text/keyboard routing, composition Apply/Discard, preview synchronization, and multiple editor instances. Include a large result and retention eviction case. Use the existing development server on port 3000; do not build packages or restart/kill that server for these checks. During implementation, run the relevant package tests, source typechecks, and existing i18n checks for changed UI messages.

Release local controls only after changes 1–5 pass across supported editing entry points. The audit record should list each user command, its affected paths, its grouping policy, and its acceptance test. Remote capability remains disabled until change 6 passes independently.
