import { LayoutPanel } from "@/shell/Layout/Layout.types";
import React from "react";
import { Tutorial } from "@/_panels/right-panels/Tutotiral/Tutorial";

export const tutorial: LayoutPanel = {
  id: "@manifest-editor/tutorial",
  label: "Tutorial",
  options: { hideHeader: true, tabs: false, pinnable: true, openPinned: true },
  render() {
    return <Tutorial />;
  },
};
