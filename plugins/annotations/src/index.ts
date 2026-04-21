import type { AnnotationPanel, BackgroundActionDefinition, BackgroundPanel, LayoutPanel, PluginMetadata } from "@manifest-editor/shell";
import { annotationsPanel } from "./annotation-panel";
import { canvasAnnotations } from "./canvas-annotations";
import { ANNOTATIONS_PLUGIN_ID } from "./constants";
import { createBulkAnnotationImportBackgroundAction } from "./importer/background-action";
import { annotationRoutingBackground } from "./routing-background";

export default {
  id: ANNOTATIONS_PLUGIN_ID,
  label: "Annotations",
  description: "Create, view, and inline external supplemental canvas annotation pages.",
  author: "Digirati",
  official: true,
  defaultEnabled: true,
  tags: ["annotations", "iiif", "external-pages"],
  supports: {
    apps: ["manifest-editor"],
    projectTypes: ["Manifest"],
  },
} satisfies PluginMetadata;

export const leftPanels: LayoutPanel[] = [annotationsPanel];
export const annotations: AnnotationPanel[] = [canvasAnnotations];
export const background: BackgroundPanel[] = [annotationRoutingBackground];
export const backgroundActions: BackgroundActionDefinition[] = [createBulkAnnotationImportBackgroundAction()];

export * from "./constants";
export * from "./importer/background-action";
export * from "./importer/importer";
