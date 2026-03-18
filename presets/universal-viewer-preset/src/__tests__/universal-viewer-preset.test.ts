import { describe, expect, it } from "vitest";
import { creators as manifestPresetCreators } from "@manifest-editor/manifest-preset";
import { config, creators, editors, leftPanels, universalViewerFieldSupport } from "../index";

describe("universal viewer preset", () => {
  it("exports the expected creator subset", () => {
    expect(creators.map((creator) => creator.id)).toEqual([
      "@manifest-editor/image-service-creator",
      "@manifest-editor/image-service-annotation",
      "@manifest-editor/image-url-creator",
      "@manifest-editor/image-url-annotation",
      "@manifest-editor/video-annotation",
      "@manifest-editor/audio-annotation",
      "@manifest-editor/iiif-browser-creator",
      "@manifest-editor/plaintext-creator",
      "@manifest-editor/web-page-creator",
      "@manifest-editor/empty-annotation-page",
      "@manifest-editor/image-url-list",
      "@manifest-editor/image-url-list-annotation",
      "@manifest-editor/thumbnail-image",
      "@manifest-editor/range-top-level",
      "@manifest-editor/range-with-items",
    ]);
  });

  it("exports the expected field allowlist", () => {
    expect(config.editorConfig).toEqual(universalViewerFieldSupport);
    expect(universalViewerFieldSupport.Manifest?.fields).toEqual([
      "label",
      "metadata",
      "requiredStatement",
      "homepage",
      "viewingDirection",
      "items",
      "structures",
      "rendering",
    ]);
    expect(universalViewerFieldSupport.Manifest?.singleTab).toBe(
      "@manifest-editor/universal-viewer-overview",
    );
    expect(universalViewerFieldSupport.Canvas?.fields).toEqual([
      "label",
      "metadata",
      "thumbnail",
      "items",
      "rendering",
    ]);
    expect(universalViewerFieldSupport.Canvas?.singleTab).toBe(
      "@manifest-editor/universal-viewer-overview",
    );
    expect(universalViewerFieldSupport.Range?.fields).toEqual([
      "label",
      "metadata",
      "items",
      "rendering",
    ]);
    expect(universalViewerFieldSupport.Range?.singleTab).toBe(
      "@manifest-editor/universal-viewer-overview",
    );
    expect(universalViewerFieldSupport.Annotation?.fields).toEqual(["target"]);
    expect(universalViewerFieldSupport.Annotation?.singleTab).toBe(
      "@manifest-editor/fallback-annotation-editor",
    );
    expect(universalViewerFieldSupport.AnnotationPage).toEqual({
      fields: ["items"],
      singleTab: "@manifest-editor/universal-viewer-annotation-page",
    });
    expect(universalViewerFieldSupport.ContentResource?.fields).toEqual(["label"]);
    expect(universalViewerFieldSupport.ContentResource?.singleTab).toBe(
      "@manifest-editor/universal-viewer-overview",
    );
  });

  it("limits previews to Universal Viewer", () => {
    expect(config.defaultPreview).toBe("universal-viewer");
    expect(config.previews).toEqual([
      {
        id: "universal-viewer",
        type: "external-manifest-preview",
        label: "Universal Viewer",
        config: {
          url: "https://universalviewer.dev/#?iiifManifestId={manifestId}",
        },
      },
    ]);
  });

  it("adds the single-tab editors required by the preset", () => {
    expect(
      editors.some((editor) => editor.id === "@manifest-editor/universal-viewer-overview"),
    ).toBe(true);
    expect(
      editors.some((editor) => editor.id === "@manifest-editor/fallback-annotation-editor"),
    ).toBe(true);
    expect(
      editors.some((editor) => editor.id === "@manifest-editor/universal-viewer-annotation-page"),
    ).toBe(true);
  });

  it("removes the annotations panel from the left sidebar", () => {
    expect(
      leftPanels.some((panel) => panel.id === "@manifest-editor/canvas-annotation-listing"),
    ).toBe(false);
  });

  it("does not change the default manifest preset creator set", () => {
    expect(
      manifestPresetCreators.some(
        (creator) => creator.id === "@manifest-editor/html-body-creator",
      ),
    ).toBe(true);
    expect(
      manifestPresetCreators.some(
        (creator) => creator.id === "@manifest-editor/provider",
      ),
    ).toBe(true);
  });
});
