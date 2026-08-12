import type { DelftExhibitionProps, DelftPresentationProps } from "exhibition-viewer/library";

export type PresetUrlSearchParamsPreset = "delft" | "exhibition" | "minimal" | "presentation" | "scroll" | "slideshow";
type TableOfContentsPlacement = "header" | "footer";
type FloatingPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top" | "bottom" | "left" | "right";

export type PresetUrlSearchParamsByPreset = {
  delft: DelftPresetUrlSearchParamsOptions;
  exhibition: DelftPresetUrlSearchParamsOptions;
  minimal: MinimalPresetUrlSearchParamsOptions;
  presentation: PresentationPresetUrlSearchParamsOptions;
  scroll: ScrollPresetUrlSearchParamsOptions;
  slideshow: SlideshowPresetUrlSearchParamsOptions;
};

export type PresetUrlSearchParamsOptions<T extends PresetUrlSearchParamsPreset = PresetUrlSearchParamsPreset> =
  PresetUrlSearchParamsByPreset[T];

type SharedPresetUrlSearchParamsOptions = {
  manifest: string;
  canvas?: string;
};

export type DelftPresetUrlSearchParamsOptions = SharedPresetUrlSearchParamsOptions &
  Pick<NonNullable<DelftExhibitionProps["options"]>, "cutCorners" | "fullTitleBar"> & {
    hideTableOfContents?: boolean;
    ignoreCanvasBackgrounds?: boolean;
    showNavigationControls?: boolean;
    showProgressBar?: boolean;
    tableOfContentsPlacement?: TableOfContentsPlacement;
  };

export type MinimalPresetUrlSearchParamsOptions = DelftPresetUrlSearchParamsOptions;

export type PresentationPresetUrlSearchParamsOptions = SharedPresetUrlSearchParamsOptions &
  Pick<NonNullable<DelftPresentationProps["options"]>, "cutCorners" | "isFloating"> & {
    floating?: NonNullable<DelftPresentationProps["options"]>["isFloating"];
    floatingPosition?: FloatingPosition;
    ignoreCanvasBackgrounds?: boolean;
    labelOnlyFloating?: boolean;
  };

export type SlideshowPresetUrlSearchParamsOptions = SharedPresetUrlSearchParamsOptions & {
  minimal?: boolean;
  floating?: NonNullable<DelftPresentationProps["options"]>["isFloating"];
  floatingPosition?: FloatingPosition;
  ignoreCanvasBackgrounds?: boolean;
  labelOnlyFloating?: boolean;
};

export type ScrollPresetUrlSearchParamsOptions = SharedPresetUrlSearchParamsOptions & {
  minimal?: boolean;
  manifestEditorPreview?: boolean;
  manifestEditorPreviewOrigin?: string;
  ignoreCanvasBackgrounds?: boolean;
  tableOfContentsPlacement?: TableOfContentsPlacement;
};

export function createPresetUrlSearchParams<T extends PresetUrlSearchParamsPreset>(
  preset: T,
  options: PresetUrlSearchParamsOptions<T>,
): URLSearchParams;
export function createPresetUrlSearchParams(
  preset: PresetUrlSearchParamsPreset,
  options: PresetUrlSearchParamsOptions,
): URLSearchParams {
  const params = new URLSearchParams();

  setString(params, "manifest", options.manifest);
  setString(params, "canvas", options.canvas);

  switch (preset) {
    case "delft":
    case "exhibition": {
      const presetOptions = options as DelftPresetUrlSearchParamsOptions;
      setBoolean(params, "cut-corners", presetOptions.cutCorners);
      setBoolean(params, "full-title-bar", presetOptions.fullTitleBar);
      setBoolean(params, "hide-toc", presetOptions.hideTableOfContents);
      setBoolean(params, "show-navigation-controls", presetOptions.showNavigationControls);
      setBoolean(params, "show-progress-bar", presetOptions.showProgressBar);
      setString(params, "toc-placement", presetOptions.tableOfContentsPlacement);
      setBoolean(params, "ignore-canvas-backgrounds", presetOptions.ignoreCanvasBackgrounds);
      break;
    }

    case "minimal": {
      const presetOptions = options as MinimalPresetUrlSearchParamsOptions;
      params.set("minimal", "true");
      setBoolean(params, "cut-corners", presetOptions.cutCorners);
      setBoolean(params, "full-title-bar", presetOptions.fullTitleBar);
      setString(params, "toc-placement", presetOptions.tableOfContentsPlacement);
      setBoolean(params, "ignore-canvas-backgrounds", presetOptions.ignoreCanvasBackgrounds);
      break;
    }

    case "presentation": {
      const presetOptions = options as PresentationPresetUrlSearchParamsOptions;
      params.set("type", "presentation");
      setBoolean(params, "cut-corners", presetOptions.cutCorners);
      setBoolean(params, "floating", presetOptions.floating ?? presetOptions.isFloating);
      setString(params, "floating-position", presetOptions.floatingPosition);
      setBoolean(params, "label-only-floating", presetOptions.labelOnlyFloating);
      setBoolean(params, "ignore-canvas-backgrounds", presetOptions.ignoreCanvasBackgrounds);
      break;
    }

    case "scroll": {
      const presetOptions = options as ScrollPresetUrlSearchParamsOptions;
      params.set("type", "scroll");
      setFlag(params, "minimal", presetOptions.minimal);
      setString(params, "toc-placement", presetOptions.tableOfContentsPlacement);
      setBoolean(params, "ignore-canvas-backgrounds", presetOptions.ignoreCanvasBackgrounds);
      setFlag(params, "manifest-editor-preview", presetOptions.manifestEditorPreview);
      setString(params, "manifest-editor-preview-origin", presetOptions.manifestEditorPreviewOrigin);
      break;
    }

    case "slideshow": {
      const presetOptions = options as SlideshowPresetUrlSearchParamsOptions;
      params.set("type", "slideshow");
      setFlag(params, "minimal", presetOptions.minimal);
      setBoolean(params, "floating", presetOptions.floating);
      setString(params, "floating-position", presetOptions.floatingPosition);
      setBoolean(params, "label-only-floating", presetOptions.labelOnlyFloating);
      setBoolean(params, "ignore-canvas-backgrounds", presetOptions.ignoreCanvasBackgrounds);
      break;
    }
  }

  return params;
}

export function createScrollingPreviewUrl<T extends PresetUrlSearchParamsPreset>(
  preset: T,
  options?: Partial<PresetUrlSearchParamsOptions<T>>,
  previewUrl?: string,
): URL;
export function createScrollingPreviewUrl(
  preset: PresetUrlSearchParamsPreset,
  options?: Partial<PresetUrlSearchParamsOptions>,
  previewUrl?: string,
): URL {
  const searchParams = createPresetUrlSearchParams(preset, (options || {}) as any);
  const url = new URL(previewUrl || `https://preview.exhibitionviewer.org/preview/${preset}`);

  if (!previewUrl && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && window.location.port === "3000") {
    url.protocol = "http:";
    url.host = "localhost:5174";
  }

  searchParams.forEach((value, key) => { url.searchParams.set(key, value) });

  url.searchParams.set("manifest-editor-preview", "true");
  url.searchParams.set("manifest-editor-preview-origin", window.location.origin);

  return url;
}

function setString(params: URLSearchParams, key: string, value: string | undefined) {
  if (value) {
    params.set(key, value);
  }
}

function setBoolean(params: URLSearchParams, key: string, value: boolean | undefined) {
  if (typeof value === "boolean") {
    params.set(key, String(value));
  }
}

function setFlag(params: URLSearchParams, key: string, value: boolean | undefined) {
  if (value) {
    params.set(key, "true");
  }
}
