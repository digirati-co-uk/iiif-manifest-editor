/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  resources: {
    manifest: "Manifest",
    canvas: "Canvas",
    range: "Range",
    collection: "Collection",
    annotation: "Annotation",
    annotationPage: "Annotation page",
    contentResource: "Content resource",
  },
  layout: {
    pair: "Side by side",
    triptych: "Three columns",
    featureLeft: "Feature left",
    blank: "Blank canvas",
  },
  fields: {
    label: "Label",
    summary: "Summary",
    width: "Width",
    height: "Height",
    duration: "Duration",
  },
} as const;
