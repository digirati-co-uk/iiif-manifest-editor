import type { BackgroundActionDefinition, PluginMetadata, PluginSettingsDefinition } from "@manifest-editor/shell";
import {
  CANVAS_LABEL_GENERATOR_PLUGIN_ID,
  createCanvasLabelGeneratorBackgroundAction,
} from "./background-action";
import {
  CANVAS_LABEL_PATTERN_PRESETS,
  getDefaultRunOptions,
  type CanvasLabelGeneratorPluginSettings,
} from "./generator";

export default {
  id: CANVAS_LABEL_GENERATOR_PLUGIN_ID,
  label: "Canvas Label Generator",
  description: "Generate or normalise canvas labels from patterns, filenames, existing labels, and ranges.",
  author: "Digirati",
  official: true,
  defaultEnabled: true,
  tags: ["labels", "canvases", "automation"],
  supports: {
    apps: ["manifest-editor"],
    projectTypes: ["Manifest"],
  },
} satisfies PluginMetadata;

const defaultRunOptions = getDefaultRunOptions();

export const settings: PluginSettingsDefinition<CanvasLabelGeneratorPluginSettings> = {
  defaults: {
    defaultLanguage: defaultRunOptions.language,
    defaultPattern: defaultRunOptions.pattern,
    onlyUntitled: defaultRunOptions.onlyUntitled,
  },
  fields: [
    {
      id: "defaultLanguage",
      label: "Default language",
      type: "text",
      description: "Language key used when generated labels are written.",
      placeholder: "en",
    },
    {
      id: "defaultPattern",
      label: "Default pattern",
      type: "select",
      description: "Starting pattern used when opening the label generator.",
      options: CANVAS_LABEL_PATTERN_PRESETS.map((preset) => ({
        label: preset.label,
        value: preset.pattern,
      })),
    },
    {
      id: "onlyUntitled",
      label: "Only update untitled canvases",
      type: "boolean",
      description: "Start the action in protected mode for missing or placeholder labels.",
    },
  ],
};

export const backgroundActions: BackgroundActionDefinition[] = [createCanvasLabelGeneratorBackgroundAction()];

export * from "./background-action";
export * from "./config-modal";
export * from "./generator";
export * from "./results";
