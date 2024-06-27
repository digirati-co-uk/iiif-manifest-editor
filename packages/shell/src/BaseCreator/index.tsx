import { BaseCreator } from "./BaseCreator";
import { CreatableResource } from "../EditingStack/EditingStack.types";
import { LayoutPanel } from "../Layout/Layout.types";

export const baseCreator: LayoutPanel = {
  id: "@manifest-editor/creator",
  label: "Add content",
  options: { hideHeader: true, tabs: false },
  render(state: CreatableResource) {
    return <BaseCreator resource={state} />;
  },
};
