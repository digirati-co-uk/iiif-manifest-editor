import type {
  BackgroundActionDefinition,
  LayoutPanel,
  PluginMetadata,
  PluginSettingsDefinition,
} from "@manifest-editor/shell";
import { createTranslationBackgroundAction } from "./background-action";
import { TRANSLATION_PLUGIN_ID } from "./constants";
import { createTranslationLanguageTagsBackgroundAction } from "./language-tags-background-action";
import { translationsPanel } from "./sidebar";
import type { TranslationPluginSettings } from "./types";

export default {
  id: TRANSLATION_PLUGIN_ID,
  label: "Translations",
  description: "Review manifest strings and fill missing translations with M2M100.",
  author: "Digirati",
  official: true,
  defaultEnabled: true,
  tags: ["translation", "i18n", "automation"],
  supports: {
    apps: ["manifest-editor"],
    projectTypes: ["Manifest"],
  },
} satisfies PluginMetadata;

export const settings: PluginSettingsDefinition<TranslationPluginSettings> = {
  defaults: {
    runtimePreference: "auto",
  },
  fields: [
    {
      id: "defaultSourceLanguage",
      label: "Default source language",
      type: "text",
      description: "Optional M2M100 source language code. Falls back to the editor default language.",
      placeholder: "en",
    },
    {
      id: "defaultTargetLanguage",
      label: "Default target language",
      type: "text",
      description: "Optional M2M100 target language code. Falls back to another configured editor language.",
      placeholder: "nl",
    },
    {
      id: "runtimePreference",
      label: "Runtime preference",
      type: "select",
      description: "WebGPU is attempted first in Auto mode, then WASM is used as a fallback.",
      options: [
        { label: "Auto", value: "auto" },
        { label: "WebGPU", value: "webgpu" },
        { label: "WASM", value: "wasm" },
      ],
    },
  ],
};

export const leftPanels: LayoutPanel[] = [translationsPanel];

export const backgroundActions: BackgroundActionDefinition[] = [
  createTranslationBackgroundAction(),
  createTranslationLanguageTagsBackgroundAction(),
];

export * from "./background-action";
export * from "./collection";
export * from "./config-modal";
export * from "./constants";
export * from "./html";
export * from "./language-tags-background-action";
export * from "./languages";
export * from "./options";
export * from "./results";
export * from "./runtime";
export * from "./sidebar";
export * from "./types";
export * from "./writeback";
