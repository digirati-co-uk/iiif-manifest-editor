/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  resource: {
    create: "Create resource",
    chooseType: "Choose a resource type",
    label: "Label",
    url: "URL",
    invalidUrl: "Enter a valid URL",
    createFailed: "Could not create this resource",
  },
  canvas: {
    create: "Create canvas",
    width: "Width",
    height: "Height",
    duration: "Duration",
  },
  image: {
    fromUrl: "Image URL",
    fromService: "IIIF image service",
    browse: "Browse images",
    previewAlt: "Preview of selected resource",
    use: "Use image",
  },
  content: {
    webPage: "Web page",
    manifest: "Manifest",
    collection: "Collection",
  },
} as const;
