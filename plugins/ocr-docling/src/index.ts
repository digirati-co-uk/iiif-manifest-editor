import type { BackgroundActionDefinition, PluginMetadata } from "@manifest-editor/shell";
import { createOcrDoclingBackgroundAction } from "./background-action";

export default {
  id: "@manifest-editor/ocr-docling",
  label: "Docling OCR",
  description: "Run Granite Docling OCR on manifest canvases and write text annotations.",
  author: "Digirati",
  official: true,
  defaultEnabled: true,
  tags: ["ocr", "docling", "automation"],
  supports: {
    apps: ["manifest-editor"],
    projectTypes: ["Manifest"],
  },
} satisfies PluginMetadata;

export const backgroundActions: BackgroundActionDefinition[] = [createOcrDoclingBackgroundAction()];

export * from "./background-action";
export * from "./config-modal";
export * from "./annotations";
