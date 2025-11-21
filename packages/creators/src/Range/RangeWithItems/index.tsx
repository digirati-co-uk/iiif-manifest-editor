import { RangesIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { createRangeWithItems, RangeWithItemsCreatorForm } from "./create-range-with-items";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/range-with-items": typeof rangeWithItems;
    }
  }
}

export const rangeWithItems = defineCreator({
  id: "@manifest-editor/range-with-items",
  create: createRangeWithItems,
  label: "Range",
  summary: "Add a new range",
  icon: <RangesIcon />,
  render(ctx) {
    return <RangeWithItemsCreatorForm {...ctx} />;
  },
  resourceType: "Range",
  resourceFields: ["id", "label", "type"],
  supports: {
    parentTypes: ["Range"],
    parentFields: ["items"],
  },
  staticFields: {
    type: "Range",
  },
});
