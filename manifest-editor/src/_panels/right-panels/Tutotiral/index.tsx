import { LayoutPanel } from "@/shell/Layout/Layout.types";
import { CreatableResource } from "@/shell/EditingStack/EditingStack.types";
import { BaseCreator } from "@/_panels/right-panels/BaseCreator/BaseCreator";
import React from "react";
import { Tutorial } from "@/_panels/right-panels/Tutotiral/Tutorial";

export const tutorial: LayoutPanel = {
  id: "@manifest-editor/tutorial",
  label: "Tutorial",
  options: { hideHeader: true, tabs: false },
  render() {
    return <Tutorial />;
  },
};
