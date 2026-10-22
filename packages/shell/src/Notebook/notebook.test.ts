import { describe, expect, test } from "vitest";
import { createNotebook, resourceNode } from "iiif-browser/notebook";
import {
  ensureProjectNote,
  notebookResourceInput,
  parseNotebookMarkdown,
  projectNotebookSources,
  seedProjectNotebook,
} from "./notebook";

describe("project notebooks", () => {
  test("seeds formatted workshop markdown once and preserves user edits", () => {
    const notebook = createNotebook({ storageKey: false });
    const config = {
      initialNotes: [
        {
          id: "workshop",
          title: "Workshop",
          markdown: "# Start here\n\nUse [this image](https://example.org/image/info.json).",
        },
      ],
    };
    seedProjectNotebook(notebook, "project-a", config);
    expect(notebook.getState().notes[0].content.content?.[0].type).toBe("heading");
    expect(projectNotebookSources(notebook.getState().notes, "project-a")[0].url).toBe(
      "https://example.org/image/info.json"
    );
    notebook.getState().updateNote("workshop", { title: "My edited workshop" });
    seedProjectNotebook(notebook, "project-a", config);
    expect(notebook.getState().notes).toHaveLength(1);
    expect(notebook.getState().notes[0].title).toBe("My edited workshop");
  });

  test("scopes sources to the project and deduplicates resource URLs", () => {
    const notebook = createNotebook({ storageKey: false });
    const resource = {
      id: "https://example.org/image",
      source: "https://example.org/image",
      type: "ImageService" as const,
      label: "An image",
    };
    const a = notebook.getState().createNote("project-a");
    notebook.getState().updateNote(a.id, {
      content: {
        type: "doc",
        content: [resourceNode(resource.source, resource), resourceNode(resource.source, resource)],
      },
    });
    const b = notebook.getState().createNote("project-b");
    notebook.getState().updateNote(b.id, { content: parseNotebookMarkdown("[Private](https://example.org/private)") });
    expect(projectNotebookSources(notebook.getState().notes, "project-a").map((source) => source.url)).toEqual([
      "https://example.org/image/info.json",
    ]);
    expect(projectNotebookSources(notebook.getState().notes, "project-b").map((source) => source.url)).toEqual([
      "https://example.org/private",
    ]);
  });

  test("keeps the original content state and explicit info URLs", () => {
    expect(
      notebookResourceInput({
        id: "https://example.org/canvas",
        source: "https://example.org/state.json",
        type: "ContentState",
        label: "Crop",
      })
    ).toBe("https://example.org/state.json");
    expect(
      notebookResourceInput({
        id: "https://example.org/image",
        source: "https://example.org/image",
        infoUrl: "https://example.org/image/info.json?token=abc",
        type: "ImageService",
        label: "Image",
      })
    ).toBe("https://example.org/image/info.json?token=abc");
  });

  test("accepts host Markdown parsers and structured seed content", () => {
    const notebook = createNotebook({ storageKey: false });
    const content = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Custom tutorial" }] }],
    };
    seedProjectNotebook(notebook, "project-a", {
      initialNotes: [{ id: "tutorial", title: "Tutorial", markdown: "host syntax" }],
      parseMarkdown: () => content,
    });
    expect(notebook.getState().notes[0].content).toEqual(content);
  });
});

describe("single project note", () => {
  test("creates one note using the manifest label and reuses it when reopened", () => {
    const notebook = createNotebook({ storageKey: false });
    const id = ensureProjectNote(notebook, "project-a", "My manifest");
    const content = parseNotebookMarkdown("My working notes");
    notebook.getState().updateNote(id, { content });
    expect(ensureProjectNote(notebook, "project-a", "Renamed manifest")).toBe(id);
    expect(notebook.getState().notes).toHaveLength(1);
    expect(notebook.getState().notes[0]).toMatchObject({ title: "Renamed manifest", content });
  });

  test("uses preloaded workshop content when it is configured", () => {
    const notebook = createNotebook({ storageKey: false });
    notebook.getState().createNote("project-a", "Older notes");
    seedProjectNotebook(notebook, "project-a", {
      initialNotes: [{ id: "workshop", title: "Workshop", markdown: "# Start here" }],
    });
    expect(ensureProjectNote(notebook, "project-a", "My manifest", "workshop")).toBe("workshop");
    expect(notebook.getState().notes.find((note) => note.id === "workshop")?.content.content?.[0].type).toBe("heading");
  });
});
