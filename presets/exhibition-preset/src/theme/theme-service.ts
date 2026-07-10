export const EXHIBITION_THEME_SERVICE_PROFILE =
  "https://exhibitionviewer.org/iiif/theme-service";
export const EXHIBITION_THEME_SERVICE_LABEL = {
  en: ["Exhibition viewer theme"],
};

export type ExhibitionThemePreset =
  | "delft"
  | "minimal"
  | "gallery"
  | "leeds-full-page"
  | "leeds-scroll"
  | "leeds-slideshow";
export type FloatingPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "bottom"
  | "left"
  | "right";
export type TitleTransform = "uppercase" | "none" | "capitalize";
export type TableOfContentsPlacement = "header" | "footer";

export interface SharedThemeConfig {
  fontSans: string;
  fontMono: string;
  fontDisplay: string;
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
  tableOfContentsPlacement: TableOfContentsPlacement;
  showProgressBar: boolean;
  showProgressTableOfContents: boolean;
  showNavigationControls: boolean;
  disablePresentation: boolean;
  hideTitle: boolean;
  hideTitleCard: boolean;
  alternativeImageMode: boolean;
  transitionScale: boolean;
  imageInfoIcon: boolean;
  coverImages: boolean;
  ignoreCanvasBackgrounds: boolean;
}

export interface DelftPresentationThemeOptions {
  cutCorners: boolean;
  isFloating: boolean;
  floatingPosition: FloatingPosition;
  labelOnlyFloating: boolean;
  ignoreCanvasBackgrounds: boolean;
}

export interface DelftSlideshowThemeOptions {
  alternativeImageMode: boolean;
  transitionScale: boolean;
  imageInfoIcon: boolean;
  coverImages: boolean;
  ignoreCanvasBackgrounds: boolean;
}

export interface ScrollThemeConfigOptions {
  showTitleBlock: boolean;
  showTableOfContents: boolean;
  tableOfContentsPlacement: TableOfContentsPlacement;
  showProgressBar: boolean;
  showProgressTableOfContents: boolean;
  showScrollToTop: boolean;
  showNavigationControls: boolean;
  ignoreCanvasBackgrounds: boolean;
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
  fontDisplay: '"Tahoma", "Fira Sans", sans-serif',
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
  tableOfContentsPlacement: "footer",
  showProgressBar: true,
  showProgressTableOfContents: true,
  showNavigationControls: true,
  disablePresentation: false,
  hideTitle: false,
  hideTitleCard: false,
  alternativeImageMode: true,
  transitionScale: false,
  imageInfoIcon: false,
  coverImages: false,
  ignoreCanvasBackgrounds: false,
};

const DEFAULT_PRESENTATION_OPTIONS: DelftPresentationThemeOptions = {
  cutCorners: false,
  isFloating: false,
  floatingPosition: "bottom-left",
  labelOnlyFloating: true,
  ignoreCanvasBackgrounds: false,
};

const DEFAULT_SLIDESHOW_OPTIONS: DelftSlideshowThemeOptions = {
  alternativeImageMode: true,
  transitionScale: false,
  imageInfoIcon: false,
  coverImages: false,
  ignoreCanvasBackgrounds: false,
};

const DEFAULT_SCROLL_OPTIONS: ScrollThemeConfigOptions = {
  showTitleBlock: true,
  showTableOfContents: false,
  tableOfContentsPlacement: "header",
  showProgressBar: true,
  showProgressTableOfContents: true,
  showScrollToTop: true,
  showNavigationControls: true,
  ignoreCanvasBackgrounds: false,
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
    fontDisplay: '"Gill Sans", "Trebuchet MS", sans-serif',
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
      ...DEFAULT_SCROLL_OPTIONS,
      showTableOfContents: true,
      tableOfContentsPlacement: "header",
      titleBlock: {
        fullHeight: false,
      },
    },
  },
};

const LEEDS_BLACK = "#000000";
const LEEDS_BRICK = "#9c381c";
const LEEDS_CREAM = "#fff1df";
const LEEDS_DARK_BROWN = "#4a2f29";
const LEEDS_PALE_BLUE = "#8de3ef";
const LEEDS_PINK = "#f28df7";
const LEEDS_VIVID_GREEN = "#55ff55";
const LEEDS_WHITE = "#ffffff";
const LEEDS_SHARED: SharedThemeConfig = {
  fontSans: '"UoL Sans", Arial, sans-serif',
  fontMono: '"UoL Inter", Arial, sans-serif',
  fontDisplay: '"UoL Sans", Arial, sans-serif',
  titleTransform: "none",
};
const LEEDS_BASE_DELFT_TOKENS: DelftThemeTokens = {
  ...DEFAULT_DELFT_TOKENS,
  backgroundPrimary: LEEDS_WHITE,
  backgroundSecondary: LEEDS_BLACK,
  backgroundOverlay: "rgba(0, 0, 0, 0.56)",
  textPrimary: LEEDS_BLACK,
  textSecondary: LEEDS_BLACK,
  imageCaption: LEEDS_WHITE,
  annotationSelected: LEEDS_VIVID_GREEN,
  controlBar: LEEDS_BLACK,
  controlBarBorder: LEEDS_BLACK,
  controlHover: "rgba(255, 255, 255, 0.16)",
  progressBar: LEEDS_VIVID_GREEN,
  closeBackground: LEEDS_BLACK,
  closeBackgroundHover: LEEDS_DARK_BROWN,
  closeText: LEEDS_WHITE,
  titleCard: LEEDS_VIVID_GREEN,
  titleCardText: LEEDS_BLACK,
  infoBlock: LEEDS_BLACK,
  infoBlockText: LEEDS_WHITE,
  viewerBackground: LEEDS_WHITE,
};
const LEEDS_BASE_SCROLL_TOKENS: ScrollThemeTokens = {
  ...DEFAULT_SCROLL_TOKENS,
  titleBackground: LEEDS_WHITE,
  titleColor: LEEDS_BLACK,
  annotationBackground: LEEDS_BLACK,
  annotationColor: LEEDS_WHITE,
  annotationRadius: "0px",
  annotationMaxWidth: "34em",
  infoBlockBackground: LEEDS_BLACK,
  infoBlockColor: LEEDS_WHITE,
};

const LEEDS_FULL_PAGE_THEME: ExhibitionThemeConfig = {
  version: 1,
  preset: "leeds-full-page",
  shared: LEEDS_SHARED,
  delft: {
    tokens: LEEDS_BASE_DELFT_TOKENS,
    exhibition: {
      ...DEFAULT_EXHIBITION_OPTIONS,
      cutCorners: false,
      fullTitleBar: true,
      fullWidthGrid: false,
      hideTableOfContents: false,
      alternativeImageMode: false,
      transitionScale: false,
      imageInfoIcon: true,
      coverImages: false,
    },
    presentation: {
      ...DEFAULT_PRESENTATION_OPTIONS,
      cutCorners: false,
      isFloating: false,
    },
    slideshow: DEFAULT_SLIDESHOW_OPTIONS,
  },
  scroll: {
    tokens: LEEDS_BASE_SCROLL_TOKENS,
    options: DEFAULT_SCROLL_OPTIONS,
  },
};

const LEEDS_SCROLL_THEME: ExhibitionThemeConfig = {
  ...LEEDS_FULL_PAGE_THEME,
  preset: "leeds-scroll",
  delft: {
    ...LEEDS_FULL_PAGE_THEME.delft,
    tokens: {
      ...LEEDS_BASE_DELFT_TOKENS,
      backgroundPrimary: LEEDS_CREAM,
      backgroundSecondary: LEEDS_DARK_BROWN,
      textPrimary: LEEDS_BLACK,
      textSecondary: LEEDS_BLACK,
      titleCard: LEEDS_CREAM,
      titleCardText: LEEDS_BLACK,
      infoBlock: LEEDS_DARK_BROWN,
      infoBlockText: LEEDS_WHITE,
      controlBar: LEEDS_BLACK,
      progressBar: LEEDS_PINK,
      viewerBackground: LEEDS_CREAM,
    },
    exhibition: {
      ...LEEDS_FULL_PAGE_THEME.delft.exhibition,
      fullTitleBar: false,
      imageInfoIcon: false,
    },
  },
  scroll: {
    tokens: {
      ...LEEDS_BASE_SCROLL_TOKENS,
      titleBackground: LEEDS_CREAM,
      titleColor: LEEDS_BLACK,
      annotationBackground: LEEDS_PINK,
      annotationColor: LEEDS_BLACK,
      infoBlockBackground: LEEDS_DARK_BROWN,
      infoBlockColor: LEEDS_WHITE,
    },
    options: {
      ...DEFAULT_SCROLL_OPTIONS,
      showTableOfContents: true,
      titleBlock: {
        fullHeight: false,
      },
    },
  },
};

const LEEDS_SLIDESHOW_THEME: ExhibitionThemeConfig = {
  ...LEEDS_FULL_PAGE_THEME,
  preset: "leeds-slideshow",
  delft: {
    ...LEEDS_FULL_PAGE_THEME.delft,
    tokens: {
      ...LEEDS_BASE_DELFT_TOKENS,
      backgroundPrimary: LEEDS_WHITE,
      backgroundSecondary: LEEDS_PALE_BLUE,
      textPrimary: LEEDS_BLACK,
      textSecondary: LEEDS_BLACK,
      titleCard: LEEDS_PALE_BLUE,
      titleCardText: LEEDS_BLACK,
      infoBlock: LEEDS_BRICK,
      infoBlockText: LEEDS_WHITE,
      controlBar: LEEDS_BLACK,
      controlBarBorder: LEEDS_BLACK,
      progressBar: LEEDS_BRICK,
      viewerBackground: LEEDS_WHITE,
    },
    exhibition: {
      ...LEEDS_FULL_PAGE_THEME.delft.exhibition,
      hideTableOfContents: true,
      imageInfoIcon: true,
    },
    presentation: {
      ...LEEDS_FULL_PAGE_THEME.delft.presentation,
      isFloating: false,
      floatingPosition: "bottom-left",
    },
    slideshow: {
      ...DEFAULT_SLIDESHOW_OPTIONS,
      alternativeImageMode: false,
      imageInfoIcon: true,
    },
  },
};

const PRESET_THEMES: Record<ExhibitionThemePreset, ExhibitionThemeConfig> = {
  delft: DEFAULT_DELFT_THEME,
  minimal: MINIMAL_THEME,
  gallery: GALLERY_THEME,
  "leeds-full-page": LEEDS_FULL_PAGE_THEME,
  "leeds-scroll": LEEDS_SCROLL_THEME,
  "leeds-slideshow": LEEDS_SLIDESHOW_THEME,
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

function normalizeThemePreset(value: unknown): ExhibitionThemePreset {
  if (isThemePreset(value)) {
    return value;
  }

  if (
    value === "leeds" ||
    value === "leeds-page" ||
    value === "leeds-slideshow" ||
    value === "leeds-scroll"
  ) {
    if (value === "leeds-slideshow") return "leeds-slideshow";
    if (value === "leeds-scroll") return "leeds-scroll";
    return "leeds-full-page";
  }

  return "delft";
}

export function getThemePreset(
  preset: ExhibitionThemePreset = "delft",
): ExhibitionThemeConfig {
  return clone(PRESET_THEMES[preset] || DEFAULT_DELFT_THEME);
}

export function resolveThemeConfig(
  theme?: DeepPartial<ExhibitionThemeConfig> | null,
): ExhibitionThemeConfig {
  const preset = normalizeThemePreset(theme?.preset);
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
    "--f-display-font": theme.shared.fontDisplay,
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
