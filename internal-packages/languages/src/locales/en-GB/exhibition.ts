/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  app: {
    title: "Exhibition Editor",
    slideshow: "Exhibition Editor (slideshow)",
  },
  panels: {
    slides: "Slides",
    theme: "Theme",
    overview: "Overview",
    tourSteps: "Tour steps",
  },
  slide: {
    add: "Add slide",
    empty: "No slides",
    count_one: "{{count}} slide",
    count_other: "{{count}} slides",
    removeConfirm: "Remove this slide from the exhibition?",
  },
  theme: {
    title: "Theme",
    background: "Background",
    textColour: "Text colour",
    font: "Font",
  },
  tourStep: {
    add: "Add tour step",
    empty: "No tour steps",
    count_one: "{{count}} tour step",
    count_other: "{{count}} tour steps",
  },
  template: {
    choose: "Choose an exhibition template",
    preview: "Preview template",
  },
} as const;
