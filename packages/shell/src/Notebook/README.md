# Project notebooks

The Manifest preset enables notebooks. The header button opens a single project note in the sidebar. Its title follows the manifest label; note switching and deletion controls are hidden in this view. The note is created on first opening, and existing or preloaded content is preserved. Each project uses its resource instance ID (the project ID in the web app), with its own local-storage key. Notes are local to this browser; they are separate from the exported IIIF manifest. Clicking an IIIF resource in the sidebar opens the canvas creator at that resource, with an Add to manifest action. Canvas parent and crop information is retained. Existing creator browsers share this notebook through `useNotebookBrowserPlugins()`.

Hosts can preload tutorial or workshop material through the editor's `config`:

```tsx
<ManifestEditor
  resource={manifest}
  config={{
    notebook: {
      // Optional; defaults to the project/resource instance ID.
      projectId: "workshop-group-1",
      initialNotes: [
        {
          id: "workshop-introduction-v1",
          title: "Start here",
          markdown: "# Your first manifest\n\nTry [this image](https://example.org/iiif/image/info.json).",
        },
      ],
      onChange: (notes, projectId) => saveWorkshopNotes(projectId, notes),
    },
  }}
/>
```

Seeds with existing IDs preserve edits. Use a new ID for additional workshop material. Each seed accepts either Markdown or Tiptap JSON `content` (which takes precedence). `parseMarkdown(markdown)` can override the default parser for host-specific Markdown or notebook resource nodes. `parseNotebookMarkdown` is also exported for hosts that need to prepare content in advance.

The Add content dialog shows up to four saved resources and Markdown links when the URL field is empty. Choosing one runs the same detection as pasting its URL. Image services use their `info.json` URL. Browsing a creator's IIIF Browser also lets users save resources to the same project notes.

Set `notebook.enabled: false` to hide notebook controls. The shell exports `ProjectNotebookButton`, `ProjectNotebookPanel`, `useProjectNotebook`, and `useNotebookBrowserPlugins` for custom headers and presets. Custom presets register a left panel with `NOTEBOOK_PANEL_ID` to use the header button.

The workspace pins `prosemirror-model` so the notebook and descriptive editors share the same document/fragment classes. Loading multiple versions causes Enter to fail with a Fragment conversion error.

Exhibition presets retain the same project notebook across full-page, slideshow, and scrolling views. They configure `notebook.browserCreatorId` as `@exhibitions/browser-creator` and `notebook.canvasActionLabel` as `Add to exhibition`, so notebook imports create exhibition slides with their layout behavior. Other presets can override these two fields for their own canvas creators.
