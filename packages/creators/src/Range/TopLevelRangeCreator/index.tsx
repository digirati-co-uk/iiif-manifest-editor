import { RangesIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import {
  createRangeTopLevel,
  TopLevelRangeCreatorForm,
} from "./create-range-top-level";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/range-top-level": typeof rangeTopLevel;
    }
  }
}

export const rangeTopLevel = defineCreator({
  id: "@manifest-editor/range-top-level",
  create: createRangeTopLevel,
  label: "Top Level Range",
  summary: "Add a new top level range",
  icon: <RangesIcon />,
  render(ctx) {
    return <TopLevelRangeCreatorForm {...ctx} />;
  },
  resourceType: "Range",
  resourceFields: ["id", "label", "type"],
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["structures"],
  },
  staticFields: {
    type: "Range",
  },
});
