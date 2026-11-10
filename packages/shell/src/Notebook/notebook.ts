import type { MessageReference } from "@manifest-editor/i18n/core";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import { IIIFImage } from "iiif-browser/tiptap";
import { MarkdownManager } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";
import type { JSONContent } from "@tiptap/core";
import {
  createNotebook,
  noteResources,
  type NotebookNote,
  type NotebookResource,
  type NotebookStore,
} from "iiif-browser/notebook";

export interface ProjectNotebookConfig {
  enabled?: boolean;
  /** Canvas creator used when opening a saved resource, e.g. an exhibition slide creator. */
  browserCreatorId?: string;
  canvasActionLabel?: string;
  /** UI-only display metadata; legacy custom labels remain literal fallbacks. */
  canvasActionLabelMessage?: MessageReference;
  /** Override the project instance ID, e.g. when the host provides its own workspace. */
  projectId?: string;
  /** Stable IDs ensure workshop material is seeded once, preserving subsequent edits. */
  initialNotes?: Array<{ id: string; title: string; markdown?: string; content?: JSONContent }>;
  parseMarkdown?: (markdown: string) => JSONContent;
  onChange?: (notes: ReturnType<NotebookStore["getState"]>["notes"], projectId: string) => void;
}

const notebooks = new Map<string, NotebookStore>();
export function getProjectNotebook(projectId: string): NotebookStore {
  if (typeof window === "undefined") return createNotebook({ storageKey: false });
  let notebook = notebooks.get(projectId);
  if (!notebook) {
    notebook = createNotebook({ storageKey: `manifest-editor:notebook:${projectId}` });
    notebooks.set(projectId, notebook);
  }
  return notebook;
}

export function parseNotebookMarkdown(markdown: string): JSONContent {
  return new MarkdownManager({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      IIIFImage.extend({
        markdownTokenName: "image",
        parseMarkdown: (token, helpers) => helpers.createNode("iiifImage", { src: token.href, alt: token.text || "" }),
      }),
    ],
  }).parse(markdown);
}

export function seedProjectNotebook(notebook: NotebookStore, projectId: string, config: ProjectNotebookConfig) {
  const existing = notebook.getState().notes;
  const now = new Date().toISOString();
  const additions: NotebookNote[] = (config.initialNotes || [])
    .filter((note) => !existing.some((saved) => saved.id === note.id && saved.projectId === projectId))
    .map((note) => ({
      id: note.id,
      title: note.title,
      projectId,
      content: note.content ?? (config.parseMarkdown ?? parseNotebookMarkdown)(note.markdown ?? ""),
      createdAt: now,
      updatedAt: now,
    }));
  if (additions.length) notebook.setState({ notes: [...existing, ...additions] });
}

/** Use the original URL for content states/crops and the info document for image services. */
export function notebookResourceInput(resource: NotebookResource) {
  if (resource.type !== "ImageService") return resource.source || resource.id;
  if (resource.infoUrl) return resource.infoUrl;
  const url = new URL(resource.id);
  url.pathname = `${url.pathname.replace(/\/info\.json$|\/$/g, "")}/info.json`;
  return url.toString();
}

export interface NotebookSource {
  url: string;
  label: string;
  thumbnail?: string;
  noteTitle: string;
}
export function projectNotebookSources(notes: NotebookNote[], projectId: string): NotebookSource[] {
  const sources = new Map<string, NotebookSource>();
  for (const note of notes.filter((note) => note.projectId === projectId)) {
    for (const resource of noteResources(note.content)) {
      const url = notebookResourceInput(resource);
      if (!sources.has(url))
        sources.set(url, { url, label: resource.label, thumbnail: resource.thumbnail, noteTitle: note.title });
    }
    // Workshop markdown may contain ordinary links before the browser resolves them.
    const visit = (node: JSONContent) => {
      for (const mark of node.marks ?? []) {
        const url = mark.type === "link" ? mark.attrs?.href : undefined;
        if (typeof url === "string" && /^https?:\/\//.test(url) && !sources.has(url)) {
          sources.set(url, { url, label: node.text || url, noteTitle: note.title });
        }
      }
      node.content?.forEach(visit);
    };
    visit(note.content);
  }
  return [...sources.values()];
}

/** Reuse existing/preloaded content, and keep one stable note as the project sidebar. */
export function ensureProjectNote(
  notebook: NotebookStore,
  projectId: string,
  title: string,
  preferredId?: string
): string {
  const state = notebook.getState();
  const notes = state.notes
    .filter((note) => note.projectId === projectId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  const note = notes.find((note) => note.id === preferredId) ?? notes[0] ?? state.createNote(projectId, title);
  if (note.title !== title) state.updateNote(note.id, { title });
  return note.id;
}
