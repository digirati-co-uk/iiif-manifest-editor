import type { BackgroundActionDefinition, PluginMetadata } from "@manifest-editor/shell";
import { createOcrClassificationBackgroundAction } from "./background-action";

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

export const backgroundActions: BackgroundActionDefinition[] = [createOcrClassificationBackgroundAction()];

export * from "./background-action";
export * from "./ocr-difficulty";
