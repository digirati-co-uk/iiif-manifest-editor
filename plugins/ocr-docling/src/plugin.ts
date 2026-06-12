import type { PluginMetadata, PluginSettingsDefinition } from "@manifest-editor/shell";
import { DOCLING_DEFAULT_PROMPT } from "./docling/constants";
import type { OcrDoclingPluginSettings } from "./config-modal";

export const OCR_DOCLING_PLUGIN_ID = "@manifest-editor/ocr-docling";

const OCR_DOCLING_IMAGE_SIZES = [768, 1024, 1536, 2048] as const;

export default {
  id: OCR_DOCLING_PLUGIN_ID,
  label: "Local OCR",
  description: "Run Granite Docling OCR on manifest canvases and write text annotations. (500MB download)",
  author: "Digirati",
  official: true,
  defaultEnabled: false,
  tags: ["ocr", "docling", "automation"],
  supports: {
    apps: ["manifest-editor"],
    projectTypes: ["Manifest"],
  },
} satisfies PluginMetadata;

export const settings: PluginSettingsDefinition<OcrDoclingPluginSettings> = {
  defaults: {
    prompt: DOCLING_DEFAULT_PROMPT,
    imageSize: 1024,
  },
  fields: [
    {
      id: "prompt",
      label: "Default prompt",
      type: "textarea",
      description: "Used as the starting prompt when running Docling OCR.",
    },
    {
      id: "imageSize",
      label: "Default image size",
      type: "select",
      description: "Controls the long edge size sent to the OCR model.",
      options: OCR_DOCLING_IMAGE_SIZES.map((size) => ({
        label: `${size}px long edge`,
        value: size,
      })),
    },
    {
      id: "workerUrl",
      label: "Worker URL",
      type: "text",
      description: "Optional public URL for the Docling OCR worker when the package is consumed through another bundled package.",
      placeholder: "/assets/docling-worker.js",
    },
  ],
};
