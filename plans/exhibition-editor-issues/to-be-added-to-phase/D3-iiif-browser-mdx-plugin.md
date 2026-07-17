# D3 IIIF Browser MDX editor integration

## Why deferred

The requested Browser revision contains MDX editor/snippet plugins, but this repository currently stores and edits exhibition rich text through Tiptap/HTML and has no identified MDX-backed field or MDXEditor surface. Installing the plugin without deciding where MDX is persisted would create an unused dependency or silently change content format.

The Phase 1 Browser upgrade is still independent and should land first.

## Confirmed upstream context

- Local `/Users/stephen/github.com/digirati-co-uk/iiif-browser` commit `c69b412` includes the styling changes.
- Its preceding changes include MDX snippet/editor plugins.
- MDX plugin CSS is exported separately from the base Browser stylesheet.
- The editor request explicitly requires reuse of the existing history key so prior history is preserved.

## Product/architecture decisions required

1. Which manifest field or editor surface will contain MDX.
  A: The integration point is the existing HTML editor. We will use only the IIIF Image plugin which produces clean image tags that we can use. /Users/stephen/github.com/digirati-co-uk/iiif-manifest-editor/packages/components/src/HTMLEditor.tsx
2. Whether existing HTML content is migrated, displayed read-only, converted on demand, or kept as a separate format.
  A: It stays as HTML, no changes there. We are using the existing MDX plugin to produce HTML.
3. Whether the Browser plugin inserts a content-state/reference, an MDX component, or serialized HTML.
  A: It inserts serialized HTML. The other plugin (Snippets) is NOT to be used.
4. Which existing history store/key must be shared and how its type is exposed to the plugin.
  A: The history key should be the same as the existing IIIF Browser. Its probably default, this was meant to ensure you don't override it. The IIIF Browser history is saved so whenever you open it it remembers where you were. Convenient.
5. Sanitization/rendering rules in the editor and exhibition viewer.
  A: The MDX plugin sanitizes the HTML before inserting it into the editor.
6. Whether this applies only to exhibition info boxes or also tour steps and other presets.
  A: Info boxes and tour steps are both supported.

## Investigation plan

1. Read the upstream plugin API and example at c69b412; record required provider, CSS, value format, and history options.
2. Trace current rich-text persistence from editor form to exported manifest and viewer rendering.
3. Build a non-persisting spike in the intended surface and verify the Browser can reuse the current history key rather than registering another one.
4. Test round trips for an existing HTML document and a new MDX snippet.
5. Review the result with a product owner and the exhibition viewer maintainer.
6. Once the data format is approved, split implementation into editor adapter, viewer rendering, and migration/backward-compatibility tasks.

## Evidence needed to promote

- Named editor surface and manifest field.
- Agreed persisted representation and backward-compatibility policy.
- Identified shared history key/API.
- Viewer support plan and security constraints.

## Future acceptance criteria

- The plugin is visible only in the intended IIIF/MDX editor.
- Existing history remains available under the same key with no duplicate settings/history entry.
- Existing HTML manifests still open safely.
- New MDX content survives export/reload and renders consistently in the viewer.
