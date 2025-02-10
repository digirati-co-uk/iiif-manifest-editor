import { BaseCreator } from "./BaseCreator";
import { LayoutPanel } from "../Layout/Layout.types";
import { CreatableResource } from "@manifest-editor/creator-api";

export const baseCreator: LayoutPanel = {
  id: "@manifest-editor/creator",
  label: "Add content",
  options: { hideHeader: true, tabs: false },
  render(state: CreatableResource) {
    return <BaseCreator resource={state} />;
  },
};
