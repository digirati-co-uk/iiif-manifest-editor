import { LayoutPanel } from "@/shell/Layout/Layout.types";
import React from "react";
import { BaseCreator } from "./BaseCreator";
import { CreatableResource } from "@/shell/EditingStack/EditingStack.types";

export const baseCreator: LayoutPanel = {
  id: "@manifest-editor/creator",
  label: "Creator",
  options: { hideHeader: true, tabs: false },
  render(state: CreatableResource) {
    return <BaseCreator resource={state} />;
  },
};
