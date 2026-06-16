import type { PluginMetadata } from "@manifest-editor/shell";

export default {
  id: "@manifest-editor/ocr-classification",
  label: "OCR Classification",
  description: "Classify canvases by OCR difficulty and apply canvas tags.",
  author: "Digirati",
  official: true,
  defaultEnabled: false,
  tags: ["ocr", "classification", "automation"],
  supports: {
    apps: ["manifest-editor"],
    projectTypes: ["Manifest"],
  },
} satisfies PluginMetadata;
