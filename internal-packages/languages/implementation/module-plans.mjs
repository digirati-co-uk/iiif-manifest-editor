// Inventory source scopes only. Markdown task guides are authoritative for implementation details.
export const modulePlans = [
  {
    id: "00-languages",
    path: "internal-packages/languages",
    title: "Language catalog foundation",
  },
  {
    id: "01-public-runtime",
    path: null,
    title: "Public i18n runtime and workspace bootstrap",
  },
  {
    id: "02-editor-api",
    path: "packages/editor-api",
    title: "Editor API display metadata",
  },
  {
    id: "03-creator-api",
    path: "packages/creator-api",
    title: "Creator API message contracts",
  },
  {
    id: "04-components",
    path: "packages/components",
    title: "Shared component messages and accessibility",
  },
  {
    id: "05-ui",
    path: "packages/ui",
    title: "UI package and duplicate widget audit",
  },
  {
    id: "06-shell",
    path: "packages/shell",
    title: "Shell configuration and definition integration",
  },
  {
    id: "07-editors",
    path: "packages/editors",
    title: "Shared property editors and forms",
  },
  {
    id: "08-creators",
    path: "packages/creators",
    title: "Resource creator forms",
  },
  {
    id: "09-projects",
    path: "packages/projects",
    title: "Project and draft controls",
  },
  {
    id: "10-manifest-preset",
    path: "presets/manifest-preset",
    title: "Manifest preset workflows",
  },
  {
    id: "11-collection-preset",
    path: "presets/collection-preset",
    title: "Collection preset workflows",
  },
  {
    id: "12-exhibition-preset",
    path: "presets/exhibition-preset",
    title: "Exhibition presets and terminology",
  },
  {
    id: "13-plugin-annotations",
    path: "plugins/annotations",
    title: "Annotations plugin",
  },
  {
    id: "14-plugin-canvas-label-generator",
    path: "plugins/canvas-label-generator",
    title: "Canvas label generator plugin",
  },
  {
    id: "15-plugin-ocr-classification",
    path: "plugins/ocr-classification",
    title: "OCR classification plugin",
  },
  {
    id: "16-plugin-ocr-docling",
    path: "plugins/ocr-docling",
    title: "Docling OCR plugin",
  },
  {
    id: "17-plugin-specifications",
    path: "plugins/specifications",
    title: "Specifications plugin",
  },
  {
    id: "18-plugin-translation",
    path: "plugins/translation",
    title: "Content translation plugin interface",
  },
  {
    id: "19-manifest-editor",
    path: "packages/manifest-editor",
    title: "Public editor facade and browser distribution",
  },
  {
    id: "20-web",
    path: "apps/web",
    title: "Web host locale preferences and application UI",
  },
  {
    id: "21-vite-example",
    path: "apps/vite-example",
    title: "Vite external integration example",
  },
  {
    id: "22-storybook",
    path: "packages/storybook",
    title: "Storybook localisation coverage",
  },
  {
    id: "23-playwright",
    path: "packages/playwright",
    title: "End to end localisation acceptance",
  },
  {
    id: "24-client-vault",
    path: "packages/client-vault",
    title: "Client vault language boundary",
  },
  {
    id: "25-server-vault",
    path: "packages/server-vault",
    title: "Server vault language boundary",
  },
  {
    id: "26-iiif-preview-server",
    path: "packages/iiif-preview-server",
    title: "Preview server and external viewer boundary",
  },
  {
    id: "27-docs",
    path: "apps/docs",
    title: "Integration and translation contributor documentation",
  },
  {
    id: "28-typescript-config",
    path: "internal-packages/typescript-config",
    title: "Shared TypeScript configuration compatibility",
  },
  {
    id: "29-release-and-ci",
    path: null,
    title: "Catalog quality gates and publishing",
  },
];
