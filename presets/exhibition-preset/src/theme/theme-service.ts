export const EXHIBITION_THEME_SERVICE_PROFILE =
  "https://exhibitionviewer.org/iiif/theme-service";
export const EXHIBITION_THEME_SERVICE_LABEL = {
  en: ["Exhibition viewer theme"],
};

export type ExhibitionThemePreset = "delft" | "minimal" | "gallery";
export type FloatingPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
export type TitleTransform = "uppercase" | "none" | "capitalize";

export interface SharedThemeConfig {
  fontSans: string;
  fontMono: string;
  titleTransform: TitleTransform;
}

export interface DelftThemeTokens {
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundOverlay: string;
  textPrimary: string;
  textSecondary: string;
  imageCaption: string;
  annotationSelected: string;
  controlBar: string;
  controlBarBorder: string;
  controlHover: string;
  progressBar: string;
  closeBackground: string;
  closeBackgroundHover: string;
  closeText: string;
  titleCard: string;
  titleCardText: string;
  infoBlock: string;
  infoBlockText: string;
  viewerBackground: string;
}

export interface ScrollThemeTokens {
  titleBackground: string;
  titleColor: string;
  annotationBackground: string;
  annotationColor: string;
  annotationRadius: string;
  annotationMaxWidth: string;
  infoBlockBackground: string;
  infoBlockColor: string;
}

export interface DelftExhibitionThemeOptions {
  cutCorners: boolean;
  fullTitleBar: boolean;
  fullWidthGrid: boolean;
  hideTableOfContents: boolean;
  disablePresentation: boolean;
  hideTitle: boolean;
  hideTitleCard: boolean;
  alternativeImageMode: boolean;
  transitionScale: boolean;
  imageInfoIcon: boolean;
  coverImages: boolean;
}

export interface DelftPresentationThemeOptions {
  cutCorners: boolean;
  isFloating: boolean;
  floatingPosition: FloatingPosition;
}

export interface DelftSlideshowThemeOptions {
  alternativeImageMode: boolean;
  transitionScale: boolean;
  imageInfoIcon: boolean;
  coverImages: boolean;
}

export interface ScrollThemeConfigOptions {
  showTableOfContents: boolean;
  titleBlock: {
    fullHeight: boolean;
  };
}

export interface ExhibitionThemeConfig {
  version: 1;
  preset: ExhibitionThemePreset;
  shared: SharedThemeConfig;
  delft: {
    tokens: DelftThemeTokens;
    exhibition: DelftExhibitionThemeOptions;
    presentation: DelftPresentationThemeOptions;
    slideshow: DelftSlideshowThemeOptions;
  };
  scroll: {
    tokens: ScrollThemeTokens;
    options: ScrollThemeConfigOptions;
  };
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

const DEFAULT_SHARED: SharedThemeConfig = {
  fontSans: '"Tahoma", "Fira Sans", sans-serif',
  fontMono: '"Fira Mono", monospace',
  titleTransform: "uppercase",
};

const DEFAULT_DELFT_TOKENS: DelftThemeTokens = {
  backgroundPrimary: "#e5e7eb",
  backgroundSecondary: "#fff",
  backgroundOverlay: "rgba(0, 0, 0, 0.3)",
  textPrimary: "#fff",
  textSecondary: "#000",
  imageCaption: "#fff",
  annotationSelected: "#facc15",
  controlBar: "#6d6e70",
  controlBarBorder: "#5a5b5d",
  controlHover: "rgba(0, 0, 0, 0.1)",
  progressBar: "#fff",
  closeBackground: "#000",
  closeBackgroundHover: "#373737",
  closeText: "#fff",
  titleCard: "#facc15",
  titleCardText: "#000",
  infoBlock: "#000",
  infoBlockText: "#fff",
  viewerBackground: "#373737",
};

const MINIMAL_DELFT_TOKENS: DelftThemeTokens = {
  ...DEFAULT_DELFT_TOKENS,
  backgroundPrimary: "#fff",
  backgroundSecondary: "#fff",
  textPrimary: "#000",
  textSecondary: "#000",
  imageCaption: "#000",
  annotationSelected: "#303f9f",
  controlBar: "#f9f9f9",
  controlBarBorder: "#000",
  closeBackground: "#fff",
  closeBackgroundHover: "#eee",
  closeText: "#000",
  progressBar: "#000000",
  titleCard: "#fff",
  titleCardText: "#000",
  infoBlock: "#fff",
  infoBlockText: "#000",
  viewerBackground: "#e9e9e9",
};

const DEFAULT_SCROLL_TOKENS: ScrollThemeTokens = {
  titleBackground: "#fff",
  titleColor: "#444",
  annotationBackground: "#fff",
  annotationColor: "#333",
  annotationRadius: "0px",
  annotationMaxWidth: "30em",
  infoBlockBackground: "#fff",
  infoBlockColor: "#444",
};

const DEFAULT_EXHIBITION_OPTIONS: DelftExhibitionThemeOptions = {
  cutCorners: true,
  fullTitleBar: true,
  fullWidthGrid: false,
  hideTableOfContents: false,
  disablePresentation: false,
  hideTitle: false,
  hideTitleCard: false,
  alternativeImageMode: true,
  transitionScale: false,
  imageInfoIcon: false,
  coverImages: false,
};

const DEFAULT_PRESENTATION_OPTIONS: DelftPresentationThemeOptions = {
  cutCorners: false,
  isFloating: false,
  floatingPosition: "bottom-left",
};

const DEFAULT_SLIDESHOW_OPTIONS: DelftSlideshowThemeOptions = {
  alternativeImageMode: true,
  transitionScale: false,
  imageInfoIcon: false,
  coverImages: false,
};

const DEFAULT_SCROLL_OPTIONS: ScrollThemeConfigOptions = {
  showTableOfContents: false,
  titleBlock: {
    fullHeight: true,
  },
};

const DEFAULT_DELFT_THEME: ExhibitionThemeConfig = {
  version: 1,
  preset: "delft",
  shared: DEFAULT_SHARED,
  delft: {
    tokens: DEFAULT_DELFT_TOKENS,
    exhibition: DEFAULT_EXHIBITION_OPTIONS,
    presentation: DEFAULT_PRESENTATION_OPTIONS,
    slideshow: DEFAULT_SLIDESHOW_OPTIONS,
  },
  scroll: {
    tokens: DEFAULT_SCROLL_TOKENS,
    options: DEFAULT_SCROLL_OPTIONS,
  },
};

const MINIMAL_THEME: ExhibitionThemeConfig = {
  ...DEFAULT_DELFT_THEME,
  preset: "minimal",
  shared: {
    ...DEFAULT_SHARED,
    titleTransform: "none",
  },
  delft: {
    ...DEFAULT_DELFT_THEME.delft,
    tokens: MINIMAL_DELFT_TOKENS,
  },
};

const GALLERY_THEME: ExhibitionThemeConfig = {
  version: 1,
  preset: "gallery",
  shared: {
    fontSans: '"Gill Sans", "Trebuchet MS", sans-serif',
    fontMono: '"Courier Prime", "Courier New", monospace',
    titleTransform: "capitalize",
  },
  delft: {
    tokens: {
      ...DEFAULT_DELFT_TOKENS,
      backgroundPrimary: "#f3ecdf",
      backgroundSecondary: "#fff8ee",
      backgroundOverlay: "rgba(20, 26, 32, 0.45)",
      textPrimary: "#fff8ee",
      textSecondary: "#2b2118",
      imageCaption: "#f8efe1",
      annotationSelected: "#f08c2e",
      controlBar: "#1f3a5f",
      controlBarBorder: "#162b47",
      controlHover: "rgba(255, 255, 255, 0.14)",
      progressBar: "#f4a261",
      closeBackground: "#1f3a5f",
      closeBackgroundHover: "#335c8a",
      closeText: "#fff8ee",
      titleCard: "#c7522a",
      titleCardText: "#fff8ee",
      infoBlock: "#22313f",
      infoBlockText: "#f8efe1",
      viewerBackground: "#30414d",
    },
    exhibition: {
      ...DEFAULT_EXHIBITION_OPTIONS,
      cutCorners: false,
      fullTitleBar: true,
      fullWidthGrid: true,
      alternativeImageMode: false,
      transitionScale: true,
      imageInfoIcon: true,
      coverImages: true,
    },
    presentation: {
      ...DEFAULT_PRESENTATION_OPTIONS,
      isFloating: true,
      floatingPosition: "bottom-right",
    },
    slideshow: {
      ...DEFAULT_SLIDESHOW_OPTIONS,
      alternativeImageMode: false,
      transitionScale: true,
      imageInfoIcon: true,
      coverImages: true,
    },
  },
  scroll: {
    tokens: {
      ...DEFAULT_SCROLL_TOKENS,
      titleBackground: "#f8efe1",
      titleColor: "#2a2119",
      annotationBackground: "#22313f",
      annotationColor: "#f8efe1",
      annotationRadius: "18px",
      annotationMaxWidth: "34em",
      infoBlockBackground: "#fff8ee",
      infoBlockColor: "#2a2119",
    },
    options: {
      showTableOfContents: true,
      titleBlock: {
        fullHeight: false,
      },
    },
  },
};

const PRESET_THEMES: Record<ExhibitionThemePreset, ExhibitionThemeConfig> = {
  delft: DEFAULT_DELFT_THEME,
  minimal: MINIMAL_THEME,
  gallery: GALLERY_THEME,
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function mergeDeep<T>(base: T, overrides?: DeepPartial<T>): T {
  if (!overrides) {
    return clone(base);
  }

  const result = clone(base) as Record<string, unknown>;

  for (const [key, value] of Object.entries(overrides)) {
    if (typeof value === "undefined") {
      continue;
    }

    const current = result[key];
    if (isPlainObject(current) && isPlainObject(value)) {
      result[key] = mergeDeep(current, value as DeepPartial<typeof current>);
      continue;
    }

    result[key] = value as unknown;
  }

  return result as T;
}

function isThemePreset(value: unknown): value is ExhibitionThemePreset {
  return typeof value === "string" && value in PRESET_THEMES;
}

export function getThemePreset(
  preset: ExhibitionThemePreset = "delft",
): ExhibitionThemeConfig {
  return clone(PRESET_THEMES[preset] || DEFAULT_DELFT_THEME);
}

export function resolveThemeConfig(
  theme?: DeepPartial<ExhibitionThemeConfig> | null,
): ExhibitionThemeConfig {
  const preset = isThemePreset(theme?.preset) ? theme.preset : "delft";
  const base = getThemePreset(preset);
  const merged = mergeDeep(base, theme || {});
  merged.version = 1;
  merged.preset = preset;
  return merged;
}

export function getThemeServiceId(manifestId: string) {
  return `${manifestId}#exhibition-viewer-theme`;
}

export function createThemeService(
  manifestId: string,
  theme?: DeepPartial<ExhibitionThemeConfig>,
) {
  return {
    id: getThemeServiceId(manifestId),
    type: "Service",
    profile: EXHIBITION_THEME_SERVICE_PROFILE,
    label: EXHIBITION_THEME_SERVICE_LABEL,
    theme: resolveThemeConfig(theme),
  };
}

export function getThemeServiceDetails(services?: Array<any>) {
  if (!services?.length) {
    return null;
  }

  const index = services.findIndex((service) => {
    return (
      service?.profile === EXHIBITION_THEME_SERVICE_PROFILE || service?.theme
    );
  });

  if (index === -1) {
    return null;
  }

  return {
    index,
    service: services[index],
  };
}

export function getThemeConfigFromServices(services?: Array<any>) {
  return getThemeServiceDetails(services)?.service?.theme as
    | DeepPartial<ExhibitionThemeConfig>
    | undefined;
}

export function replaceThemeService(
  services: Array<any> | undefined,
  nextThemeService: ReturnType<typeof createThemeService> | null,
) {
  const nextServices = [...(services || [])];
  const existing = getThemeServiceDetails(nextServices);

  if (existing) {
    if (nextThemeService) {
      nextServices[existing.index] = nextThemeService;
      return nextServices;
    }

    nextServices.splice(existing.index, 1);
    return nextServices;
  }

  if (nextThemeService) {
    nextServices.push(nextThemeService);
  }

  return nextServices;
}

export function getThemeCssVariables(theme: ExhibitionThemeConfig) {
  return {
    "--f-font": theme.shared.fontSans,
    "--f-mono-font": theme.shared.fontMono,
    "--delft-title-transform": theme.shared.titleTransform,
    "--delft-bg-primary": theme.delft.tokens.backgroundPrimary,
    "--delft-bg-secondary": theme.delft.tokens.backgroundSecondary,
    "--delft-bg-overlay": theme.delft.tokens.backgroundOverlay,
    "--delft-text-primary": theme.delft.tokens.textPrimary,
    "--delft-text-secondary": theme.delft.tokens.textSecondary,
    "--delft-image-caption": theme.delft.tokens.imageCaption,
    "--delft-annotation-selected": theme.delft.tokens.annotationSelected,
    "--delft-control-bar": theme.delft.tokens.controlBar,
    "--delft-control-bar-border": theme.delft.tokens.controlBarBorder,
    "--delft-control-hover": theme.delft.tokens.controlHover,
    "--delft-progress-bar": theme.delft.tokens.progressBar,
    "--delft-close-background": theme.delft.tokens.closeBackground,
    "--delft-close-background-hover": theme.delft.tokens.closeBackgroundHover,
    "--delft-close-text": theme.delft.tokens.closeText,
    "--delft-title-card": theme.delft.tokens.titleCard,
    "--delft-title-card-text": theme.delft.tokens.titleCardText,
    "--delft-info-block": theme.delft.tokens.infoBlock,
    "--delft-info-block-text": theme.delft.tokens.infoBlockText,
    "--delft-viewer-background": theme.delft.tokens.viewerBackground,
    "--exv-scroll-title-background": theme.scroll.tokens.titleBackground,
    "--exv-scroll-title-color": theme.scroll.tokens.titleColor,
    "--exv-scroll-annotation-background":
      theme.scroll.tokens.annotationBackground,
    "--exv-scroll-annotation-color": theme.scroll.tokens.annotationColor,
    "--exv-scroll-annotation-radius": theme.scroll.tokens.annotationRadius,
    "--exv-scroll-annotation-max-width": theme.scroll.tokens.annotationMaxWidth,
    "--exv-scroll-info-block-background":
      theme.scroll.tokens.infoBlockBackground,
    "--exv-scroll-info-block-color": theme.scroll.tokens.infoBlockColor,
  };
}
