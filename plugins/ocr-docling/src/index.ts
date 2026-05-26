import type { BackgroundActionDefinition, PluginMetadata, PluginSettingsDefinition } from "@manifest-editor/shell";
import { createOcrDoclingBackgroundAction, OCR_DOCLING_PLUGIN_ID } from "./background-action";
import {
  getDefaultRunOptions,
  OCR_DOCLING_IMAGE_SIZES,
  type OcrDoclingPluginSettings,
} from "./config-modal";

export default {
  id: OCR_DOCLING_PLUGIN_ID,
  label: "Docling OCR",
  description: "Run Granite Docling OCR on manifest canvases and write text annotations.",
  author: "Digirati",
  official: true,
  defaultEnabled: false,
  tags: ["ocr", "docling", "automation"],
  supports: {
    apps: ["manifest-editor"],
    projectTypes: ["Manifest"],
  },
} satisfies PluginMetadata;

const defaultRunOptions = getDefaultRunOptions();

export const settings: PluginSettingsDefinition<OcrDoclingPluginSettings> = {
  defaults: {
    prompt: defaultRunOptions.prompt,
    imageSize: defaultRunOptions.imageSize,
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
  ],
};

export const backgroundActions: BackgroundActionDefinition[] = [createOcrDoclingBackgroundAction()];

export * from "./background-action";
export * from "./config-modal";
export * from "./annotations";
