import type { PluginMetadata } from "@manifest-editor/shell";
export default {
  id: "@manifest-editor/diff",
  label: "Diff",
  description: "Compare a source IIIF URL with the current document and export a unified diff.",
  author: "Digirati",
  official: true,
  defaultEnabled: true,
  tags: ["diff", "review", "iiif"],
  supports: { apps: ["manifest-editor"], projectTypes: ["Manifest"] },
} satisfies PluginMetadata;
