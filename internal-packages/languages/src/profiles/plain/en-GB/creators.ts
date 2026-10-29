import type { CatalogOverlay } from "../../../schema.ts";
import type { SourceCatalogs } from "../../../catalog-types.ts";

export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Empty page",
      summary: "Start with an image layout or a blank page",
    },
    internalCanvas: {
      label: "Existing page",
      summary: "Choose a page from this item.",
    },
    example: {
      label: "Blank page example",
      summary: "Create a large blank page with a title.",
    },
    contents: {
      summary: "Create a section to organise this item’s contents.",
    },
    range: {
      summary: "Group pages or other sections into a section.",
    },
    highlight: {
      summary: "Mark an area of the page without adding content.",
    },
    html: {
      summary: "Write formatted text to display on a page.",
    },
    browser: {
      summary: "Browse an IIIF item, collection, or supported collection webpage and choose content to add.",
      copyMetadata: "Copy item details to imported pages",
      copyMetadataHelp: "Copies descriptive details from the source item when the browser creates a page.",
    },
    manifestBrowser: {
      summary: "Browse IIIF items and collections to choose something to add.",
    },
    vtt: {
      summary: "Add subtitles or captions from a WebVTT file to an audio or video page.",
    },
  },
  browser: {
    selectCanvas: "Select page",
    addToManifest: "Add to item",
  },
  errors: {
    vttCanvas: "WebVTT captions must belong to a page.",
    canvas: "Could not load the selected page.",
    manifest: "Could not load the selected item.",
  },
  form: {
    vttHelp: "Link an existing WebVTT (.vtt) file to this page. Host the file at a public URL before adding it.",
    createRange: "Create section",
  },
  resource: {
    create: "Add something",
    chooseType: "Choose what to add",
  },
  canvas: {
    create: "Add page",
  },
} as const satisfies CatalogOverlay<SourceCatalogs["creators"]>;
