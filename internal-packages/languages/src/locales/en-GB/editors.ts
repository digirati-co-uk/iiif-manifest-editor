/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  fields: {
    label: "Label",
    summary: "Summary",
    thumbnail: "Thumbnail",
    rights: "Rights",
    navDate: "Nav Date",
    metadata: "Metadata",
    provider: "Provider",
    language: "Language",
    requiredStatement: "Required statement",
  },
  canvas: {
    add: "Add canvas",
    current: "Current canvas",
    removeConfirm: "Remove this canvas from the manifest?",
    count_one: "{{count}} canvas",
    count_other: "{{count}} canvases",
  },
  metadata: {
    add: "Add metadata",
    label: "Label",
    value: "Value",
    empty: "No metadata",
  },
  language: {
    add: "Add language",
    none: "No language",
    remove: "Remove language",
    switchPlainConfirm: "Switching to plain text will remove formatting such as bold, links and headings. Continue?",
  },
  thumbnail: {
    empty: "No thumbnail",
    choose: "Choose thumbnail",
  },
  navDate: {
    openCalendar: "Open Nav Date calendar",
    clear: "Clear Nav Date",
    day: "Nav Date day",
    month: "Nav Date month",
    year: "Nav Date year",
    hour: "Nav Date hour",
    minute: "Nav Date minute",
  },
  provider: {
    removeConfirm: "Are you sure you want to delete this provider?",
  },
} as const;
