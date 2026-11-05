# Diff plugin

Compares a resolvable IIIF source URL with the current editor document using
`@iiif/helpers/diff`. The source is the baseline; the editor is the after side.
The web Manifest editor includes this plugin, enabled by default.

Opening **Diff** in the sidebar opens the main comparison panel and loads the
document ID as the source automatically. If it cannot be resolved (offline, not
CORS-enabled, not a IIIF resource) nothing is reported: the source field stays
available to enter another URL, and a manual **Compare** or **Reload** shows errors.
Local edits update the comparison live without re-fetching.

The sidebar lists changes grouped by resource in collapsible sections, with an
added/changed/removed summary. Selecting one opens the main panel, a full-screen page
of collapsible sections with three views:

- **Changes**: the raw before/after JSON. Lists of references (`items`, `annotations`…)
  are shown as a code diff of just the entries that changed, in the style of a text diff:
  `−` where an item was, `+` where it is now, a little unchanged context either side, and
  both positions on each row so items that were pushed along by a move are visibly shifted.
- **Visual**: values rendered as a reader sees them (labels, metadata, images). Lists of
  canvases are two strips of editor thumbnails, source and current, marking moved, added
  and removed items. The source is loaded into a private Vault for this, never the editor
  Vault.
- **Unified**: the contextual `.diff` patch, which you can download.

**Open** edits the changed resource in the right sidebar, which the diff page otherwise
keeps closed (it is handed back when you leave the Diff panel). **Undo** restores the
source value in the editor; undoing the addition or removal of a whole resource also undoes
the reference to it in its parent. Undone changes are kept in `localStorage` (per document
and source) in an **Undone** section where **Redo** puts them back, and refuses if that part
of the document has been edited since. **Ignore order** suppresses pure reordering while
preserving property and membership changes.

The panels are styled with Tailwind classes; the editor's Tailwind build scans this plugin
(`packages/manifest-editor/tailwind.config.js`), so rebuild or restart that package's CSS
after changing classes here.

The source is fetched independently and never imported into the editor Vault.
Only the serialized current document is compared, excluding unrelated Vault
resources. Servers must allow browser cross-origin requests. State is scoped to
the editor Vault and document and lasts for that editor session.

Resources match by type and ID. Different root IDs can be reviewed as structured
changes, but unified export is disabled because a patch of either root alone
would not represent the comparison. Arrays are
atomic change units, so undoing one reverts the whole array.

For another host, register the lazy plugin:

```ts
import diffPlugin from "@manifest-editor/diff/lazy";
// Add diffPlugin to the host's plugins array.
```

The package exposes source entrypoints in the workspace so development does not
require a plugin build. Publication uses the compiled entrypoints.

Validation: `pnpm --filter @manifest-editor/diff test` and
`pnpm --filter @manifest-editor/diff typecheck`.
