import type { MessageReference } from "@manifest-editor/i18n";
import type { EditorDefinition } from "@manifest-editor/shell";
import { RangeOverview } from "./RangeOverview";

export const rangeOverview: EditorDefinition & {
  labelMessage?: MessageReference;
  summaryMessage?: MessageReference;
} = {
  id: "@manifest-editor/range-overview",
  label: "Overview",
  labelMessage: { namespace: "editors", key: "ui.overview" },
  supports: {
    edit: true,
    properties: [],
    resourceTypes: ["Range"],
  },
  component: () => <RangeOverview />,
};
