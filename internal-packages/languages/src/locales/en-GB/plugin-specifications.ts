/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  metadata: {
    label: "Specifications",
    description: "Review project specifications and required Manifest work.",
  },
  filters: {
    current: "Current resource",
    all: "All resources",
    hideCompleted: "Hide completed",
  },
  status: {
    passed: "Passed",
    failed: "Failed",
    skipped: "Skipped",
  },
} as const;
