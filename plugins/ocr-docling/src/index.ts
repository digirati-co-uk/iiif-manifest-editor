import type { BackgroundActionDefinition } from "@manifest-editor/shell";
import { createOcrDoclingBackgroundAction } from "./background-action";
export { default, settings } from "./plugin";

export const backgroundActions: BackgroundActionDefinition[] = [createOcrDoclingBackgroundAction()];

export * from "./annotations";
export * from "./background-action";
export * from "./config-modal";
