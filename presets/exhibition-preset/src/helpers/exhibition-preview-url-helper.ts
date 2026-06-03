import type { DelftExhibitionProps, DelftPresentationProps } from "exhibition-viewer/library";

export type PresetUrlSearchParamsPreset = "delft" | "exhibition" | "minimal" | "presentation" | "scroll" | "slideshow";

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
  Pick<NonNullable<DelftExhibitionProps["options"]>, "cutCorners" | "fullTitleBar">;

export type MinimalPresetUrlSearchParamsOptions = DelftPresetUrlSearchParamsOptions;

export type PresentationPresetUrlSearchParamsOptions = SharedPresetUrlSearchParamsOptions &
  Pick<NonNullable<DelftPresentationProps["options"]>, "cutCorners" | "floatingPosition" | "isFloating"> & {
    floating?: NonNullable<DelftPresentationProps["options"]>["isFloating"];
  };

export type SlideshowPresetUrlSearchParamsOptions = SharedPresetUrlSearchParamsOptions & {
  minimal?: boolean;
  floating?: NonNullable<DelftPresentationProps["options"]>["isFloating"];
  floatingPosition?: NonNullable<DelftPresentationProps["options"]>["floatingPosition"];
};

export type ScrollPresetUrlSearchParamsOptions = SharedPresetUrlSearchParamsOptions & {
  minimal?: boolean;
  manifestEditorPreview?: boolean;
  manifestEditorPreviewOrigin?: string;
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
      break;
    }

    case "minimal": {
      const presetOptions = options as MinimalPresetUrlSearchParamsOptions;
      params.set("minimal", "true");
      setBoolean(params, "cut-corners", presetOptions.cutCorners);
      setBoolean(params, "full-title-bar", presetOptions.fullTitleBar);
      break;
    }

    case "presentation": {
      const presetOptions = options as PresentationPresetUrlSearchParamsOptions;
      params.set("type", "presentation");
      setBoolean(params, "cut-corners", presetOptions.cutCorners);
      setBoolean(params, "floating", presetOptions.floating ?? presetOptions.isFloating);
      setString(params, "floating-position", presetOptions.floatingPosition);
      break;
    }

    case "scroll": {
      const presetOptions = options as ScrollPresetUrlSearchParamsOptions;
      params.set("type", "scroll");
      setFlag(params, "minimal", presetOptions.minimal);
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
      break;
    }
  }

  return params;
}

export function createScrollingPreviewUrl<T extends PresetUrlSearchParamsPreset>(
  preset: T,
  options?: Partial<PresetUrlSearchParamsOptions<T>>,
): URL;
export function createScrollingPreviewUrl(
  preset: PresetUrlSearchParamsPreset,
  options?: Partial<PresetUrlSearchParamsOptions>,
): URL {

  const searchParams = createPresetUrlSearchParams(preset, (options || {}) as any);

  const base =
    window.localStorage.getItem("exhibition-viewer-preview-url") ||
    process.env.NEXT_PUBLIC_EXHIBITION_VIEWER_URL ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? `http://localhost:5174/preview/${preset}?${searchParams?.toString()}`
      : `https://preview.exhibitionviewer.org/preview/${preset}?${searchParams?.toString()}`);

  const url = new URL(base);

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
