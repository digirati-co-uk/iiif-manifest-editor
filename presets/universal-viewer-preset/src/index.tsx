import { fallbackAnnotationEditor } from "@manifest-editor/editors";
import type { Config } from "@manifest-editor/shell";
import * as ManifestPreset from "@manifest-editor/manifest-preset";
import { universalViewerAnnotationPageEditor } from "./UniversalViewerAnnotationPage";
import { universalViewerSingleTabEditor } from "./UniversalViewerSingleTab";

export default {
  id: "universal-viewer-manifest-editor",
  title: "Universal Viewer Manifest Editor",
  project: true,
  projectType: "Manifest",
};

export const universalViewerFieldSupport = {
  Manifest: {
    singleTab: "@manifest-editor/universal-viewer-overview",
    fields: [
      "label",
      "metadata",
      "requiredStatement",
      "homepage",
      "viewingDirection",
      "items",
      "structures",
      "rendering",
    ],
  },
  Canvas: {
    singleTab: "@manifest-editor/universal-viewer-overview",
    fields: ["label", "metadata", "thumbnail", "items", "rendering"],
  },
  Range: {
    singleTab: "@manifest-editor/universal-viewer-overview",
    fields: ["label", "metadata", "items", "rendering"],
  },
  Annotation: {
    singleTab: "@manifest-editor/fallback-annotation-editor",
    fields: ["target"],
  },
  AnnotationPage: {
    fields: ["items"],
    singleTab: "@manifest-editor/universal-viewer-annotation-page",
  },
  ContentResource: {
    singleTab: "@manifest-editor/universal-viewer-overview",
    fields: ["label"],
  },
} satisfies Config["editorConfig"];

export const config: Partial<Config> = {
  defaultPreview: "universal-viewer",
  previews: [
    {
      id: "universal-viewer",
      type: "external-manifest-preview",
      label: "Universal Viewer",
      config: {
        url: "https://universalviewer.dev/#?iiifManifestId={manifestId}",
      },
    },
  ],
  editorConfig: universalViewerFieldSupport,
};

export const universalViewerCreatorIds = new Set([
  "@manifest-editor/image-service-creator",
  "@manifest-editor/image-service-annotation",
  "@manifest-editor/image-url-creator",
  "@manifest-editor/image-url-annotation",
  "@manifest-editor/image-url-list",
  "@manifest-editor/image-url-list-annotation",
  "@manifest-editor/audio-annotation",
  "@manifest-editor/video-annotation",
  "@manifest-editor/iiif-browser-creator",
  "@manifest-editor/plaintext-creator",
  "@manifest-editor/web-page-creator",
  "@manifest-editor/thumbnail-image",
  "@manifest-editor/empty-annotation-page",
  "@manifest-editor/range-top-level",
  "@manifest-editor/range-with-items",
]);

export const creators = ManifestPreset.creators.filter((creator) =>
  universalViewerCreatorIds.has(creator.id),
);

export const centerPanels = ManifestPreset.centerPanels;
export const leftPanels = ManifestPreset.leftPanels.filter(
  (panel) => panel.id !== "@manifest-editor/canvas-annotation-listing",
);
export const annotations = ManifestPreset.annotations;
export const background = ManifestPreset.background;
export const floatingPanels = ManifestPreset.floatingPanels;
export const rightPanels = ManifestPreset.rightPanels;
export const modals = ManifestPreset.modals;
export const editors = [
  ...ManifestPreset.editors,
  fallbackAnnotationEditor,
  universalViewerSingleTabEditor,
  universalViewerAnnotationPageEditor,
];
export const resources = ManifestPreset.resources;
