# Vault history in Manifest Editor

ME uses `@iiif/helpers` 4.0.4 history. Reducer inversion, conditional replay and retention are provided by helpers. ME supplies interaction boundaries, controls, document lifecycle and transport authority.

## Hosts and document lifetime

ME-owned document Vaults enable history automatically. Supplied host Vaults keep their existing policy; a host that wants history can use:

```ts
import { createManifestEditorVault } from "manifest-editor";

const vault = createManifestEditorVault({
  history: { maxGroups: 100, maxBytes: 10 * 1024 * 1024 },
});
```

The factory is also exported by `manifest-editor/vault`, shell and client-vault. Pass `history: false` for scratch or read-only work. `history.metadata` extends the ME defaults: `canvas-layout`, `@manifest-editor/tags`, and `@manifest-editor/canvas-progress`. Other operational metadata is excluded.

Initial loads create no history entry. Each owned editing Vault has one document lifetime; selecting another root/file creates another Vault and disposes the old history. Renders, locale changes, layout changes and saving retain the stack. Hosts own disposal for supplied Vaults. `vault.getStore().setState()` replaces the document, clears history and invalidates open scopes.

Local browser projects persist the normalized document and sealed undo/redo history together in IndexedDB. Reloading restores both stacks. The legacy local project loader migrates to an IndexedDB checkpoint on the next save. Remote disconnect/reconnect and ordinary IIIF imports do not restore history; remote history still belongs to the server. JSON file exports remain standard IIIF documents without history.

## Commands, creators and fields

Use a batch for synchronous atomic writes. Use `runVaultCommand` for a user command spanning batches or awaits, and pass its scope to every participating API:

```ts
import { runVaultCommand } from "@manifest-editor/editor-api";

await runVaultCommand(vault, "Create range and move items", async (scoped) => {
  const created = await creator.withVault(scoped).create(definition, data, options);
  for (const range of Array.isArray(created) ? created : [created]) {
    editor.withVault(scoped).structural.items.add(range);
  }
});
```

`Creator.create()` supplies one scope to imports, attachment, awaited side effects and placement. Use the provided `ctx.vault` in side effects. Redo replays the recorded changes and never reruns external work. `CreatorOptions.signal` cancels pending preparation and invalidates late side-effect writes. Already applied creation remains undoable after a failure or cancellation.

Fields use `VaultEditSession`, or shell's `useVaultEditSession(label, resourceAndFieldKey)`. Register pending debounce flushes with `session.onFlush()`, write with `session.run(scoped => ...)`, and `finish()` on blur/completion. The shell flushes active sessions before undo/redo. Do not hold an entire editor sidebar open as one group.

Both `finish()` and helpers' `cancel()` seal already applied work; they do not revert it. Apply/Discard interfaces need a draft. `CanvasCompositionDraft` renders through an isolated Vault, checks owned fields against the captured base, and applies as one command. Discard never modifies the source document. A stale Apply preserves the draft and reports a conflict.

Native input, rich-text and source-editor history owns shortcuts while the field has focus. Shell shortcuts apply only inside the active editor root, outside those fields. Toolbar controls use the controller's guarded `canUndo`/`canRedo`, flush sessions and report failures without skipping blocked groups.

## Background results

Prepare/fetch results first, validate source assumptions, then use `ctx.commitResult(label, scoped => ...)` for writeback. Plugins can also use `runVaultCommand(ctx.vault, ...)` where existing integration contexts do not expose `commitResult`. Keep writes synchronous inside a batch when they form one result. Do not hold a group open during a model download or a whole job.

Translation groups each completed writeback across occurrences. OCR, inference and thumbnail application retain their per-result batches and check cancellation before writing. Cancelling a job leaves completed results undoable. Background task bookkeeping remains operational metadata. The built-in task progress API passes `history: "ignore"`; authored bulk progress remains one reversible batch. Custom task contexts can request the same policy with `createManifestEditorCanvasProgressApi(vault, { history: "ignore" })`.

## Commit subscribers and previews

Observe `subscribeCommits()`, rather than replacing `dispatch()` or listening only for reducer action events. Undo/redo bypasses public dispatch and action-type events. ME's persistence hook, editing-stack reconciliation, preview bridge and editable remote transport use committed changes.

`vaultDocumentChanged(before, after)` filters request state, operational metadata and semantic no-ops. Saving does not clear history. A single shared preview subscription fans out flattened materialized actions, including replay, to read-only ports. Initialization and document replacement send a snapshot; preview writes are rejected. Both transports use the tagged wire codec to preserve undefined, sparse arrays and special numbers in inverse patches.

## Remote authority

Update client-vault and server-vault together. Protocol 2 puts history on the authority. Remote clients always disable local `undo()`/`redo()`; the shell uses `requestHistory("undo" | "redo")`. Protocol 1 and read-only previews expose no editable history.

`VaultAuthority` supports both WebSocket and MessagePort adapters. Each connection has a helpers history controller on the shared authoritative store. Ownership comes from a trusted `{ actorId, sessionId }` supplied by the host, never from message options. For WebSocket hosts:

```ts
const server = new MultiVaultServer(httpServer, {
  authenticate: async (request, documentId) => {
    const user = await authorizeDocument(request, documentId);
    return user ? { actorId: user.id, sessionId: user.connectionSessionId } : null;
  },
});
```

Without `authenticate`, the server assigns an isolated random identity to each connection; it does not provide account authentication. A live actor/session pair is exclusive. Use a fresh session per connection; session history ends on disconnect.

Normal edits are optimistic and include an epoch and predicted server revision. Stale forwards are rejected and the client replaces its view with the authority snapshot, discarding rejected pending intent. They are not automatically replayed against changed positional data. The UI reports synchronization rejection. Undo/redo names an owned group; helpers checks field lineage, current values and surviving references atomically before publication. A conflicting group stays blocked. All peers receive the same accepted inverse commit once.

The server overwrites client attribution, maps interaction IDs to owned groups, deduplicates request IDs in a bounded retry window (monotonic client sequences reject older evicted requests), rejects arbitrary inverse patches and changes epoch on document replacement. Server-originated work has its own attribution and cannot appear in every connected user's stack. A failed peer send cannot reject another client's accepted commit.

## Mutation audit

| Family | Implemented boundary |
| --- | --- |
| Creation | Runtime imports, mappings, attachment, awaited effects, painting-page prerequisite and placeholder placement share the creator scope. Opening the image chooser makes no document mutation. |
| Ranges | Splits, creation plus move, bulk/sidebar commands and temporal range mutations bind the scoped editor/creator. |
| Annotation style and references | Target class plus stylesheet, parent reference descriptions and annotation-page imports use atomic batches. |
| Choice and canvas layout | Choice graph commands and layout/resize/image placement helpers define complete interactions. |
| Composition | Preview Vault; validated Apply is one interaction; Discard creates no commit. Viewer origin follows the draft. |
| Text and numeric fields | Language maps, metadata, inline labels, annotation bodies, rich text and dimensions use sessions. Reset invalidates drafts and timers. |
| Exhibition | Adding a language across blocks, tour text, layout placeholders and info-block HTML use explicit scopes. Compatibility normalization is ignored history. Image crop/rotation already applies one complete batch. |
| Background jobs | Each completed writeback is the reversible result; cancellation blocks late writes. |
| Preview and persistence | Actual commit stream includes direct store commits and undo/redo. Invalid editing-stack references are reconciled after commits. |

The `variations-timeliner` files mentioned in the original plan are absent from this checkout. New plugins and interaction surfaces must use these same boundaries; ME cannot infer a user command from unrelated dispatch calls.

## Validation

Core coverage includes creator side effects/cancellation, composition isolation/conflicts, field grouping, metadata policy, preview replay/reset, authority ownership/ABA/reference conflicts, duplicate requests, stale forwards, failed peers, real MessageChannel/WebSocket transport and unauthorized connections. Mounted editor tests cover StrictMode, independent histories and document replacement. Playwright checks real debounced editing, native rich text, shell shortcuts, composition Apply/Discard and preview geometry.

Validation recorded 352 passing targeted unit/integration tests and 19 passing browser checks. Core client-vault, server-vault, editor-api and shell type checks pass. Lint completes with existing warnings.

The broader suite also contains failures outside this change: legacy editor type errors, temporal-neighbor clamping, exhibition HTML serialization/comment expectations and incomplete icon mocks. The existing Shift-resize collage check also fails with the original viewer/composition sources (388 expected, 416 received); its baseline failure was reproduced separately. These checks remain visible; they are not disabled by the history implementation.

Helpers may evict a whole group when it exceeds retention limits. The current public history API has no explicit eviction-reason notification, so the toolbar reflects the retained stack without distinguishing capacity eviction from other unavailable history.

## Follow-up undo/redo audit (5 November 2026)

Fixed during the follow-up review:

- Whole-canvas IIIF Browser imports mutated the normalized resource's existing `iiif-parser:hasPart` array while preparing the creator commit. That array could be shared with retained history snapshots, causing the import's own undo to report a value conflict. Creator serialization now copies the array.
- Multi-item creation at a specified insertion index inserted every item at the same position, reversing selection order. Attachment now advances the insertion index for each result.
- Uncropped browser selections targeting an annotation's body returned an Annotation instead of its ContentResource. The body is now embedded, matching the cropped path.
- Registered field sessions with pending flush callbacks could survive document replacement and flush old values into the new document. Reset now invalidates the session and discards its pending callbacks, including sessions that had not written yet.
- The canvas context menu passed an undefined painting-page ID for empty canvases. It now reserves a page ID and passes `ensurePaintingPage` to the creator; opening the chooser still makes no document edit. Page creation, attachment and placement remain in the creation interaction.
- Shell history actions now catch thrown errors, expose the error in their live output and permit retry. A synchronous guard prevents overlapping invocations before React renders the pending state. Focusing the controls flushes pending sessions for keyboard users as pointer interaction already did.

New regression coverage exercises whole/cropped/rotated browser selections as Canvas, Annotation and ContentResource; real creator side effects; empty-canvas painting-page creation and placement; collection browser multi-selection; indexed insertion order; reuse of a loaded resource; pending-field reset; and error recovery. Entity graphs are compared before creation, after undo and after redo. Redo must not refetch remote IIIF content.

Audited entry points include the manifest overview/list, canvas context menu, canvas-layout image chooser, annotation body and partOf browser launches, collection items, internal start-canvas selection and the exhibition browser wrapper. These converge on the creator pipeline, but this review does not provide an end-to-end browser test for every modal launcher. Network-failure/retry during multi-selection, simultaneous editing while an import is awaiting fetch, and every exhibition-wrapper/browser combination remain useful additions to UI coverage. Existing transport tests cover authority ownership, conflicts and disconnection separately.

The two existing Playwright history checks passed against the running development server using `E2E_TARGET=watch` (no package builds or server lifecycle changes).

### Persisting history with projects

ME now uses the published helpers 4.0.4 checkpoint API. Browser projects save `vaultData` and `historySnapshot` in one existing IndexedDB project record. The legacy `LocalStorageLoader` saves a single localforage record containing the Presentation JSON recovery copy and a normalized checkpoint; its original localStorage copy is removed only after a successful migration. Deletion removes both formats.

Capture does not seal user interactions. Autosaves while a creator or field session is open save the document without a snapshot, explicitly removing any preceding snapshot. A history subscription schedules another save when the interaction seals, even if no further document commit occurs. Closing the editor flushes registered field sessions. An abrupt process termination during an unfinished interaction can therefore reopen the latest autosaved document without undo history. Browser shutdown cannot guarantee completion of an asynchronous IndexedDB write; regular autosaves remain the durability boundary.

Restore validates the helpers format/version/policy and checks the checkpoint against the document stored alongside it. Missing, incompatible, corrupt or mismatched history falls back to that document with an empty stack. Project etag checks run in the same IndexedDB transaction as the write, and writes from one mounted editor are serialized. A stale writer is rejected. History remains bounded by the default 100 groups / 10 MiB (or a host's configured limits); IndexedDB quota errors use the existing save-error path.

Standalone JSON files and remote connections retain their existing lifetimes. Server-side persistence needs coordinated authority/session restoration and is outside this local-project change.


### Independent branch review

The independent Sol 6.1 high review identified two additional issues, both fixed before committing: remote sessions previously hit a permanent 10,000-request capacity limit, and audio/video duration changes bypassed their field scope. Remote clients now send monotonically increasing request sequences; the authority retains a bounded retry cache and rejects expired sequenced retries without blocking new work. Closed group tombstones are bounded too. Duration callbacks bind the provided scoped Vault.

Regression checks cover continued editing and undo after more than 10,000 requests, evicted retry rejection, and mounted audio/video editor callbacks changing duration 10 → 11 → 12 → 13 as one reversible group. The upgraded checkpoint/storage, core API, transport, shell, mounted-editor and browser tests pass. The three Playwright history checks include project reload with Undo and Redo intact. No packages were built and the running development server was left in place.
