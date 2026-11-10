import type { CreatableResource } from "@manifest-editor/creator-api";
import type { LayoutPanel } from "../Layout/Layout.types";
import { BaseCreator } from "./BaseCreator";

export const baseCreator: LayoutPanel = {
  id: "@manifest-editor/creator",
  label: "Add content",
  labelMessage: { namespace: "shell", key: "creator.add" },
  options: { hideHeader: true, tabs: false },
  render(state: CreatableResource) {
    return <BaseCreator resource={state} />;
  },
};
