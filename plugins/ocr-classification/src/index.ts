import type { BackgroundActionDefinition } from "@manifest-editor/shell";
import { createOcrClassificationBackgroundAction } from "./background-action";
export { default } from "./plugin";

export const backgroundActions: BackgroundActionDefinition[] = [createOcrClassificationBackgroundAction()];

export * from "./background-action";
export * from "./ocr-difficulty";
