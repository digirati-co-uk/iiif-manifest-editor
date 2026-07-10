import type { PresetTemplateDefinition } from "@manifest-editor/shell";

const boolean = (id: string, label: string, defaultValue: boolean) => ({
  id,
  label,
  type: "boolean" as const,
  defaultValue,
});

export const exhibitionTemplates: PresetTemplateDefinition[] = [
  {
    id: "exhibition-fullpage",
    label: "Full page exhibition",
    summary: "A guided exhibition layout with full-page scenes and focused narrative steps.",
    type: "fullpage",
    previewUrl: "https://preview.exhibitionviewer.org/preview/exhibition",
    thumbnailUrl: "https://deploy-preview-391--manifest-editor-docs.netlify.app/exhibition-fullpage.png",
    configuration: [
      boolean("delft.exhibition.cutCorners", "Cut corners", true),
      boolean("delft.exhibition.fullTitleBar", "Show full title bar", false),
      boolean("delft.exhibition.fullWidthGrid", "Full-width grid", false),
      boolean("delft.exhibition.hideTableOfContents", "Hide table of contents", false),
      boolean("delft.exhibition.showNavigationControls", "Show navigation controls", true),
      boolean("delft.exhibition.disablePresentation", "Disable presentation mode", false),
      boolean("delft.exhibition.hideTitle", "Hide title", false),
      boolean("delft.exhibition.hideTitleCard", "Hide title card", false),
      boolean("delft.exhibition.alternativeImageMode", "Alternative image mode", true),
      boolean("delft.exhibition.transitionScale", "Scale transitions", false),
      boolean("delft.exhibition.imageInfoIcon", "Show image information icon", false),
      boolean("delft.exhibition.coverImages", "Cover images", false),
      boolean("delft.exhibition.ignoreCanvasBackgrounds", "Ignore canvas backgrounds", false),
    ],
  },
  {
    id: "exhibition-slideshow",
    label: "Slideshow",
    summary: "A slide-based exhibition for linear presentations and teaching material.",
    type: "slideshow",
    previewUrl: "https://preview.exhibitionviewer.org/preview/slideshow",
    thumbnailUrl: "https://deploy-preview-391--manifest-editor-docs.netlify.app/exhibition-slideshow.png",
    configuration: [
      boolean("delft.presentation.cutCorners", "Cut corners", false),
      boolean("delft.presentation.isFloating", "Floating controls", false),
      {
        id: "delft.presentation.floatingPosition",
        label: "Floating position",
        type: "select",
        defaultValue: "top-left",
        options: [
          { label: "Top left", value: "top-left" },
          { label: "Top right", value: "top-right" },
          { label: "Bottom left", value: "bottom-left" },
          { label: "Bottom right", value: "bottom-right" },
        ],
      },
      boolean("delft.presentation.labelOnlyFloating", "Only float labels", true),
      boolean("delft.presentation.ignoreCanvasBackgrounds", "Ignore canvas backgrounds", false),
    ],
  },
  {
    id: "exhibition-scroll",
    label: "Scrolling story",
    summary: "A vertical reading experience for essays, object stories, and long-form interpretation.",
    type: "scroll",
    previewUrl: "https://preview.exhibitionviewer.org/preview/scroll",
    thumbnailUrl: "https://deploy-preview-391--manifest-editor-docs.netlify.app/exhibition-scroll.png",
    configuration: [
      boolean("scroll.options.showTitleBlock", "Show title block", true),
      boolean("scroll.options.titleBlock.fullHeight", "Full-height title block", true),
      boolean("scroll.options.showTableOfContents", "Show table of contents", false),
      boolean("scroll.options.showProgressBar", "Show progress bar", true),
      boolean("scroll.options.showProgressTableOfContents", "Show contents in progress bar", true),
      boolean("scroll.options.showScrollToTop", "Show scroll-to-top button", true),
      boolean("scroll.options.showNavigationControls", "Show navigation controls", true),
      boolean("scroll.options.ignoreCanvasBackgrounds", "Ignore canvas backgrounds", false),
    ],
  },
];

export function getTemplateConfigurationValue(values: Record<string, any>, path: string): any {
  let current: any = values;
  for (const key of path.split(".")) current = current?.[key];
  return current;
}

export function setTemplateConfigurationValue(values: Record<string, any>, path: string, value: unknown) {
  const next = structuredClone(values);
  const parts = path.split(".");
  let current = next;
  for (const part of parts.slice(0, -1)) current = current[part] ||= {};
  current[parts.at(-1)!] = value;
  return next;
}
