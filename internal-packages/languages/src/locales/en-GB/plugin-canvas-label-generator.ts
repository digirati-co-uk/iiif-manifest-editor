/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  metadata: {
    label: "Canvas labels",
    description: "Generate canvas labels.",
  },
  settings: {
    pattern: "Label pattern",
    start: "Start number",
    preview: "Preview labels",
  },
  results: {
    updated_one: "{{count}} canvas updated",
    updated_other: "{{count}} canvases updated",
  },
} as const;
