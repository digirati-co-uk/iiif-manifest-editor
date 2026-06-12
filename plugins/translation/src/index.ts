import type {
  BackgroundActionDefinition,
  LayoutPanel,
} from "@manifest-editor/shell";
import { createTranslationBackgroundAction } from "./background-action";
import { createTranslationLanguageTagsBackgroundAction } from "./language-tags-background-action";
import { translationsPanel } from "./sidebar";
export { default, settings } from "./plugin";

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
